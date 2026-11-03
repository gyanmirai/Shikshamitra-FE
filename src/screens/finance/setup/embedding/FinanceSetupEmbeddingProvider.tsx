'use client';

import type { ReactNode } from 'react';

import { useMemo, useContext, createContext } from 'react';

const FinanceSetupEmbeddingContext = createContext<{
  embedded: boolean;
  setEditorOpen?: (open: boolean) => void;
}>({ embedded: false });

export function FinanceSetupEmbeddingProvider({
  children,
  onEditorOpenChange,
}: {
  children: ReactNode;
  onEditorOpenChange: (open: boolean) => void;
}) {
  const value = useMemo(
    () => ({ embedded: true, setEditorOpen: onEditorOpenChange }),
    [onEditorOpenChange]
  );
  return (
    <FinanceSetupEmbeddingContext.Provider value={value}>
      {children}
    </FinanceSetupEmbeddingContext.Provider>
  );
}

export const useFinanceSetupEmbedding = () => useContext(FinanceSetupEmbeddingContext);
