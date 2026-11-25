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

const columns = createWorkflowColumns(
  {
    canEdit: false,
    canDelete: false,
    canCreateVersion: false,
    canArchive: false,
    canReopen: false,
    canViewUsage: false,
  },
  {
    onEdit: () => undefined,
    onCreateVersion: () => undefined,
    onUsage: () => undefined,
    onArchive: () => undefined,
    onReopen: () => undefined,
    onDelete: () => undefined,
    onPublish: () => undefined,
  }
);

it('shows the workflow version and status beside the shared workflow name', () => {
  const nameColumn = columns.find((column) => column.id === 'name');

  render(<>{nameColumn?.render?.(workflow.name, workflow)}</>);

  expect(screen.getByText('Stage 8 Main Workflow')).toBeInTheDocument();
  expect(screen.getByText('Version 2 · Draft')).toBeInTheDocument();
});

it('left-aligns the requested columns and offers an optional Created At column', () => {
  expect(columns.filter(({ id }) => ['version', 'offeringCount', 'actions'].includes(id))).toEqual([
    expect.objectContaining({ id: 'version', align: 'left' }),
    expect.objectContaining({ id: 'offeringCount', align: 'left' }),
    expect.objectContaining({ id: 'actions', align: 'left' }),
  ]);
  expect(columns.find(({ id }) => id === 'creationTime')).toMatchObject({
    label: 'Created At',
    defaultHidden: true,
    isSort: false,
    isFilter: false,
  });
});
