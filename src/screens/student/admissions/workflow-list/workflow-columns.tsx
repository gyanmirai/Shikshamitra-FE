import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionWorkflow,
  AdmissionWorkflowStatus,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

import { WorkflowRowActions } from './workflow-row-actions';
import { AdmissionTableText } from '../admission-table-text';
import { formatWorkflowDateTime } from './workflow-list-format';

import type { WorkflowActionPermissions } from './workflow-row-actions';

export const STATUS_LABELS: Record<AdmissionWorkflowStatus, string> = {
  0: 'Draft',
  1: 'Published',
  2: 'Archived',
  3: 'Validated',
  4: 'Submitted',
  5: 'Approved',
  6: 'Scheduled',
  7: 'Superseded',
};
const STATUS_COLORS: Record<
  AdmissionWorkflowStatus,
  'default' | 'success' | 'error' | 'info' | 'warning' | 'primary' | 'secondary'
> = {
  0: 'default',
  1: 'success',
  2: 'error',
  3: 'info',
  4: 'warning',
  5: 'primary',
  6: 'secondary',
  7: 'default',
};

type Handlers = {
  onEdit: (workflow: AdmissionWorkflow) => void;
  onCreateVersion: (workflow: AdmissionWorkflow) => void;
  onUsage: (workflow: AdmissionWorkflow) => void;
  onArchive: (workflow: AdmissionWorkflow) => void;
  onReopen: (workflow: AdmissionWorkflow) => void;
  onDelete: (workflow: AdmissionWorkflow) => void;
  onPublish: (workflow: AdmissionWorkflow) => void;
  publishingId?: string | null;
  creatingVersionId?: string | null;
};

export function createWorkflowColumns(
  permissions: WorkflowActionPermissions,
  handlers: Handlers
): IColumn[] {
  return [
    {
      id: 'name',
      label: 'Workflow',
      filterType: 'string' as const,
      width: 300,
      minWidth: 250,
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      isFilter: true,
      render: (value, row) => {
        const workflow = row as AdmissionWorkflow;
        return (
          <Box sx={{ minWidth: 0 }}>
            <AdmissionTableText text={String(value ?? '')} strong />
            <Typography component="div" variant="caption" color="text.secondary">
              Version {workflow.version} · {STATUS_LABELS[workflow.status]}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'version',
      label: 'Version',
      filterType: 'number' as const,
      filterStep: 1,
      minWidth: 90,
      align: 'left',
      isFilter: true,
      render: (value) => fNumber(Number(value)),
    },
    {
      id: 'offeringCount',
      label: 'Used by Offerings',
      filterType: 'number' as const,
      filterStep: 1,
      minWidth: 150,
      align: 'left',
      isFilter: true,
      render: (value) => fNumber(Number(value)),
    },
    {
      id: 'creationTime',
      label: 'Created At',
      minWidth: 170,
      defaultHidden: true,
      isSort: false,
      isFilter: false,
      render: (value) => (
        <AdmissionTableText text={formatWorkflowDateTime(value as string | null)} />
      ),
    },
    {
      id: 'lastModificationTime',
      label: 'Last Modified',
      filterType: 'date' as const,
      minWidth: 170,
      isFilter: true,
      render: (value, row) => {
        const date = (value as string | null) || (row as AdmissionWorkflow).creationTime;
        return <AdmissionTableText text={formatWorkflowDateTime(date)} />;
      },
    },
    {
      id: 'publishedAt',
      label: 'Published At',
      filterType: 'date' as const,
      minWidth: 170,
      isFilter: true,
      render: (value) => (
        <AdmissionTableText text={formatWorkflowDateTime(value as string | null)} />
      ),
    },
    {
      id: 'status',
      originalId: 'statusLabel',
      label: 'Status',
      stickyOnMobile: false,
      filterType: 'enum' as const,
      enumOptions: Object.entries(STATUS_LABELS).map(([value, label]) => ({
        label,
        value: Number(value),
      })),
      minWidth: 120,
      sticky: true,
      stickyPosition: 'right',
      isFilter: true,
      render: (value) => {
        const status = Number(value) as AdmissionWorkflowStatus;
        return <Label color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Label>;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 160,
      minWidth: 150,
      headerSx: { width: { xs: 120, sm: 160 }, minWidth: { xs: 120, sm: 150 } },
      cellSx: { width: { xs: 120, sm: 160 }, minWidth: { xs: 120, sm: 150 } },
      align: 'left',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const workflow = row as AdmissionWorkflow;
        return (
          <WorkflowRowActions
            {...permissions}
            workflow={workflow}
            onEdit={() => handlers.onEdit(workflow)}
            onCreateVersion={() => handlers.onCreateVersion(workflow)}
            onUsage={() => handlers.onUsage(workflow)}
            onArchive={() => handlers.onArchive(workflow)}
            onReopen={() => handlers.onReopen(workflow)}
            onDelete={() => handlers.onDelete(workflow)}
            onPublish={() => handlers.onPublish(workflow)}
            publishing={handlers.publishingId === workflow.id}
            creatingVersion={handlers.creatingVersionId === workflow.id}
            busy={Boolean(handlers.publishingId || handlers.creatingVersionId)}
          />
        );
      },
    },
  ];
}
