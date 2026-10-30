import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Label } from 'src/components/label';
import { fNumber } from 'src/utils/format-number';

import { FormRowActions } from './form-row-actions';
import { AdmissionTableText } from '../admission-table-text';

type Handlers = {
  canManage: boolean;
  canPublish: boolean;
  canDelete: boolean;
  onEdit: (form: AdmissionForm) => void;
  onClone: (form: AdmissionForm) => void;
  onValidate: (form: AdmissionForm) => void;
  onPublish: (form: AdmissionForm) => void;
  onHistory: (form: AdmissionForm) => void;
  onCreateVersion: (form: AdmissionForm) => void;
  onArchive: (form: AdmissionForm) => void;
  onDelete: (form: AdmissionForm) => void;
};

const STATUS_LABELS = ['Draft', 'Published', 'Archived'] as const;
const STATUS_COLORS = ['default', 'success', 'error'] as const;
const PURPOSE_LABELS = ['Inquiry', 'Registration', 'Correction', 'Consent'] as const;

export function createFormColumns(handlers: Handlers): IColumn[] {
  return [
    {
      id: 'name',
      label: 'Form',
      filterType: 'string' as const,
      minWidth: 220,
      isFilter: true,
      isSort: false,
      render: (value) => <AdmissionTableText text={String(value ?? '')} strong />,
    },

    {
      id: 'purpose',
      label: 'Form type',
      minWidth: 130,
      isFilter: false,
      isSort: false,
      render: (value) => PURPOSE_LABELS[Number(value ?? 1)] ?? 'Registration',
    },
    {
      id: 'version',
      label: 'Version',
      filterType: 'number' as const,
      minWidth: 115,
      align: 'right',
      filterStep: 1,
      isFilter: true,
      isSort: false,
      render: (value) => fNumber(value),
    },

    {
      id: 'sectionCount',
      label: 'Sections',
      filterType: 'number' as const,
      minWidth: 120,
      align: 'right',
      filterStep: 1,
      isFilter: true,
      isSort: false,
      render: (value) => fNumber(Number(value) || 0),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      isFilter: true,
      filterType: 'enum' as const,
      enumOptions: STATUS_LABELS.map((label, value) => ({ label, value })),
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      render: (value) => {
        const status = Number(value);
        return (
          <Label
            color={STATUS_COLORS[status]}
            sx={status === 0 ? { color: 'text.primary', bgcolor: 'action.selected' } : undefined}
          >
            {STATUS_LABELS[status]}
          </Label>
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
            onEdit={() => handlers.onEdit(form)}
            onClone={() => handlers.onClone(form)}
            onValidate={() => handlers.onValidate(form)}
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
