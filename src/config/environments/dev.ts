import type { AppConfig } from '../types';

export const devConfig: AppConfig = {
  environment: 'dev',
  app: {
    name: 'Auckland School Finder (Dev)',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: '1.0.0-dev'
  },
  api: {
    baseUrl: '/api',
    timeout: 10000,
    retryAttempts: 3
  },
  database: {
    enabled: true,
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/schoolzone',
    provider: 'postgresql'
  },
  services: {
    school: 'database',
    geocoding: process.env.GEOCODING_PROVIDER || 'linz',
    zones: 'database'
  },
  features: {
    maps: {
      enabled: true,
      provider: 'mapbox',
      apiKey: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
    },
    analytics: {
      enabled: false,
      provider: 'none'
    },
    monitoring: {
      enabled: true,
      provider: 'console'
    }
  },
  ui: {
    showEnvironmentBanner: true,
    enableDebugMode: true,
    defaultPageSize: 20
  }
};