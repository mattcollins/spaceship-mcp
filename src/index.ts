#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { SpaceshipClient } from './spaceship-client.js';

interface ServerConfig {
  apiKey: string;
  apiSecret: string;
}

class SpaceshipMCPServer {
  private server: Server;
  private client: SpaceshipClient;

  constructor(config: ServerConfig) {
    this.server = new Server(
      {
        name: 'spaceship-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.client = new SpaceshipClient(config.apiKey, config.apiSecret);
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_dns_records',
            description: 'List all DNS records for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name to list DNS records for',
                },
              },
              required: ['domain'],
            },
          },
          {
            name: 'create_dns_record',
            description: 'Create a new DNS record for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                records: {
                  type: 'array',
                  description: 'Array of DNS records to create',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'The record name (subdomain)',
                      },
                      type: {
                        type: 'string',
                        description: 'The record type (A, AAAA, CNAME, MX, TXT, etc.)',
                      },
                      value: {
                        type: 'string',
                        description: 'The record value',
                      },
                      ttl: {
                        type: 'number',
                        description: 'Time to live in seconds (optional)',
                        default: 3600,
                      },
                    },
                    required: ['name', 'type', 'value'],
                  },
                },
              },
              required: ['domain', 'records'],
            },
          },
          {
            name: 'update_dns_records',
            description: 'Update DNS records for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                records: {
                  type: 'array',
                  description: 'Array of DNS records to update',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'The record name (subdomain)',
                      },
                      type: {
                        type: 'string',
                        description: 'The record type (A, AAAA, CNAME, MX, TXT, etc.)',
                      },
                      value: {
                        type: 'string',
                        description: 'The record value',
                      },
                      ttl: {
                        type: 'number',
                        description: 'Time to live in seconds (optional)',
                        default: 3600,
                      },
                    },
                    required: ['name', 'type', 'value'],
                  },
                },
              },
              required: ['domain', 'records'],
            },
          },
          {
            name: 'delete_dns_records',
            description: 'Delete DNS records for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                records: {
                  type: 'array',
                  description: 'Array of DNS records to delete',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'The record name (subdomain)',
                      },
                      type: {
                        type: 'string',
                        description: 'The record type (A, AAAA, CNAME, MX, TXT, etc.)',
                      },
                    },
                    required: ['name', 'type'],
                  },
                },
              },
              required: ['domain', 'records'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'list_dns_records':
            return await this.handleListDnsRecords(args as { domain: string });

          case 'create_dns_record':
            return await this.handleCreateDnsRecord(args as {
              domain: string;
              records: Array<{
                name: string;
                type: string;
                value: string;
                ttl?: number;
              }>;
            });

          case 'update_dns_records':
            return await this.handleUpdateDnsRecords(args as {
              domain: string;
              records: Array<{
                name: string;
                type: string;
                value: string;
                ttl?: number;
              }>;
            });

          case 'delete_dns_records':
            return await this.handleDeleteDnsRecords(args as {
              domain: string;
              records: Array<{
                name: string;
                type: string;
              }>;
            });

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async handleListDnsRecords(args: { domain: string }) {
    const records = await this.client.getDnsRecords(args.domain);
    return {
      content: [
        {
          type: 'text' as const,
          text: `DNS records for ${args.domain}:\n${JSON.stringify(records, null, 2)}`,
        },
      ],
    };
  }

  private async handleCreateDnsRecord(args: {
    domain: string;
    records: Array<{ name: string; type: string; value: string; ttl?: number }>;
  }) {
    await this.client.saveDnsRecords(args.domain, args.records);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully created ${args.records.length} DNS record(s) for ${args.domain}`,
        },
      ],
    };
  }

  private async handleUpdateDnsRecords(args: {
    domain: string;
    records: Array<{ name: string; type: string; value: string; ttl?: number }>;
  }) {
    await this.client.saveDnsRecords(args.domain, args.records);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully updated ${args.records.length} DNS record(s) for ${args.domain}`,
        },
      ],
    };
  }

  private async handleDeleteDnsRecords(args: {
    domain: string;
    records: Array<{ name: string; type: string }>;
  }) {
    await this.client.deleteDnsRecords(args.domain, args.records);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully deleted ${args.records.length} DNS record(s) for ${args.domain}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

async function main() {
  const apiKey = process.env.SPACESHIP_API_KEY;
  const apiSecret = process.env.SPACESHIP_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('Error: SPACESHIP_API_KEY and SPACESHIP_API_SECRET environment variables are required');
    process.exit(1);
  }

  const server = new SpaceshipMCPServer({ apiKey, apiSecret });
  await server.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}