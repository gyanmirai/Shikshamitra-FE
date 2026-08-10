'use client';

import { PipelineWorkspaceView } from './pipeline-workspace-view';
import { PipelineWorkspaceProvider } from './pipeline-workspace-context';
import { usePipelineWorkspaceController } from './pipeline-workspace-controller';
import { ApplicantWorkspaceDirtyProvider } from './applicant-workspace-dirty-context';

function PipelineWorkspaceContent() {
  const controller = usePipelineWorkspaceController();

  return (
    <PipelineWorkspaceProvider value={controller}>
      <PipelineWorkspaceView />
    </PipelineWorkspaceProvider>
  );
}

export function PipelineWorkspace() {
  return (
    <ApplicantWorkspaceDirtyProvider>
      <PipelineWorkspaceContent />
    </ApplicantWorkspaceDirtyProvider>
  );
}
