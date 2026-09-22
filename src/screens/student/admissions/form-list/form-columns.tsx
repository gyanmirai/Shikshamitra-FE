import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Typography } from '@mui/material';
import { Label } from 'src/components/label';

import { FormRowActions } from './form-row-actions';

type Handlers = {
  canManage: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canOverrideMakerChecker: boolean;
  currentUserId?: string | null;
  onPreview: (form: AdmissionForm) => void;
  onEdit: (form: AdmissionForm) => void;
  onClone: (form: AdmissionForm) => void;
  onValidate: (form: AdmissionForm) => void;
  onRequestApproval: (form: AdmissionForm) => void;
  onApprove: (form: AdmissionForm) => void;
  onReject: (form: AdmissionForm) => void;
  onPublish: (form: AdmissionForm) => void;
  onHistory: (form: AdmissionForm) => void;
  onCreateVersion: (form: AdmissionForm) => void;
  onArchive: (form: AdmissionForm) => void;
  onDelete: (form: AdmissionForm) => void;
};

const STATUS_LABELS = ['Draft', 'Published', 'Archived'] as const;
const STATUS_COLORS = ['default', 'success', 'error'] as const;
const APPROVAL_LABELS = [
  'Not requested',
  'Pending review',
  'Approved',
  'Changes requested',
] as const;
const APPROVAL_COLORS = ['default', 'warning', 'success', 'error'] as const;

export function createFormColumns(handlers: Handlers): IColumn[] {
  return [
    {
      id: 'name',
      label: 'Form',
      minWidth: 220,
      isFilter: false,
      isSort: false,
      render: (value) => <Typography fontWeight={600}>{value}</Typography>,
    },
    { id: 'code', label: 'Code', isFilter: false, isSort: false },
    { id: 'version', label: 'Version', isFilter: false, isSort: false },

    {
      id: 'sectionCount',
      label: 'Sections',
      isFilter: false,
      isSort: false,
      render: (value) => Number(value) || 0,
    },
    {
      id: 'approvalStatus',
      label: 'Approval',
      isFilter: false,
      isSort: false,
      render: (value) => (
        <Label
          color={APPROVAL_COLORS[Number(value ?? 0)]}
          sx={
            Number(value ?? 0) === 0
              ? { color: 'text.primary', bgcolor: 'action.selected' }
              : undefined
          }
        >
          {APPROVAL_LABELS[Number(value ?? 0)]}
        </Label>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      enumOptions: STATUS_LABELS.map((label, value) => ({ label, value })),
      isSort: false,
      sticky: true,
      render: (value) => (
        <Label
          color={STATUS_COLORS[Number(value)]}
          sx={
            Number(value) === 0 ? { color: 'text.primary', bgcolor: 'action.selected' } : undefined
          }
        >
          {STATUS_LABELS[Number(value)]}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 160,
      minWidth: 150,
      align: 'right',
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_, row) => {
        const form = row as AdmissionForm;
        return (
          <FormRowActions
            form={form}
            canManage={handlers.canManage}
            canPublish={handlers.canPublish}
            canDelete={handlers.canDelete}
            canOverrideMakerChecker={handlers.canOverrideMakerChecker}
            currentUserId={handlers.currentUserId}
            onPreview={() => handlers.onPreview(form)}
            onEdit={() => handlers.onEdit(form)}
            onClone={() => handlers.onClone(form)}
            onValidate={() => handlers.onValidate(form)}
            onRequestApproval={() => handlers.onRequestApproval(form)}
            onApprove={() => handlers.onApprove(form)}
            onReject={() => handlers.onReject(form)}
            onPublish={() => handlers.onPublish(form)}
            onHistory={() => handlers.onHistory(form)}
            onCreateVersion={() => handlers.onCreateVersion(form)}
            onArchive={() => handlers.onArchive(form)}
            onDelete={() => handlers.onDelete(form)}
          />
        );
      },
    },
  ];
}
