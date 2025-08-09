import type { AppConfig } from '../types';

export const releaseConfig: AppConfig = {
  environment: 'release',
  app: {
    name: 'Auckland School Finder',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://auckland-schools.nz',
    version: '1.0.0'
  },
  api: {
    baseUrl: '/api',
    timeout: 15000,
    retryAttempts: 3
  },
  database: {
    enabled: true,
    url: process.env.DATABASE_URL || '',
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
      enabled: true,
      provider: process.env.ANALYTICS_PROVIDER || 'gtag'
    },
    monitoring: {
      enabled: true,
      provider: process.env.MONITORING_PROVIDER || 'sentry'
    }
  },
  ui: {
    showEnvironmentBanner: false,
    enableDebugMode: false,
    defaultPageSize: 20
  }
};