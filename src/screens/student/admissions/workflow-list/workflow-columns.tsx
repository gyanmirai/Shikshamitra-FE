import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionWorkflow,
  AdmissionWorkflowStatus,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';

import { WorkflowRowActions } from './workflow-row-actions';
import { AdmissionTableText } from '../admission-table-text';
import { formatWorkflowDateTime, formatWorkflowListDate } from './workflow-list-format';

import type { WorkflowActionPermissions } from './workflow-row-actions';

const STATUS_LABELS: Record<AdmissionWorkflowStatus, string> = {
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
  onClone: (workflow: AdmissionWorkflow) => void;
  onCreateVersion: (workflow: AdmissionWorkflow) => void;
  onUsage: (workflow: AdmissionWorkflow) => void;
  onArchive: (workflow: AdmissionWorkflow) => void;
  onDelete: (workflow: AdmissionWorkflow) => void;
};

export function createWorkflowColumns(
  permissions: WorkflowActionPermissions,
  handlers: Handlers
): IColumn[] {
  return [
    {
      id: 'name',
      label: 'Workflow',
      minWidth: 240,
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      isFilter: false,
      render: (value, row) => <AdmissionTableText text={String(value ?? '')} secondary={(row as AdmissionWorkflow).description || 'No description'} strong />,
    },
    { id: 'code', label: 'Code', minWidth: 140, isFilter: false, render: (value) => <AdmissionTableText text={String(value ?? '')} /> },
    { id: 'version', label: 'Version', minWidth: 90, align: 'center', isFilter: false },
    {
      id: 'offeringCount',
      label: 'Used by offerings',
      minWidth: 150,
      align: 'center',
      isFilter: false,
    },
    {
      id: 'lastModificationTime',
      label: 'Last modified',
      minWidth: 170,
      isFilter: false,
      render: (value, row) => {
        const date = (value as string | null) || (row as AdmissionWorkflow).creationTime;
        return <AdmissionTableText text={formatWorkflowListDate(date)} tooltip={formatWorkflowDateTime(date)} />;
      },
    },
    {
      id: 'publishedAt',
      label: 'Published at',
      minWidth: 170,
      isFilter: false,
      render: (value) => <AdmissionTableText text={formatWorkflowListDate(value as string | null)} tooltip={formatWorkflowDateTime(value as string | null)} />,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
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
      headerSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
      cellSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
      align: 'right',
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
            onClone={() => handlers.onClone(workflow)}
            onCreateVersion={() => handlers.onCreateVersion(workflow)}
            onUsage={() => handlers.onUsage(workflow)}
            onArchive={() => handlers.onArchive(workflow)}
            onDelete={() => handlers.onDelete(workflow)}
          />
        );
      },
    },
  ];
}
