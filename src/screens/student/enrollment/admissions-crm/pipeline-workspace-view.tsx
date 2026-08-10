'use client';

import { Alert, Stack } from '@mui/material';

import { EnrollmentWorkspaceHeader } from './workspace-header';

import { enrollmentWorkspaceRootSx } from './workspace-table-patterns';

import { usePipelineWorkspaceWorkspace } from './pipeline-workspace-context';

import { PipelineWorkspaceSection1 } from './pipeline-workspace-section-1';

import { PipelineWorkspaceSection2 } from './pipeline-workspace-section-2';

import { PipelineWorkspaceSection3 } from './pipeline-workspace-section-3';

export function PipelineWorkspaceView() {
  const { state: controllerState, actions, meta } = usePipelineWorkspaceWorkspace();
  const { academicYearId, leadsQuery } = { ...controllerState, ...actions, ...meta };

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="Admissions Pipeline"
          description="Capture, qualify, assign, and progress inquiries through exam readiness."
        />
        <Alert severity="info">Select an academic year to open the Admissions Pipeline.</Alert>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={1.5}
      data-enrollment-scroll-root="true"
      data-enrollment-restore-ready={String(!leadsQuery.isLoading && !leadsQuery.isFetching)}
      sx={enrollmentWorkspaceRootSx}
    >
      <PipelineWorkspaceSection1 />

      <PipelineWorkspaceSection2 />

      <PipelineWorkspaceSection3 />
    </Stack>
  );
}
