import { useState, useEffect } from 'react';

import {
  type PublicAdmissionPortal,
  getPublicAdmissionsPortalUrl,
} from './public-admissions-portal';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export function usePublicAdmissionsPortal(tenantId: string) {
  const [portal, setPortal] = useState<PublicAdmissionPortal | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    async function loadPortal() {
      try {
        const response = await fetch(getPublicAdmissionsPortalUrl(API_BASE, tenantId), {
          signal: abortController.signal,
        });
        if (!response.ok) return;
        setPortal((await response.json()) as PublicAdmissionPortal);
      } catch {
        // Branding and help enhance the public journey but never block the admission task.
      }
    }

    loadPortal();
    return () => abortController.abort();
  }, [tenantId]);

  return portal;
}
