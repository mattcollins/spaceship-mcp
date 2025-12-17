# Spaceship MCP Server

An MCP (Model Context Protocol) server for the Spaceship API, providing easy-to-use tools for managing DNS records. Features specialized tools for common record types (A, AAAA, CNAME, MX, SRV, TXT) with explicit parameters, plus generic tools for advanced use cases.

## ⚠️ Warning: use with care

This MCP server gives AI agents direct control over your DNS records. This can be helpful but also dangerous because:

- **Domain takeover risk**: Incorrect DNS changes could redirect your domain to malicious sites
- **Service disruption**: Wrong DNS records can make your websites and services inaccessible
- **Permanent consequences**: Some DNS changes can have lasting effects on your domain's reputation
- **Unintended modifications**: AI agents may make DNS changes you didn't expect or want

**Recommendations:**
- Review AI-suggested DNS changes before confirming them
- Keep backups of your current DNS configuration
- Monitor your domains closely when using this server
- Avoid using it with an AI agent that may also be accessing untrusted content

## Status

I use this myself for my own projects.

- **Limited testing**: As far as I know it is not in widespread use
- **No automated tests**: There are currently no unit tests or integration tests
- **Use at your own risk**: Suitable for experimentation but not recommended for critical systems

Contributions, bug reports, and feedback are welcome to help improve the project's stability and reliability.

## Features

### Core Operations
- **List DNS Records**: Retrieve all DNS records for a domain
- **Delete DNS Records**: Remove DNS records from a domain

### Specialized Record Creation Tools
Type-specific tools with explicit parameters for easy, error-free DNS management:
- **A Records**: Create IPv4 address records
- **AAAA Records**: Create IPv6 address records
- **CNAME Records**: Create canonical name aliases
- **MX Records**: Create mail exchange records with priority and exchange parameters
- **SRV Records**: Create service locator records with priority, weight, port, and target
- **TXT Records**: Create text records for SPF, DKIM, DMARC, verification, etc.

### Generic Tools
- **Create/Update DNS Records**: Generic tools supporting all DNS record types for advanced use cases

## Installation

### Prerequisites

* Node.js ≥ 18
* An MCP-compatible client (e.g. Claude Desktop, Cursor, Continue)
* Spaceship API credentials (see Configuration section below)

---

### Install the server

Clone the repository and build:

```bash
git clone https://github.com/mattcollins/spaceship-mcp.git
cd spaceship-mcp
npm install
npm run build
```

---

### Configure your MCP client

Add the server to your MCP client configuration.

#### Example (Claude Desktop)

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "spaceship": {
      "command": "node",
      "args": ["/absolute/path/to/spaceship-mcp/dist/index.js"],
      "env": {
        "SPACESHIP_API_KEY": "your_api_key",
        "SPACESHIP_API_SECRET": "your_api_secret"
      }
    }
  }
}
```

Replace `/absolute/path/to/spaceship-mcp` with the actual path where you cloned the repository.

Restart the client after saving the file.

---

### Verify the installation

After restarting your client, confirm the server is running:

* The server appears in the client's MCP/server list
* No errors appear in the client logs
* Tools exposed by the server (like `list_dns_records`) are available to the model

To check for startup errors, you can run the server manually:

```bash
npm start
```

---

## Configuration

### Environment Variables

| Variable                | Description                        | Required |
| ----------------------- | ---------------------------------- | -------- |
| `SPACESHIP_API_KEY`     | Your Spaceship API key             | Yes      |
| `SPACESHIP_API_SECRET`  | Your Spaceship API secret          | Yes      |

Get your API credentials from the [Spaceship API Manager](https://www.spaceship.com/application/api-manager/).

### Required API Permissions

Your API key will need the following permissions:
- `dnsrecords:read` - For listing DNS records
- `dnsrecords:write` - For creating, updating, and deleting DNS records

## Usage

### Available Tools

#### `list_dns_records`
Lists all DNS records for a domain.

**Parameters:**
- `domain` (string, required): The domain name to list DNS records for

#### `create_dns_record`
Creates new DNS records for a domain.

**Parameters:**
- `domain` (string, required): The domain name
- `records` (array, required): Array of DNS records to create
  - `name` (string, required): The record name (subdomain)
  - `type` (string, required): The record type (A, AAAA, CNAME, MX, TXT, etc.)
  - `value` (string, required): The record value
  - `ttl` (number, optional): Time to live in seconds (default: 3600)

#### `update_dns_records`
Updates DNS records for a domain.

**Parameters:**
- `domain` (string, required): The domain name
- `records` (array, required): Array of DNS records to update
  - `name` (string, required): The record name (subdomain)
  - `type` (string, required): The record type (A, AAAA, CNAME, MX, TXT, etc.)
  - `value` (string, required): The record value
  - `ttl` (number, optional): Time to live in seconds (default: 3600)

#### `delete_dns_records`
Deletes DNS records from a domain.

**Parameters:**
- `domain` (string, required): The domain name
- `records` (array, required): Array of DNS records to delete
  - `name` (string, required): The record name (subdomain)
  - `type` (string, required): The record type (A, AAAA, CNAME, MX, TXT, etc.)

### Specialized Record Type Tools

For convenience, specialized tools are available for common DNS record types. These tools provide explicit parameters instead of requiring format strings.

#### `create_a_record`
Creates an A record (IPv4 address).

**Parameters:**
- `domain` (string, required): The domain name
- `name` (string, required): The record name (subdomain, use "@" for root)
- `address` (string, required): The IPv4 address (e.g., "192.0.2.1")
- `ttl` (number, optional): Time to live in seconds (default: 3600)

#### `create_aaaa_record`
Creates an AAAA record (IPv6 address).

**Parameters:**
- `domain` (string, required): The domain name
- `name` (string, required): The record name (subdomain, use "@" for root)
- `address` (string, required): The IPv6 address (e.g., "2001:db8::1")
- `ttl` (number, optional): Time to live in seconds (default: 3600)

#### `create_cname_record`
Creates a CNAME record (canonical name/alias).

**Parameters:**
- `domain` (string, required): The domain name
- `name` (string, required): The record name (subdomain)
- `cname` (string, required): The canonical name to point to
- `ttl` (number, optional): Time to live in seconds (default: 3600)

**Note:** CNAME values typically should not include a trailing dot for Spaceship DNS.

#### `create_mx_record`
Creates an MX record (mail exchange).

**Parameters:**
- `domain` (string, required): The domain name
- `name` (string, required): The record name (subdomain, use "@" for root)
- `priority` (number, required): The priority value (lower is higher priority, e.g., 10)
- `exchange` (string, required): The mail server hostname
- `ttl` (number, optional): Time to live in seconds (default: 3600)

#### `create_srv_record`
Creates an SRV record (service locator).

**Parameters:**
- `domain` (string, required): The domain name
- `name` (string, required): The service name (e.g., "_autodiscover._tcp")
- `priority` (number, required): The priority value (lower is higher priority)
- `weight` (number, required): The weight for load balancing
- `port` (number, required): The port number
- `target` (string, required): The target hostname
- `ttl` (number, optional): Time to live in seconds (default: 3600)

#### `create_txt_record`
Creates a TXT record (text data).

**Parameters:**
- `domain` (string, required): The domain name
- `name` (string, required): The record name (subdomain, use "@" for root)
- `value` (string, required): The text value
- `ttl` (number, optional): Time to live in seconds (default: 3600)

## Example Usage

### Using Specialized Tools (Recommended)

The specialized tools provide a cleaner interface with explicit parameters:

#### Create an A Record
```json
{
  "tool": "create_a_record",
  "arguments": {
    "domain": "example.com",
    "name": "www",
    "address": "192.0.2.1"
  }
}
```

#### Create an MX Record
```json
{
  "tool": "create_mx_record",
  "arguments": {
    "domain": "example.com",
    "name": "@",
    "priority": 10,
    "exchange": "mail.example.com"
  }
}
```

#### Create an SRV Record
```json
{
  "tool": "create_srv_record",
  "arguments": {
    "domain": "example.com",
    "name": "_autodiscover._tcp",
    "priority": 0,
    "weight": 1,
    "port": 443,
    "target": "autodiscover.example.com"
  }
}
```

#### Create a TXT Record
```json
{
  "tool": "create_txt_record",
  "arguments": {
    "domain": "example.com",
    "name": "@",
    "value": "v=spf1 include:spf.example.com -all"
  }
}
```

#### Create a CNAME Record
```json
{
  "tool": "create_cname_record",
  "arguments": {
    "domain": "example.com",
    "name": "www",
    "cname": "example.com"
  }
}
```

### Using Generic Tools

The generic tools are still available and support all record types:

#### List DNS Records
```json
{
  "tool": "list_dns_records",
  "arguments": {
    "domain": "example.com"
  }
}
```

#### Create DNS Record (Generic)
```json
{
  "tool": "create_dns_record",
  "arguments": {
    "domain": "example.com",
    "records": [
      {
        "name": "www",
        "type": "A",
        "value": "192.0.2.1",
        "ttl": 3600
      }
    ]
  }
}
```

**Note:** For MX records, use format "priority exchange" (e.g., "10 mail.example.com"). For SRV records, use format "priority weight port target" (e.g., "0 1 443 autodiscover.example.com").

#### Delete DNS Records
```json
{
  "tool": "delete_dns_records",
  "arguments": {
    "domain": "example.com",
    "records": [
      {
        "name": "www",
        "type": "A"
      }
    ]
  }
}
```

## Error Handling

The server will return appropriate error messages for:
- Invalid API credentials
- Missing required parameters
- API rate limits
- Network errors
- Invalid domain names

## Troubleshooting

### Server not appearing in client

* Ensure the `command` path is correct and points to the built `dist/index.js` file
* Use an absolute path in the configuration, not a relative path
* Check that the project has been built with `npm run build`

### Authentication errors

* Verify your API credentials are correct in the configuration
* Check that your API key has the required permissions (`dnsrecords:read` and `dnsrecords:write`)
* Ensure environment variables are properly set in your client configuration

### Node version issues

* Check your Node version with `node --version`
* Ensure you're running Node.js 18 or higher
* If you have multiple Node versions, ensure your MCP client is using the correct one

### Debugging startup errors

Run the server manually to see detailed error messages:

```bash
cd /path/to/spaceship-mcp
npm start
```

Check your MCP client logs for additional error information.

## Development

- `npm run dev` - Watch mode for development
- `npm run build` - Build the TypeScript code
- `npm start` - Run the built server
