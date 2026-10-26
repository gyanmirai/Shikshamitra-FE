import { useEffect, useContext, createContext } from 'react';

export type AcademicFormCloseState = { dirty: boolean; busy: boolean };

export const AcademicFormCloseContext = createContext<{
  setFormState: (state: AcademicFormCloseState) => void;
  requestClose: () => void;
} | null>(null);

export function useAcademicFormClose(dirty: boolean, busy: boolean, fallbackClose: () => void) {
  const context = useContext(AcademicFormCloseContext);
  const setFormState = context?.setFormState;

  useEffect(() => {
    setFormState?.({ dirty, busy });
  }, [setFormState, dirty, busy]);

  useEffect(() => () => setFormState?.({ dirty: false, busy: false }), [setFormState]);

  return context?.requestClose ?? fallbackClose;
}
