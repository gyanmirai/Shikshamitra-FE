import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { createWorkflowColumns } from './workflow-columns';

const workflow: AdmissionWorkflow = {
  id: 'workflow-draft-2',
  name: 'Stage 8 Main Workflow',
  code: 'STAGE_8',
  version: 2,
  status: 0,
  parentVersionId: 'workflow-v1',
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp',
  creationTime: '2026-11-20T00:00:00Z',
  stages: [],
  transitions: [],
};

it('shows the workflow version and status beside the shared workflow name', () => {
  const nameColumn = createWorkflowColumns(
    {
      canEdit: false,
      canDelete: false,
      canClone: false,
      canCreateVersion: false,
      canArchive: false,
      canReopen: false,
      canViewUsage: false,
    },
    {
      onEdit: () => undefined,
      onClone: () => undefined,
      onCreateVersion: () => undefined,
      onUsage: () => undefined,
      onArchive: () => undefined,
      onReopen: () => undefined,
      onDelete: () => undefined,
      onPublish: () => undefined,
    }
  ).find((column) => column.id === 'name');

  render(<>{nameColumn?.render?.(workflow.name, workflow)}</>);

  expect(screen.getByText('Stage 8 Main Workflow')).toBeInTheDocument();
  expect(screen.getByText('Version 2 · Draft')).toBeInTheDocument();
});
