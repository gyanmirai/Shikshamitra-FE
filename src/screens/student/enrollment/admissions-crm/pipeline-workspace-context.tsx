'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { PipelineWorkspaceController } from './pipeline-workspace-controller';

const PipelineWorkspaceContext = createContext<PipelineWorkspaceController | null>(null);

export function usePipelineWorkspaceWorkspace() {
  const value = useContext(PipelineWorkspaceContext);
  if (!value) throw new Error('PipelineWorkspace workspace must be rendered inside its provider.');
  return value;
}

export function PipelineWorkspaceProvider({
  value,
  children,
}: {
  value: PipelineWorkspaceController;
  children: ReactNode;
}) {
  return (
    <PipelineWorkspaceContext.Provider value={value}>{children}</PipelineWorkspaceContext.Provider>
  );
}
