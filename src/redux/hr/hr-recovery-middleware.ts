import type { Middleware } from '@reduxjs/toolkit';

import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import { emitHrRecovery, hrRecoveryScope } from 'src/screens/hr/recovery/hr-recovery-events';
import { takeInlineSalaryPreviewRecovery } from 'src/screens/hr/recovery/inline-salary-preview-recovery';

/** Observe mutation outcomes only. Never retry commands or retain their arguments. */
export const hrRecoveryMiddleware: Middleware = (store) => {
  const requests = new Map<string, { route: string; scope: string; endpoint: string }>();
  const latest = new Map<string, string>();
  return (next) => (action) => {
    const result = next(action);
    const event = action as any;
    if (typeof window === 'undefined' || !event.type?.startsWith('api/executeMutation/'))
      return result;
    const id = event.meta?.requestId;
    const endpoint = event.meta?.arg?.endpointName;
    if (!id || !endpoint) return result;
    const route = window.location.pathname + window.location.search;
    const scope = hrRecoveryScope(store.getState().auth);
    const key = JSON.stringify([scope, route, endpoint]);
    if (event.type.endsWith('/pending')) {
      if (window.location.pathname.startsWith('/hr/') && scope) {
        if (requests.size >= 100) {
          requests.clear();
          latest.clear();
        }
        requests.set(id, { route, scope, endpoint });
        latest.set(key, id);
      }
      return result;
    }
    const started = requests.get(id);
    requests.delete(id);
    const startedKey = started
      ? JSON.stringify([started.scope, started.route, started.endpoint])
      : '';
    const isLatest = latest.get(startedKey) === id;
    if (isLatest) latest.delete(startedKey);
    if (!started || started.route !== route || started.scope !== scope || !isLatest) return result;
    if (event.meta?.aborted || event.meta?.condition) return result;
    const inlineOwned = takeInlineSalaryPreviewRecovery(id, route);
    const failure = event.type.endsWith('/rejected') ? normalizeHrFailure(event.payload) : undefined;
    // Only this explicitly owned, read-only calculation's known business failures are local.
    // Additional field validation, access, transport and unrelated failures retain global recovery.
    if (inlineOwned && endpoint === 'previewSalaryTemplate' && failure?.kind === 'salaryPreview' &&
      failure.fields.length === 0 && [400, 422].includes(Number(event.payload?.status))) return result;
    emitHrRecovery({
      ...started,
      requestId: id,
      ...(failure ? { failure } : {}),
    });
    return result;
  };
};
