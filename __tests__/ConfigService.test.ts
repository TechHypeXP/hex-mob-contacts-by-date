import { ConfigService } from '../src/config/ConfigService';

describe('ConfigService', () => {
  it('should return the correct API endpoint', () => {
    // Assuming your frontend-config.json has "api.baseURL" and "api.endpoints.contacts"
    // For example:
    // {
    //   "api": {
    //     "baseURL": "https://api.example.com",
    //     "endpoints": {
    //       "contacts": "/v1/contacts"
    //     }
    //   }
    // }
    const expectedUrl = 'http://localhost:3000/v1/contacts'; // Adjust based on your actual config
    const apiUrl = ConfigService.getApiEndpoint('contacts');
    expect(apiUrl).toBe(expectedUrl);
  });

  it('should return correct value for a given path', () => {
    const timeout = ConfigService.get<number>('api.timeout');
    expect(timeout).toBe(10000);
  });

  it('should return undefined for non-existent path', () => {
    const nonExistent = ConfigService.get<string>('non.existent.path');
    expect(nonExistent).toBeUndefined();
  });
});