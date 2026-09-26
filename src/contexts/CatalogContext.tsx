import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { mapCatalogFirm } from '../lib/catalog';
import type { PropFirm } from '../types';

interface CatalogContextValue {
  firms: PropFirm[];
  loading: boolean;
  error: string;
  lastSyncedAt: string | null;
}

const CatalogContext = createContext<CatalogContextValue>({ firms: [], loading: true, error: '', lastSyncedAt: null });
export const useCatalog = () => useContext(CatalogContext);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/catalog', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error('Unable to load the firm catalog. Please try again.');
        const payload = await res.json();
        setFirms(payload.data.map(mapCatalogFirm));
        setLastSyncedAt(payload.meta.lastSyncedAt);
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <CatalogContext.Provider value={{ firms, loading, error, lastSyncedAt }}>
      {children}
    </CatalogContext.Provider>
  );
}