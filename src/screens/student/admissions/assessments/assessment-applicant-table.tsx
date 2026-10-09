import type { IColumn, ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Menu, Stack, Tooltip, MenuItem, IconButton, Typography } from '@mui/material';

import { normalizeAssessmentDateTime } from './assessment-date-time';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { assessmentQueues, getAssessmentRowActions } from './assessment-workbench-model';
import { assessmentActionLabels, latestAssessmentAttempt } from './assessment-action-model';

import type { AssessmentAction } from './assessment-action-model';

const outcomeLabels = {
  pending: 'Not recorded',
  passed: 'Passed',
  failed: 'Failed',
  absent: 'Absent',
  retake: 'Retake allowed',
  waived: 'Waived',
};
const attendanceLabels = { pending: 'Pending', present: 'Present', absent: 'Absent' };
const nextActionLabel = (row: AssessmentRosterItem) =>
  row.assessment.blockers[0] ??
  {
    toBook: row.assessment.policy?.schedulingEnabled ? 'Book session' : 'Start assessment',
    attendance: 'Record attendance',
    result: 'Record result',
    review: 'Review result',
    ready: 'Continue to next stage',
    attention: 'Review assessment details',
    completed: 'View history',
  }[row.queue];

type Props = Omit<ICustomizableTableProps, 'columns' | 'data' | 'tableId'> & {
  items: AssessmentRosterItem[];
  selectedSessionId?: string;
  canAdvance: boolean;
  onAction: (row: AssessmentRosterItem, action: AssessmentAction | 'continue') => void;
  onDetails: (row: AssessmentRosterItem) => void;
};
const actionIcons: Record<AssessmentAction | 'continue', string> = {
  book: 'mdi:calendar-plus',
  attendance: 'mdi:account-check-outline',
  result: 'mdi:pencil-outline',
  retake: 'mdi:refresh',
  cancel: 'mdi:cancel',
  waive: 'mdi:shield-check-outline',
  continue: 'mdi:arrow-right',
};
function RowActions({
  row,
  canAdvance,
  onAction,
  onDetails,
}: Pick<Props, 'canAdvance' | 'onAction' | 'onDetails'> & { row: AssessmentRosterItem }) {
  const permissions = useAssessmentPermissions();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const actions: (AssessmentAction | 'continue')[] = getAssessmentRowActions(row, permissions);
  if (row.isActive && row.assessment.canComplete && canAdvance) actions.unshift('continue');
  const label = (action: AssessmentAction | 'continue') =>
    action === 'continue'
      ? 'Continue to next stage'
      : action === 'book' && row.assessment.policy?.schedulingEnabled
        ? 'Book session'
        : assessmentActionLabels[action];
  const direct = actions.length + 1 <= 3 ? actions : [];
  return (
    <Stack direction="row" spacing={0.5}>
      {direct.map((action) => (
        <Tooltip key={action} title={label(action)}>
          <IconButton
            size="small"
            aria-label={`${label(action)} for ${row.applicantName}`}
            onClick={() => onAction(row, action)}
          >
            <Iconify icon={actionIcons[action]} />
          </IconButton>
        </Tooltip>
      ))}
      {actions.length + 1 <= 3 && (
        <Tooltip title="Assessment details">
          <IconButton
            size="small"
            aria-label={`Assessment details for ${row.applicantName}`}
            onClick={() => onDetails(row)}
          >
            <Iconify icon="mdi:eye-outline" />
          </IconButton>
        </Tooltip>
      )}
      {!direct.length && actions.length > 0 && (
        <>
          <Tooltip title="Assessment actions">
            <IconButton
              size="small"
              aria-label={`Assessment actions for ${row.applicantName}`}
              aria-haspopup="menu"
              aria-expanded={!!anchor}
              onClick={(event) => setAnchor(event.currentTarget)}
            >
              <Iconify icon="mdi:dots-vertical" />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
            {actions.map((action) => (
              <MenuItem
                key={action}
                onClick={() => {
                  setAnchor(null);
                  onAction(row, action);
                }}
              >
                <Iconify icon={actionIcons[action]} sx={{ mr: 1 }} />
                {label(action)}
              </MenuItem>
            ))}
            <MenuItem
              onClick={() => {
                setAnchor(null);
                onDetails(row);
              }}
            >
              <Iconify icon="mdi:eye-outline" sx={{ mr: 1 }} />
              Assessment details
            </MenuItem>
          </Menu>
        </>
      )}
    </Stack>
  );
}

export function AssessmentApplicantTable({
  items,
  selectedSessionId,
  canAdvance,
  onAction,
  onDetails,
  ...table
}: Props) {
  const displayAttempt = (row: AssessmentRosterItem) =>
    !row.isActive && selectedSessionId
      ? latestAssessmentAttempt({
          ...row.assessment,
          attempts: row.assessment.attempts.filter(
            (attempt) => attempt.sessionId === selectedSessionId
          ),
        })
      : latestAssessmentAttempt(row.assessment);
  const columns: IColumn[] = [
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 200,
      render: (_, data) => (
        <Box>
          <Typography variant="subtitle2">{data.applicantName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {data.applicationNumber}
          </Typography>
        </Box>
      ),
    },
    { id: 'applicationNumber', label: 'Application number', defaultHidden: true },
    {
      id: 'sessionStartsAt',
      label: 'Session',
      minWidth: 180,
      render: (_, data) => {
        const attempt = displayAttempt(data as AssessmentRosterItem);
        return (
          <Box>
            <Typography variant="body2">
              {attempt?.sessionName ??
                (data.assessment.policy?.schedulingEnabled ? 'Not booked' : 'Without session')}
            </Typography>
            {attempt?.sessionStartsAt && (
              <Typography variant="caption" color="text.secondary">
                {dayjs(normalizeAssessmentDateTime(attempt.sessionStartsAt)).format(
                  'DD MMM YYYY, h:mm A'
                )}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'attendance',
      label: 'Attendance',
      isSort: false,
      render: (_, data) => {
        const attendance = displayAttempt(data as AssessmentRosterItem)?.attendance;
        return attendance ? attendanceLabels[attendance] : '—';
      },
    },
    {
      id: 'result',
      label: 'Result',
      isSort: false,
      render: (_, data) => {
        const attempt = displayAttempt(data as AssessmentRosterItem);
        return attempt
          ? `${outcomeLabels[attempt.outcome]}${attempt.marks != null ? ` · ${attempt.marks}/${data.assessment.policy?.totalMarks ?? '—'}` : ''}`
          : '—';
      },
    },
    {
      id: 'queue',
      label: 'Status',
      isSort: false,
      render: (_, data) => (
        <Label
          color={
            data.queue === 'ready' ? 'success' : data.queue === 'attention' ? 'warning' : 'default'
          }
        >
          {assessmentQueues.find((item) => item.value === data.queue)?.label ?? 'Unknown'}
        </Label>
      ),
    },
    {
      id: 'nextAction',
      label: 'Next action',
      isSort: false,
      minWidth: 180,
      render: (_, data) => {
        const row = data as AssessmentRosterItem;
        return nextActionLabel(row);
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      isSort: false,
      excludeFromExport: true,
      minWidth: 130,
      render: (_, data) => (
        <RowActions
          row={data as AssessmentRosterItem}
          canAdvance={canAdvance}
          onAction={onAction}
          onDetails={onDetails}
        />
      ),
    },
  ];
  const data = items.map((row) => {
    const attempt = displayAttempt(row);
    return {
      ...row,
      id: row.stageInstanceId,
      sessionStartsAt: attempt?.sessionStartsAt ?? '',
      attendance: attempt ? attendanceLabels[attempt.attendance] : '',
      result: attempt
        ? `${outcomeLabels[attempt.outcome]}${attempt.marks != null ? ` · ${attempt.marks}` : ''}`
        : '',
      nextAction: nextActionLabel(row),
    };
  });
  return (
    <CustomizableTable
      {...table}
      tableId="admission-assessment-applicants"
      columns={columns}
      data={data}
      tableTitle="Assessment applicants"
      exportLabel="Export current page"
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      isSearch
      isPagination
      serverSidePagination
      serverSideSearch
      serverSideSort
      serverSideSortMode="single"
      searchFieldProps={{
        placeholder: 'Search applicants or application number',
        inputProps: { 'aria-label': 'Search assessment applicants', maxLength: 128 },
      }}
    />
  );
}
