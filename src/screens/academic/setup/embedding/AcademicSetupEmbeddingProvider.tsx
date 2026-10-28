'use client';

import type { ReactNode } from 'react';

import { useRef, useEffect, useContext, useCallback, createContext } from 'react';

export type AcademicSetupFormState = { dirty: boolean; busy: boolean };
type ReportState = (state: AcademicSetupFormState) => void;

const EmbeddingContext = createContext<ReportState | null>(null);
const StandardContext = createContext<((standardId: string | undefined) => void) | null>(null);

type Props = {
  children: ReactNode;
  onFormStateChange: (state: AcademicSetupFormState) => void;
  onStandardChange?: (standardId: string | undefined) => void;
};

export function AcademicSetupEmbeddingProvider({
  children,
  onFormStateChange,
  onStandardChange,
}: Props) {
  const reportRef = useRef(onFormStateChange);
  useEffect(() => {
    reportRef.current = onFormStateChange;
  }, [onFormStateChange]);
  // The reporter is an effect dependency in embedded forms; a stable reference avoids feedback loops.
  const report = useCallback((state: AcademicSetupFormState) => reportRef.current(state), []);
  return (
    <EmbeddingContext.Provider value={report}>
      <StandardContext.Provider value={onStandardChange ?? null}>
        {children}
      </StandardContext.Provider>
    </EmbeddingContext.Provider>
  );
}

export function useAcademicSetupEmbedding() {
  return { embedded: useContext(EmbeddingContext) !== null };
}

export function useAcademicSetupFormState(
  { dirty, busy }: AcademicSetupFormState,
  onStateChange?: ReportState
) {
  const report = useContext(EmbeddingContext);
  useEffect(() => {
    report?.({ dirty, busy });
    onStateChange?.({ dirty, busy });
  }, [report, onStateChange, dirty, busy]);
  useEffect(
    () => () => {
      report?.({ dirty: false, busy: false });
      onStateChange?.({ dirty: false, busy: false });
    },
    [report, onStateChange]
  );
}

export function useAcademicSetupStandard(standardId?: string) {
  const report = useContext(StandardContext);
  useEffect(() => {
    if (standardId) report?.(standardId);
  }, [report, standardId]);
}
