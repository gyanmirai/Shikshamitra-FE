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
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Box,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  useLinkStudentOnboardingParentMutation,
  useGetStudentOnboardingCredentialsQuery,
  useSendStudentOnboardingCredentialsMutation,
  useRetryStudentOnboardingParentSetupMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import GuardianProfileEmailDialog from './guardian-profile-email-dialog';
import { getStudentParentSiblingActivationState } from './student-parent-sibling-state';
import StudentCredentialProfileEmailDialog from './student-credential-profile-email-dialog';

import type { StudentOnboardingItem } from './student-onboarding-model';
import type { StudentParentSiblingActivationState } from './student-parent-sibling-state';

type CredentialsValues = {
  caseId: string;
  siblingParentRelationship: string;
  accountType: StudentCredentialsRecipient['accountType'];
  relationship: string;
  email: string;
};

type Props = {
  student: StudentOnboardingItem;
  canManage: boolean;
  onBusyChange?: (busy: boolean) => void;
  onParentStateChange?: (state: StudentParentSiblingActivationState) => void;
  parentValidationAttempt?: number;
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
  siblingParentRelationship: Yup.string().oneOf(['', 'father', 'mother']),
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
  onParentStateChange,
  parentValidationAttempt = 0,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const credentials = useGetStudentOnboardingCredentialsQuery(student.id);
  const [sendCredentials, mutation] = useSendStudentOnboardingCredentialsMutation();
  const [retryParentSetup, retryMutation] = useRetryStudentOnboardingParentSetupMutation();
  const [linkParent, linkMutation] = useLinkStudentOnboardingParentMutation();
  const linkingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const retryRef = useRef(false);
  const submittingRef = useRef(false);
  const initializedCase = useRef<string | null>(null);
  const [profileCorrection, setProfileCorrection] = useState<
    'father' | 'mother' | 'guardian' | null
  >(null);
  const [emailEditor, setEmailEditor] = useState<StudentCredentialsRecipient | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [profileChange, setProfileChange] = useState<{
    id: string;
    status: string;
    relationship: string;
  } | null>(null);
  const currentWorkspace = credentials.currentData ?? credentials.data;
  const workspace = currentWorkspace?.caseId === student.id ? currentWorkspace : undefined;
  const sibling = workspace?.parentSibling;
  const parentOnly = Boolean(sibling?.enabled);
  const recipients = useMemo(
    () =>
      (workspace?.recipients ?? []).filter(
        (recipient) => !parentOnly || recipient.relationship !== 'guardian'
      ),
    [workspace, parentOnly]
  );
  const parentCandidates = useMemo(
    () =>
      sibling?.candidates.filter((candidate) =>
        ['father', 'mother'].includes(candidate.relationship)
      ) ?? [],
    [sibling]
  );
  const formik = useFormik<CredentialsValues>({
    initialValues: {
      caseId: student.id,
      siblingParentRelationship: '',
      accountType: 'student',
      relationship: 'self',
      email: '',
    },
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
        shikshaMitraToast.error({
          message:
            parseApiProblemDetail(error).detail ||
            'Credentials could not be requested. Refresh the saved details, then try again.',
        });
      } finally {
        submittingRef.current = false;
      }
    },
  });
  const parentRelationship =
    formik.values.caseId === student.id ? formik.values.siblingParentRelationship : '';
  const parentState = useMemo(
    () =>
      getStudentParentSiblingActivationState(
        student.id,
        workspace,
        credentials.isFetching || credentials.isError,
        parentRelationship
      ),
    [student.id, workspace, credentials.isFetching, credentials.isError, parentRelationship]
  );
  useEffect(() => {
    onParentStateChange?.(parentState);
  }, [onParentStateChange, parentState]);
  const legalGuardianRecipients = recipients.filter(
    (recipient) => recipient.accountType === 'guardian'
  );
  const guardianRecipients = legalGuardianRecipients;
  const selectedRecipient = recipients.find(
    (recipient) =>
      recipient.accountType === formik.values.accountType &&
      recipient.relationship === formik.values.relationship
  );
  const savedEmail = selectedRecipient?.email?.trim() ?? '';
  const validEmail = emailSchema.isValidSync(savedEmail);
  const busy =
    mutation.isLoading ||
    formik.isSubmitting ||
    retryMutation.isLoading ||
    linkMutation.isLoading ||
    editingEmail;
  const usesExistingParent =
    parentOnly &&
    formik.values.accountType === 'guardian' &&
    Boolean(sibling?.isLinked || parentCandidates.length);
  const canLinkExistingParent =
    usesExistingParent &&
    Boolean(student.studentEnrollmentId) &&
    student.backendStatus !== 5 &&
    canManage &&
    sibling?.canLink &&
    sibling.familyConfirmed &&
    !sibling.isLinked &&
    ['Available', 'SelectParent'].includes(sibling.status) &&
    parentCandidates.length > 0;
  const canSend =
    canManage &&
    !usesExistingParent &&
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
      recipients.find((recipient) => recipient.canSend && recipient.email?.trim()) ??
      recipients.find((recipient) => recipient.email?.trim()) ??
      recipients[0];
    const accountType =
      parentOnly && parentCandidates.length ? 'guardian' : (first?.accountType ?? 'student');
    const owners = recipients.filter(
      (recipient) => recipient.accountType === accountType && recipient.email?.trim()
    );
    const candidates = owners.length
      ? owners
      : recipients.filter((recipient) => recipient.accountType === accountType);
    setValues(
      {
        caseId: student.id,
        siblingParentRelationship: sibling?.selectedRelationship || '',
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
    setEmailEditor(null);
  }, [
    workspace,
    student.id,
    setValues,
    setStatus,
    parentOnly,
    recipients,
    parentCandidates.length,
    sibling?.selectedRelationship,
  ]);

  useEffect(() => {
    if (formik.values.email !== savedEmail) {
      setFieldValue('email', savedEmail, false);
      setStatus(undefined);
    }
  }, [savedEmail, formik.values.email, setFieldValue, setStatus]);

  // Saved contact display is independent of permission to link or activate that parent.
  const displayedParentRole =
    sibling?.linkedRelationship || sibling?.selectedRelationship || parentRelationship;
  const displayedParentCandidate = displayedParentRole
    ? parentCandidates.find((candidate) => candidate.relationship === displayedParentRole)
    : parentCandidates.length === 1
      ? parentCandidates[0]
      : undefined;
  const soleGuardianRelationship =
    parentOnly && parentCandidates.length
      ? displayedParentCandidate?.relationship || ''
      : guardianRecipients.length === 1
        ? guardianRecipients[0].relationship
        : '';
  const siblingOwnsRelationship = parentOnly && parentCandidates.length > 0;
  useEffect(() => {
    if (
      !busy &&
      formik.values.accountType === 'guardian' &&
      (soleGuardianRelationship || siblingOwnsRelationship) &&
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
    siblingOwnsRelationship,
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
      <StudentFeedback
        notificationKey="STU-1013"
        presentation="toast"
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
      </StudentFeedback>
    );
  }
  if (!recipients.length) {
    return (
      <StudentFeedback
        notificationKey="STU-1014"
        presentation="persistent"
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
      </StudentFeedback>
    );
  }

  const delivery = selectedRecipient?.delivery;
  const emailError =
    selectedRecipient && !validEmail
      ? selectedRecipient.canEditEmail
        ? savedEmail
          ? 'Update the invalid email before sending credentials.'
          : 'Add an email to send credentials.'
        : savedEmail
          ? 'The saved email is invalid. Correct it in Student Records, then refresh.'
          : `No email is saved for this ${formik.values.accountType === 'student' ? 'student' : parentOnly ? 'parent' : 'parent/guardian'}. Add it in Student Records, then refresh.`
      : formik.touched.email
        ? formik.errors.email
        : undefined;
  const blockedReason = usesExistingParent
    ? sibling?.blockedReason
    : !canManage
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
  const formError = typeof formik.status === 'string' ? formik.status : undefined;
  const parentChoiceError =
    parentOnly &&
    parentCandidates.length > 1 &&
    !sibling?.isLinked &&
    !sibling?.selectedRelationship &&
    sibling?.canLink &&
    !parentRelationship &&
    (parentValidationAttempt > 0 || formik.touched.siblingParentRelationship)
      ? `Choose Father or Mother before ${student.studentEnrollmentId ? 'linking' : 'activating'}.`
      : undefined;
  const selectedSetupStatus =
    sibling?.status === 'SetupFailed'
      ? 'Failed'
      : sibling?.status === 'SetupPending'
        ? 'Pending'
        : displayedParentCandidate?.setupStatus;

  return (
    <Stack spacing={1}>
      {credentials.isError && (
        <StudentFeedback notificationKey="STU-1013" presentation="toast" severity="error">
          Credentials could not be refreshed. Refresh again before sending.
        </StudentFeedback>
      )}
      {credentials.isFetching && <LinearProgress aria-label="Refreshing credentials" />}
      <Box
        component="form"
        ref={formRef}
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
                { value: 'guardian', label: parentOnly ? 'Parent' : 'Parent / Guardian' },
              ]}
              onChange={(value) => {
                const accountType = value === 'guardian' ? 'guardian' : 'student';
                setValues(
                  {
                    caseId: student.id,
                    siblingParentRelationship: parentRelationship,
                    accountType,
                    relationship:
                      accountType === 'student'
                        ? 'self'
                        : guardianRecipients.filter((recipient) => recipient.email?.trim())
                              .length === 1
                          ? guardianRecipients.find((recipient) => recipient.email?.trim())!
                              .relationship
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
            {parentOnly && parentCandidates.length > 1 && !sibling?.isLinked && (
              <ShakingTextField data-parent-sibling-selection error={Boolean(parentChoiceError)}>
                <CustomSelect
                  fullWidth
                  required
                  size="small"
                  label="Parent"
                  name="siblingParentRelationship"
                  value={sibling?.selectedRelationship || parentRelationship}
                  disabled={
                    busy ||
                    credentials.isFetching ||
                    !canManage ||
                    !sibling?.canLink ||
                    Boolean(sibling?.selectedRelationship)
                  }
                  options={parentCandidates.map((candidate) => ({
                    value: candidate.relationship,
                    label: `${relationshipLabels[candidate.relationship]}${candidate.name ? ` · ${candidate.name}` : ''} · ${candidate.email}`,
                  }))}
                  onChange={(value) =>
                    setFieldValue('siblingParentRelationship', String(value), false)
                  }
                  onBlur={() => formik.setFieldTouched('siblingParentRelationship', true)}
                  error={Boolean(parentChoiceError)}
                  helperText={
                    !sibling?.canLink
                      ? sibling?.blockedReason ||
                        'An authorized staff member must link this parent.'
                      : parentChoiceError
                  }
                />
              </ShakingTextField>
            )}
            {formik.values.accountType === 'guardian' &&
              guardianRecipients.length > 1 &&
              !(parentOnly && parentCandidates.length) && (
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
                    helperText={
                      formik.touched.relationship ? formik.errors.relationship : undefined
                    }
                    onBlur={() => formik.setFieldTouched('relationship', true)}
                    onChange={(value) => {
                      setFieldValue('relationship', value, false);
                      setStatus(undefined);
                    }}
                  />
                </ShakingTextField>
              )}
            <ShakingTextField error={Boolean(!usesExistingParent && emailError)}>
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
                error={Boolean(!usesExistingParent && emailError)}
                helperText={
                  (!usesExistingParent &&
                    (emailError ||
                      (!selectedRecipient &&
                      (formik.values.accountType === 'student' || !guardianRecipients.length)
                        ? 'No saved email is available for this account type. Complete the contact details in Student Records, then refresh.'
                        : undefined))) ||
                  undefined
                }
              />
            </ShakingTextField>
            {usesExistingParent && (
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Label color={sibling?.isLinked ? 'success' : 'info'}>
                    {sibling?.isLinked ? 'Linked' : 'Existing parent account'}
                  </Label>
                </Stack>
                {selectedSetupStatus && selectedSetupStatus !== 'Ready' && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedSetupStatus === 'Failed'
                      ? sibling?.canRetrySetup && canManage
                        ? 'Original parent account setup failed.'
                        : 'Original parent setup failed. Ask authorized staff to review it.'
                      : 'Original parent account setup is pending.'}
                  </Typography>
                )}
              </Stack>
            )}
            {selectedRecipient?.canEditEmail && canManage && (
              <Button
                type="button"
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:pencil-outline" width={18} />}
                disabled={busy || credentials.isFetching || credentials.isError}
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => setEmailEditor(selectedRecipient)}
              >
                {savedEmail ? 'Update email' : 'Add email'}
              </Button>
            )}
            {selectedRecipient?.pendingEmail && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflowWrap: 'anywhere' }}
                role="status"
              >
                {selectedRecipient.emailChangeStatus === 'Expired'
                  ? 'Verification expired'
                  : selectedRecipient.emailChangeStatus === 'Stale'
                    ? 'New verification needed'
                    : selectedRecipient.emailChangeStatus === 'Pending'
                      ? 'Verification queued'
                      : 'Awaiting verification'}
                : {selectedRecipient.pendingEmail}
              </Typography>
            )}
            {correctionAvailable && !selectedRecipient?.canEditEmail && (
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
                <StudentFeedback
                  notificationKey="STU-1015"
                  presentation="persistent"
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
                </StudentFeedback>
              )}
            {formError ? (
              <StudentFeedback
                notificationKey="STU-1016"
                presentation="persistent"
                severity="error"
              >
                {formError}
              </StudentFeedback>
            ) : blockedReason &&
              !(
                parentOnly &&
                parentCandidates.length > 1 &&
                !sibling?.isLinked &&
                !sibling?.canLink
              ) ? (
              <StudentFeedback
                notificationKey="STU-1017"
                presentation="persistent"
                severity="warning"
              >
                {blockedReason}
              </StudentFeedback>
            ) : null}
            {!usesExistingParent &&
              !formError &&
              delivery &&
              !['NotRequested', 'Blocked'].includes(delivery.status) && (
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
              {usesExistingParent ? (
                canLinkExistingParent ? (
                  <LoadingButton
                    size="small"
                    type="button"
                    color="inherit"
                    variant="contained"
                    loading={linkMutation.isLoading}
                    disabled={
                      busy || credentials.isFetching || credentials.isError || !parentState.loaded
                    }
                    startIcon={<Iconify icon="mdi:account-link-outline" width={18} />}
                    onClick={async () => {
                      if (linkingRef.current || busy || !workspace || !parentState.loaded) return;
                      if (!parentState.selection || parentState.blockedReason) {
                        await formik.setFieldTouched('siblingParentRelationship', true, false);
                        formRef.current
                          ?.querySelector<HTMLElement>(
                            '[data-parent-sibling-selection] [role="combobox"], [data-parent-sibling-selection] select'
                          )
                          ?.focus();
                        return;
                      }
                      linkingRef.current = true;
                      try {
                        const result = await linkParent({
                          id: student.id,
                          concurrencyStamp: workspace.concurrencyStamp,
                          siblingParentSelection: parentState.selection,
                        }).unwrap();
                        if (result.parentSibling?.isLinked)
                          shikshaMitraToast.success({ message: 'Parent linked.' });
                        else
                          shikshaMitraToast.warning({
                            message: 'Parent linking needs review. Refresh and retry.',
                          });
                      } catch (error) {
                        shikshaMitraToast.error({
                          message:
                            parseApiProblemDetail(error).detail ||
                            'Parent could not be linked. Refresh and retry.',
                        });
                      } finally {
                        linkingRef.current = false;
                      }
                    }}
                  >
                    Link parent
                  </LoadingButton>
                ) : (
                  sibling?.canRetrySetup &&
                  canManage && (
                    <LoadingButton
                      size="small"
                      type="button"
                      color="inherit"
                      variant="outlined"
                      loading={retryMutation.isLoading}
                      disabled={busy || credentials.isFetching}
                      startIcon={<Iconify icon="mdi:refresh" width={18} />}
                      onClick={async () => {
                        if (retryRef.current || busy || !workspace) return;
                        retryRef.current = true;
                        try {
                          await retryParentSetup({
                            id: student.id,
                            concurrencyStamp: workspace.concurrencyStamp,
                          }).unwrap();
                          shikshaMitraToast.success({
                            message: 'Original parent setup requested.',
                          });
                        } catch (error) {
                          shikshaMitraToast.error({
                            message:
                              parseApiProblemDetail(error).detail ||
                              'Parent setup could not be retried.',
                          });
                        } finally {
                          retryRef.current = false;
                        }
                      }}
                    >
                      Retry parent setup
                    </LoadingButton>
                  )
                )
              ) : (
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
              )}
            </Stack>
          </Stack>
        </Box>
        {busy && (
          <Stack
            role="status"
            aria-label={editingEmail ? 'Saving email' : 'Requesting credentials'}
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', opacity: 0.9 }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2">
              {editingEmail ? 'Saving email…' : 'Requesting credentials…'}
            </Typography>
          </Stack>
        )}
      </Box>
      {emailEditor && workspace && (
        <StudentCredentialProfileEmailDialog
          key={`${student.id}:${emailEditor.accountType}:${emailEditor.relationship}`}
          caseId={student.id}
          caseLabel={student.studentName}
          concurrencyStamp={workspace.concurrencyStamp}
          recipient={emailEditor}
          onBusyChange={setEditingEmail}
          onClose={() => setEmailEditor(null)}
        />
      )}
      {profileCorrection && student.studentId && (
        <GuardianProfileEmailDialog
          studentId={student.studentId}
          relationship={profileCorrection}
          caseLabel={`${student.studentName} · ${student.applicationNumber}`}
          parentOnly={parentOnly}
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
