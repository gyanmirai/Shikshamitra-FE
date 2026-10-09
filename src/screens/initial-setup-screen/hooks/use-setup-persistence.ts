import type { SetupDraft, SetupAction, InitialSetup } from 'src/redux/initial-setup/types';

import { useRef, useState, useCallback } from 'react';
import { useSaveInitialSetupMutation } from 'src/redux/initial-setup/initial-setup-api';

import { setupError } from '../services/setup-error';

export function useSetupPersistence(initial: InitialSetup) {
  const [progress, setProgress] = useState(initial);
  const latest = useRef(initial);
  const savedDraft = useRef(JSON.stringify(initial.draft));
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const locked = useRef(false);
  const [blocking, setBlocking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [mutate] = useSaveInitialSetupMutation();

  // Stable identity is required by the autosave effect; all queued writes use the latest server stamp.
  const write = useCallback(
    async (action: SetupAction, input: Record<string, unknown>) => {
      const operation = queue.current.then(async () => {
        setSaving(true);
        try {
          const response = await mutate({
            action,
            input: { ...input, concurrencyStamp: latest.current.concurrencyStamp },
          }).unwrap();
          latest.current = response;
          savedDraft.current = JSON.stringify(response.draft);
          setProgress(response);
          setError('');
          setConflict(false);
          return response;
        } catch (failure) {
          setError(setupError(failure));
          setConflict(
            Boolean(
              failure &&
              typeof failure === 'object' &&
              'status' in failure &&
              failure.status === 409
            )
          );
          throw failure;
        } finally {
          setSaving(false);
        }
      });
      queue.current = operation.catch(() => undefined);
      return operation;
    },
    [mutate]
  );

  // Autosave observes a stable function, while refs keep step/concurrency state current.
  const autosave = useCallback(
    async (draft: SetupDraft, step: number) => {
      if (
        locked.current ||
        latest.current.currentStep !== step ||
        latest.current.isCompleted ||
        JSON.stringify(draft) === savedDraft.current
      )
        return;
      await write('draft', { draft, currentStep: step });
    },
    [write]
  );

  async function command(action: SetupAction, input: Record<string, unknown>, draft: SetupDraft) {
    if (locked.current) return undefined;
    locked.current = true;
    setBlocking(true);
    try {
      if (action !== 'draft')
        await write('draft', { draft, currentStep: latest.current.currentStep });
      return await write(action, input);
    } finally {
      locked.current = false;
      setBlocking(false);
    }
  }
  function adopt(response: InitialSetup) {
    latest.current = response;
    savedDraft.current = JSON.stringify(response.draft);
    setProgress(response);
    setError('');
    setConflict(false);
  }
  return { progress, blocking, saving, error, conflict, savedDraft, autosave, command, adopt };
}
