import { useId } from 'react';
import { Label } from 'src/components/label';
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
import { studentBookingReason } from './assessment-student-booking-model';
import { useAssessmentStudentBooking } from './use-assessment-student-booking';
import { AssessmentSessionSetupFields } from './assessment-session-setup-fields';

import type { StudentBookingProps } from './use-assessment-student-booking';

export function AssessmentStudentBookingDrawer(props: StudentBookingProps) {
  const { canBook, canCreate, scopes } = props;
  const data = useAssessmentStudentBooking(props);
  const titleId = useId();
  const locked = data.busy || (data.mode === 'create' && data.resources.isFetching);
  const readonly = !canBook || (data.mode === 'create' && !canCreate);
  const count = data.rows.length;
  const noun = count === 1 ? 'Student' : 'Students';
  const selectedClasses = [...new Set(data.rows.map((row) => row.className).filter(Boolean))];
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={() => data.navigate('close')}
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
            if (data.mode === 'create') data.form.handleSubmit();
            else data.book();
          }}
          sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <Typography id={titleId} variant="h6">
              <AdmissionDialogTitle
                title={data.mode === 'create' ? 'Create & Book' : 'Book Session'}
                helpText="Book the selected students into a session. Room availability and eligibility are checked before confirmation."
              />
            </Typography>
            <IconButton
              size="small"
              aria-label="Close student booking"
              disabled={locked}
              onClick={() => data.navigate('close')}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <FormBusyRegion busy={locked} label="Checking and booking selected students…">
              <Stack spacing={2} sx={{ p: 2 }}>
                <FormSectionCard
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
                      const reason =
                        item?.reason ||
                        studentBookingReason(
                          row,
                          data.mode === 'book' && data.session
                            ? (data.input ?? undefined)
                            : undefined
                        );
                      return (
                        <Stack
                          key={row.stageInstanceId}
                          direction="row"
                          alignItems="center"
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
                          <Label
                            color={reason ? 'warning' : item && !reason ? 'success' : 'default'}
                          >
                            {reason ? 'Unavailable' : item ? 'Ready' : 'Selected'}
                          </Label>
                          <IconButton
                            size="small"
                            disabled={locked || data.retryPending}
                            aria-label={`Remove ${row.applicantName}`}
                            onClick={() => data.remove(row.stageInstanceId)}
                          >
                            <Iconify icon="mdi:close" width={16} />
                          </IconButton>
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
                {data.mode === 'book' ? (
                  <FormSectionCard
                    title="Available Sessions"
                    descriptionTooltip="Choose a session for the selected students."
                    action={
                      canCreate ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="mdi:plus" />}
                          disabled={locked || readonly || data.retryPending || data.createBlocked}
                          onClick={data.beginCreate}
                        >
                          Create Session
                        </Button>
                      ) : undefined
                    }
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
                        {data.available.map((session) => (
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
                              cursor: 'pointer',
                            }}
                          >
                            <Radio
                              name="assessment-session"
                              size="small"
                              checked={data.session?.id === session.id}
                              disabled={locked || readonly || data.retryPending}
                              value={session.id}
                              onChange={() => data.chooseSession(session)}
                              inputProps={{ 'aria-label': session.name }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2">{session.name}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatAssessmentSchedule(session.startsAt, session.endsAt)?.date} ·{' '}
                                {formatAssessmentSchedule(session.startsAt, session.endsAt)?.time}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {session.location}
                              </Typography>
                            </Box>
                            <Label>
                              {Math.max(0, session.capacity - session.bookedCount)} seats / slots
                            </Label>
                          </Box>
                        ))}
                        {!data.available.length && (
                          <Typography variant="body2" color="text.secondary">
                            No available sessions on this page. Create a session or check another
                            page.
                          </Typography>
                        )}
                      </Stack>
                    )}
                    {(data.sessions.currentData?.totalCount ?? 0) > 25 && (
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          size="small"
                          disabled={locked || data.page === 0}
                          onClick={() => data.setPage(data.page - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          size="small"
                          disabled={
                            locked || (data.page + 1) * 25 >= data.sessions.currentData!.totalCount
                          }
                          onClick={() => data.setPage(data.page + 1)}
                        >
                          Next
                        </Button>
                      </Stack>
                    )}
                  </FormSectionCard>
                ) : data.resources.isError ? (
                  <StudentFeedback
                    notificationKey="STU-0264"
                    presentation="persistent"
                    severity="error"
                    action={
                      <Button size="small" onClick={data.resources.refetch}>
                        Retry
                      </Button>
                    }
                  >
                    Unable to load Institute rooms.
                  </StudentFeedback>
                ) : (
                  <AssessmentSessionSetupFields
                    pipeline
                    formik={data.form}
                    scopes={scopes.filter((scope) =>
                      data.rows.some(
                        (row) =>
                          row.admissionOfferingId === scope.admissionOfferingId &&
                          row.workflowStageDefinitionId === scope.workflowStageDefinitionId
                      )
                    )}
                    rooms={data.rooms}
                    interviewers={data.resources.currentData?.interviewers ?? []}
                    onSearchInterviewers={data.searchInterviewers}
                    disabled={locked || readonly || data.retryPending}
                    bookedCount={0}
                    classSummary={
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Class
                        </Typography>
                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                          {selectedClasses.map((name) => (
                            <Label key={name}>{name}</Label>
                          ))}
                        </Stack>
                      </Stack>
                    }
                  />
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
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ p: 2 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={locked}
              onClick={() => data.navigate(data.mode === 'create' ? 'back' : 'close')}
            >
              {data.mode === 'create' ? 'Back' : 'Cancel'}
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              color="inherit"
              type="submit"
              loading={locked}
              disabled={
                locked ||
                readonly ||
                (data.mode === 'book'
                  ? !data.review?.canConfirm && !data.retryPending
                  : data.createBlocked || data.resources.isError || !data.resources.currentData)
              }
            >
              {data.mode === 'create' ? `Create & Book ${count} ${noun}` : `Book ${count} ${noun}`}
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
            : 'Your session entries and booking selection have not been submitted.'
        }
        onClose={() => data.setDiscard(null)}
        action={
          <Button size="small" variant="contained" color="error" onClick={data.discardChanges}>
            Discard
          </Button>
        }
      />
    </>
  );
}
