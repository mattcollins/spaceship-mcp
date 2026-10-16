import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { SpaceshipClient } from '../dist/spaceship-client.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// A fake CLI and fetch keep verification independent of 1Password and live DNS.
test('credentials are lazy, cached across concurrent calls, and retryable', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'spaceship-credentials-'));
  const log = join(dir, 'calls');
  await writeFile(log, '');
  await writeFile(join(dir, 'op'), `#!${process.execPath}
import { appendFileSync, existsSync } from 'node:fs';
appendFileSync(${JSON.stringify(log)}, process.argv.at(-1) + '\\n');
if (existsSync(${JSON.stringify(join(dir, 'fail'))})) {
  console.error('sensitive error output');
  process.exit(1);
}
process.stdout.write('resolved-' + process.argv.at(-1).split('/').at(-1));
`, { mode: 0o700 });
  const oldPath = process.env.PATH;
  process.env.PATH = `${dir}:${oldPath}`;
  t.after(async () => {
    process.env.PATH = oldPath;
    await rm(dir, { recursive: true, force: true });
  });
  const key = 'op://vault/item/key';
  const secret = 'op://vault/item/secret';
  const client = new SpaceshipClient(key, secret);
  assert.equal(await readFile(log, 'utf8'), '');
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push(options);
    return new Response('{}', { headers: { 'content-type': 'application/json' } });
  });

  // Discovery must work even when 1Password is unavailable.
  await writeFile(join(dir, 'fail'), '');
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve('dist/index.js')],
    env: { PATH: process.env.PATH, SPACESHIP_API_KEY: key, SPACESHIP_API_SECRET: secret },
  });
  const mcp = new Client({ name: 'credential-test', version: '1' });
  try {
    await mcp.connect(transport);
    assert.equal((await mcp.listTools()).tools.length, 10);
    assert.equal(await readFile(log, 'utf8'), '');
    await assert.rejects(mcp.callTool({ name: 'list_dns_records', arguments: { domain: 'example.com' } }), error => {
      assert.match(error.message, /Could not read credentials from 1Password/);
      assert.doesNotMatch(error.message, /sensitive error output/);
      return true;
    });
  } finally {
    await mcp.close();
  }
  await assert.rejects(client.getDnsRecords('example.com'), /Could not read credentials/);
  assert.equal(requests.length, 0);
  await rm(join(dir, 'fail'));
  await writeFile(log, '');
  await Promise.all([client.getDnsRecords('example.com'), client.getDnsRecords('example.org')]);
  await client.getDnsRecords('example.net');
  assert.deepEqual((await readFile(log, 'utf8')).trim().split('\n'), [key, secret]);
  assert.equal(requests.length, 3);
  for (const request of requests) {
    assert.equal(request.headers['X-Api-Key'], 'resolved-key');
    assert.equal(request.headers['X-Api-Secret'], 'resolved-secret');
  }
  await new SpaceshipClient('literal-key', 'literal-secret').getDnsRecords('example.com');
  assert.equal(requests.at(-1).headers['X-Api-Key'], 'literal-key');
  assert.equal(requests.at(-1).headers['X-Api-Secret'], 'literal-secret');
  assert.deepEqual((await readFile(log, 'utf8')).trim().split('\n'), [key, secret]);
});
