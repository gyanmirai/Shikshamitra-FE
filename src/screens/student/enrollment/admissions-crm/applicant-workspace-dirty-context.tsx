'use client';

import type { ReactNode } from 'react';

import { Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
} from 'react';

type DirtyContextValue = {
  hasUnsavedChanges: boolean;
  registerDirtyState: (key: string, dirty: boolean) => void;
  requestTransition: (action: () => void) => void;
};

const ApplicantWorkspaceDirtyContext = createContext<DirtyContextValue | null>(null);

export function ApplicantWorkspaceDirtyProvider({ children }: { children: ReactNode }) {
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(() => new Set());
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const hasUnsavedChanges = dirtyKeys.size > 0;
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const historyGuardActiveRef = useRef(false);
  const allowNextPopRef = useRef(false);
  const afterGuardRemovalRef = useRef<(() => void) | null>(null);

  hasUnsavedChangesRef.current = hasUnsavedChanges;

  const removeHistoryGuardThen = useCallback((action: () => void) => {
    if (!historyGuardActiveRef.current) {
      action();
      return;
    }

    historyGuardActiveRef.current = false;
    allowNextPopRef.current = true;
    afterGuardRemovalRef.current = action;
    window.history.back();
  }, []);

  const registerDirtyState = useCallback((key: string, dirty: boolean) => {
    setDirtyKeys((current) => {
      const next = new Set(current);
      if (dirty) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const requestTransition = useCallback(
    (action: () => void) => {
      if (hasUnsavedChanges) setPendingAction(() => action);
      else action();
    },
    [hasUnsavedChanges]
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handlePopState = () => {
      if (allowNextPopRef.current) {
        allowNextPopRef.current = false;
        const action = afterGuardRemovalRef.current;
        afterGuardRemovalRef.current = null;
        if (action) queueMicrotask(action);
        return;
      }

      if (!historyGuardActiveRef.current || !hasUnsavedChangesRef.current) return;

      window.history.pushState(
        { ...(window.history.state || {}), applicantWorkspaceDirtyGuard: true },
        '',
        window.location.href
      );
      historyGuardActiveRef.current = true;
      setPendingAction(() => () => {
        allowNextPopRef.current = true;
        window.history.back();
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (hasUnsavedChanges && !historyGuardActiveRef.current) {
      window.history.pushState(
        { ...(window.history.state || {}), applicantWorkspaceDirtyGuard: true },
        '',
        window.location.href
      );
      historyGuardActiveRef.current = true;
      return;
    }

    if (!hasUnsavedChanges && historyGuardActiveRef.current) {
      removeHistoryGuardThen(() => {});
    }
  }, [hasUnsavedChanges, removeHistoryGuardThen]);

  const value = useMemo(
    () => ({ hasUnsavedChanges, registerDirtyState, requestTransition }),
    [hasUnsavedChanges, registerDirtyState, requestTransition]
  );

  return (
    <ApplicantWorkspaceDirtyContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title="Discard unsaved changes?"
        icon="warning"
        content="The open form contains changes that have not been submitted."
        action={
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              const action = pendingAction;
              setPendingAction(null);
              setDirtyKeys(new Set());
              removeHistoryGuardThen(() => action?.());
            }}
          >
            Discard changes
          </Button>
        }
      />
    </ApplicantWorkspaceDirtyContext.Provider>
  );
}

export function useApplicantWorkspaceDirtyState(key: string, dirty: boolean) {
  const context = useContext(ApplicantWorkspaceDirtyContext);
  const registerDirtyState = context?.registerDirtyState;
  useEffect(() => {
    registerDirtyState?.(key, dirty);
    return () => registerDirtyState?.(key, false);
  }, [dirty, key, registerDirtyState]);
}

export function useApplicantWorkspaceTransition() {
  const context = useContext(ApplicantWorkspaceDirtyContext);
  if (!context) {
    throw new Error('useApplicantWorkspaceTransition must be used inside its provider.');
  }
  return context;
}
