'use client';

import { useConfig } from '@/hooks/useConfig';

export function EnvironmentBanner() {
  const { config, loading } = useConfig();

  if (loading || !config || !config.ui.showEnvironmentBanner) {
    return null;
  }

  const getEnvironmentStyles = () => {
    switch (config.environment) {
      case 'mock':
        return 'bg-orange-500 text-white';
      case 'dev':
        return 'bg-blue-500 text-white';
      case 'release':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getEnvironmentInfo = () => {
    switch (config.environment) {
      case 'mock':
        return {
          label: 'MOCK MODE',
          description: 'Using mock data - no database required',
          icon: '🎭'
        };
      case 'dev':
        return {
          label: 'DEVELOPMENT',
          description: 'Connected to local database',
          icon: '🚧'
        };
      case 'release':
        return {
          label: 'PRODUCTION',
          description: 'Live environment with real data',
          icon: '🚀'
        };
      default:
        return {
          label: 'UNKNOWN',
          description: 'Unknown environment configuration',
          icon: '❓'
        };
    }
  };

  const envInfo = getEnvironmentInfo();

  return (
    <div className={`${getEnvironmentStyles()} px-4 py-2 text-center text-sm font-medium`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span>{envInfo.icon}</span>
        <span className="font-bold">{envInfo.label}</span>
        <span>•</span>
        <span>{envInfo.description}</span>
        {config.ui.enableDebugMode && (
          <>
            <span>•</span>
            <span className="opacity-75">Debug Mode</span>
          </>
        )}
      </div>
    </div>
  );
}