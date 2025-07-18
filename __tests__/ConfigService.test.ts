import { ConfigService } from '../src/config/ConfigService';

describe('ConfigService', () => {
  it('should load correct environment config', () => {
    const apiUrl = ConfigService.getApiEndpoint('contacts');
    expect(apiUrl).toBeDefined();
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