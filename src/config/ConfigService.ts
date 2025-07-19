import config from './frontend-config.json';

export class ConfigService {
  static get<T>(path: string): T {
    return path.split('.').reduce((obj: any, key) => obj?.[key], config) as T;
  }
  
  static getApiEndpoint(endpoint: string): string {
    const baseURL = this.get<string>('api.baseURL') || 'http://localhost:3000';
    const path = this.get<string>(`api.endpoints.${endpoint}`) || '';
    return `${baseURL}${path}`;
  }
}