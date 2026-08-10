'use client';

import { Alert, Stack } from '@mui/material';

import { EnrollmentWorkspaceHeader } from './workspace-header';

import { enrollmentWorkspaceRootSx } from './workspace-table-patterns';

import { useExamsWorkspaceWorkspace } from './exams-workspace-context';

import { ExamsWorkspaceSection1 } from './exams-workspace-section-1';

import { ExamsWorkspaceSection2 } from './exams-workspace-section-2';

export function ExamsWorkspaceView() {
  const { state: controllerState, actions, meta } = useExamsWorkspaceWorkspace();
  const { academicYearId } = { ...controllerState, ...actions, ...meta };

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="Assessments"
          description="Process attendance, results, merit, and eligibility decisions from one queue."
        />
        <Alert severity="info">Select an academic year to open Assessments.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <ExamsWorkspaceSection1 />

      <ExamsWorkspaceSection2 />
    </Stack>
  );
}
