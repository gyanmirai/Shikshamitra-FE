import type {
  AdmissionInquirySource,
  AdmissionInquiryStatus,
  AdmissionInquiryWorkQueue,
  AdmissionInquiryCounsellor,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Button, MenuItem, TextField } from '@mui/material';

import { INQUIRY_SOURCE_OPTIONS, INQUIRY_STATUS_OPTIONS } from './admission-inquiry-list-options';

type Option = { id: string; name?: string; code?: string };

export const MY_INQUIRIES_FILTER = '__mine__';
export const UNASSIGNED_INQUIRIES_FILTER = '__unassigned__';
export const INQUIRY_WORK_QUEUE_OPTIONS: { value: AdmissionInquiryWorkQueue; label: string }[] = [
  { value: 1, label: 'Overdue work' },
  { value: 2, label: 'Awaiting first contact' },
  { value: 3, label: 'Awaiting qualification' },
  { value: 4, label: 'Open follow-ups' },
];

type Props = {
  search: string;
  cycleId: string;
  offeringId: string;
  status: '' | AdmissionInquiryStatus;
  source: '' | AdmissionInquirySource;
  workQueue: '' | AdmissionInquiryWorkQueue;
  ownerId: string;
  currentUserId?: string;
  cycles: Option[];
  offerings: Option[];
  counsellors: AdmissionInquiryCounsellor[];
  showSearch?: boolean;
  showStatus?: boolean;
  onChange: (
    field: 'search' | 'cycleId' | 'offeringId' | 'status' | 'source' | 'workQueue' | 'ownerId',
    value: string
  ) => void;
  onReset: () => void;
};

export function AdmissionInquiryFilters(props: Props) {
  const {
    search,
    cycleId,
    offeringId,
    status,
    source,
    workQueue,
    ownerId,
    currentUserId,
    cycles,
    offerings,
    counsellors,
    showSearch = true,
    showStatus = true,
    onChange,
    onReset,
  } = props;
  const hasActiveFilters = Boolean(
    (showSearch && search) ||
    cycleId ||
    offeringId ||
    status !== '' ||
    source !== '' ||
    workQueue !== '' ||
    ownerId
  );
  const select = (
    field: 'cycleId' | 'offeringId' | 'status' | 'source' | 'workQueue' | 'ownerId',
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
      fullWidth
      sx={{ minWidth }}
    >
      {children}
    </TextField>
  );

  return (
    <Card sx={{ p: 1, borderRadius: 2, boxShadow: 'var(--shadows-4)', flexShrink: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          alignItems: 'center',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg:
              !showSearch && !showStatus
                ? 'repeat(3, minmax(0, 1fr))'
                : 'repeat(4, minmax(0, 1fr))',
            xl: `${showSearch ? 'minmax(220px, 1.5fr) ' : ''}repeat(${showStatus ? 6 : 5}, minmax(140px, 1fr)) auto`,
          },
        }}
      >
        {showSearch && (
          <TextField
            fullWidth
            label="Search applicant or phone"
            value={search}
            onChange={(event) => onChange('search', event.target.value)}
            size="small"
            sx={{ minWidth: 240 }}
          />
        )}
        {select(
          'cycleId',
          'Cycle',
          cycleId,
          [
            <MenuItem key="all" value="">
              All cycles
            </MenuItem>,
            ...cycles.map((cycle) => (
              <MenuItem key={cycle.id} value={cycle.id}>
                {cycle.name}
              </MenuItem>
            )),
          ],
          180
        )}
        {select(
          'offeringId',
          'Offering',
          offeringId,
          [
            <MenuItem key="all" value="">
              All offerings
            </MenuItem>,
            ...offerings.map((offering) => (
              <MenuItem key={offering.id} value={offering.id}>
                {offering.code}
              </MenuItem>
            )),
          ],
          180
        )}
        {showStatus &&
          select(
            'status',
            'Status',
            status,
            [
              <MenuItem key="all" value="">
                All statuses
              </MenuItem>,
              ...INQUIRY_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )),
            ],
            160
          )}
        {select(
          'source',
          'Source',
          source,
          [
            <MenuItem key="all" value="">
              All sources
            </MenuItem>,
            ...INQUIRY_SOURCE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            )),
          ],
          150
        )}
        {select(
          'workQueue',
          'Work queue',
          workQueue,
          [
            <MenuItem key="all" value="">
              All work
            </MenuItem>,
            ...INQUIRY_WORK_QUEUE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            )),
          ],
          190
        )}
        {select(
          'ownerId',
          'Counsellor',
          ownerId,
          [
            <MenuItem key="all" value="">
              All counsellors
            </MenuItem>,
            ...(currentUserId
              ? [
                  <MenuItem key="mine" value={MY_INQUIRIES_FILTER}>
                    My inquiries
                  </MenuItem>,
                ]
              : []),
            <MenuItem key="unassigned" value={UNASSIGNED_INQUIRIES_FILTER}>
              Unassigned
            </MenuItem>,
            ...counsellors.map((counsellor) => (
              <MenuItem key={counsellor.id} value={counsellor.id}>
                {counsellor.name || counsellor.userName}
              </MenuItem>
            )),
          ],
          190
        )}
        <Button
          size="small"
          variant="text"
          disabled={!hasActiveFilters}
          startIcon={<Iconify icon="mdi:filter-remove-outline" />}
          onClick={onReset}
          sx={{ flexShrink: 0 }}
        >
          Clear
        </Button>
      </Box>
    </Card>
  );
}
