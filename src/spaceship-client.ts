export interface DnsRecord {
  name: string;
  type: string;
  value: string;
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
      const errorText = await response.text();
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
    return await this.makeRequest(`/domains/${encodeURIComponent(domain)}/dns-records`);
  }

  async saveDnsRecords(domain: string, records: DnsRecord[]): Promise<void> {
    await this.makeRequest(
      `/domains/${encodeURIComponent(domain)}/dns-records`,
      'PUT',
      { records }
    );
  }

  async deleteDnsRecords(domain: string, records: DnsRecordToDelete[]): Promise<void> {
    await this.makeRequest(
      `/domains/${encodeURIComponent(domain)}/dns-records`,
      'DELETE',
      { records }
    );
  }
}