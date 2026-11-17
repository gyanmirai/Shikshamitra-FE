'use client';

import type { ReactNode } from 'react';

import { useId, useRef, useEffect, useContext, useCallback, createContext } from 'react';

export type StudentSetupFormState = { dirty: boolean; busy: boolean };
type ReportState = (id: string, state: StudentSetupFormState | null) => void;
const EmbeddingContext = createContext<ReportState | null>(null);

type Props = {
  children: ReactNode;
  onFormStateChange: (state: StudentSetupFormState) => void;
};

export function StudentSetupEmbeddingProvider({ children, onFormStateChange }: Props) {
  const reportRef = useRef(onFormStateChange);
  reportRef.current = onFormStateChange;
  const reporters = useRef(new Map<string, StudentSetupFormState>());
  const report = useCallback<ReportState>((id, state) => {
    if (state) reporters.current.set(id, state);
    else reporters.current.delete(id);
    const states = [...reporters.current.values()];
    reportRef.current({ dirty: states.some((item) => item.dirty), busy: states.some((item) => item.busy) });
  }, []);
  return <EmbeddingContext.Provider value={report}>{children}</EmbeddingContext.Provider>;
}

export function useStudentSetupEmbedding() {
  return { embedded: useContext(EmbeddingContext) !== null };
}

export function useStudentSetupFormState({ dirty, busy }: StudentSetupFormState) {
  const report = useContext(EmbeddingContext);
  const id = useId();
  useEffect(() => { report?.(id, { dirty, busy }); }, [report, id, dirty, busy]);
  useEffect(() => () => { report?.(id, null); }, [report, id]);
}
