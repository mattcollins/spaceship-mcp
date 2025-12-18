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
                        description: 'The record value. For MX records, use format "priority exchange" (e.g., "10 mail.example.com"). For SRV records, use format "priority weight port target" (e.g., "0 1 443 autodiscover.migadu.com.")',
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
                        description: 'The record value. For MX records, use format "priority exchange" (e.g., "10 mail.example.com"). For SRV records, use format "priority weight port target" (e.g., "0 1 443 autodiscover.migadu.com.")',
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
          {
            name: 'create_a_record',
            description: 'Create an A record (IPv4 address) for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                name: {
                  type: 'string',
                  description: 'The record name (subdomain, use "@" for root domain)',
                },
                address: {
                  type: 'string',
                  description: 'The IPv4 address (e.g., "192.0.2.1")',
                },
                ttl: {
                  type: 'number',
                  description: 'Time to live in seconds (optional)',
                  default: 3600,
                },
              },
              required: ['domain', 'name', 'address'],
            },
          },
          {
            name: 'create_aaaa_record',
            description: 'Create an AAAA record (IPv6 address) for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                name: {
                  type: 'string',
                  description: 'The record name (subdomain, use "@" for root domain)',
                },
                address: {
                  type: 'string',
                  description: 'The IPv6 address (e.g., "2001:db8::1")',
                },
                ttl: {
                  type: 'number',
                  description: 'Time to live in seconds (optional)',
                  default: 3600,
                },
              },
              required: ['domain', 'name', 'address'],
            },
          },
          {
            name: 'create_cname_record',
            description: 'Create a CNAME record (canonical name/alias) for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                name: {
                  type: 'string',
                  description: 'The record name (subdomain)',
                },
                cname: {
                  type: 'string',
                  description: 'The canonical name to point to without trailing dot (e.g., "example.com")',
                },
                ttl: {
                  type: 'number',
                  description: 'Time to live in seconds (optional)',
                  default: 3600,
                },
              },
              required: ['domain', 'name', 'cname'],
            },
          },
          {
            name: 'create_mx_record',
            description: 'Create an MX record (mail exchange) for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                name: {
                  type: 'string',
                  description: 'The record name (subdomain, use "@" for root domain)',
                },
                priority: {
                  type: 'number',
                  description: 'The priority/preference value (lower is higher priority, e.g., 10)',
                },
                exchange: {
                  type: 'string',
                  description: 'The mail server hostname (e.g., "mail.example.com")',
                },
                ttl: {
                  type: 'number',
                  description: 'Time to live in seconds (optional)',
                  default: 3600,
                },
              },
              required: ['domain', 'name', 'priority', 'exchange'],
            },
          },
          {
            name: 'create_srv_record',
            description: 'Create an SRV record (service locator) for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                name: {
                  type: 'string',
                  description: 'The service name (e.g., "_autodiscover._tcp")',
                },
                priority: {
                  type: 'number',
                  description: 'The priority value (lower is higher priority)',
                },
                weight: {
                  type: 'number',
                  description: 'The weight for load balancing',
                },
                port: {
                  type: 'number',
                  description: 'The port number',
                },
                target: {
                  type: 'string',
                  description: 'The target hostname (e.g., "autodiscover.example.com")',
                },
                ttl: {
                  type: 'number',
                  description: 'Time to live in seconds (optional)',
                  default: 3600,
                },
              },
              required: ['domain', 'name', 'priority', 'weight', 'port', 'target'],
            },
          },
          {
            name: 'create_txt_record',
            description: 'Create a TXT record (text data) for a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain name',
                },
                name: {
                  type: 'string',
                  description: 'The record name (subdomain, use "@" for root domain)',
                },
                value: {
                  type: 'string',
                  description: 'The text value (e.g., "v=spf1 include:example.com -all")',
                },
                ttl: {
                  type: 'number',
                  description: 'Time to live in seconds (optional)',
                  default: 3600,
                },
              },
              required: ['domain', 'name', 'value'],
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

          case 'create_a_record':
            return await this.handleCreateARecord(args as {
              domain: string;
              name: string;
              address: string;
              ttl?: number;
            });

          case 'create_aaaa_record':
            return await this.handleCreateAAAARecord(args as {
              domain: string;
              name: string;
              address: string;
              ttl?: number;
            });

          case 'create_cname_record':
            return await this.handleCreateCNAMERecord(args as {
              domain: string;
              name: string;
              cname: string;
              ttl?: number;
            });

          case 'create_mx_record':
            return await this.handleCreateMXRecord(args as {
              domain: string;
              name: string;
              priority: number;
              exchange: string;
              ttl?: number;
            });

          case 'create_srv_record':
            return await this.handleCreateSRVRecord(args as {
              domain: string;
              name: string;
              priority: number;
              weight: number;
              port: number;
              target: string;
              ttl?: number;
            });

          case 'create_txt_record':
            return await this.handleCreateTXTRecord(args as {
              domain: string;
              name: string;
              value: string;
              ttl?: number;
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

  private async handleCreateARecord(args: {
    domain: string;
    name: string;
    address: string;
    ttl?: number;
  }) {
    await this.client.saveDnsRecords(args.domain, [{
      name: args.name,
      type: 'A',
      address: args.address,
      ttl: args.ttl,
    }]);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully created A record for ${args.name}.${args.domain} → ${args.address}`,
        },
      ],
    };
  }

  private async handleCreateAAAARecord(args: {
    domain: string;
    name: string;
    address: string;
    ttl?: number;
  }) {
    await this.client.saveDnsRecords(args.domain, [{
      name: args.name,
      type: 'AAAA',
      address: args.address,
      ttl: args.ttl,
    }]);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully created AAAA record for ${args.name}.${args.domain} → ${args.address}`,
        },
      ],
    };
  }

  private async handleCreateCNAMERecord(args: {
    domain: string;
    name: string;
    cname: string;
    ttl?: number;
  }) {
    await this.client.saveDnsRecords(args.domain, [{
      name: args.name,
      type: 'CNAME',
      cname: args.cname,
      ttl: args.ttl,
    }]);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully created CNAME record for ${args.name}.${args.domain} → ${args.cname}`,
        },
      ],
    };
  }

  private async handleCreateMXRecord(args: {
    domain: string;
    name: string;
    priority: number;
    exchange: string;
    ttl?: number;
  }) {
    await this.client.saveDnsRecords(args.domain, [{
      name: args.name,
      type: 'MX',
      priority: args.priority,
      exchange: args.exchange,
      ttl: args.ttl,
    }]);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully created MX record for ${args.name}.${args.domain} with priority ${args.priority} → ${args.exchange}`,
        },
      ],
    };
  }

  private async handleCreateSRVRecord(args: {
    domain: string;
    name: string;
    priority: number;
    weight: number;
    port: number;
    target: string;
    ttl?: number;
  }) {
    await this.client.saveDnsRecords(args.domain, [{
      name: args.name,
      type: 'SRV',
      priority: args.priority,
      weight: args.weight,
      port: args.port,
      target: args.target,
      ttl: args.ttl,
    }]);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully created SRV record for ${args.name}.${args.domain} → ${args.target}:${args.port} (priority: ${args.priority}, weight: ${args.weight})`,
        },
      ],
    };
  }

  private async handleCreateTXTRecord(args: {
    domain: string;
    name: string;
    value: string;
    ttl?: number;
  }) {
    await this.client.saveDnsRecords(args.domain, [{
      name: args.name,
      type: 'TXT',
      value: args.value,
      ttl: args.ttl,
    }]);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully created TXT record for ${args.name}.${args.domain}`,
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