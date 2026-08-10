'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { ExamsWorkspaceController } from './exams-workspace-controller';

const ExamsWorkspaceContext = createContext<ExamsWorkspaceController | null>(null);

export function useExamsWorkspaceWorkspace() {
  const value = useContext(ExamsWorkspaceContext);
  if (!value) throw new Error('ExamsWorkspace workspace must be rendered inside its provider.');
  return value;
}

export function ExamsWorkspaceProvider({
  value,
  children,
}: {
  value: ExamsWorkspaceController;
  children: ReactNode;
}) {
  return <ExamsWorkspaceContext.Provider value={value}>{children}</ExamsWorkspaceContext.Provider>;
}
