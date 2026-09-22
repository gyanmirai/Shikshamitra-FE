import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AssessmentSession } from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Stack, Button } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { assessmentDateTimeTimestamp, normalizeAssessmentDateTime } from './assessment-date-time';

type Props = {
  sessions: AssessmentSession[];
  loading: boolean;
  canManage: boolean;
  onEdit: (session: AssessmentSession) => void;
  onCancel: (session: AssessmentSession) => void;
};

export function AssessmentSessionTable({ sessions, loading, canManage, onEdit, onCancel }: Props) {
  const now = Date.now();
  const columns: IColumn[] = [
    { id: 'name', label: 'Session', minWidth: 180, isFilter: true },
    {
      id: 'startsAt',
      label: 'Starts',
      minWidth: 180,
      render: (value: string) =>
        dayjs(normalizeAssessmentDateTime(value)).format('DD MMM YYYY, h:mm A'),
    },
    {
      id: 'endsAt',
      label: 'Ends',
      minWidth: 180,
      render: (value: string) =>
        dayjs(normalizeAssessmentDateTime(value)).format('DD MMM YYYY, h:mm A'),
    },
    { id: 'location', label: 'Location', minWidth: 160 },
    {
      id: 'bookedCount',
      label: 'Booked / capacity',
      minWidth: 140,
      render: (_: unknown, row) => `${row.bookedCount} / ${row.capacity}`,
    },
    {
      id: 'isCancelled',
      label: 'Status',
      render: (_: unknown, row) => {
        const session = row as AssessmentSession;
        const status = session.isCancelled
          ? 'Cancelled'
          : assessmentDateTimeTimestamp(session.endsAt) <= now
            ? 'Ended'
            : assessmentDateTimeTimestamp(session.startsAt) <= now
              ? 'In progress'
              : 'Scheduled';
        return (
          <Label
            color={
              status === 'In progress' ? 'success' : status === 'Scheduled' ? 'info' : 'default'
            }
          >
            {status}
          </Label>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      isSort: false,
      excludeFromExport: true,
      minWidth: 170,
      render: (_: unknown, row) => {
        const session = row as AssessmentSession;
        return canManage && !session.isCancelled ? (
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              disabled={assessmentDateTimeTimestamp(session.startsAt) <= now}
              onClick={() => onEdit(session)}
            >
              Edit
            </Button>
            <Button size="small" color="error" onClick={() => onCancel(session)}>
              Cancel
            </Button>
          </Stack>
        ) : null;
      },
    },
  ];
  return (
    <CustomizableTable
      tableId="admission-assessment-sessions"
      tableTitle="Assessment sessions"
      columns={columns}
      data={sessions}
      isLoading={loading}
      isSearch
      isPagination
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      noDataText="No sessions for this offering and stage. Create a session to start staff bookings."
    />
  );
}
