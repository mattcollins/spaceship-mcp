export interface DnsRecord {
  name: string;
  type: string;
  value?: string;
  address?: string;
  exchange?: string;
  priority?: number;
  cname?: string;
  ttl?: number;
  // SRV record specific fields
  weight?: number;
  port?: number;
  target?: string;
  service?: string;
  protocol?: string;
}

export interface DnsRecordToDelete {
  name: string;
  type: string;
}

export class SpaceshipClient {
  private readonly baseUrl = 'https://spaceship.dev/api/v1';
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
      'X-Api-Secret': this.apiSecret,
    };
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      let errorText;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } else {
          errorText = await response.text();
        }
      } catch (e) {
        errorText = await response.text();
      }
      throw new Error(
        `Spaceship API error: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  async getDnsRecords(domain: string): Promise<any> {
    return await this.makeRequest(`/dns/records/${encodeURIComponent(domain)}?take=100&skip=0`);
  }

  async saveDnsRecords(domain: string, records: DnsRecord[]): Promise<void> {
    const payload = {
      force: true,
      items: records.map(record => {
        const item: any = {
          name: record.name,
          type: record.type,
          ...(record.ttl && { ttl: record.ttl })
        };

        // Handle different record types with their specific fields
        if (record.type === 'MX') {
          if (record.priority !== undefined && record.exchange) {
            item.preference = record.priority;
            item.exchange = record.exchange;
          } else if (record.value) {
            // Parse "priority exchange" format from value
            const parts = record.value.trim().split(/\s+/);
            if (parts.length >= 2) {
              item.preference = parseInt(parts[0], 10);
              item.exchange = parts.slice(1).join(' ');
            } else {
              throw new Error(`Invalid MX record format. Expected "priority exchange" but got: ${record.value}`);
            }
          } else {
            throw new Error('MX record must have either priority/exchange fields or value field');
          }
        } else if (record.type === 'SRV') {
          if (record.priority !== undefined && record.weight !== undefined &&
              record.port !== undefined && record.target) {
            item.priority = record.priority;
            item.weight = record.weight;
            item.port = record.port;
            item.target = record.target;

            // Parse service and protocol from name if not provided
            // Format: _service._protocol.domain
            // Spaceship API expects service and protocol to include the underscore prefix
            const nameParts = record.name.split('.');
            if (nameParts.length >= 2 && nameParts[0].startsWith('_') && nameParts[1].startsWith('_')) {
              item.service = record.service || nameParts[0];  // Keep underscore
              item.protocol = record.protocol || nameParts[1];  // Keep underscore
            } else {
              item.service = record.service || '';
              item.protocol = record.protocol || '';
            }
          } else if (record.value) {
            // Parse "priority weight port target" format from value
            const parts = record.value.trim().split(/\s+/);
            if (parts.length >= 4) {
              item.priority = parseInt(parts[0], 10);
              item.weight = parseInt(parts[1], 10);
              item.port = parseInt(parts[2], 10);
              item.target = parts[3];

              // Parse service and protocol from name
              // Spaceship API expects service and protocol to include the underscore prefix
              const nameParts = record.name.split('.');
              if (nameParts.length >= 2 && nameParts[0].startsWith('_') && nameParts[1].startsWith('_')) {
                item.service = nameParts[0];  // Keep underscore, e.g., "_autodiscover"
                item.protocol = nameParts[1];  // Keep underscore, e.g., "_tcp"
              } else {
                throw new Error(`Invalid SRV record name format. Expected _service._protocol format but got: ${record.name}`);
              }
            } else {
              throw new Error(`Invalid SRV record format. Expected "priority weight port target" but got: ${record.value}`);
            }
          } else {
            throw new Error('SRV record must have either priority/weight/port/target fields or value field');
          }
        } else if (record.type === 'CNAME') {
          item.cname = record.cname || record.value;
        } else if (record.type === 'A' || record.type === 'AAAA') {
          item.address = record.address || record.value;
        } else {
          item.value = record.value;
        }

        return item;
      })
    };

    await this.makeRequest(
      `/dns/records/${encodeURIComponent(domain)}`,
      'PUT',
      payload
    );
  }

  async deleteDnsRecords(domain: string, records: DnsRecordToDelete[]): Promise<void> {
    await this.makeRequest(
      `/dns/records/${encodeURIComponent(domain)}`,
      'DELETE',
      records
    );
  }
}