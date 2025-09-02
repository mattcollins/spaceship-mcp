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

## API Permissions

The following permissions are required for your Spaceship API key:

- `dnsrecords:read` - For listing DNS records
- `dnsrecords:write` - For creating, updating, and deleting DNS records

## Example Usage

### List DNS Records
```json
{
  "tool": "list_dns_records",
  "arguments": {
    "domain": "example.com"
  }
}
```

### Create DNS Record
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

### Update DNS Records
```json
{
  "tool": "update_dns_records",
  "arguments": {
    "domain": "example.com",
    "records": [
      {
        "name": "www",
        "type": "A",
        "value": "192.0.2.2",
        "ttl": 7200
      }
    ]
  }
}
```

### Delete DNS Records
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