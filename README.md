# Spaceship MCP Server

An MCP (Model Context Protocol) server for the Spaceship API, providing tools to manage DNS records.

## ⚠️ Security Warning

**Use with extreme caution!** This MCP server gives AI agents direct control over your DNS records. This can be dangerous because:

- **Domain takeover risk**: Incorrect DNS changes could redirect your domain to malicious sites
- **Service disruption**: Wrong DNS records can make your websites and services inaccessible
- **Permanent consequences**: Some DNS changes can have lasting effects on your domain's reputation
- **Unintended modifications**: AI agents may make DNS changes you didn't expect or want

**Recommendations:**
- Only use this server with domains you can afford to lose or break temporarily
- Test thoroughly with non-critical domains first
- Always review AI-suggested DNS changes before confirming them
- Keep backups of your current DNS configuration
- Monitor your domains closely when using this server
- Consider using API keys with limited permissions when possible

## Status

⚠️ **Early Development** - This project is very immature and shared in case it's useful to someone else. Please be aware:

- **Limited testing**: The server has not been extensively tested in production environments
- **No automated tests**: There are currently no unit tests or integration tests
- **Minimal error handling**: Error scenarios may not be handled gracefully
- **API changes**: The interface may change without notice as the project evolves
- **Use at your own risk**: Suitable for experimentation but not recommended for critical systems

Contributions, bug reports, and feedback are welcome to help improve the project's stability and reliability.

## Features

- **List DNS Records**: Retrieve all DNS records for a domain
- **Create DNS Records**: Add new DNS records to a domain
- **Update DNS Records**: Modify existing DNS records
- **Delete DNS Records**: Remove DNS records from a domain

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Set up environment variables:
   ```bash
   export SPACESHIP_API_KEY="your_api_key"
   export SPACESHIP_API_SECRET="your_api_secret"
   ```

   You can get your API credentials from the [Spaceship API Manager](https://www.spaceship.com/application/api-manager/).

## Usage

### Running the Server

```bash
npm start
```

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

## API Permissions

The following permissions are required for your Spaceship API key:

- `dnsrecords:read` - For listing DNS records
- `dnsrecords:write` - For creating, updating, and deleting DNS records

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

## Development

- `npm run dev` - Watch mode for development
- `npm run build` - Build the TypeScript code
- `npm start` - Run the built server