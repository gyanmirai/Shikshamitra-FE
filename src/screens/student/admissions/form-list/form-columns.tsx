import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import { Label } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';

import { FormRowActions } from './form-row-actions';
import { AdmissionTableText } from '../admission-table-text';

type Handlers = {
  canManage: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canOverrideMakerChecker: boolean;
  currentUserId?: string | null;
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
const PURPOSE_LABELS = ['Inquiry', 'Registration', 'Correction', 'Consent'] as const;

export function createFormColumns(handlers: Handlers): IColumn[] {
  return [
    {
      id: 'name',
      label: 'Form',
      minWidth: 220,
      isFilter: false,
      isSort: false,
      render: (value) => <AdmissionTableText text={String(value ?? '')} strong />,
    },
    { id: 'code', label: 'Code', isFilter: false, isSort: false, render: (value) => <AdmissionTableText text={String(value ?? '')} /> },
    {
      id: 'purpose',
      label: 'Purpose',
      isFilter: false,
      isSort: false,
      render: (value) => PURPOSE_LABELS[Number(value ?? 1)] ?? 'Registration',
    },
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
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      headerSx: { display: { xs: 'none', sm: 'table-cell' } },
      cellSx: { display: { xs: 'none', sm: 'table-cell' } },
      align: 'left',
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
      label: <><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Status</Box><Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Statuses</Box></>,
      filterType: 'enum',
      enumOptions: STATUS_LABELS.map((label, value) => ({ label, value })),
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      render: (value, row) => {
        const approval = Number((row as AdmissionForm).approvalStatus ?? 0);
        const status = Number(value);
        const statusLabel = (
          <Label
            color={STATUS_COLORS[status]}
            sx={status === 0 ? { color: 'text.primary', bgcolor: 'action.selected' } : undefined}
          >
            {STATUS_LABELS[status]}
          </Label>
        );
        return (
          <>
            <CustomTooltip title={`Approval: ${APPROVAL_LABELS[approval]} · Status: ${STATUS_LABELS[status]}`} arrow>
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, maxWidth: 120 }}>
                <Label color={APPROVAL_COLORS[approval]} sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{APPROVAL_LABELS[approval]}</Label>
                {statusLabel}
              </Box>
            </CustomTooltip>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{statusLabel}</Box>
          </>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 160,
      minWidth: 150,
      headerSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
      cellSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
      align: 'left',
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
