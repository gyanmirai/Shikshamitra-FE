import type { AppDispatch } from 'src/redux/store';
import type {
  StudentAppAccessSnapshot,
  StudentAppAccessRecipient,
} from 'src/redux/student/records/student-record-app-access-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { fDateTime, formatStr } from 'src/utils/format-time';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Alert,
  Stack,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  studentRecordAppAccessApi,
  useGetStudentRecordAppAccessQuery,
  useUpdateStudentRecordAppAccessMutation,
} from 'src/redux/student/records/student-record-app-access-api';

const relationships = { self: 'Student', father: 'Father', mother: 'Mother' };
const statuses = {
  on: { label: 'On', color: 'success' },
  off: { label: 'Off', color: 'error' },
  'not-set-up': { label: 'Not set up', color: 'default' },
} as const;
const reasonHint = 'Enter a reason using 3 to 400 characters.';
const reasonSchema = Yup.string()
  .trim()
  .required(reasonHint)
  .min(3, reasonHint)
  .max(400, reasonHint);
const columns = {
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr) 78px 74px', sm: 'minmax(0, 1fr) 110px 102px' },
  gap: 1,
  alignItems: 'center',
};

function getStatus(error: unknown) {
  return error && typeof error === 'object' && 'status' in error ? error.status : undefined;
}

function AppAccessHistory({
  history,
  onClose,
}: {
  history: StudentAppAccessSnapshot['history'];
  onClose: () => void;
}) {
  return (
    <CustomDialog
      open
      title="App Access History"
      titleInfo="Review access changes recorded for this student and their linked recipients."
      handleClose={onClose}
      hasForm={false}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        {history.length ? (
          <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {history.map((entry) => (
              <Stack
                key={entry.id}
                component="li"
                spacing={0.5}
                sx={{ minWidth: 0, borderBottom: 1, borderColor: 'divider', pb: 1.5 }}
              >
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {relationships[entry.relationship] ?? entry.relationship}
                    {entry.displayName && ` · ${entry.displayName}`}
                  </Typography>
                  <Label color={entry.enabled ? 'success' : 'error'}>
                    {entry.enabled ? 'Turned on' : 'Turned off'}
                  </Label>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {fDateTime(entry.changedAt, formatStr.split.dateTime)}
                  {entry.changedByName && ` · ${entry.changedByName}`}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
                >
                  {entry.reason}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No app access changes recorded.
          </Typography>
        )}
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

type SaveFeedback = 'failed' | 'stale' | 'reload-failed' | 'review' | 'target-changed';

const feedbackText: Record<SaveFeedback, string> = {
  failed: 'App access could not be saved. Try again.',
  stale: 'App access changed since you opened this dialog. Refresh access before trying again.',
  'reload-failed': 'Current app access could not be loaded. Refresh access to continue.',
  review: 'App access was refreshed. Review the current status and confirm again to save.',
  'target-changed':
    'This recipient or their access status changed. Close this dialog and review the current App Access card.',
};

function AppAccessConfirmation({
  recipient,
  canSave,
  onSave,
  onRefresh,
  onClose,
}: {
  recipient: StudentAppAccessRecipient;
  canSave: boolean;
  onSave: (
    recipient: StudentAppAccessRecipient,
    enabled: boolean,
    reason: string
  ) => Promise<unknown>;
  onRefresh: () => Promise<StudentAppAccessSnapshot | null>;
  onClose: () => void;
}) {
  const [target, setTarget] = useState(recipient);
  const [feedback, setFeedback] = useState<SaveFeedback>();
  const [refreshing, setRefreshing] = useState(false);
  const enabled = recipient.status === 'off';
  const action = enabled ? 'Turn on' : 'Turn off';
  const name = recipient.displayName || relationships[recipient.relationship];
  const refreshRequired = feedback === 'stale' || feedback === 'reload-failed';
  const form = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({ reason: reasonSchema }),
    onSubmit: async ({ reason }) => {
      if (!canSave || refreshRequired || feedback === 'target-changed') return;
      setFeedback(undefined);
      try {
        await onSave(target, enabled, reason.trim());
        onClose();
      } catch (error) {
        setFeedback(getStatus(error) === 409 ? 'stale' : 'failed');
      }
    },
  });

  const refresh = async () => {
    setRefreshing(true);
    try {
      const snapshot = await onRefresh();
      const current = snapshot?.recipients.find(
        (item) => item.recipientKey === target.recipientKey
      );
      if (
        !current?.canUpdate ||
        current.relationship !== recipient.relationship ||
        current.status !== recipient.status ||
        current.displayName !== recipient.displayName
      ) {
        setFeedback('target-changed');
        return;
      }
      setTarget(current);
      setFeedback('review');
    } catch {
      setFeedback('reload-failed');
    } finally {
      setRefreshing(false);
    }
  };

  const reasonError = form.touched.reason && form.errors.reason;
  return (
    <ConfirmDialog
      open
      title={`${enabled ? 'Turn On' : 'Turn Off'} App Access`}
      icon={enabled ? 'info' : 'warning'}
      onClose={onClose}
      disableCancel={form.isSubmitting || refreshing}
      content={
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {enabled
              ? `${name} will be able to access this student in the app again.`
              : `${name} will lose app access to this student.`}
            {recipient.relationship !== 'self' &&
              ' Their access to linked siblings stays the same.'}
          </Typography>
          <ShakingTextField error={Boolean(reasonError)}>
            <TextField
              {...form.getFieldProps('reason')}
              label="Reason"
              size="small"
              fullWidth
              required
              multiline
              minRows={2}
              error={Boolean(reasonError)}
              helperText={reasonError || reasonHint}
            />
          </ShakingTextField>
          {feedback && (
            <Alert
              severity={feedback === 'review' ? 'info' : 'warning'}
              action={
                refreshRequired ? (
                  <Button size="small" color="inherit" disabled={refreshing} onClick={refresh}>
                    Refresh access
                  </Button>
                ) : undefined
              }
            >
              {feedbackText[feedback]}
            </Alert>
          )}
        </Stack>
      }
      action={
        <LoadingButton
          type="button"
          size="small"
          variant="contained"
          color={enabled ? 'inherit' : 'error'}
          loading={form.isSubmitting}
          disabled={
            !canSave ||
            refreshing ||
            refreshRequired ||
            feedback === 'target-changed' ||
            !reasonSchema.isValidSync(form.values.reason)
          }
          onClick={() => form.submitForm()}
        >
          {action}
        </LoadingButton>
      }
    />
  );
}

export function StudentProfileAppAccess({
  studentId,
  canManage,
}: {
  studentId: string;
  canManage: boolean;
}) {
  const access = useGetStudentRecordAppAccessQuery(studentId, { refetchOnMountOrArgChange: true });
  const [updateAccess] = useUpdateStudentRecordAppAccessMutation();
  const dispatch = useDispatch<AppDispatch>();
  const [selected, setSelected] = useState<StudentAppAccessRecipient>();
  const [showHistory, setShowHistory] = useState(false);
  const lastAnchor = useRef('');
  const { currentData } = access;
  const data = access.isError ? undefined : currentData;

  useEffect(() => {
    if (data === null) {
      setSelected(undefined);
      setShowHistory(false);
      return;
    }
    const { hash } = window.location;
    if (!data || !hash.startsWith('#student-app-access-') || lastAnchor.current === hash) return;
    const row = document.getElementById(hash.slice(1));
    if (row) {
      row.scrollIntoView({ block: 'nearest' });
      row.focus({ preventScroll: true });
      lastAnchor.current = hash;
    }
  }, [data]);

  if (data === null) return null;

  return (
    <FormSectionCard
      aria-label="App Access"
      icon={GlobalIcons.lockIcon}
      title="App Access"
      descriptionTooltip="Manage whether the student and linked parents can open this student in the app."
      action={
        data && (
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.history} />}
            onClick={() => setShowHistory(true)}
          >
            View history
          </Button>
        )
      }
    >
      <Divider />
      {access.isError && (
        <Alert
          severity="warning"
          action={
            <Button size="small" color="inherit" onClick={() => access.refetch()}>
              Retry
            </Button>
          }
        >
          App access could not be loaded.
        </Alert>
      )}
      {access.isFetching && !data && (
        <Stack role="status" aria-label="Loading app access" spacing={1}>
          <Skeleton height={28} />
          <Skeleton height={28} />
        </Stack>
      )}
      {data && (
        <>
          <Box aria-hidden="true" sx={columns}>
            {['Recipient', 'Status', 'Action'].map((label) => (
              <Typography key={label} variant="caption" color="text.secondary" fontWeight={600}>
                {label}
              </Typography>
            ))}
          </Box>
          <Stack component="ul" spacing={0} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {data.recipients.map((recipient) => {
              const relationship = relationships[recipient.relationship];
              const status = statuses[recipient.status];
              const action = recipient.status === 'off' ? 'Turn on' : 'Turn off';
              return (
                <Box
                  key={recipient.recipientKey}
                  id={`student-app-access-${recipient.relationship}`}
                  component="li"
                  tabIndex={-1}
                  sx={{
                    ...columns,
                    py: 0.75,
                    borderTop: 1,
                    borderColor: 'divider',
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    columnGap={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                  >
                    <Typography variant="subtitle2">{relationship}</Typography>
                    {recipient.displayName && (
                      <Typography variant="body2" color="text.secondary">
                        {recipient.displayName}
                      </Typography>
                    )}
                  </Stack>
                  <Label color={status.color} sx={{ justifySelf: 'start' }}>
                    {status.label}
                  </Label>
                  {canManage && recipient.canUpdate && recipient.status !== 'not-set-up' ? (
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      color={recipient.status === 'on' ? 'error' : 'inherit'}
                      disabled={access.isFetching || access.isError}
                      aria-label={`${action} access for ${relationship}${recipient.displayName ? ` ${recipient.displayName}` : ''}`}
                      onClick={() => setSelected(recipient)}
                    >
                      {action}
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary" aria-hidden="true">
                      —
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </>
      )}
      {showHistory && data && (
        <AppAccessHistory history={data.history} onClose={() => setShowHistory(false)} />
      )}
      {selected && canManage && (
        <AppAccessConfirmation
          recipient={selected}
          canSave={!access.isFetching && !access.isError}
          onClose={() => setSelected(undefined)}
          onRefresh={() => access.refetch().unwrap()}
          onSave={async ({ recipientKey, concurrencyStamp }, enabled, reason) => {
            const request = updateAccess({
              studentId,
              recipientKey,
              concurrencyStamp,
              enabled,
              reason,
            });
            try {
              const updated = await request.unwrap();
              dispatch(
                studentRecordAppAccessApi.util.updateQueryData(
                  'getStudentRecordAppAccess',
                  studentId,
                  (current) => (current === null ? null : updated)
                )
              );
            } finally {
              request.reset();
            }
          }}
        />
      )}
    </FormSectionCard>
  );
}
