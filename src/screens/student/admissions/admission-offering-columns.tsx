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
  { id: 'stageName', label: 'School level', minWidth: 130 },
  { id: 'standardName', label: 'Standard', minWidth: 130 },
  {
    id: 'workflowName',
    label: 'Workflow',
    minWidth: 170,
    render: (_, row) =>
      row.workflowName && row.workflowVersion != null
        ? `${row.workflowName} v${row.workflowVersion}`
        : 'Not configured',
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
    id: 'applicationCount',
    label: 'Applications',
    minWidth: 120,
  },
  {
    id: 'availabilityStatus',
    label: 'Availability',
    sticky: true,
    stickyPosition: 'right',
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
    stickyPosition: 'right',
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
    stickyPosition: 'right',
    width: 160,
    minWidth: 150,
    align: 'right',
    isSort: false,
    isFilter: false,
    excludeFromExport: true,
    render: (_, data) => (
      <AdmissionOfferingRowActions
        row={data as unknown as AdmissionOfferingListItem}
        {...actions}
      />
    ),
  },
];
