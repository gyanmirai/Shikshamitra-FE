import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';
import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useId, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { fDateTime, formatStr } from 'src/utils/format-time';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { recordFieldLabel } from 'src/screens/student/records/record-diff';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useProfileChangeDiff } from 'src/screens/student/records/student-record-change-diff';
import { useGetStudentRecordChangeQuery } from 'src/redux/student/records/student-record-changes-api';
import {
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Pagination,
  Typography,
} from '@mui/material';
import {
  ActivityHistoryTimeline,
  ActivityHistorySkeleton,
} from 'src/screens/student/components/activity-history-timeline';

import { ProfileValues } from './student-profile-overview';
import { PROFILE_SECTIONS } from './student-record-profile-model';
import { useStudentDrawerExit } from '../components/use-student-drawer-exit';

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
  const trigger = useRef<HTMLButtonElement | null>(null);
  const exit = useStudentDrawerExit();
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
  const closeDetail = () =>
    exit.closeAfterExit(() => {
      const opener = trigger.current;
      trigger.current = null;
      setSelection(null);
      window.requestAnimationFrame(() => {
        if (opener?.isConnected && trigger.current === null) opener.focus();
      });
    });
  return (
    <>
      {canReadChanges ? (
        <FormSectionCard
          icon={GlobalIcons.history}
          title="Audit History"
          descriptionTooltip="Student record changes across academic years, with their recorded status, actor and dates."
          titleTypographyProps={{ fontWeight: 600 }}
          action={
            <Typography variant="caption" color="text.secondary">
              All academic years · Newest first
            </Typography>
          }
        >
          {isLoading || (isFetching && !changes.length) ? (
            <ActivityHistorySkeleton ariaLabel="Loading record changes" />
          ) : isError ? (
            <StudentFeedback
              notificationKey="STU-0771"
              presentation="toast"
              severity="error"
              toastAction={
                onRetry ? (
                  <Button size="small" onClick={onRetry}>
                    Retry History
                  </Button>
                ) : undefined
              }
            >
              Record change history could not be loaded.
            </StudentFeedback>
          ) : changes.length ? (
            <ActivityHistoryTimeline
              ariaLabel="Student record audit history"
              items={changes.map((change) => {
                const sectionLabel = changeSectionLabel(change);

                return {
                  id: change.id,
                  title: `${sectionLabel} ${change.status === 'Applied' ? 'updated' : 'change requested'}`,
                  occurredAt: change.creationTime,
                  icon: 'mdi:pencil-outline',
                  actor: `Submitted by ${change.requestedByName ?? 'Staff member'}`,
                  description: change.payloadMasked
                    ? 'Details restricted by school policy.'
                    : change.reason || 'No reason recorded',
                  details: change.appliedAt
                    ? `Applied ${fDateTime(change.appliedAt, formatStr.split.dateTime)}`
                    : 'Not applied',
                  badge: <Label color={changeStatusColor(change.status)}>{change.status}</Label>,
                  action: (
                    <Button
                      size="small"
                      color="inherit"
                      variant="outlined"
                      disabled={isFetching}
                      onClick={(event) => {
                        trigger.current = event.currentTarget;
                        exit.reopen();
                        setSelection({ studentId: student.studentId, changeId: change.id });
                      }}
                      aria-label={`View ${sectionLabel} change history`}
                      endIcon={<Iconify icon="mdi:chevron-right" />}
                    >
                      View changes
                    </Button>
                  ),
                };
              })}
            />
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
        <StudentFeedback notificationKey="STU-0773" presentation="inline" severity="info">
          Record change history is not available with your current access.
        </StudentFeedback>
      )}
      <Drawer
        anchor="right"
        open={Boolean(selectedId) && !exit.closing}
        onClose={closeDetail}
        onTransitionExited={exit.onExited}
        ModalProps={{ disableRestoreFocus: true }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': titleId,
            inert: exit.closing || undefined,
            sx: {
              width: { xs: 1, sm: 440 },
              maxWidth: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ p: 2, flexShrink: 0 }}
        >
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ flex: 1, minWidth: 0 }}>
            <Typography id={titleId} component="h2" variant="h6">
              Record Change History
            </Typography>
            <InfoTooltipIcon
              title="Review who requested this change, its status, and any visible reason and field changes."
              label="Record Change History information"
            />
          </Stack>
          <IconButton
            aria-label="Close record change history"
            onClick={closeDetail}
            disabled={exit.closing}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <Iconify icon={GlobalIcons.cancel} width={20} />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {!selected && detail.isFetching && (
              <Skeleton height={160} aria-label="Loading record change details" />
            )}
            {detail.isError && (
              <StudentFeedback
                notificationKey="STU-0774"
                presentation="toast"
                severity="error"
                toastAction={
                  <Button size="small" onClick={() => detail.refetch()}>
                    Retry
                  </Button>
                }
              >
                This audit entry could not be loaded.
              </StudentFeedback>
            )}
            {!selected && !detail.isError && !detail.isFetching && detail.currentData && (
              <StudentFeedback notificationKey="STU-0775" presentation="inline" severity="info">
                This audit entry is not available for this student.
              </StudentFeedback>
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
                    {
                      label: 'Submitted on',
                      value: fDateTime(selected.creationTime, formatStr.split.dateTime),
                    },
                    {
                      label: 'Applied on',
                      value: selected.appliedAt
                        ? fDateTime(selected.appliedAt, formatStr.split.dateTime)
                        : 'Not applied',
                    },
                  ]}
                />
                <Divider />
                {selected.payloadMasked ? (
                  <StudentFeedback notificationKey="STU-0776" presentation="inline" severity="info">
                    These details are restricted by school policy.
                  </StudentFeedback>
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
                        <StudentFeedback
                          notificationKey="STU-0777"
                          presentation="toast"
                          severity="error"
                          toastAction={
                            <Button size="small" onClick={retryLabels}>
                              Retry Labels
                            </Button>
                          }
                        >
                          Changed field labels could not be loaded.
                        </StudentFeedback>
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
                          {decision.actorName ?? 'Reviewer'} ·{' '}
                          {fDateTime(decision.creationTime, formatStr.split.dateTime)}
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
      </Drawer>
    </>
  );
}
