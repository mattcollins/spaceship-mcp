export interface DnsRecord {
  name: string;
  type: string;
  value?: string;
  address?: string;
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
      items: records.map(record => ({
        name: record.name,
        type: record.type,
        value: record.value,
        ...(record.ttl && { ttl: record.ttl })
      }))
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