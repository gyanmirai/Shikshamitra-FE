import type { RefObject } from 'react';
import type { SetupDraft } from 'src/redux/initial-setup/types';

import { useEffect } from 'react';

export function useSetupAutosave(
  draft: SetupDraft,
  step: number,
  disabled: boolean,
  saved: RefObject<string>,
  save: (values: SetupDraft, step: number) => Promise<void>
) {
  useEffect(() => {
    if (disabled) return undefined;
    const timer = window.setTimeout(() => {
      save(draft, step).catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [draft, step, disabled, save]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (JSON.stringify(draft) !== saved.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draft, saved]);
}
