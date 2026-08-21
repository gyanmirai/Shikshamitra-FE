import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Typography } from '@mui/material';
import { Label } from 'src/components/label';
import { formatDateOnly } from 'src/utils/date-only';

import { AdmissionOfferingRowActions } from './admission-offering-row-actions';
import { availabilityColors, availabilityLabels } from './admission-offering-model';

import type { AdmissionOfferingActionProps } from './admission-offering-row-actions';

export const buildAdmissionOfferingColumns = (actions: AdmissionOfferingActionProps): IColumn[] => [
  {
    id: 'code',
    label: 'Offering',
    minWidth: 150,
    render: (value) => <Typography fontWeight={600}>{value}</Typography>,
  },
  { id: 'boardName', label: 'Board', minWidth: 120 },
  { id: 'campusName', label: 'Campus', minWidth: 130 },
  { id: 'mediumName', label: 'Medium', minWidth: 120 },
  { id: 'stageName', label: 'Stage', minWidth: 120 },
  { id: 'standardName', label: 'Standard', minWidth: 130 },
  {
    id: 'workflowName',
    label: 'Workflow',
    minWidth: 170,
    render: (value, row) => (value ? `${value} v${row.workflowVersion}` : 'Not configured'),
  },
  {
    id: 'effectiveOpenDate',
    label: 'Open',
    minWidth: 120,
    render: (value) => formatDateOnly(value, 'DD MMM YYYY'),
  },
  {
    id: 'effectiveCloseDate',
    label: 'Close',
    minWidth: 120,
    render: (value) => formatDateOnly(value, 'DD MMM YYYY'),
  },
  {
    id: 'availabilityStatus',
    label: 'Availability',
    sticky: true,
    minWidth: 150,
    render: (value) => (
      <Label color={availabilityColors[value as number]}>
        {availabilityLabels[value as number]}
      </Label>
    ),
  },
  {
    id: 'configurationStatus',
    label: 'Configuration',
    sticky: true,
    minWidth: 130,
    render: (value) => (
      <Label color={value === 1 ? 'success' : 'warning'}>
        {value === 1 ? 'Ready' : 'Missing config'}
      </Label>
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    sticky: true,
    isSort: false,
    excludeFromExport: true,
    render: (_, data) => (
      <AdmissionOfferingRowActions
        row={data as unknown as AdmissionOfferingListItem}
        {...actions}
      />
    ),
  },
];
