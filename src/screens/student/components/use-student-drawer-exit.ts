import { useRef, useState, useCallback } from 'react';

/** Run the owning session's close action after MUI has finished sliding the drawer out. */
export function useStudentDrawerExit() {
  const [closing, setClosing] = useState(false);
  const pending = useRef<(() => void) | 'exited' | null>(null);

  const closeAfterExit = useCallback((action: () => void) => {
    if (pending.current !== null) return;
    pending.current = action;
    setClosing(true);
  }, []);

  const onExited = useCallback(() => {
    const action = pending.current;
    if (typeof action !== 'function') return;
    pending.current = 'exited';
    action();
  }, []);

  const reopen = useCallback(() => {
    pending.current = null;
    setClosing(false);
  }, []);

  return { closing, closeAfterExit, onExited, reopen };
}
