'use client';

import type { RootState } from 'src/redux/store';
import type {
  StudentCredentialsRecipient,
  StudentCredentialsWorkspace,
} from 'src/redux/student/onboarding/student-onboarding-types';

import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { studentPaths } from 'src/constants/student-menu';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  Box,
  Stack,
  Button,
  Skeleton,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';
import {
  useLinkStudentOnboardingParentMutation,
  useGetStudentOnboardingCredentialsQuery,
  useSendStudentOnboardingCredentialsMutation,
  useRetryStudentOnboardingParentSetupMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import StudentAppAccessDialog from './student-app-access-dialog';
import GuardianProfileEmailDialog from './guardian-profile-email-dialog';
import { getStudentParentSiblingActivationState } from './student-parent-sibling-state';
import StudentCredentialProfileEmailDialog from './student-credential-profile-email-dialog';
import { getOnboardingMessage, getOnboardingErrorMessage } from './student-onboarding-messages';

import type { StudentOnboardingItem } from './student-onboarding-model';
import type { StudentParentSiblingActivationState } from './student-parent-sibling-state';

type Props = {
  student: StudentOnboardingItem;
  canManage: boolean;
  onBusyChange?: (busy: boolean) => void;
  onParentStateChange?: (state: StudentParentSiblingActivationState) => void;
  parentValidationAttempt?: number;
  compact?: boolean;
};
type AccountType = StudentCredentialsRecipient['accountType'];
const relationshipLabels = {
  self: 'Student',
  father: 'Father',
  mother: 'Mother',
  guardian: 'Guardian',
};
const relationshipLabel = (recipient: StudentCredentialsRecipient) =>
  recipient.relationship === 'guardian' && recipient.relationshipLabel?.trim()
    ? `Guardian (${recipient.relationshipLabel.trim()})`
    : relationshipLabels[recipient.relationship];
const emailSchema = Yup.string().trim().email().max(256).required();
const queued = (recipient?: StudentCredentialsRecipient) =>
  ['Pending', 'Processing'].includes(recipient?.delivery?.status ?? '');
const recipientKey = (recipient: StudentCredentialsRecipient) =>
  `${recipient.accountType}:${recipient.relationship}`;
// The stamp changes after each command. Identity changes, unlike stamps, invalidate reviewed access.
const ownerIdentity = (
  workspace: StudentCredentialsWorkspace | undefined,
  relationship: string
) => {
  const recipient = workspace?.recipients.find(
    (item) => item.accountType === 'guardian' && item.relationship === relationship
  );
  const candidate = workspace?.parentSibling?.candidates.find(
    (item) => item.relationship === relationship
  );
  return JSON.stringify([
    workspace?.caseId,
    relationship,
    recipient?.email,
    recipient?.pendingEmail,
    candidate?.userId,
    candidate?.email,
    workspace?.parentSibling?.linkedRelationship,
    workspace?.parentSibling?.selectedRelationship,
    workspace?.guardianAccessEnabled,
  ]);
};

export default function StudentOnboardingPortalAccounts({
  student,
  canManage,
  onBusyChange,
  onParentStateChange,
  parentValidationAttempt = 0,
  compact = false,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const credentials = useGetStudentOnboardingCredentialsQuery(student.id);
  const [sendCredentials, mutation] = useSendStudentOnboardingCredentialsMutation();
  const [retryParentSetup, retryMutation] = useRetryStudentOnboardingParentSetupMutation();
  const [linkParent, linkMutation] = useLinkStudentOnboardingParentMutation();
  const source = credentials.currentData ?? credentials.data;
  const queryWorkspace = source?.caseId === student.id ? source : undefined;
  // Retain the returned workspace immediately; a newer query response takes precedence.
  const [command, setCommand] = useState<{
    source: typeof source;
    value: StudentCredentialsWorkspace;
  } | null>(null);
  const workspace =
    command && command.source === source && command.value.caseId === student.id
      ? command.value
      : queryWorkspace;
  const sibling = workspace?.parentSibling;
  const recipients = workspace?.recipients ?? [];
  const adults = recipients.filter((recipient) => recipient.accountType === 'guardian');
  const legacyChoiceRequired = Boolean(
    sibling?.enabled &&
    sibling.familyConfirmed &&
    !sibling.isLinked &&
    !sibling.selectedRelationship &&
    sibling.candidates.length > 1
  );
  const suggestedAdult =
    sibling?.linkedRelationship ||
    sibling?.selectedRelationship ||
    adults.find((recipient) => recipient.hasLinkedAccount)?.relationship ||
    (sibling?.guardianAccessSelected ? 'guardian' : '') ||
    (legacyChoiceRequired
      ? ''
      : adults.find((recipient) => recipient.relationship !== 'guardian' && recipient.isMainContact)
          ?.relationship ||
        adults.find((recipient) => recipient.relationship !== 'guardian')?.relationship ||
        adults[0]?.relationship ||
        '');
  const [choice, setChoice] = useState({ caseId: student.id, relationship: '' });
  const relationship =
    choice.caseId === student.id &&
    adults.some((adult) => adult.relationship === choice.relationship)
      ? choice.relationship
      : suggestedAdult;
  const adult = adults.find((recipient) => recipient.relationship === relationship);
  const studentRecipient = recipients.find((recipient) => recipient.accountType === 'student');
  const [selected, setSelected] = useState<{ caseId: string; student: boolean; guardian: boolean }>(
    { caseId: student.id, student: false, guardian: false }
  );
  const [confirmation, setConfirmation] = useState('');
  const adultIdentity = ownerIdentity(workspace, relationship);
  const confirmed = confirmation === adultIdentity;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mustRefresh, setMustRefresh] = useState(false);
  const [working, setWorking] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const latest = useRef({
    caseId: student.id,
    source,
    workspace,
    canManage,
    readError: credentials.isError,
  });
  const scope = useRef({ caseId: student.id, canManage, version: 0 });
  if (scope.current.caseId !== student.id || (scope.current.canManage && !canManage))
    scope.current.version += 1;
  scope.current.caseId = student.id;
  scope.current.canManage = canManage;
  latest.current = {
    caseId: student.id,
    source,
    workspace,
    canManage,
    readError: credentials.isError,
  };
  const [emailEditor, setEmailEditor] = useState<StudentCredentialsRecipient | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [accessEditorCase, setAccessEditorCase] = useState<string | null>(null);
  const [profileCorrection, setProfileCorrection] = useState<
    'father' | 'mother' | 'guardian' | null
  >(null);
  const [profileChange, setProfileChange] = useState<{
    id: string;
    status: string;
    relationship: string;
  } | null>(null);
  const busy =
    working ||
    mutation.isLoading ||
    retryMutation.isLoading ||
    linkMutation.isLoading ||
    Boolean(emailEditor) ||
    accessEditorCase === student.id ||
    Boolean(profileCorrection) ||
    emailBusy;
  const unavailable =
    credentials.isFetching || credentials.isError || mustRefresh || !workspace?.concurrencyStamp;
  const canEnableStudentAccess = Boolean(
    canManage &&
    workspace?.canEnableStudentAccess &&
    workspace.studentAccessEnabled === false &&
    !unavailable
  );
  useEffect(() => {
    if (!canEnableStudentAccess || accessEditorCase !== student.id) setAccessEditorCase(null);
  }, [canEnableStudentAccess, accessEditorCase, student.id]);
  const parentCandidate = sibling?.candidates.find(
    (candidate) => candidate.relationship === relationship
  );
  const existingParent = Boolean(
    sibling?.enabled &&
    (parentCandidate || sibling.isLinked) &&
    (!sibling.linkedRelationship || sibling.linkedRelationship === relationship)
  );
  const canLink = Boolean(
    existingParent &&
    !sibling?.isLinked &&
    sibling?.canLink &&
    ['Available', 'SelectParent'].includes(sibling.status) &&
    parentCandidate &&
    parentCandidate.email === adult?.email &&
    student.studentEnrollmentId &&
    student.backendStatus !== 5 &&
    workspace?.guardianAccessEnabled !== false &&
    canManage
  );
  const parentState = useMemo(
    () =>
      getStudentParentSiblingActivationState(
        student.id,
        workspace,
        credentials.isFetching || credentials.isError,
        relationship,
        adult?.relationship === 'guardian'
          ? { expectedEmail: adult.email?.trim() || '', confirmRecipientAccess: confirmed }
          : undefined
      ),
    [
      student.id,
      workspace,
      credentials.isFetching,
      credentials.isError,
      relationship,
      adult?.relationship,
      adult?.email,
      confirmed,
    ]
  );
  useEffect(() => {
    onParentStateChange?.(parentState);
  }, [onParentStateChange, parentState]);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      onBusyChange?.(false);
    };
  }, [onBusyChange]);
  const previousIdentity = useRef({
    adult: adultIdentity,
    student: studentRecipient?.email,
    caseId: student.id,
  });
  useEffect(() => {
    const previous = previousIdentity.current;
    const caseChanged = previous.caseId !== student.id;
    const adultChanged = previous.adult !== adultIdentity;
    const studentChanged = previous.student !== studentRecipient?.email;
    if (caseChanged || adultChanged || studentChanged) {
      setSelected((current) => ({
        caseId: student.id,
        student: caseChanged || studentChanged ? false : current.student,
        guardian: caseChanged || adultChanged ? false : current.guardian,
      }));
      if (adultChanged || caseChanged) setConfirmation('');
      setErrors((current) =>
        Object.fromEntries(
          Object.entries(current).filter(
            ([key]) =>
              !caseChanged &&
              !(studentChanged && key.startsWith('student:')) &&
              !(adultChanged && key.startsWith('guardian:'))
          )
        )
      );
      setEmailEditor(null);
      setProfileCorrection(null);
      if (caseChanged) setProfileChange(null);
    }
    previousIdentity.current = {
      adult: adultIdentity,
      student: studentRecipient?.email,
      caseId: student.id,
    };
  }, [adultIdentity, studentRecipient?.email, student.id]);
  const eligible = (recipient: StudentCredentialsRecipient | undefined, current = workspace) =>
    Boolean(
      recipient &&
      emailSchema.isValidSync(recipient.email?.trim() || '') &&
      !queued(recipient) &&
      (recipient.canSend || recipient.canSendExistingParentHelp) &&
      (!(
        recipient.accountType === 'guardian' &&
        current?.parentSibling?.enabled &&
        current.parentSibling.isLinked
      ) ||
        recipient.canSendExistingParentHelp === true) &&
      (recipient.accountType === 'student' || current?.guardianAccessEnabled !== false) &&
      // A returned existing-account candidate must be explicitly linked before any send.
      !(
        recipient.accountType === 'guardian' &&
        current?.parentSibling?.enabled &&
        current.parentSibling.candidates.some(
          (candidate) => candidate.relationship === recipient.relationship
        ) &&
        !current.parentSibling.isLinked
      )
    );
  const activeSelected =
    selected.caseId === student.id ? selected : { student: false, guardian: false };
  const chosen = [
    activeSelected.student ? studentRecipient : undefined,
    activeSelected.guardian ? adult : undefined,
  ].filter(Boolean) as StudentCredentialsRecipient[];
  const canSend =
    canManage &&
    !unavailable &&
    !busy &&
    chosen.length > 0 &&
    chosen.length === Number(activeSelected.student) + Number(activeSelected.guardian) &&
    chosen.every(
      (recipient) => eligible(recipient) && (recipient.accountType === 'student' || confirmed)
    );
  const needsActivation = compact && !student.studentEnrollmentId && chosen.length > 0;
  const currentRequest = (caseId: string) =>
    mounted.current && latest.current.caseId === caseId && latest.current.canManage;
  const accept = (result: StudentCredentialsWorkspace, baseSource: typeof source) => {
    if (!currentRequest(result.caseId)) return;
    setCommand({ source: baseSource, value: result });
  };
  const refetchCurrent = async (caseId: string) => {
    setMustRefresh(true);
    const result = await credentials.refetch();
    if (
      result.isError ||
      result.error ||
      !currentRequest(caseId) ||
      !result.data ||
      result.data.caseId !== caseId ||
      !result.data.concurrencyStamp
    )
      return undefined;
    accept(result.data, latest.current.source);
    setMustRefresh(false);
    return result.data;
  };
  const send = async (only?: StudentCredentialsRecipient) => {
    if (submitting.current || busy || unavailable || !canManage || !workspace) return;
    const targets = only ? [only] : chosen;
    if (
      !targets.length ||
      !targets.every(
        (recipient) => eligible(recipient) && (recipient.accountType === 'student' || confirmed)
      )
    )
      return;
    const caseId = student.id;
    const operationVersion = scope.current.version;
    const isCurrent = () => currentRequest(caseId) && scope.current.version === operationVersion;
    const reviewedAdult = ownerIdentity(workspace, relationship);
    let current = workspace;
    let observedSource = source;
    submitting.current = true;
    setWorking(true);
    try {
      // Each recipient is an independent write. The next request must await its returned stamp.
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const target of targets) {
        if (!isCurrent()) break;
        // A background response must never be overwritten by a captured batch snapshot.
        if (latest.current.source !== observedSource) {
          if (latest.current.readError) {
            setMustRefresh(true);
            break;
          }
          const refreshed = latest.current.workspace;
          if (!refreshed || refreshed.caseId !== caseId) break;
          current = refreshed;
          observedSource = latest.current.source;
        }
        const recipient = current.recipients.find(
          (item) => recipientKey(item) === recipientKey(target)
        );
        if (
          !recipient ||
          recipient.email !== target.email ||
          (recipient.accountType === 'guardian' &&
            ownerIdentity(current, relationship) !== reviewedAdult)
        ) {
          setConfirmation('');
          setSelected({ caseId, student: false, guardian: false });
          setErrors((previous) => ({
            ...previous,
            [recipientKey(target)]:
              'The saved recipient changed. Refresh App Login and review before sending.',
          }));
          break;
        }
        if (!eligible(recipient, current)) {
          setErrors((previous) => ({
            ...previous,
            [recipientKey(target)]: getOnboardingMessage(
              recipient.blockedReason,
              'Login details cannot be sent yet. Review the onboarding requirements.'
            ),
          }));
          break;
        }
        const key = recipientKey(recipient);
        setErrors((previous) => {
          const next = { ...previous };
          delete next[key];
          return next;
        });
        try {
          const result = await sendCredentials({
            id: caseId,
            accountType: recipient.accountType,
            relationship: recipient.relationship,
            expectedEmail: recipient.email!.trim(),
            concurrencyStamp: current.concurrencyStamp,
            confirmRecipientAccess: recipient.accountType === 'guardian',
            ...(recipient.canSendExistingParentHelp ? { sendExistingParentHelp: true } : {}),
          }).unwrap();
          if (!isCurrent()) break;
          if (result.caseId !== caseId || !result.concurrencyStamp) break;
          current = result;
          accept(result, observedSource);
          const updated = result.recipients.find((item) => recipientKey(item) === key);
          if (updated?.delivery?.status === 'Sent')
            shikshaMitraToast.success({ message: 'Login email submitted for sending.' });
          else if (queued(updated)) shikshaMitraToast.info({ message: 'Login email is queued.' });
          else
            setErrors((previous) => ({
              ...previous,
              [key]: getOnboardingMessage(
                updated?.delivery?.message || updated?.blockedReason,
                'Login details could not be requested. Refresh and try again.'
              ),
            }));
          // Successful recipients are removed from the next shared action, including partial failure.
          if (queued(updated) || updated?.delivery?.status === 'Sent')
            setSelected((previous) => ({ ...previous, [recipient.accountType]: false }));
        } catch (error) {
          if (!isCurrent()) break;
          const message = getOnboardingErrorMessage(
            error,
            'Login details could not be requested. Refresh and review status before retrying.'
          );
          setErrors((previous) => ({
            ...previous,
            [key]: 'Request failed. Review the current email status before retrying.',
          }));
          shikshaMitraToast.error({ message });
          // The server may have committed an uncertain write. Read before sending another person;
          // never replay this recipient automatically.
          try {
            const refreshed = await refetchCurrent(caseId);
            if (!refreshed) break;
            current = refreshed;
            observedSource = latest.current.source;
            const recovered = refreshed.recipients.find((item) => recipientKey(item) === key);
            if (queued(recovered) || recovered?.delivery?.status === 'Sent') {
              setErrors((previous) => {
                const next = { ...previous };
                delete next[key];
                return next;
              });
              setSelected((previous) => ({ ...previous, [recipient.accountType]: false }));
            }
          } catch {
            break;
          }
        }
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop */
    } finally {
      submitting.current = false;
      if (mounted.current) setWorking(false);
    }
  };
  const runParentCommand = async (retry = false) => {
    if (submitting.current || busy || unavailable || !workspace || !canManage) return;
    if (!retry && (!canLink || !confirmed || !parentCandidate)) return;
    if (retry && !sibling?.canRetrySetup) return;
    submitting.current = true;
    setWorking(true);
    const caseId = student.id;
    const operationVersion = scope.current.version;
    const isCurrent = () => currentRequest(caseId) && scope.current.version === operationVersion;
    try {
      const result = retry
        ? await retryParentSetup({
            id: caseId,
            concurrencyStamp: workspace.concurrencyStamp,
          }).unwrap()
        : await linkParent({
            id: caseId,
            concurrencyStamp: workspace.concurrencyStamp,
            siblingParentSelection: {
              relationship: parentCandidate!.relationship,
              expectedEmail: parentCandidate!.email,
              expectedUserId: parentCandidate!.userId,
            },
            confirmExistingParentAccess: true,
          }).unwrap();
      if (!isCurrent()) return;
      accept(result, source);
      setConfirmation('');
      if (retry) shikshaMitraToast.success({ message: 'Original parent setup requested.' });
      else if (result.parentSibling?.isLinked)
        shikshaMitraToast.success({ message: 'Parent linked.' });
      else
        shikshaMitraToast.warning({ message: 'Parent linking needs review. Refresh and retry.' });
    } catch (error) {
      if (isCurrent()) {
        setConfirmation('');
        shikshaMitraToast.error({
          message: getOnboardingErrorMessage(
            error,
            retry
              ? 'Parent setup could not be retried.'
              : 'Parent could not be linked. Refresh and retry.'
          ),
        });
        try {
          await refetchCurrent(caseId);
        } catch {
          /* A failed refresh keeps actions unavailable until staff refresh. */
        }
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setWorking(false);
    }
  };
  const refresh = () => {
    if (busy || credentials.isFetching) return;
    refetchCurrent(student.id).catch(() => {
      /* Keep actions locked until current status is available. */
    });
  };
  if (!workspace && !credentials.isError && (credentials.isLoading || credentials.isFetching))
    return (
      <Stack spacing={1} role="status" aria-label="Loading credentials">
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" width={160} height={30} />
      </Stack>
    );
  if (!workspace && credentials.isError)
    return (
      <StudentFeedback notificationKey="STU-1013" presentation="toast" severity="error">
        Credentials could not be loaded. Try again.
      </StudentFeedback>
    );
  if (!recipients.length)
    return (
      <StudentFeedback
        notificationKey="STU-1014"
        presentation="inline"
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

  const renderRecipient = (
    recipient: StudentCredentialsRecipient | undefined,
    accountType: AccountType
  ) => {
    const isAdult = accountType === 'guardian';
    const email = recipient?.email?.trim() || '';
    const validEmail = emailSchema.isValidSync(email);
    const key = recipient ? recipientKey(recipient) : accountType;
    const delivery = recipient?.delivery;
    const editable = canManage && recipient?.canEditEmail;
    const emailError = !validEmail
      ? editable
        ? email
          ? 'Enter a valid email, such as name@example.com.'
          : 'Add an email before sending login details.'
        : email
          ? 'The saved email is invalid. Correct it in Student Records, then refresh.'
          : `No email is saved for this ${isAdult ? relationshipLabels[recipient?.relationship || 'guardian'].toLowerCase() : 'student'}. Add their own email in Student Records, then refresh.`
      : undefined;
    const correctionAvailable =
      isAdult &&
      !validEmail &&
      !editable &&
      Boolean(recipient?.name?.trim()) &&
      canManage &&
      ![4, 5].includes(student.backendStatus ?? -1) &&
      Boolean(student.studentId) &&
      hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
      hasGrantedPermission(permissions, 'Students.Records.Changes.Add');
    const reason = !canManage
      ? 'Ask authorized staff to send login details.'
      : isAdult && sibling?.enabled && !sibling.canLink && sibling.blockedReason
        ? getOnboardingMessage(sibling.blockedReason, 'Ask authorized staff to link this parent.')
        : isAdult && existingParent && !sibling?.isLinked
          ? sibling?.blockedReason
          : recipient && !eligible(recipient) && !queued(recipient) && validEmail
            ? recipient.blockedReason ||
              'Login details cannot be sent yet. Review the onboarding requirements.'
            : undefined;
    const accepted = queued(recipient) || delivery?.status === 'Sent';
    const activationReason =
      needsActivation &&
      /must be actively enrolled|activate .*enrollment before|complete enrollment activation before/i.test(
        reason || ''
      );
    const error = accepted ? undefined : errors[key];
    const failed = !accepted && Boolean(error || delivery?.status === 'Failed');
    const retryAllowed =
      failed &&
      eligible(recipient) &&
      canManage &&
      !unavailable &&
      !busy &&
      (!isAdult || confirmed);
    const showEmailError = Boolean(emailError && activeSelected[accountType]);
    const accessOff =
      compact &&
      (isAdult
        ? workspace?.guardianAccessEnabled === false
        : workspace?.studentAccessEnabled === false);
    const showConsent =
      !compact ||
      activeSelected.guardian ||
      confirmed ||
      parentValidationAttempt ||
      (existingParent && !sibling?.isLinked);
    const emailActionLabel = `${email ? 'Update' : 'Add'} ${isAdult && recipient ? relationshipLabel(recipient) : 'Student'} email`;
    return (
      <Stack
        role="group"
        aria-label={isAdult ? 'Parent / guardian login' : 'Student login'}
        spacing={compact ? 0.75 : 1}
        sx={{ minWidth: 0 }}
      >
        <Box
          sx={
            compact
              ? {
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr) auto',
                    md: 'minmax(180px, 1fr) minmax(180px, 1fr) 108px 64px',
                  },
                  alignItems: 'center',
                  gap: 1,
                }
              : undefined
          }
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={compact ? 0 : 1}
            sx={compact ? { display: 'contents' } : undefined}
          >
            <FormControlLabel
              sx={{ m: 0, minWidth: 0, ...(compact && { gridColumn: 1, gridRow: 1 }) }}
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(activeSelected[accountType])}
                  disabled={busy || !canManage || !recipient}
                  slotProps={{
                    input: {
                      'aria-label': isAdult ? 'Send to parent / guardian' : 'Send to student',
                    },
                  }}
                  onChange={(_, checked) =>
                    setSelected((previous) => ({
                      ...previous,
                      caseId: student.id,
                      [accountType]: checked,
                    }))
                  }
                />
              }
              label={
                <Box component="span" sx={{ minWidth: 0 }}>
                  <Typography
                    component="span"
                    display={compact && isAdult ? 'inline' : 'block'}
                    variant="body2"
                    fontWeight={600}
                  >
                    {isAdult
                      ? compact && recipient?.relationship !== 'guardian'
                        ? 'Parent'
                        : 'Parent / guardian'
                      : 'Student'}
                    {!compact && !isAdult && recipient?.name ? ` · ${recipient.name}` : ''}
                  </Typography>
                  {compact && isAdult && recipient?.name && (
                    <Typography
                      component="span"
                      display="inline"
                      variant="caption"
                      color="text.secondary"
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {` · ${recipient.name} (${relationshipLabel(recipient)})`}
                    </Typography>
                  )}
                </Box>
              }
            />
            <CustomTooltip
              title={
                reason
                  ? getOnboardingMessage(reason, 'Review the login requirements before sending.')
                  : delivery?.status === 'Sent' && delivery.sentAt
                    ? `Submitted for sending · ${fDateTime(delivery.sentAt)}`
                    : 'Saved app login email'
              }
            >
              <Label
                role="status"
                sx={
                  compact
                    ? { gridColumn: { xs: 2, md: 3 }, gridRow: 1, justifySelf: 'start' }
                    : undefined
                }
                color={
                  accessOff
                    ? 'default'
                    : !validEmail
                      ? 'warning'
                      : queued(recipient)
                        ? 'info'
                        : failed
                          ? 'error'
                          : 'success'
                }
              >
                {accessOff
                  ? 'Off'
                  : !validEmail
                    ? 'Email needed'
                    : queued(recipient)
                      ? 'Queued'
                      : delivery?.status === 'Sent'
                        ? 'Submitted'
                        : failed
                          ? 'Failed'
                          : 'Email saved'}
              </Label>
            </CustomTooltip>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={compact ? 0 : 1}
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            sx={compact ? { display: 'contents' } : { pl: { xs: 0, sm: 3.5 }, minWidth: 0 }}
          >
            {isAdult && adults.length > 1 && (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  ...(compact && {
                    gridColumn: { xs: '1 / -1', md: 1 },
                    gridRow: { xs: 3, md: 2 },
                  }),
                }}
                data-parent-sibling-selection
              >
                <ShakingTextField
                  error={Boolean(
                    parentValidationAttempt && parentState.blockedReason && !relationship
                  )}
                >
                  <CustomSelect
                    size="small"
                    fullWidth
                    label="Person"
                    name="relationship"
                    value={relationship}
                    disabled={
                      busy ||
                      Boolean(sibling?.linkedRelationship || sibling?.selectedRelationship) ||
                      adults.some((item) => item.hasLinkedAccount) ||
                      Boolean(
                        sibling?.enabled &&
                        sibling.candidates.length &&
                        !sibling.canLink &&
                        !sibling.isLinked
                      )
                    }
                    options={adults.map((item) => ({
                      value: item.relationship,
                      label: `${relationshipLabel(item)}${item.name?.trim() ? ` — ${item.name}` : ''}${item.email?.trim() ? ` · ${item.email}` : ''}`,
                    }))}
                    onChange={(value) => {
                      setChoice({ caseId: student.id, relationship: String(value) });
                      setConfirmation('');
                      setSelected((previous) => ({ ...previous, guardian: false }));
                      setErrors((previous) =>
                        Object.fromEntries(
                          Object.entries(previous).filter(
                            ([errorKey]) => !errorKey.startsWith('guardian:')
                          )
                        )
                      );
                    }}
                    helperText={
                      parentValidationAttempt &&
                      parentState.blockedReason &&
                      !relationship &&
                      sibling?.canLink
                        ? 'Choose Father or Mother before activating.'
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Box>
            )}
            <Box
              sx={{
                flex: isAdult && adults.length > 1 ? 1.5 : 1,
                minWidth: 0,
                ...(compact && { gridColumn: { xs: 1, md: 2 }, gridRow: { xs: 2, md: 1 } }),
              }}
            >
              {compact ? (
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {email || 'No email added'}
                  </Typography>
                  {emailError && (activeSelected[accountType] || !editable) && (
                    <FormHelperText error={showEmailError} sx={{ m: 0 }}>
                      {emailError}
                    </FormHelperText>
                  )}
                </Stack>
              ) : (
                <ShakingTextField error={showEmailError}>
                  <TextField
                    fullWidth
                    size="small"
                    label={isAdult ? 'Parent / guardian email' : 'Student email'}
                    value={email}
                    disabled={busy}
                    slotProps={{ input: { readOnly: true } }}
                    error={showEmailError}
                    helperText={emailError}
                  />
                </ShakingTextField>
              )}
            </Box>
            {editable &&
              (compact ? (
                <Box
                  sx={{
                    gridColumn: { xs: 2, md: 4 },
                    gridRow: { xs: 2, md: 1 },
                    justifySelf: { xs: 'end', md: 'start' },
                  }}
                >
                  <CustomTooltip title={emailActionLabel} placement="right">
                    <span>
                      <IconButton
                        type="button"
                        size="small"
                        aria-label={emailActionLabel}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                        disabled={busy || unavailable}
                        onClick={() => {
                          setConfirmation('');
                          setEmailEditor(recipient!);
                        }}
                      >
                        <Iconify icon={email ? 'mdi:pencil-outline' : 'mdi:plus'} width={18} />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                </Box>
              ) : (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="mdi:pencil-outline" width={18} />}
                  disabled={busy || unavailable}
                  sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'flex-start' } }}
                  onClick={() => {
                    setConfirmation('');
                    setEmailEditor(recipient!);
                  }}
                >
                  {email ? 'Update email' : 'Add email'}
                </Button>
              ))}
          </Stack>
        </Box>
        {isAdult && adults.length === 1 && !compact && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ pl: { sm: 3.5 }, overflowWrap: 'anywhere' }}
          >
            {recipient?.name?.trim() || 'Name not recorded'} ·{' '}
            {recipient ? relationshipLabel(recipient) : 'Guardian'}
          </Typography>
        )}
        {recipient?.pendingEmail && (
          <Typography
            variant="caption"
            role="status"
            sx={{ pl: { sm: 3.5 }, overflowWrap: 'anywhere' }}
            color="text.secondary"
          >
            {!compact && <>Current login: {email || 'No email saved'} · </>}
            {recipient.emailChangeStatus === 'Expired'
              ? 'Verification expired'
              : recipient.emailChangeStatus === 'Stale'
                ? 'New verification needed'
                : recipient.emailChangeStatus === 'Pending'
                  ? 'Verification queued'
                  : 'Awaiting verification'}
            : {recipient.pendingEmail}
          </Typography>
        )}
        {isAdult && recipient && showConsent && (
          <Box sx={{ pl: { sm: 3.5 } }}>
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={confirmed}
                  disabled={busy || !canManage}
                  onChange={(_, checked) => setConfirmation(checked ? adultIdentity : '')}
                />
              }
              label={`I confirm ${recipient.name?.trim() || 'this person'} may access ${student.studentName} in the app.`}
            />
            {existingParent && (
              <Typography variant="caption" color="text.secondary" display="block">
                {sibling?.isLinked
                  ? 'Linked existing parent. Sign-in help uses the existing login; no new password is created.'
                  : 'Confirm access to link the existing parent login. Their password stays unchanged.'}
              </Typography>
            )}
            {existingParent && !sibling?.isLinked && !student.studentEnrollmentId && (
              <Typography variant="caption" color="text.secondary" display="block">
                {sibling?.requiresOnboardingConfirmation
                  ? 'Activate the student, then confirm and link this parent here.'
                  : 'Save & Activate will link this student to the reviewed parent login.'}
              </Typography>
            )}
            {(sibling?.status === 'SetupFailed' || parentCandidate?.setupStatus === 'Failed') && (
              <Typography variant="body2" color="text.secondary">
                {sibling?.canRetrySetup && canManage
                  ? 'Original parent account setup failed.'
                  : 'Original parent setup failed. Ask authorized staff to review it.'}
              </Typography>
            )}
            {(sibling?.status === 'SetupPending' || parentCandidate?.setupStatus === 'Pending') && (
              <Typography variant="body2" color="text.secondary">
                Original parent account setup is pending.
              </Typography>
            )}
            {canLink && (
              <LoadingButton
                type="button"
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:account-link-outline" width={18} />}
                loading={working && linkMutation.isLoading}
                disabled={busy || unavailable || !confirmed}
                onClick={() => runParentCommand()}
              >
                Confirm &amp; link parent
              </LoadingButton>
            )}
            {existingParent && sibling?.canRetrySetup && canManage && (
              <LoadingButton
                type="button"
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:refresh" width={18} />}
                disabled={busy || unavailable}
                onClick={() => runParentCommand(true)}
              >
                Retry parent setup
              </LoadingButton>
            )}
          </Box>
        )}
        {(error || (reason && !activationReason && (!compact || activeSelected[accountType]))) && (
          <Typography
            variant="body2"
            color={error ? 'error.main' : 'text.secondary'}
            sx={{ pl: { sm: 3.5 }, overflowWrap: 'anywhere' }}
          >
            {error || getOnboardingMessage(reason, 'Review the login requirements before sending.')}
          </Typography>
        )}
        {delivery &&
          !error &&
          !['NotRequested', 'Blocked'].includes(delivery.status) &&
          !(compact && delivery.status === 'Sent') && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ pl: { sm: 3.5 }, overflowWrap: 'anywhere' }}
            >
              {queued(recipient)
                ? getOnboardingMessage(
                    delivery.message,
                    'Login email is queued. Refresh to check progress.'
                  )
                : delivery.status === 'Sent'
                  ? `Submitted for sending${delivery.sentAt ? ` · ${fDateTime(delivery.sentAt)}` : ''}.`
                  : getOnboardingMessage(
                      delivery.message,
                      'Login email could not be sent. Refresh and try again.'
                    )}
            </Typography>
          )}
        {failed && (
          <Button
            size="small"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
            startIcon={<Iconify icon="mdi:refresh" width={18} />}
            disabled={!retryAllowed}
            onClick={() => send(recipient)}
          >
            {isAdult ? 'Retry parent email' : 'Retry student email'}
          </Button>
        )}
        {correctionAvailable && (
          <Button
            size="small"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
            startIcon={<Iconify icon="mdi:pencil-outline" width={18} />}
            disabled={busy || unavailable}
            onClick={() =>
              setProfileCorrection(recipient!.relationship as 'father' | 'mother' | 'guardian')
            }
          >
            Correct Saved Email
          </Button>
        )}
        {isAdult &&
          profileChange &&
          profileChange.relationship === relationship &&
          profileChange.status !== 'Applied' && (
            <StudentFeedback
              notificationKey="STU-1015"
              presentation="inline"
              severity="warning"
              action={
                <Button
                  component={RouterLink}
                  href={`${studentPaths.records.changes}?request=${encodeURIComponent(profileChange.id)}`}
                  size="small"
                  disabled={busy}
                  startIcon={<Iconify icon="mdi:open-in-new" width={18} />}
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
      </Stack>
    );
  };
  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      {credentials.isError && (
        <StudentFeedback notificationKey="STU-1013" presentation="toast" severity="error">
          Credentials could not be refreshed. Refresh again before sending.
        </StudentFeedback>
      )}
      {credentials.isFetching && <LinearProgress aria-label="Refreshing credentials" />}
      <Box
        component="form"
        aria-label="Send credentials"
        aria-busy={busy}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (canSend) send();
        }}
      >
        <FormBusyRegion
          busy={working || emailBusy}
          label={emailBusy ? 'Saving email…' : 'Requesting credentials…'}
        >
          <Box
            component="fieldset"
            disabled={busy}
            inert={busy}
            sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
          >
            <Stack spacing={1.5}>
              {!compact && (
                <Typography variant="body2" color="text.secondary">
                  Choose who should receive their own login details.
                </Typography>
              )}
              {compact && (
                <Box
                  aria-hidden
                  sx={{
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: 'minmax(180px, 1fr) minmax(180px, 1fr) 108px 64px',
                    gap: 1,
                    pb: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    color: 'text.secondary',
                  }}
                >
                  {['Recipient', 'Email', 'Status', 'Actions'].map((label) => (
                    <Typography
                      key={label}
                      variant="caption"
                      fontWeight={600}
                      sx={{ pl: label === 'Recipient' ? 3.5 : 0 }}
                    >
                      {label}
                    </Typography>
                  ))}
                </Box>
              )}
              {renderRecipient(studentRecipient, 'student')}
              {canEnableStudentAccess && !compact && (
                <Button
                  size="small"
                  color="inherit"
                  sx={{ alignSelf: 'flex-start' }}
                  disabled={busy}
                  startIcon={<Iconify icon={GlobalIcons.admissionStudent} width={18} />}
                  onClick={() => setAccessEditorCase(student.id)}
                >
                  Enable student login
                </Button>
              )}
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: compact ? 1 : 1.5 }}>
                {renderRecipient(adult, 'guardian')}
              </Box>
            </Stack>
          </Box>
        </FormBusyRegion>
        <Stack spacing={1} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1.5, pt: 1 }}>
          {needsActivation && (
            <Typography variant="caption" color="text.secondary">
              Use Save &amp; Activate first, then send login details.
            </Typography>
          )}
          {!compact && (
            <FormHelperText sx={{ m: 0 }}>
              Each selected person receives a separate email using their own saved login. Submitted
              means accepted by the sender.
            </FormHelperText>
          )}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon="mdi:refresh" width={18} />}
                disabled={busy || credentials.isFetching}
                onClick={refresh}
              >
                Refresh
              </Button>
              {compact && canEnableStudentAccess && (
                <Button
                  size="small"
                  color="inherit"
                  disabled={busy}
                  onClick={() => setAccessEditorCase(student.id)}
                >
                  Enable student login
                </Button>
              )}
            </Stack>
            <LoadingButton
              type="submit"
              aria-label="Send selected login details"
              size="small"
              variant="contained"
              color="inherit"
              loading={working}
              disabled={!canSend}
              sx={{ ml: 'auto' }}
              startIcon={<Iconify icon="mdi:email-send-outline" width={18} />}
            >
              {compact ? 'Send login details' : 'Send selected login details'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
      {emailEditor && workspace && (
        <StudentCredentialProfileEmailDialog
          key={`${student.id}:${recipientKey(emailEditor)}`}
          caseId={student.id}
          caseLabel={student.studentName}
          concurrencyStamp={workspace.concurrencyStamp}
          recipient={emailEditor}
          onBusyChange={setEmailBusy}
          onClose={() => setEmailEditor(null)}
        />
      )}
      {accessEditorCase === student.id && canEnableStudentAccess && workspace && (
        <StudentAppAccessDialog
          key={student.id}
          caseId={student.id}
          caseLabel={student.studentName}
          concurrencyStamp={workspace.concurrencyStamp}
          onClose={() => setAccessEditorCase(null)}
          onSaved={() => {
            refetchCurrent(student.id).catch(() => {});
          }}
        />
      )}
      {profileCorrection && student.studentId && (
        <GuardianProfileEmailDialog
          studentId={student.studentId}
          relationship={profileCorrection}
          caseLabel={`${student.studentName} · ${student.applicationNumber}`}
          parentOnly={Boolean(sibling?.enabled && profileCorrection !== 'guardian')}
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
