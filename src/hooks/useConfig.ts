'use client';

import { useState, useEffect } from 'react';
import type { AppConfig } from '@/config/types';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import config dynamically on client-side
    import('@/config').then(({ config: importedConfig }) => {
      setConfig(importedConfig);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  return { config, loading };
}