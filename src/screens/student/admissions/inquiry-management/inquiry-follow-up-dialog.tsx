'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { InquiryFollowUpNote } from 'src/redux/student/admissions/admission-inquiry-management-api';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { fDate, fTime } from 'src/utils/format-time';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetAdmissionInquiryQuery } from 'src/redux/student/admissions/admission-inquiries-api';
import {
  Box,
  Stack,
  Paper,
  Button,
  Avatar,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  useGetAdmissionInquiryManagementQuery,
  useRecordAdmissionInquiryFollowUpNoteMutation,
} from 'src/redux/student/admissions/admission-inquiry-management-api';

import { getAdmissionInquiryAccess } from '../inquiry-access';
import {
  inquiryStatusLabel,
  INQUIRY_STATUS_OPTIONS,
  normalizeInquiryStatus,
} from './admission-inquiry-list-options';
import {
  inquiryReminderAt,
  inquiryFollowUpSchema,
  type InquiryFollowUpValues,
  inquiryFollowUpReadOnlyReason,
} from './inquiry-follow-up-model';

export function InquiryFollowUpDialog({
  inquiry,
  onClose,
}: {
  inquiry: AdmissionInquiry | null;
  onClose: () => void;
}) {
  return inquiry ? (
    <InquiryFollowUpContent key={inquiry.id} inquiry={inquiry} onClose={onClose} />
  ) : null;
}

function InquiryFollowUpContent({
  inquiry,
  onClose,
}: {
  inquiry: AdmissionInquiry;
  onClose: () => void;
}) {
  const [openedAt] = useState(() => Date.now());
  const management = useGetAdmissionInquiryManagementQuery(inquiry.id, {
    refetchOnMountOrArgChange: true,
  });
  const managementReady = Boolean(
    management.currentData &&
    !management.isFetching &&
    !management.isError &&
    management.fulfilledTimeStamp &&
    management.fulfilledTimeStamp >= openedAt
  );
  // Management can initialize a legacy row and rotate the inquiry stamp.
  const detail = useGetAdmissionInquiryQuery(inquiry.id, {
    skip: !managementReady,
    refetchOnMountOrArgChange: true,
  });
  const [record, recording] = useRecordAdmissionInquiryFollowUpNoteMutation();
  const savingRef = useRef(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const { canManage } = getAdmissionInquiryAccess(permissions);
  const initialized = useBoolean();
  const discard = useBoolean();
  const [requestError, setRequestError] = useState('');
  const current = detail.currentData;
  const state = management.currentData;
  const fetching = detail.isFetching || management.isFetching;
  const freshForOpening = Boolean(
    managementReady &&
    detail.fulfilledTimeStamp &&
    management.fulfilledTimeStamp &&
    detail.fulfilledTimeStamp >= management.fulfilledTimeStamp
  );
  const queryError = Boolean(
    detail.isError ||
    management.isError ||
    (freshForOpening &&
      !fetching &&
      current &&
      state &&
      (!current.concurrencyStamp?.trim() || !state.concurrencyStamp?.trim()))
  );
  const ready = Boolean(current && state && freshForOpening && !fetching && !queryError);
  const readOnlyReason =
    current && state
      ? inquiryFollowUpReadOnlyReason(current, state, canManage, currentUserId)
      : null;

  const formik = useFormik<InquiryFollowUpValues>({
    initialValues: { note: '', reminderDate: null, status: 0 },
    validationSchema: inquiryFollowUpSchema,
    onSubmit: async (values, helpers) => {
      if (
        !ready ||
        !initialized.value ||
        !current ||
        !state ||
        readOnlyReason ||
        recording.isLoading ||
        savingRef.current
      )
        return;
      savingRef.current = true;
      setRequestError('');
      try {
        await record({
          inquiryId: current.id,
          concurrencyStamp: state.concurrencyStamp,
          inquiryConcurrencyStamp: current.concurrencyStamp,
          note: values.note.trim(),
          status: values.status,
          reminderAt: inquiryReminderAt(values),
        }).unwrap();
        helpers.resetForm();
        shikshaMitraToast.success({ message: 'Follow-up saved.' });
        onClose();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        const conflict = problem.errorCode?.includes('ConcurrencyConflict');
        const generic = /^(one or more|something went wrong|typeerror:|failed to fetch)/i.test(
          problem.detail
        );
        const message = conflict
          ? 'This inquiry changed. Reload its details and submit your note again.'
          : !problem.detail || generic
            ? 'Unable to save the follow-up. Your draft is preserved; try again.'
            : problem.detail;
        setRequestError(message);
        shikshaMitraToast.error({ message });
      } finally {
        savingRef.current = false;
      }
    },
  });

  useEffect(() => {
    // Cached results can be rendered before the mount refetch starts.
    if (initialized.value || !ready || !freshForOpening || !current) return;
    const status = normalizeInquiryStatus(current.status);
    const reminderAt =
      state?.nextReminderAt ??
      state?.followUps
        ?.filter((followUp) => followUp.status === 0)
        .sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf())[0]
        ?.scheduledAt ??
      current.nextFollowUpAt;
    const reminder = reminderAt ? dayjs(reminderAt) : null;
    formik.resetForm({
      values: {
        note: '',
        status,
        reminderDate:
          status !== 6 && reminder?.isValid() && reminder.isAfter(dayjs(), 'day') ? reminder : null,
      },
    });
    initialized.onTrue();
  }, [current, formik, freshForOpening, initialized, ready, state]);

  const saving = recording.isLoading || formik.isSubmitting;
  const locked = saving || !ready || !initialized.value || Boolean(readOnlyReason);
  const close = () => {
    if (saving) return;
    if (formik.dirty) discard.onTrue();
    else onClose();
  };
  const reload = () => {
    // Skipping/resubscribing the detail query refetches it after management succeeds.
    management.refetch();
  };
  const notes = [...(state?.notes ?? [])].sort(
    (a, b) => dayjs(b.occurredAt).valueOf() - dayjs(a.occurredAt).valueOf()
  );
  const noteError = Boolean((formik.touched.note || formik.submitCount) && formik.errors.note);
  const dateError = Boolean(
    (formik.touched.reminderDate || formik.submitCount) && formik.errors.reminderDate
  );

  return (
    <>
      <CustomDialog
        open
        title="Follow-up"
        maxWidth="sm"
        hasForm={false}
        handleClose={close}
        disableClose={saving}
        guardUnsavedChanges={false}
        hasUnsavedChanges={formik.dirty}
        paperProps={{
          sx: { height: { xs: 'calc(100dvh - 32px)', sm: 660 }, maxHeight: 'calc(100dvh - 32px)' },
        }}
      >
        <Box component="form" noValidate onSubmit={formik.handleSubmit}>
          <DialogScrollContent aria-label="Follow-up notes, newest first">
            <Stack spacing={1.5}>
              {(fetching || !initialized.value) && !queryError && (
                <Stack spacing={1} aria-label="Loading follow-up notes">
                  <Skeleton variant="rounded" height={110} />
                  <Skeleton variant="rounded" height={110} />
                </Stack>
              )}
              {queryError && (
                <StudentFeedback
                  notificationKey="STU-0406"
                  presentation="toast"
                  severity="error"
                  action={
                    <Button size="small" color="inherit" onClick={reload}>
                      Retry
                    </Button>
                  }
                >
                  Follow-up notes could not be loaded.
                </StudentFeedback>
              )}
              {readOnlyReason && (
                <StudentFeedback
                  notificationKey="STU-0407"
                  presentation="persistent"
                  severity="info"
                >
                  {readOnlyReason}
                </StudentFeedback>
              )}
              {!queryError && initialized.value && !notes.length && !fetching && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No follow-up notes yet.
                </Typography>
              )}
              {!queryError &&
                initialized.value &&
                notes.map((note) => <FollowUpNoteCard key={note.id} note={note} />)}
            </Stack>
          </DialogScrollContent>
          <Box
            sx={{ position: 'relative', p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
          >
            <Stack spacing={1.5}>
              {requestError && (
                <StudentFeedback
                  notificationKey="STU-0408"
                  presentation="inline"
                  severity="error"
                  action={
                    <Button
                      size="small"
                      color="inherit"
                      onClick={reload}
                      disabled={saving || fetching}
                    >
                      Reload
                    </Button>
                  }
                >
                  {requestError}
                </StudentFeedback>
              )}
              <ShakingTextField error={noteError}>
                <TextField
                  required
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  size="small"
                  label="Notes"
                  name="note"
                  disabled={locked}
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={noteError}
                  helperText={
                    <Box
                      component="span"
                      sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                    >
                      <span>{noteError ? formik.errors.note : ''}</span>
                      <span>{formik.values.note.length}/500</span>
                    </Box>
                  }
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </ShakingTextField>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' },
                  gap: 1.5,
                }}
              >
                <ShakingTextField error={dateError}>
                  <DatePicker
                    label="Next reminder date"
                    format="DD-MM-YYYY"
                    value={formik.values.reminderDate}
                    minDate={dayjs().add(1, 'day').startOf('day')}
                    disabled={locked || formik.values.status === 6}
                    onChange={(value) => formik.setFieldValue('reminderDate', value)}
                    slotProps={{
                      textField: {
                        name: 'reminderDate',
                        size: 'small',
                        fullWidth: true,
                        required: formik.values.status !== 6,
                        onBlur: () => formik.setFieldTouched('reminderDate', true),
                        error: dateError,
                        helperText: dateError ? String(formik.errors.reminderDate) : undefined,
                      },
                    }}
                  />
                </ShakingTextField>
                <CustomSelect
                  required
                  fullWidth
                  size="small"
                  label="Status"
                  name="status"
                  value={formik.values.status}
                  options={INQUIRY_STATUS_OPTIONS}
                  disabled={locked}
                  onChange={(value) => {
                    const status = Number(value) as InquiryFollowUpValues['status'];
                    formik.setFieldValue('status', status);
                    if (status === 6) formik.setFieldValue('reminderDate', null);
                  }}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.status && formik.errors.status)}
                  helperText={formik.touched.status ? formik.errors.status : undefined}
                />
              </Box>
            </Stack>
            {saving && (
              <Box
                role="status"
                aria-label="Saving follow-up"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'action.disabledBackground',
                  display: 'grid',
                  placeItems: 'center',
                  zIndex: 1,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={saving}
              onClick={close}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              type="submit"
              loading={saving}
              disabled={locked}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </Box>
      </CustomDialog>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        icon="warning"
        disableBackdropClick
        title="Discard unsaved changes?"
        content="Your follow-up note and reminder changes will be discarded."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              discard.onFalse();
              formik.resetForm();
              onClose();
            }}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}

function FollowUpNoteCard({ note }: { note: InquiryFollowUpNote }) {
  const name = note.authorName?.trim() || 'Author not recorded';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <Stack
      component="article"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.25}
      alignItems="flex-start"
    >
      <Stack
        direction={{ xs: 'row', sm: 'column' }}
        spacing={{ xs: 0.75, sm: 0.25 }}
        sx={{ flexShrink: 0, width: { sm: 88 }, pt: { sm: 1 } }}
      >
        <Typography variant="caption" color="text.secondary">
          {fDate(note.occurredAt)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fTime(note.occurredAt)}
        </Typography>
      </Stack>
      <Box
        aria-hidden
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 10,
          height: 10,
          mt: 1.5,
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor:
            note.status === 2
              ? 'success.main'
              : note.status === 0
                ? 'warning.main'
                : 'text.disabled',
        }}
      />
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, flex: 1, minWidth: 0, width: 1 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Label
              color={note.status === 2 ? 'success' : note.status === 0 ? 'warning' : 'default'}
            >
              {note.status === null ? 'Note' : inquiryStatusLabel(note.status)}
            </Label>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {note.note}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  fontSize: 11,
                  bgcolor: 'action.selected',
                  color: 'text.secondary',
                }}
              >
                {initials}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {name}
              </Typography>
            </Stack>
            {note.reminderAt && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify icon={GlobalIcons.calendar} width={14} color="text.secondary" />
                <Typography variant="caption" color="text.secondary">
                  Remind date: {fDate(note.reminderAt)}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
