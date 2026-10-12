import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import Box from '@mui/material/Box';
import { Label } from 'src/components/label';
import { formatDateOnly } from 'src/utils/date-only';
import CustomTooltip from 'src/components/custom-tooltip';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionOfferingRowActions } from './admission-offering-row-actions';
import {
  availabilityColors,
  availabilityLabels,
  admissionTrackLabels,
  admissionEntryModeLabels,
} from './admission-offering-model';

import type { AdmissionOfferingActionProps } from './admission-offering-row-actions';

export const buildAdmissionOfferingColumns = (actions: AdmissionOfferingActionProps): IColumn[] => [
  {
    id: 'name',
    label: 'Offering',
    sticky: true,
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
    minWidth: 120,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'mediumName',
    label: 'Medium',
    minWidth: 120,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'stageName',
    label: 'School level',
    minWidth: 130,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'standardName',
    label: 'Standard',
    minWidth: 130,
    render: (value) => <AdmissionTableText text={String(value ?? '—')} />,
  },
  {
    id: 'workflowName',
    label: 'Workflow',
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
    minWidth: 120,
    render: (value) => <AdmissionTableText text={formatDateOnly(value)} />,
  },
  {
    id: 'effectiveCloseDate',
    label: 'Close',
    minWidth: 120,
    render: (value) => <AdmissionTableText text={formatDateOnly(value)} />,
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
    id: 'configurationStatus',
    label: (
      <>
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Configuration
        </Box>
        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
          Statuses
        </Box>
      </>
    ),
    sticky: true,
    stickyPosition: 'right',
    minWidth: 130,
    render: (value, row) => {
      const availability = Number((row as AdmissionOfferingListItem).availabilityStatus);
      const configuration = value === 1 ? 'Ready' : 'Missing config';
      const configurationLabel = (
        <Label color={value === 1 ? 'success' : 'warning'}>{configuration}</Label>
      );
      return (
        <>
          <CustomTooltip
            title={`Availability: ${availabilityLabels[availability]} · Configuration: ${configuration}`}
            arrow
          >
            <Box
              sx={{
                display: { xs: 'flex', sm: 'none' },
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.5,
              }}
            >
              <Label color={availabilityColors[availability]}>
                {availabilityLabels[availability]}
              </Label>
              {configurationLabel}
            </Box>
          </CustomTooltip>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{configurationLabel}</Box>
        </>
      );
    },
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
    align: 'left',
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
