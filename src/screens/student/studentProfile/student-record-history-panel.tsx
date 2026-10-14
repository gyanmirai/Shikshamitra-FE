import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';
import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';

import { useId, useState } from 'react';
import Timeline from '@mui/lab/Timeline';
import { Label } from 'src/components/label';
import TimelineDot from '@mui/lab/TimelineDot';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { recordFieldLabel } from 'src/screens/student/records/record-diff';
import { useProfileChangeDiff } from 'src/screens/student/records/student-record-change-diff';
import { useGetStudentRecordChangeQuery } from 'src/redux/student/records/student-record-changes-api';
import {
  Box,
  Stack,
  Alert,
  Drawer,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Pagination,
  Typography,
} from '@mui/material';

import { ProfileValues } from './student-profile-overview';
import { PROFILE_SECTIONS } from './student-record-profile-model';

function changeSectionLabel(change: RecordChange) {
  return change.section === 'registration-form'
    ? 'Registration form'
    : change.section === 'custom-details'
      ? 'School details'
      : (PROFILE_SECTIONS.find((section) => section.key === change.section)?.label ??
        recordFieldLabel(change.section));
}

function changeStatusColor(status: string) {
  if (status === 'Applied') return 'success' as const;
  if (status === 'Conflict') return 'warning' as const;
  if (status === 'Rejected') return 'error' as const;
  return 'default' as const;
}

export function StudentRecordHistoryPanel({
  student,
  changes,
  sources,
  canReadChanges,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
  page = 0,
  pageSize = 25,
  totalCount = changes.length,
  onPageChange,
}: {
  student: Pick<StudentRecordProfile, 'studentId'>;
  changes: RecordChange[];
  sources: RecordRegistrationSource[];
  canReadChanges: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}) {
  const [selection, setSelection] = useState<{ studentId: string; changeId: string } | null>(null);
  const selectedId =
    canReadChanges && selection?.studentId === student.studentId ? selection.changeId : null;
  const detail = useGetStudentRecordChangeQuery(selectedId ?? '', {
    skip: !selectedId,
  });
  const selected =
    canReadChanges &&
    !detail.isError &&
    detail.currentData?.id === selectedId &&
    detail.currentData.studentId === student.studentId
      ? detail.currentData
      : undefined;
  const titleId = useId();
  const {
    diffs,
    isLoading: loadingLabels,
    isError: labelsError,
    retry: retryLabels,
  } = useProfileChangeDiff(selected, sources);
  const drawerBusy = detail.isFetching || loadingLabels;
  const closeDetail = () => {
    if (!drawerBusy) setSelection(null);
  };
  const orderedChanges = [...changes].sort(
    (left, right) => Date.parse(right.creationTime) - Date.parse(left.creationTime)
  );

  return (
    <>
      {canReadChanges ? (
        <FormSectionCard
          icon="mdi:history"
          title="Audit history"
          action={
            <Typography variant="caption" color="text.secondary">
              All academic years · Newest first
            </Typography>
          }
        >
          {isLoading || (isFetching && !orderedChanges.length) ? (
            <Stack aria-label="Loading record changes">
              <Skeleton height={72} />
              <Skeleton height={72} />
              <Skeleton height={72} />
            </Stack>
          ) : isError ? (
            <Alert
              severity="error"
              action={
                onRetry ? (
                  <Button size="small" onClick={onRetry}>
                    Retry History
                  </Button>
                ) : undefined
              }
            >
              Record change history could not be loaded.
            </Alert>
          ) : orderedChanges.length ? (
            <Timeline
              aria-label="Student record audit history"
              sx={{
                p: 0,
                m: 0,
                [`& .${timelineItemClasses.root}:before`]: { display: 'none' },
              }}
            >
              {orderedChanges.map((change, index) => (
                <TimelineItem key={change.id}>
                  <TimelineSeparator>
                    <TimelineDot variant="outlined" sx={{ mt: 0.5, mb: 0.5 }}>
                      <Iconify icon="mdi:pencil-outline" width={16} />
                    </TimelineDot>
                    {index < orderedChanges.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ pt: 0, pb: 2, minWidth: 0 }}>
                    <Stack spacing={1} sx={{ pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Typography variant="subtitle2" sx={{ flex: 1, overflowWrap: 'anywhere' }}>
                          {changeSectionLabel(change)}{' '}
                          {change.status === 'Applied' ? 'updated' : 'change requested'}
                        </Typography>
                        <Label color={changeStatusColor(change.status)}>{change.status}</Label>
                        <Button
                          size="small"
                          disabled={isFetching}
                          onClick={() =>
                            setSelection({ studentId: student.studentId, changeId: change.id })
                          }
                          aria-label={`View ${changeSectionLabel(change)} change history`}
                          endIcon={<Iconify icon="mdi:chevron-right" />}
                        >
                          View Changes
                        </Button>
                      </Stack>
                      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                        {change.payloadMasked
                          ? 'Details restricted by school policy.'
                          : change.reason || 'No reason recorded'}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                          Submitted by {change.requestedByName ?? 'Staff member'} ·{' '}
                          {fDateTime(change.creationTime) || 'Time not recorded'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {change.appliedAt
                            ? `Applied ${fDateTime(change.appliedAt)}`
                            : 'Not applied'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <EmptyContent
              title="No record changes yet"
              description="Profile edits and their recorded outcomes will appear here."
              filled
              slotProps={{ img: { maxWidth: 80 } }}
            />
          )}
          {!isLoading && !isError && totalCount > pageSize && onPageChange && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}
            >
              <Typography variant="caption" color="text.secondary">
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}{' '}
                entries
              </Typography>
              <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={page + 1}
                onChange={(_event, value) => onPageChange(value - 1)}
                size="small"
                disabled={isFetching}
                siblingCount={0}
              />
            </Stack>
          )}
        </FormSectionCard>
      ) : (
        <Alert severity="info">
          Record change history is not available with your current access.
        </Alert>
      )}
      <Drawer
        anchor="right"
        open={Boolean(selectedId)}
        onClose={closeDetail}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': titleId,
            sx: {
              width: { xs: 1, sm: 440 },
              maxWidth: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
          <Typography id={titleId} variant="h6" sx={{ flex: 1 }}>
            Record Change History
          </Typography>
          <IconButton
            aria-label="Close record change history"
            disabled={drawerBusy}
            onClick={closeDetail}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {!selected && detail.isFetching && (
              <Skeleton height={160} aria-label="Loading record change details" />
            )}
            {detail.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => detail.refetch()}>
                    Retry
                  </Button>
                }
              >
                This audit entry could not be loaded.
              </Alert>
            )}
            {!selected && !detail.isError && !detail.isFetching && detail.currentData && (
              <Alert severity="info">This audit entry is not available for this student.</Alert>
            )}
            {selected && (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    {changeSectionLabel(selected)}
                  </Typography>
                  <Label color={changeStatusColor(selected.status)}>{selected.status}</Label>
                </Stack>
                <ProfileValues
                  values={[
                    { label: 'Submitted by', value: selected.requestedByName ?? 'Staff member' },
                    { label: 'Submitted on', value: fDateTime(selected.creationTime) },
                    {
                      label: 'Applied on',
                      value: selected.appliedAt ? fDateTime(selected.appliedAt) : 'Not applied',
                    },
                  ]}
                />
                <Divider />
                {selected.payloadMasked ? (
                  <Alert severity="info">These details are restricted by school policy.</Alert>
                ) : (
                  <>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Reason</Typography>
                      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                        {selected.reason || 'No reason recorded'}
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Field changes</Typography>
                      {loadingLabels && (
                        <Skeleton height={120} aria-label="Loading changed field labels" />
                      )}
                      {labelsError && (
                        <Alert
                          severity="error"
                          action={
                            <Button size="small" onClick={retryLabels}>
                              Retry Labels
                            </Button>
                          }
                        >
                          Changed field labels could not be loaded.
                        </Alert>
                      )}
                      {!loadingLabels &&
                        !labelsError &&
                        (diffs.length ? (
                          diffs.map((diff, index) => (
                            <Stack
                              key={diff.label + index}
                              spacing={1}
                              sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                                {diff.label}
                              </Typography>
                              <ProfileValues
                                values={[
                                  { label: 'Before', value: diff.before },
                                  { label: 'After', value: diff.after },
                                ]}
                              />
                            </Stack>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No changes recorded.
                          </Typography>
                        ))}
                    </Stack>
                  </>
                )}
                {selected.decisions.length > 0 && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Recorded decisions</Typography>
                    {selected.decisions.map((decision, index) => (
                      <Stack
                        key={decision.actorId + index}
                        spacing={0.5}
                        sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
                      >
                        <Typography variant="body2">{decision.decision}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {decision.actorName ?? 'Reviewer'} · {fDateTime(decision.creationTime)}
                        </Typography>
                        {!selected.payloadMasked && (
                          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                            {decision.reason || 'No reason recorded'}
                          </Typography>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Scrollbar>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={closeDetail}
            disabled={drawerBusy}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Close
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
