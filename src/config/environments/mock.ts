import type { AppConfig } from '../types';

export const mockConfig: AppConfig = {
  environment: 'mock',
  app: {
    name: 'Auckland School Finder',
    url: 'http://localhost:3000',
    version: '1.0.0'
  },
  api: {
    baseUrl: '/api',
    timeout: 5000,
    retryAttempts: 2
  },
  database: {
    enabled: false,
    url: '',
    provider: 'mock'
  },
  services: {
    school: 'mock',
    geocoding: 'mock',
    zones: 'mock'
  },
  features: {
    maps: {
      enabled: true,
      provider: 'mock',
      apiKey: ''
    },
    analytics: {
      enabled: false,
      provider: 'none'
    },
    monitoring: {
      enabled: false,
      provider: 'none'
    }
  },
  ui: {
    showEnvironmentBanner: true,
    enableDebugMode: true,
    defaultPageSize: 12
  }
};