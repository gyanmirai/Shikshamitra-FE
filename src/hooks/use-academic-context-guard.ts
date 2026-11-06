import { useRef, useEffect } from 'react';

import {
  ACADEMIC_CONTEXT_CHANGE_EVENT,
  type AcademicContextChangeRequest,
} from './academic-context-change';

export function useAcademicContextGuard(
  enabled: boolean,
  dirty: boolean,
  busy: boolean,
  requestNavigation: (proceed: () => void) => void,
  onNavigationApproved?: () => void
) {
  const current = useRef({ enabled, dirty, busy, requestNavigation, onNavigationApproved });
  current.current = { enabled, dirty, busy, requestNavigation, onNavigationApproved };
  useEffect(() => {
    if (!enabled) return undefined;
    const registerOwner = (event: Event) => {
      const state = current.current;
      if (!state.enabled || (!state.dirty && !state.busy)) return;
      const { detail } = event as CustomEvent<AcademicContextChangeRequest>;
      detail.guards.push({
        blocked: state.busy,
        request: () => current.current.requestNavigation(detail.proceed),
        approve: () => current.current.onNavigationApproved?.(),
      });
    };
    window.addEventListener(ACADEMIC_CONTEXT_CHANGE_EVENT, registerOwner);
    return () => window.removeEventListener(ACADEMIC_CONTEXT_CHANGE_EVENT, registerOwner);
  }, [enabled]);
}
