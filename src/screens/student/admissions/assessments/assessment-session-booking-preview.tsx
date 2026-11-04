import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';

import { fDateTime } from 'src/utils/format-time';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Button, Checkbox, Typography } from '@mui/material';

import type {
  SessionBookingPreview,
  SessionBookingCandidate,
} from './assessment-session-setup-model';

type Props = {
  preview: SessionBookingPreview;
  scopes: AssessmentScope[];
  selected: SessionBookingCandidate[];
  onChange: (items: SessionBookingCandidate[]) => void;
  disabled: boolean;
  page: number;
  pageSize: number;
  onPage: (page: number, size: number) => void;
  onSearch: (search: string) => void;
  isLoading: boolean;
  error?: string;
  existingSession?: boolean;
  onRetry: () => void;
};
const key = (row: SessionBookingCandidate) => `${row.applicationId}:${row.stageInstanceId}`;

export function AssessmentSessionBookingPreview({
  preview,
  scopes,
  selected,
  onChange,
  disabled,
  page,
  pageSize,
  onPage,
  onSearch,
  isLoading,
  error,
  existingSession = false,
  onRetry,
}: Props) {
  const selectCandidate = (row: SessionBookingCandidate) => {
    const exists = selected.some((item) => key(item) === key(row));
    onChange(exists ? selected.filter((item) => key(item) !== key(row)) : [...selected, row]);
  };
  const columns: IColumn[] = [
    {
      id: 'selection',
      label: 'Select',
      minWidth: 64,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, raw) => {
        const row = raw as SessionBookingCandidate;
        const checked = selected.some((item) => key(item) === key(row));
        return (
          <Checkbox
            size="small"
            checked={checked}
            disabled={
              disabled || (!checked && selected.length >= Math.min(preview.availableCount, 200))
            }
            onChange={() => selectCandidate(row)}
            inputProps={{ 'aria-label': `Select ${row.applicantName} (${row.applicationNumber})` }}
          />
        );
      },
    },
    {
      id: 'applicantName',
      label: 'Applicant',
      filterType: 'string',
      isSort: false,
      render: (value, row) => (
        <Stack>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.applicationNumber}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'admissionOfferingId',
      label: 'Offering / Stage',
      isSort: false,
      render: (_, row) => {
        const scope = scopes.find(
          (s) =>
            s.admissionOfferingId === row.admissionOfferingId &&
            s.workflowStageDefinitionId === row.workflowStageDefinitionId
        );
        return (
          <Stack>
            <Typography variant="body2">{scope?.offeringName ?? 'Offering Unavailable'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {scope
                ? `${scope.stageName} · ${scope.workflowName || 'Workflow'} v${scope.workflowVersion}`
                : 'Stage Unavailable'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      id: 'slotStartsAt',
      label: 'Interview Time',
      filterType: 'dateTime',
      isSort: false,
      render: (_, raw) => {
        const item = selected.find((row) => key(row) === key(raw as SessionBookingCandidate));
        return item?.slotStartsAt
          ? fDateTime(item.slotStartsAt)
          : preview.slots.length
            ? 'Assigned on Confirmation'
            : 'Shared Session Time';
      },
    },
  ];
  return (
    <Stack spacing={1.5} sx={{ minHeight: 0, flex: 1, height: 1 }}>
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
        <Typography variant="body2">{preview.eligibleCount} Eligible</Typography>
        <Typography variant="body2">{preview.availableCount} Available Seats / Slots</Typography>
        <Typography variant="subtitle2">{selected.length} Selected</Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.max(0, preview.eligibleCount - selected.length)} Remain Pending
        </Typography>
      </Stack>
      {preview.requiresRoomApproval && (
        <StudentFeedback notificationKey="STU-0271" presentation="persistent" severity="warning">
          This room requires approval. Bookings will be held until the room reservation is approved.
        </StudentFeedback>
      )}
      {preview.warnings.map((warning) => (
        <StudentFeedback
          notificationKey="STU-0272"
          presentation="persistent"
          key={warning}
          severity="warning"
        >
          {warning}
        </StudentFeedback>
      ))}
      {preview.availableCount > 200 && (
        <StudentFeedback notificationKey="STU-0273" presentation="inline" severity="info">
          Book up to 200 applicants per confirmation. Remaining applicants can be booked into this
          session in the next batch.
        </StudentFeedback>
      )}
      {selected.length > preview.availableCount && (
        <StudentFeedback notificationKey="STU-0274" presentation="persistent" severity="error">
          Remove {selected.length - preview.availableCount} applicants to fit the available
          capacity.
        </StudentFeedback>
      )}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          disabled={disabled || isLoading}
          onClick={() => {
            const additions = preview.items
              .filter((row) => !selected.some((item) => key(item) === key(row)))
              .slice(0, Math.max(0, Math.min(preview.availableCount, 200) - selected.length));
            onChange([...selected, ...additions]);
          }}
        >
          Select Available on This Page
        </Button>
        <Button
          size="small"
          disabled={disabled || selected.length === 0}
          onClick={() => onChange([])}
        >
          Clear Selection
        </Button>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admissions-assessment-session-booking-preview"
          columns={columns}
          data={preview.items}
          isLoading={isLoading}
          isSearch
          isPagination
          serverSideSearch
          serverSidePagination
          totalCount={preview.totalCount}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={25}
          rowsPerPageOptions={[25, 50, 100]}
          onServerPagination={(nextPage, size) => onPage(Math.max(0, nextPage - 1), size)}
          onServerSearch={onSearch}
          showCheckbox={false}
          isFilter={false}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          noDataText={
            existingSession
              ? 'No Eligible Applicants Match This Booking Preview. You Can Book Applicants Into This Session Later.'
              : 'No Eligible Applicants Match This Booking Preview. You Can Create the Session and Book Applicants Later.'
          }
          errorContent={
            error ? (
              <StudentFeedback
                notificationKey="STU-0275"
                presentation="toast"
                severity="error"
                action={
                  <Button size="small" onClick={onRetry} disabled={disabled}>
                    Retry
                  </Button>
                }
              >
                {error}
              </StudentFeedback>
            ) : undefined
          }
        />
      </Box>
    </Stack>
  );
}
