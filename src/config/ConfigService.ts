import config from './frontend-config.json';

export class ConfigService {
  static get<T>(path: string): T {
    return path.split('.').reduce((obj, key) => obj?.[key], config) as T;
  }
}