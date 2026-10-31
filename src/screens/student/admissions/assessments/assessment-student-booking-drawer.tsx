import { useId } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  Radio,
  Drawer,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { AdmissionDialogTitle } from '../admission-dialog-title';
import { formatAssessmentSchedule } from './assessment-date-time';
import { useAssessmentStudentBooking } from './use-assessment-student-booking';
import { studentBookingReason, existingStudentBooking } from './assessment-student-booking-model';

import type { StudentBookingProps } from './use-assessment-student-booking';

export function AssessmentStudentBookingDrawer(props: StudentBookingProps) {
  const { canBook, onViewBooking } = props;
  const data = useAssessmentStudentBooking(props);
  const titleId = useId();
  const locked = data.busy;
  const readonly = !canBook;
  const count = data.rows.length;
  const noun = count === 1 ? 'student' : 'students';
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={() => data.navigate()}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: { width: { xs: 1, sm: 640 }, maxWidth: 1 },
        }}
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            data.book();
          }}
          sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0 }}
          >
            <Typography id={titleId} variant="h6">
              <AdmissionDialogTitle
                title="Book Session"
                helpText="Book the selected students into a session. Room availability and eligibility are checked before confirmation."
              />
            </Typography>
            <IconButton
              size="small"
              aria-label="Close student booking"
              disabled={locked}
              onClick={() => data.navigate()}
            >
              <Iconify icon={GlobalIcons.cancel} />
            </IconButton>
          </Stack>
          <Divider />
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <FormBusyRegion busy={locked} label="Checking and booking selected students…">
              <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
                <FormSectionCard
                  icon={GlobalIcons.calendar}
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>Selected Students</span>
                      <Label>{count}</Label>
                    </Stack>
                  }
                  descriptionTooltip="Only these students will be booked. Remove unavailable students explicitly before confirming."
                >
                  <Stack divider={<Divider />}>
                    {data.rows.map((row) => {
                      const item = data.review?.items.find(
                        (entry) => entry.row.stageInstanceId === row.stageInstanceId
                      );
                      const existingBooking = existingStudentBooking(row);
                      const reason =
                        item?.reason ||
                        studentBookingReason(
                          row,
                          data.session ? (data.input ?? undefined) : undefined
                        );
                      return (
                        <Stack
                          key={row.stageInstanceId}
                          direction={{ xs: 'column', sm: 'row' }}
                          alignItems={{ xs: 'stretch', sm: 'center' }}
                          spacing={1}
                          sx={{ py: 1 }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2">{row.applicantName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.className} · {row.applicationNumber}
                            </Typography>
                            {reason && (
                              <Typography variant="caption" color="warning.main" display="block">
                                {reason}
                              </Typography>
                            )}
                            {item?.slotStartsAt && (
                              <Typography variant="caption" display="block">
                                {formatAssessmentSchedule(item.slotStartsAt, item.slotEndsAt)?.time}
                              </Typography>
                            )}
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Label
                              color={reason ? 'warning' : item && !reason ? 'success' : 'default'}
                            >
                              {existingBooking
                                ? 'Already booked'
                                : reason
                                  ? 'Unavailable'
                                  : item
                                    ? 'Ready'
                                    : 'Selected'}
                            </Label>
                            {existingBooking && onViewBooking && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                disabled={locked || data.retryPending}
                                aria-label={`View booking for ${row.applicantName}`}
                                onClick={() => onViewBooking(row)}
                              >
                                View booking
                              </Button>
                            )}
                            <IconButton
                              size="small"
                              disabled={locked || data.retryPending}
                              aria-label={`Remove ${row.applicantName}`}
                              onClick={() => data.remove(row.stageInstanceId)}
                            >
                              <Iconify icon="mdi:close" width={16} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      );
                    })}
                    {!count && (
                      <Typography variant="body2" color="text.secondary">
                        Select students from the Assessments table.
                      </Typography>
                    )}
                  </Stack>
                </FormSectionCard>
                {data.error && (
                  <StudentFeedback
                    notificationKey="STU-0263"
                    presentation="persistent"
                    severity="error"
                    action={
                      <Button size="small" disabled={locked || readonly} onClick={data.refresh}>
                        Retry
                      </Button>
                    }
                  >
                    {data.error}
                  </StudentFeedback>
                )}
                {data.hasBookableStudents && (
                  <FormSectionCard
                    title="Available Sessions"
                    icon={GlobalIcons.calendar}
                    descriptionTooltip="Choose a session for the selected students."
                  >
                    <TextField
                      size="small"
                      fullWidth
                      label="Search sessions"
                      value={data.search}
                      disabled={locked || data.retryPending}
                      onChange={(event) => {
                        data.setSearch(event.target.value);
                        data.setPage(0);
                      }}
                    />
                    {data.sessions.isFetching ? (
                      <Skeleton variant="rounded" height={140} />
                    ) : data.sessions.isError ? (
                      <StudentFeedback
                        notificationKey="STU-0264"
                        presentation="persistent"
                        severity="error"
                        action={
                          <Button size="small" onClick={data.sessions.refetch}>
                            Retry
                          </Button>
                        }
                      >
                        Unable to load sessions.
                      </StudentFeedback>
                    ) : (
                      <Stack spacing={1} role="radiogroup" aria-label="Available sessions">
                        {data.available.map((session) => {
                          const reason = data.sessionReason(session);
                          return (
                            <Box
                              key={session.id}
                              component="label"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                border: 1,
                                borderRadius: 1,
                                borderColor:
                                  data.session?.id === session.id ? 'primary.main' : 'divider',
                                cursor: reason ? 'default' : 'pointer',
                              }}
                            >
                              <Radio
                                name="assessment-session"
                                size="small"
                                checked={data.session?.id === session.id}
                                disabled={locked || readonly || data.retryPending || !!reason}
                                value={session.id}
                                onChange={() => data.chooseSession(session)}
                                inputProps={{
                                  'aria-label': session.name,
                                  'aria-describedby': reason
                                    ? `${titleId}-${session.id}-reason`
                                    : undefined,
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2">{session.name}</Typography>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  {formatAssessmentSchedule(session.startsAt, session.endsAt)?.date}{' '}
                                  ·{' '}
                                  {formatAssessmentSchedule(session.startsAt, session.endsAt)?.time}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {session.location}
                                </Typography>
                              </Box>
                              {reason ? (
                                <Typography
                                  id={`${titleId}-${session.id}-reason`}
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {reason}
                                </Typography>
                              ) : (
                                <Label>
                                  {Math.max(0, session.capacity - session.bookedCount)} seats /
                                  slots
                                </Label>
                              )}
                            </Box>
                          );
                        })}
                        {!data.available.length && (
                          <Typography variant="body2" color="text.secondary">
                            No available sessions on this page. Check another page or ask a session
                            manager to create one.
                          </Typography>
                        )}
                      </Stack>
                    )}
                    {(data.sessions.currentData?.totalCount ?? 0) > 25 && (
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          size="small"
                          disabled={locked || data.retryPending || data.page === 0}
                          onClick={() => data.setPage(data.page - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          size="small"
                          disabled={
                            locked ||
                            data.retryPending ||
                            (data.page + 1) * 25 >= data.sessions.currentData!.totalCount
                          }
                          onClick={() => data.setPage(data.page + 1)}
                        >
                          Next
                        </Button>
                      </Stack>
                    )}
                  </FormSectionCard>
                )}
                {data.preview?.requiresRoomApproval && (
                  <StudentFeedback
                    notificationKey="STU-0271"
                    presentation="persistent"
                    severity="warning"
                  >
                    Bookings will be held until Room Management approves the room.
                  </StudentFeedback>
                )}
                {data.preview?.warnings.map((warning) => (
                  <StudentFeedback
                    key={warning}
                    notificationKey="STU-0272"
                    presentation="persistent"
                    severity="warning"
                  >
                    {warning}
                  </StudentFeedback>
                ))}
                {data.review?.capacityError && (
                  <StudentFeedback
                    notificationKey="STU-0274"
                    presentation="persistent"
                    severity="warning"
                  >
                    {data.review.capacityError}
                  </StudentFeedback>
                )}
                {data.review?.canConfirm && (
                  <Typography role="status" variant="body2" color="text.secondary">
                    {count} {count === 1 ? 'student' : 'students'} ready to book
                  </Typography>
                )}
              </Stack>
            </FormBusyRegion>
          </Scrollbar>
          <Divider />
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
            sx={{ px: { xs: 2, sm: 3 }, py: 1.75, flexShrink: 0 }}
          >
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
              disabled={locked}
              onClick={data.navigate}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              color="inherit"
              type="submit"
              startIcon={<Iconify icon={GlobalIcons.calendar} width={18} />}
              loading={locked}
              disabled={locked || readonly || (!data.review?.canConfirm && !data.retryPending)}
            >
              {`Book ${count} ${noun}`}
            </LoadingButton>
          </Stack>
        </Box>
      </Drawer>
      <ConfirmDialog
        open={!!data.discard}
        title="Discard Changes?"
        content={
          data.retryPending
            ? 'The last booking response was not received. Retry checks the same request safely before you close.'
            : 'Your booking selection has not been submitted.'
        }
        onClose={() => data.setDiscard(false)}
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            onClick={data.discardChanges}
          >
            Discard
          </Button>
        }
      />
    </>
  );
}
