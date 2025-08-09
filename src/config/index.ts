import { mockConfig } from './environments/mock';
import { devConfig } from './environments/dev';
import { releaseConfig } from './environments/release';
import type { AppConfig, Environment } from './types';

function getEnvironment(): Environment {
  // Check for explicit APP_ENV override
  if (process.env.APP_ENV) {
    const env = process.env.APP_ENV as Environment;
    if (['mock', 'dev', 'release'].includes(env)) {
      return env;
    }
  }

  // Fallback to NODE_ENV mapping
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'release';
    case 'development':
      return 'dev';
    case 'test':
      return 'mock';
    default:
      return 'mock';
  }
}

function loadConfig(): AppConfig {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'mock':
      return mockConfig;
    case 'dev':
      return devConfig;
    case 'release':
      return releaseConfig;
    default:
      console.warn(`Unknown environment: ${environment}, falling back to mock`);
      return mockConfig;
  }
}

export const config = loadConfig();

export { getEnvironment };
export type { AppConfig, Environment } from './types';