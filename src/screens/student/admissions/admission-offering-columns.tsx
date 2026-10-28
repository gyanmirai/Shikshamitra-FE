import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import Box from '@mui/material/Box';
import { Label } from 'src/components/label';
import { fNumber } from 'src/utils/format-number';
import { formatDateOnly } from 'src/utils/date-only';
import CustomTooltip from 'src/components/custom-tooltip';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionOfferingRowActions } from './admission-offering-row-actions';
import {
  availabilityColors,
  availabilityLabels,
  admissionTrackLabels,
} from './admission-offering-model';

import type { AdmissionOfferingActionProps } from './admission-offering-row-actions';

export type OfferingColumnOptions = Partial<Record<string, { value: string; label: string }[]>>;

export const buildAdmissionOfferingColumns = (
  actions: AdmissionOfferingActionProps,
  options: OfferingColumnOptions = {}
): IColumn[] => [
  {
    id: 'name',
    label: 'Offering',
    sticky: true,
    rowHeader: true,
    isFilter: true,
    filterType: 'string',
    filterOperators: ['contains', 'equals', 'startsWith', 'endsWith'],
    minWidth: 210,
    render: (value, row) => (
      <AdmissionTableText
        text={String(value || row.code)}
        secondary={`${admissionTrackLabels[row.track as AdmissionOfferingListItem['track']]}`}
        strong
      />
    ),
  },
  {
    id: 'boardName',
    label: 'Board',
    isFilter: true,
    filterType: 'enum',
    filterOperators: ['equals'],
    enumOptions: options.boardName ?? [],
    isSort: false,
    minWidth: 120,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'mediumName',
    label: 'Medium',
    isFilter: true,
    filterType: 'enum',
    filterOperators: ['equals'],
    enumOptions: options.mediumName ?? [],
    minWidth: 120,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'stageName',
    label: 'School level',
    isFilter: true,
    filterType: 'enum',
    filterOperators: ['equals'],
    enumOptions: options.stageName ?? [],
    minWidth: 130,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'standardName',
    label: 'Class',
    isFilter: true,
    filterType: 'enum',
    filterOperators: ['equals'],
    enumOptions: options.standardName ?? [],
    minWidth: 130,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'workflowName',
    label: 'Workflow',
    isFilter: false,
    isSort: false,
    minWidth: 170,
    render: (_, row) => (
      <AdmissionTableText
        text={
          row.workflowName && row.workflowVersion != null
            ? `${row.workflowName} v${row.workflowVersion}`
            : 'Not configured'
        }
      />
    ),
  },
  {
    id: 'effectiveOpenDate',
    label: 'Open',
    isFilter: true,
    filterType: 'date',
    filterOperators: ['equals', 'after', 'before'],
    align: 'right',
    headerAlign: 'left',
    minWidth: 120,
    render: (value) => <AdmissionTableText text={formatDateOnly(value)} />,
  },
  {
    id: 'effectiveCloseDate',
    label: 'Close',
    isFilter: true,
    filterType: 'date',
    filterOperators: ['equals', 'after', 'before'],
    align: 'right',
    headerAlign: 'left',
    minWidth: 120,
    render: (value) => <AdmissionTableText text={formatDateOnly(value)} />,
  },
  {
    id: 'applicationCount',
    label: 'Applications',
    isFilter: true,
    filterType: 'number',
    filterOperators: ['equals', 'greaterThan', 'lessThan', 'between'],
    filterStep: 1,
    align: 'right',
    headerAlign: 'left',
    render: (value) => fNumber(value),
    minWidth: 120,
  },
  {
    id: 'availabilityStatus',
    label: 'Status',
    isFilter: true,
    filterType: 'enum',
    filterOperators: ['equals'],
    enumOptions: options.availabilityStatus ?? [],
    isSort: false,
    sticky: true,
    stickyPosition: 'right',
    stickyOnMobile: false,
    headerSx: { display: { xs: 'none', sm: 'table-cell' } },
    cellSx: { display: { xs: 'none', sm: 'table-cell' } },
    minWidth: 150,
    render: (value) => (
      <Label color={availabilityColors[value as number]}>
        {availabilityLabels[value as number]}
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
    headerSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
    cellSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
    align: 'right',
    headerAlign: 'left',
    isSort: false,
    isFilter: false,
    excludeFromExport: true,
    render: (_, data) => (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <AdmissionOfferingRowActions
          row={data as unknown as AdmissionOfferingListItem}
          {...actions}
        />
      </Box>
    ),
  },
];
