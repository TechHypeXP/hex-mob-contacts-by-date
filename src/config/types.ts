export interface AppConfig {
  name: string;
  displayName: string;
  version: string;
  buildNumber: string;
  bundleId: string;
  description: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  endpoints: {
    contacts: string;
    search: string;
    sync: string;
    stats: string;
  };
}

export interface FeaturesConfig {
  contactSync: boolean;
  darkMode: boolean;
  hapticFeedback: boolean;
  analytics: boolean;
  crashReporting: boolean;
  biometricAuth: boolean;
  cloudBackup: boolean;
  exportContacts: boolean;
  advancedSearch: boolean;
  contactGroups: boolean;
}

export interface UiConfig {
  theme: {
    defaultMode: string;
    primaryColor: string;
    accentColor: string;
    errorColor: string;
    warningColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    secondaryTextColor: string;
  };
  animations: {
    enabled: boolean;
    duration: number;
    springConfig: {
      tension: number;
      friction: number;
    };
  };
  layout: {
    defaultItemsPerPage: number;
    maxItemsPerPage: number;
    listItemHeight: number;
    headerHeight: number;
    tabBarHeight: number;
    searchBarHeight: number;
  };
}

export interface PerformanceConfig {
  virtualization: {
    enabled: boolean;
    windowSize: number;
    initialNumToRender: number;
    maxToRenderPerBatch: number;
    updateCellsBatchingPeriod: number;
  };
  caching: {
    maxCacheSize: number;
    cacheTTL: number;
    enableImageCache: boolean;
    enableQueryCache: boolean;
  };
  debouncing: {
    searchDelay: number;
    scrollDelay: number;
    inputDelay: number;
  };
}

export interface StorageConfig {
  encryption: boolean;
  maxStorageSize: number;
  autoCleanup: boolean;
  cleanupInterval: number;
  keys: {
    userPreferences: string;
    contactCache: string;
    searchHistory: string;
    appSettings: string;
  };
}

export interface PermissionsConfig {
  contacts: {
    required: boolean;
    description: string;
  };
  camera: {
    required: boolean;
    description: string;
  };
  notifications: {
    required: boolean;
    description: string;
  };
}

export interface LoggingConfig {
  level: string;
  enableConsole: boolean;
  enableFileLogging: boolean;
  maxLogFiles: number;
  maxLogSize: number;
  categories: {
    network: boolean;
    database: boolean;
    ui: boolean;
    performance: boolean;
    errors: boolean;
  };
}

export interface DevelopmentConfig {
  enableDebugMode: boolean;
  enableHotReload: boolean;
  enableFlipper: boolean;
  enableDevMenu: boolean;
  mockData: boolean;
  bypassAuth: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  provider: string;
  trackingId: string;
  enableAutoTracking: boolean;
  events: {
    contactView: boolean;
    contactSearch: boolean;
    contactEdit: boolean;
    appLaunch: boolean;
    featureUsage: boolean;
  };
}

export interface SecurityConfig {
  enablePinLock: boolean;
  enableBiometrics: boolean;
  sessionTimeout: number;
  maxFailedAttempts: number;
  lockoutDuration: number;
  encryptSensitiveData: boolean;
}

export interface ContactsConfig {
  maxContacts: number;
  sortOptions: string[];
  defaultSort: string;
  defaultSortDirection: string;
  searchFields: string[];
  sources: {
    device: boolean;
    google: boolean;
    icloud: boolean;
    exchange: boolean;
    sim: boolean;
  };
}

export interface NetworkConfig {
  enableOfflineMode: boolean;
  syncInterval: number;
  maxRetries: number;
  timeoutDuration: number;
  enableCompression: boolean;
  userAgent: string;
}

export interface ExperimentalConfig {
  enableNewArchitecture: boolean;
  enableConcurrentFeatures: boolean;
  enableFabric: boolean;
  enableHermes: boolean;
  enableNewLogBox: boolean;
}

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
  [key: string]: any;
}