import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function resolveCredential(value: string): Promise<string> {
  if (!value.startsWith('op://')) {
    return value;
  }

  try {
    const { stdout } = await execFileAsync('op', ['read', '--no-newline', value], {
      timeout: 90_000,
    });
    if (!stdout) {
      throw new Error('Empty credential');
    }
    return stdout;
  } catch {
    // CLI errors can contain sensitive output; keep them out of MCP responses.
    throw new Error('Could not read credentials from 1Password. Unlock 1Password and retry the operation.');
  }
}
