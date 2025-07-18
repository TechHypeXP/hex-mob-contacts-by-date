# Frontend Configuration Guide

This document outlines the frontend configuration system, its structure, how to access settings, and best practices for integration.

## 1. Configuration Files

The application uses a centralized `frontend-config.json` file for default settings and environment-specific overrides.

- [`src/config/frontend-config.json`](src/config/frontend-config.json): Base configuration with comprehensive settings.
- [`src/config/frontend-config.development.json`](src/config/frontend-config.development.json): Overrides for development environment.
- [`src/config/frontend-config.staging.json`](src/config/frontend-config.staging.json): Overrides for staging environment.
- [`src/config/frontend-config.production.json`](src/config/frontend-config.production.json): Overrides for production environment.

## 2. Configuration Access Pattern: `ConfigService`

All configuration settings should be accessed via the `ConfigService` class to ensure type safety and proper environment handling.

### Usage

Import `ConfigService` and use its static methods:

```typescript
// src/screens/MyScreen.tsx
import { ConfigService } from '@/src/config/ConfigService';

function MyScreen() {
  const appName = ConfigService.get<string>('app.displayName');
  const apiBaseURL = ConfigService.get<string>('api.baseURL');
  const contactSyncEnabled = ConfigService.get<boolean>('features.contactSync');
  const primaryColor = ConfigService.get<string>('ui.theme.primaryColor');

  // Accessing API endpoints
  const contactsEndpoint = ConfigService.getApiEndpoint('contacts');

  console.log(`App Name: ${appName}`);
  console.log(`API Base URL: ${apiBaseURL}`);
  console.log(`Contact Sync Enabled: ${contactSyncEnabled}`);
  console.log(`Primary Color: ${primaryColor}`);
  console.log(`Contacts API Endpoint: ${contactsEndpoint}`);

  // Example of using a feature flag
  const showAdvancedSearch = ConfigService.get<boolean>('features.advancedSearch');
  if (showAdvancedSearch) {
    // Render advanced search UI
  }

  return (
    // Your component JSX
    <Text>Welcome to {appName}</Text>
  );
}
```

### `ConfigService.ts`

```typescript
// src/config/ConfigService.ts
import baseConfig from './frontend-config.json';
import devConfig from './frontend-config.development.json';
import stagingConfig from './frontend-config.staging.json';
import prodConfig from './frontend-config.production.json';
import { FrontendConfig } from './types';

class ConfigService {
  private static config: FrontendConfig;

  private static detectEnvironment(): string {
    if (process.env.NODE_ENV === 'development' || __DEV__) {
      return 'development';
    }
    if (process.env.NODE_ENV === 'staging') {
      return 'staging';
    }
    return 'production';
  }

  private static loadConfig(): FrontendConfig {
    const env = this.detectEnvironment();
    let currentConfig: FrontendConfig = baseConfig as FrontendConfig;

    if (env === 'development') {
      currentConfig = { ...currentConfig, ...devConfig };
    } else if (env === 'staging') {
      currentConfig = { ...currentConfig, ...stagingConfig };
    } else if (env === 'production') {
      currentConfig = { ...currentConfig, ...prodConfig };
    }
    return currentConfig;
  }

  static initialize() {
    if (!ConfigService.config) {
      ConfigService.config = ConfigService.loadConfig();
    }
  }

  static get<T>(path: string): T {
    if (!ConfigService.config) {
      ConfigService.initialize();
    }
    return path.split('.').reduce((obj, key) => obj?.[key], ConfigService.config) as T;
  }

  static getApiEndpoint(endpoint: string): string {
    const baseURL = this.get<string>('api.baseURL');
    const path = this.get<string>(`api.endpoints.${endpoint}`);
    return `${baseURL}${path}`;
  }
}

ConfigService.initialize();

export { ConfigService };
```

## 3. Type Safety

TypeScript interfaces are defined in [`src/config/types.ts`](src/config/types.ts) to provide strong type checking for the configuration object.

### `types.ts`

```typescript
// src/config/types.ts
export interface AppConfig {
  name: string;
  displayName: string;
  version: string;
  buildNumber: string;
  bundleId: string;
  description: string;
}

// ... (other interfaces like ApiConfig, FeaturesConfig, etc.)

export interface FrontendConfig {
  app: AppConfig;
  api: ApiConfig;
  features: FeaturesConfig;
  ui: UiConfig;
  performance: PerformanceConfig;
  storage: StorageConfig;
  permissions: PermissionsConfig;
  logging: LoggingConfig;
  development: DevelopmentConfig;
  analytics: AnalyticsConfig;
  security: SecurityConfig;
  contacts: ContactsConfig;
  network: NetworkConfig;
  experimental: ExperimentalConfig;
  [key: string]: any; // For dynamic access in ConfigService
}
```

## 4. Runtime Validation

The `validateConfig` function in [`src/config/validator.ts`](src/config/validator.ts) ensures that critical configuration paths are defined at runtime.

### `validator.ts`

```typescript
// src/config/validator.ts
import { FrontendConfig } from './types';

export function validateConfig(config: FrontendConfig): boolean {
  const required = [
    'app.name',
    'app.version',
    'api.baseURL',
    // ... (all other required paths)
  ];

  return required.every(path =>
    path.split('.').reduce((obj, key) => obj?.[key], config) !== undefined
  );
}
```

## 5. Integration Testing

Integration tests for `ConfigService` are located in [`__tests__/ConfigService.test.ts`](__tests__/ConfigService.test.ts).

### `ConfigService.test.ts`

```typescript
// __tests__/ConfigService.test.ts
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