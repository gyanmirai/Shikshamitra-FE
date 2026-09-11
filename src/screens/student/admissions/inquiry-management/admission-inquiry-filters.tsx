import type {
  AdmissionInquirySource,
  AdmissionInquiryStatus,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { Stack, MenuItem, TextField } from '@mui/material';

import { INQUIRY_SOURCE_OPTIONS, INQUIRY_STATUS_OPTIONS } from './admission-inquiry-list-options';

type Option = { id: string; name?: string; code?: string };

type Props = {
  search: string;
  cycleId: string;
  offeringId: string;
  status: '' | AdmissionInquiryStatus;
  source: '' | AdmissionInquirySource;
  cycles: Option[];
  offerings: Option[];
  onChange: (field: 'search' | 'cycleId' | 'offeringId' | 'status' | 'source', value: string) => void;
};

export function AdmissionInquiryFilters(props: Props) {
  const { search, cycleId, offeringId, status, source, cycles, offerings, onChange } = props;
  const select = (
    field: 'cycleId' | 'offeringId' | 'status' | 'source',
    label: string,
    value: string | number,
    children: React.ReactNode,
    minWidth: number
  ) => (
    <TextField
      select
      label={label}
      value={value}
      onChange={(event) => onChange(field, event.target.value)}
      size="small"
      sx={{ minWidth }}
    >
      {children}
    </TextField>
  );

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <TextField
        label="Search applicant or phone"
        value={search}
        onChange={(event) => onChange('search', event.target.value)}
        size="small"
        sx={{ minWidth: 240 }}
      />
      {select(
        'cycleId',
        'Cycle',
        cycleId,
        [
          <MenuItem key="all" value="">All cycles</MenuItem>,
          ...cycles.map((cycle) => <MenuItem key={cycle.id} value={cycle.id}>{cycle.name}</MenuItem>),
        ],
        180
      )}
      {select(
        'offeringId',
        'Offering',
        offeringId,
        [
          <MenuItem key="all" value="">All offerings</MenuItem>,
          ...offerings.map((offering) => <MenuItem key={offering.id} value={offering.id}>{offering.code}</MenuItem>),
        ],
        180
      )}
      {select(
        'status',
        'Status',
        status,
        [
          <MenuItem key="all" value="">All statuses</MenuItem>,
          ...INQUIRY_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>),
        ],
        160
      )}
      {select(
        'source',
        'Source',
        source,
        [
          <MenuItem key="all" value="">All sources</MenuItem>,
          ...INQUIRY_SOURCE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>),
        ],
        150
      )}
    </Stack>
  );
}
