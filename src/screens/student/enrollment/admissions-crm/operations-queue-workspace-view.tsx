'use client';

import { Alert, Stack } from '@mui/material';

import { EnrollmentWorkspaceHeader } from './workspace-header';

import { enrollmentWorkspaceRootSx } from './workspace-table-patterns';

import { useOperationsQueueWorkspace } from './operations-queue-workspace-context';

import { OperationsQueueSection1 } from './operations-queue-workspace-section-1';

import { OperationsQueueSection2 } from './operations-queue-workspace-section-2';

export function OperationsQueueView() {
  const { state: controllerState, actions, meta } = useOperationsQueueWorkspace();
  const { academicYearId, description, showOperationsUtilities, title } = {
    ...controllerState,
    ...actions,
    ...meta,
  };

  if (!academicYearId) {
    return (
      <Stack
        spacing={1.5}
        sx={showOperationsUtilities ? { minWidth: 0 } : enrollmentWorkspaceRootSx}
      >
        <EnrollmentWorkspaceHeader title={title} description={description} />
        <Alert severity="info">Select an academic year to open this Enrollment workspace.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={showOperationsUtilities ? { minWidth: 0 } : enrollmentWorkspaceRootSx}>
      <OperationsQueueSection1 />

      <OperationsQueueSection2 />
    </Stack>
  );
}
