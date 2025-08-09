export type Environment = 'mock' | 'dev' | 'release';

export type ServiceProvider = 'mock' | 'database' | 'external';

export type GeocodingProvider = 'mock' | 'linz' | 'mapbox' | 'google';

export type MapProvider = 'mock' | 'mapbox' | 'leaflet';

export type AnalyticsProvider = 'none' | 'gtag' | 'mixpanel';

export type MonitoringProvider = 'none' | 'console' | 'sentry' | 'datadog';

export interface AppConfig {
  environment: Environment;
  
  app: {
    name: string;
    url: string;
    version: string;
  };

  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };

  database: {
    enabled: boolean;
    url: string;
    provider: string;
  };

  services: {
    school: ServiceProvider;
    geocoding: GeocodingProvider;
    zones: ServiceProvider;
  };

  features: {
    maps: {
      enabled: boolean;
      provider: MapProvider;
      apiKey: string;
    };
    analytics: {
      enabled: boolean;
      provider: AnalyticsProvider;
    };
    monitoring: {
      enabled: boolean;
      provider: MonitoringProvider;
    };
  };

  ui: {
    showEnvironmentBanner: boolean;
    enableDebugMode: boolean;
    defaultPageSize: number;
  };
}