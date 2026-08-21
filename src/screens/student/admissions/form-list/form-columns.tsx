import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Typography } from '@mui/material';
import { Label } from 'src/components/label';

import { FormRowActions } from './form-row-actions';

type Handlers = {
  canManage: boolean;
  canPublish: boolean;
  onPreview: (form: AdmissionForm) => void;
  onEdit: (form: AdmissionForm) => void;
  onClone: (form: AdmissionForm) => void;
  onValidate: (form: AdmissionForm) => void;
  onPublish: (form: AdmissionForm) => void;
  onCreateVersion: (form: AdmissionForm) => void;
  onArchive: (form: AdmissionForm) => void;
};

const STATUS_LABELS = ['Draft', 'Published', 'Archived'] as const;
const STATUS_COLORS = ['default', 'success', 'error'] as const;

export function createFormColumns(handlers: Handlers): IColumn[] {
  return [
    { id: 'name', label: 'Form', minWidth: 220, filterType: 'string', render: (value) => <Typography fontWeight={600}>{value}</Typography> },
    { id: 'code', label: 'Code', filterType: 'string' },
    { id: 'version', label: 'Version', filterType: 'number' },
    { id: 'status', label: 'Status', filterType: 'enum', sticky: true, render: (value) => <Label color={STATUS_COLORS[Number(value)]}>{STATUS_LABELS[Number(value)]}</Label> },
    { id: 'sectionCount', label: 'Sections', filterType: 'number', isFilter: false, render: (value) => Number(value) || 0 },
    {
      id: 'actions', label: 'Actions', width: 80, align: 'right', sticky: true, stickyPosition: 'right', isFilter: false, isSort: false, excludeFromExport: true,
      render: (_, row) => {
        const form = row as AdmissionForm;
        return <FormRowActions form={form} canManage={handlers.canManage} canPublish={handlers.canPublish} onPreview={() => handlers.onPreview(form)} onEdit={() => handlers.onEdit(form)} onClone={() => handlers.onClone(form)} onValidate={() => handlers.onValidate(form)} onPublish={() => handlers.onPublish(form)} onCreateVersion={() => handlers.onCreateVersion(form)} onArchive={() => handlers.onArchive(form)} />;
      },
    },
  ];
}
