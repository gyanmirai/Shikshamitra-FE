'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { OperationsQueueController } from './operations-queue-workspace-controller';

const OperationsQueueContext = createContext<OperationsQueueController | null>(null);

export function useOperationsQueueWorkspace() {
  const value = useContext(OperationsQueueContext);
  if (!value) throw new Error('OperationsQueue workspace must be rendered inside its provider.');
  return value;
}

export function OperationsQueueProvider({
  value,
  children,
}: {
  value: OperationsQueueController;
  children: ReactNode;
}) {
  return (
    <OperationsQueueContext.Provider value={value}>{children}</OperationsQueueContext.Provider>
  );
}
