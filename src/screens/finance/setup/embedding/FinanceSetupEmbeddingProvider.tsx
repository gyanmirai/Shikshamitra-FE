'use client';

import type { ReactNode } from 'react';

import { useMemo, useContext, createContext } from 'react';

const FinanceSetupEmbeddingContext = createContext<{
  embedded: boolean;
  setEditorOpen?: (open: boolean) => void;
  actionContainer?: HTMLElement | null;
}>({ embedded: false });

export function FinanceSetupEmbeddingProvider({
  children,
  onEditorOpenChange,
  actionContainer,
}: {
  children: ReactNode;
  onEditorOpenChange: (open: boolean) => void;
  actionContainer?: HTMLElement | null;
}) {
  const value = useMemo(
    () => ({ embedded: true, setEditorOpen: onEditorOpenChange, actionContainer }),
    [onEditorOpenChange, actionContainer]
  );
  return (
    <FinanceSetupEmbeddingContext.Provider value={value}>
      {children}
    </FinanceSetupEmbeddingContext.Provider>
  );
}

export const useFinanceSetupEmbedding = () => useContext(FinanceSetupEmbeddingContext);
