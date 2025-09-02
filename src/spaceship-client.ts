export interface DnsRecord {
  name: string;
  type: string;
  value?: string;
  address?: string;
  exchange?: string;
  priority?: number;
  ttl?: number;
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
            item.priority = record.priority;
            item.exchange = record.exchange;
          } else if (record.value) {
            // Parse "priority exchange" format from value
            const parts = record.value.trim().split(/\s+/);
            if (parts.length >= 2) {
              item.priority = parseInt(parts[0], 10);
              item.exchange = parts.slice(1).join(' ');
            } else {
              throw new Error(`Invalid MX record format. Expected "priority exchange" but got: ${record.value}`);
            }
          } else {
            throw new Error('MX record must have either priority/exchange fields or value field');
          }
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