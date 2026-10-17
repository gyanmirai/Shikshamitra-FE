'use client';

import type { RootState } from 'src/redux/store';
import type { StudentCredentialsRecipient } from 'src/redux/student/onboarding/student-onboarding-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { RouterLink } from 'src/routes/components';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Box,
  Alert,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  useGetStudentOnboardingCredentialsQuery,
  useSendStudentOnboardingCredentialsMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import GuardianProfileEmailDialog from './guardian-profile-email-dialog';

import type { StudentOnboardingItem } from './student-onboarding-model';

type CredentialsValues = {
  accountType: StudentCredentialsRecipient['accountType'];
  relationship: string;
  email: string;
};

type Props = {
  student: StudentOnboardingItem;
  canManage: boolean;
  onBusyChange?: (busy: boolean) => void;
};

const relationshipLabels = {
  self: 'Student',
  father: 'Father',
  mother: 'Mother',
  guardian: 'Guardian',
};
const emailSchema = Yup.string()
  .trim()
  .email('The saved email is invalid. Correct it in Student Records, then refresh.')
  .max(256)
  .required('No email is saved for this person. Add it in Student Records, then refresh.');
const credentialsSchema = Yup.object({
  accountType: Yup.string().oneOf(['student', 'guardian']).required('Choose an account type.'),
  relationship: Yup.string().when('accountType', {
    is: 'student',
    then: (schema) => schema.oneOf(['self']).required(),
    otherwise: (schema) =>
      schema.oneOf(['father', 'mother', 'guardian']).required('Choose a recipient.'),
  }),
  email: emailSchema,
});

export default function StudentOnboardingPortalAccounts({
  student,
  canManage,
  onBusyChange,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const credentials = useGetStudentOnboardingCredentialsQuery(student.id);
  const [sendCredentials, mutation] = useSendStudentOnboardingCredentialsMutation();
  const submittingRef = useRef(false);
  const initializedCase = useRef<string | null>(null);
  const [profileCorrection, setProfileCorrection] = useState<
    'father' | 'mother' | 'guardian' | null
  >(null);
  const [profileChange, setProfileChange] = useState<{
    id: string;
    status: string;
    relationship: string;
  } | null>(null);
  const currentWorkspace = credentials.currentData ?? credentials.data;
  const workspace = currentWorkspace?.caseId === student.id ? currentWorkspace : undefined;
  const recipients = workspace?.recipients ?? [];
  const formik = useFormik<CredentialsValues>({
    initialValues: { accountType: 'student', relationship: 'self', email: '' },
    validationSchema: credentialsSchema,
    onSubmit: async (values, helpers) => {
      if (submittingRef.current || !canSend || !workspace || !selectedRecipient) return;
      submittingRef.current = true;
      helpers.setStatus(undefined);
      try {
        const result = await sendCredentials({
          id: student.id,
          accountType: selectedRecipient.accountType,
          relationship: selectedRecipient.relationship,
          expectedEmail: values.email.trim(),
          concurrencyStamp: workspace.concurrencyStamp,
        }).unwrap();
        const recipient = result.recipients.find(
          (item) =>
            item.accountType === values.accountType && item.relationship === values.relationship
        );
        const delivery = recipient?.delivery;
        if (!delivery || !['Pending', 'Sent'].includes(delivery.status)) {
          helpers.setStatus(
            delivery?.message ||
              recipient?.blockedReason ||
              'Credentials could not be requested. Refresh and review the account requirements.'
          );
        } else {
          shikshaMitraToast.success({
            message:
              delivery?.status === 'Sent'
                ? 'Credential email accepted by the email sender.'
                : 'Credentials requested. Delivery is pending.',
          });
        }
      } catch (error) {
        helpers.setStatus(
          parseApiProblemDetail(error).detail ||
            'Credentials could not be requested. Refresh the saved details, then try again.'
        );
      } finally {
        submittingRef.current = false;
      }
    },
  });
  const legalGuardianRecipients = recipients.filter(
    (recipient) => recipient.accountType === 'guardian'
  );
  const guardianEmails = legalGuardianRecipients.filter((recipient) => recipient.email?.trim());
  const guardianRecipients = guardianEmails.length ? guardianEmails : legalGuardianRecipients;
  const selectedRecipient = recipients.find(
    (recipient) =>
      recipient.accountType === formik.values.accountType &&
      recipient.relationship === formik.values.relationship
  );
  const savedEmail = selectedRecipient?.email?.trim() ?? '';
  const validEmail = emailSchema.isValidSync(savedEmail);
  const busy = mutation.isLoading || formik.isSubmitting;
  const canSend =
    canManage &&
    !!workspace?.concurrencyStamp &&
    !!selectedRecipient?.canSend &&
    validEmail &&
    formik.values.email === savedEmail &&
    !credentials.isFetching &&
    !credentials.isError &&
    !mutation.isLoading &&
    selectedRecipient.delivery?.status !== 'Pending';
  const { setValues, setFieldValue, setStatus } = formik;

  useEffect(() => {
    if (!workspace?.recipients.length || initializedCase.current === student.id) return;
    initializedCase.current = student.id;
    const first =
      workspace.recipients.find((recipient) => recipient.canSend && recipient.email?.trim()) ??
      workspace.recipients.find((recipient) => recipient.email?.trim()) ??
      workspace.recipients[0];
    const accountType = first?.accountType ?? 'student';
    const owners = workspace.recipients.filter(
      (recipient) => recipient.accountType === accountType && recipient.email?.trim()
    );
    const candidates = owners.length
      ? owners
      : workspace.recipients.filter((recipient) => recipient.accountType === accountType);
    setValues(
      {
        accountType,
        relationship:
          accountType === 'student'
            ? 'self'
            : candidates.length === 1
              ? candidates[0].relationship
              : '',
        email: '',
      },
      false
    );
    setStatus(undefined);
    setProfileChange(null);
    setProfileCorrection(null);
  }, [workspace, student.id, setValues, setStatus]);

  useEffect(() => {
    if (formik.values.email !== savedEmail) {
      setFieldValue('email', savedEmail, false);
      setStatus(undefined);
    }
  }, [savedEmail, formik.values.email, setFieldValue, setStatus]);

  const soleGuardianRelationship =
    guardianRecipients.length === 1 ? guardianRecipients[0].relationship : '';
  useEffect(() => {
    if (
      !busy &&
      formik.values.accountType === 'guardian' &&
      soleGuardianRelationship &&
      formik.values.relationship !== soleGuardianRelationship
    ) {
      setFieldValue('relationship', soleGuardianRelationship, false);
      setStatus(undefined);
    }
  }, [
    busy,
    formik.values.accountType,
    formik.values.relationship,
    soleGuardianRelationship,
    setFieldValue,
    setStatus,
  ]);

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(
    () => () => {
      onBusyChange?.(false);
    },
    [onBusyChange]
  );

  const refresh = () => {
    if (!busy && !credentials.isFetching) {
      setStatus(undefined);
      credentials.refetch();
    }
  };
  if (!workspace && !credentials.isError && (credentials.isLoading || credentials.isFetching)) {
    return (
      <Stack spacing={1} role="status" aria-label="Loading credentials">
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" width={160} height={30} sx={{ alignSelf: 'flex-end' }} />
      </Stack>
    );
  }
  if (!workspace && credentials.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            size="small"
            startIcon={<Iconify icon="mdi:refresh" width={18} />}
            onClick={refresh}
          >
            Retry
          </Button>
        }
      >
        Credentials could not be loaded. Try again.
      </Alert>
    );
  }
  if (!recipients.length) {
    return (
      <Alert
        severity="info"
        action={
          <Button
            size="small"
            disabled={credentials.isFetching}
            startIcon={<Iconify icon="mdi:refresh" width={18} />}
            onClick={refresh}
          >
            Refresh
          </Button>
        }
      >
        No saved account-owner profiles are available. Complete the student&apos;s contact details
        in Student Records, then refresh.
      </Alert>
    );
  }

  const delivery = selectedRecipient?.delivery;
  const emailError =
    selectedRecipient && !validEmail
      ? savedEmail
        ? 'The saved email is invalid. Correct it in Student Records, then refresh.'
        : `No email is saved for this ${formik.values.accountType === 'student' ? 'student' : 'parent/guardian'}. Add it in Student Records, then refresh.`
      : formik.touched.email
        ? formik.errors.email
        : undefined;
  const blockedReason = !canManage
    ? 'You can view credentials. An authorized staff member must send them.'
    : selectedRecipient &&
        validEmail &&
        !selectedRecipient.canSend &&
        delivery?.status !== 'Pending'
      ? selectedRecipient.blockedReason ||
        'Credentials cannot be sent yet. Complete the onboarding requirements, then refresh.'
      : undefined;
  const correctionAvailable =
    !validEmail &&
    !!selectedRecipient?.name?.trim() &&
    formik.values.accountType === 'guardian' &&
    canManage &&
    student.backendStatus !== 4 &&
    student.backendStatus !== 5 &&
    !!student.studentId &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.Add');
  const formError = credentials.isError
    ? 'Credentials could not be refreshed. Refresh again before sending.'
    : typeof formik.status === 'string'
      ? formik.status
      : undefined;

  return (
    <Stack spacing={1}>
      {credentials.isFetching && <LinearProgress aria-label="Refreshing credentials" />}
      <Box
        component="form"
        aria-label="Send credentials"
        aria-busy={busy}
        noValidate
        onSubmit={formik.handleSubmit}
        sx={{ position: 'relative' }}
      >
        <Box
          component="fieldset"
          disabled={busy}
          inert={busy}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          <Stack spacing={1}>
            <CustomSelect
              size="small"
              label="Account type"
              name="accountType"
              value={formik.values.accountType}
              disabled={busy}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'guardian', label: 'Parent / Guardian' },
              ]}
              onChange={(value) => {
                const accountType = value === 'guardian' ? 'guardian' : 'student';
                setValues(
                  {
                    accountType,
                    relationship:
                      accountType === 'student'
                        ? 'self'
                        : guardianRecipients.length === 1
                          ? guardianRecipients[0].relationship
                          : '',
                    email: '',
                  },
                  false
                );
                formik.setTouched({}, false);
                setStatus(undefined);
              }}
            />
            {formik.values.accountType === 'guardian' && guardianRecipients.length > 1 && (
              <ShakingTextField
                error={Boolean(formik.touched.relationship && formik.errors.relationship)}
              >
                <CustomSelect
                  size="small"
                  required
                  label="Recipient"
                  name="relationship"
                  value={formik.values.relationship}
                  disabled={busy}
                  options={guardianRecipients.map((recipient) => ({
                    value: recipient.relationship,
                    label: `${relationshipLabels[recipient.relationship]}${recipient.name?.trim() ? ` — ${recipient.name}` : ''}${recipient.email?.trim() ? ` · ${recipient.email}` : ''}`,
                  }))}
                  error={Boolean(formik.touched.relationship && formik.errors.relationship)}
                  helperText={formik.touched.relationship ? formik.errors.relationship : undefined}
                  onBlur={() => formik.setFieldTouched('relationship', true)}
                  onChange={(value) => {
                    setFieldValue('relationship', value, false);
                    setStatus(undefined);
                  }}
                />
              </ShakingTextField>
            )}
            <ShakingTextField error={Boolean(emailError)}>
              <TextField
                fullWidth
                required
                size="small"
                label="Email"
                name="email"
                value={formik.values.email}
                onBlur={formik.handleBlur}
                disabled={busy}
                slotProps={{ input: { readOnly: true } }}
                error={Boolean(emailError)}
                helperText={
                  emailError ||
                  (!selectedRecipient &&
                  (formik.values.accountType === 'student' || !guardianRecipients.length)
                    ? 'No saved email is available for this account type. Complete the contact details in Student Records, then refresh.'
                    : undefined)
                }
              />
            </ShakingTextField>
            {correctionAvailable && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:pencil-outline" width={18} />}
                disabled={busy || credentials.isFetching}
                sx={{ alignSelf: 'flex-start' }}
                onClick={() =>
                  setProfileCorrection(
                    formik.values.relationship as 'father' | 'mother' | 'guardian'
                  )
                }
              >
                Correct Saved Email
              </Button>
            )}
            {profileChange &&
              profileChange.relationship === formik.values.relationship &&
              profileChange.status !== 'Applied' && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      component={RouterLink}
                      href={`${studentPaths.records.changes}?request=${encodeURIComponent(profileChange.id)}`}
                      size="small"
                      startIcon={<Iconify icon="mdi:open-in-new" width={18} />}
                      disabled={busy}
                    >
                      Review Correction
                    </Button>
                  }
                >
                  {profileChange.status === 'Pending'
                    ? 'Email correction awaits Records approval. The saved email changes after approval.'
                    : 'Review the email correction in Student Records before sending.'}
                </Alert>
              )}
            {formError ? (
              <Alert severity="error">{formError}</Alert>
            ) : blockedReason ? (
              <Alert severity="warning">{blockedReason}</Alert>
            ) : null}
            {!formError && delivery && !['NotRequested', 'Blocked'].includes(delivery.status) && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                role="status"
                sx={{ minWidth: 0 }}
              >
                <Label
                  color={
                    delivery.status === 'Sent'
                      ? 'success'
                      : delivery.status === 'Failed'
                        ? 'error'
                        : delivery.status === 'Pending'
                          ? 'info'
                          : 'default'
                  }
                >
                  {delivery.status === 'Pending' ? 'Queued' : delivery.status}
                </Label>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {delivery.status === 'Pending'
                    ? delivery.message ||
                      selectedRecipient?.blockedReason ||
                      'Delivery is pending. Refresh to check progress.'
                    : delivery.status === 'Sent'
                      ? `Accepted by the email sender${delivery.sentAt ? ` · ${fDateTime(delivery.sentAt)}` : ''}.`
                      : delivery.message ||
                        'Delivery did not complete. Refresh and try again when available.'}
                </Typography>
              </Stack>
            )}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
              alignItems="center"
              sx={{ pt: 1 }}
            >
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon="mdi:refresh" width={18} />}
                disabled={busy || credentials.isFetching}
                onClick={refresh}
              >
                Refresh
              </Button>
              <LoadingButton
                size="small"
                type="submit"
                color="inherit"
                variant="contained"
                startIcon={<Iconify icon="mdi:email-send-outline" width={18} />}
                loading={busy}
                disabled={!canSend || busy}
              >
                Send Credentials
              </LoadingButton>
            </Stack>
          </Stack>
        </Box>
        {busy && (
          <Stack
            role="status"
            aria-label="Requesting credentials"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', opacity: 0.9 }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2">Requesting credentials…</Typography>
          </Stack>
        )}
      </Box>
      {profileCorrection && student.studentId && (
        <GuardianProfileEmailDialog
          studentId={student.studentId}
          relationship={profileCorrection}
          caseLabel={`${student.studentName} · ${student.applicationNumber}`}
          onClose={() => setProfileCorrection(null)}
          onSaved={(change) => {
            setProfileChange({ ...change, relationship: profileCorrection });
            credentials.refetch();
          }}
        />
      )}
    </Stack>
  );
}
