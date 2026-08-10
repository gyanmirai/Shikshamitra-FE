'use client';

import { ExamsWorkspaceView } from './exams-workspace-view';
import { ExamsWorkspaceProvider } from './exams-workspace-context';
import { useExamsWorkspaceController } from './exams-workspace-controller';
import { ApplicantWorkspaceDirtyProvider } from './applicant-workspace-dirty-context';

function ExamsWorkspaceContent() {
  const controller = useExamsWorkspaceController();

  return (
    <ExamsWorkspaceProvider value={controller}>
      <ExamsWorkspaceView />
    </ExamsWorkspaceProvider>
  );
}

export function ExamsWorkspace() {
  return (
    <ApplicantWorkspaceDirtyProvider>
      <ExamsWorkspaceContent />
    </ApplicantWorkspaceDirtyProvider>
  );
}
