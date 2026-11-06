import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AssessmentSession } from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Stack, Tooltip, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { assessmentDateTimeTimestamp, normalizeAssessmentDateTime } from './assessment-date-time';

type Props = {
  sessions: AssessmentSession[];
  loading: boolean;
  canManage: boolean;
  onEdit: (session: AssessmentSession) => void;
  onCancel: (session: AssessmentSession) => void;
  onRoster?: (session: AssessmentSession) => void;
  errorContent?: ReactNode;
};

export function AssessmentSessionTable({
  sessions,
  loading,
  canManage,
  onEdit,
  onCancel,
  onRoster,
  errorContent,
}: Props) {
  const now = Date.now();
  const columns: IColumn[] = [
    { id: 'name', label: 'Slot Name', sticky: true, minWidth: 180, isFilter: true },
    {
      id: 'startsAt',
      label: 'Starts',
      minWidth: 180,
      render: (value: string) =>
        dayjs(normalizeAssessmentDateTime(value)).format(ADMISSION_DATE_TIME_FORMAT),
    },
    {
      id: 'endsAt',
      label: 'Ends',
      minWidth: 180,
      render: (value: string) =>
        dayjs(normalizeAssessmentDateTime(value)).format(ADMISSION_DATE_TIME_FORMAT),
    },
    { id: 'location', label: 'Location', minWidth: 160 },
    {
      id: 'bookedCount',
      label: 'Booked / Capacity',
      minWidth: 140,
      render: (_: unknown, row) => `${row.bookedCount} / ${row.capacity}`,
    },
    {
      id: 'isCancelled',
      label: 'Status',
      sticky: true,
      render: (_: unknown, row) => {
        const session = row as AssessmentSession;
        const status = session.isCancelled
          ? 'Cancelled'
          : assessmentDateTimeTimestamp(session.endsAt) <= now
            ? 'Ended'
            : assessmentDateTimeTimestamp(session.startsAt) <= now
              ? 'In Progress'
              : 'Scheduled';
        return <Label color={status === 'In Progress' ? 'success' : 'default'}>{status}</Label>;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      isSort: false,
      excludeFromExport: true,
      minWidth: 170,
      render: (_: unknown, row) => {
        const session = row as AssessmentSession;
        return (
          <Stack direction="row" spacing={0.5}>
            {onRoster && (
              <Tooltip title="View Applicants">
                <IconButton
                  size="small"
                  aria-label={`View Applicants For ${session.name}`}
                  onClick={() => onRoster(session)}
                >
                  <Iconify icon="mdi:account-group-outline" />
                </IconButton>
              </Tooltip>
            )}
            {canManage && !session.isCancelled && (
              <>
                <Tooltip
                  title={
                    assessmentDateTimeTimestamp(session.startsAt) <= now
                      ? 'Started Sessions Cannot Be Edited'
                      : 'Edit Session'
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Edit ${session.name}`}
                      disabled={assessmentDateTimeTimestamp(session.startsAt) <= now}
                      onClick={() => onEdit(session)}
                    >
                      <Iconify icon="mdi:pencil-outline" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancel Session">
                  <IconButton
                    size="small"
                    aria-label={`Cancel ${session.name}`}
                    onClick={() => onCancel(session)}
                  >
                    <Iconify icon="mdi:cancel" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        );
      },
    },
  ];
  return (
    <CustomizableTable
      tableId="admission-assessment-sessions"
      tableTitle="Assessment Sessions"
      columns={columns}
      data={sessions}
      isLoading={loading}
      errorContent={errorContent}
      isSearch
      isPagination
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      noDataText="No Sessions for This Offering and Stage. Create a Session to Start Staff Bookings."
    />
  );
}
