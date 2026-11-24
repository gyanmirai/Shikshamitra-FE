'use client';

import type { ReactNode } from 'react';
import type {
  ParentRecipientRelationship,
  StaffParentRegistrationContext,
  ParentRegistrationCopyLinkInput,
} from 'src/redux/student/admissions/admission-parent-registration-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { createPortal } from 'react-dom';
import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { readableRegistrationValue } from 'src/screens/public/admission-registration/parent-registration-model';
import {
  Box,
  Stack,
  Button,
  MenuItem,
  MenuList,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  useGetParentRegistrationQuery,
  useSendParentRegistrationMutation,
  useApplyParentRegistrationMutation,
  useRevokeParentRegistrationMutation,
  useCopyParentRegistrationLinkMutation,
  useTakeoverParentRegistrationMutation,
  useReactivateParentRegistrationMutation,
  useChangeParentRegistrationEmailMutation,
  useGetParentRegistrationEmailHistoryQuery,
  useRetryParentRegistrationDeliveryMutation,
  useRequestParentRegistrationCorrectionsMutation,
} from 'src/redux/student/admissions/admission-parent-registration-api';

import { readAdmissionFormValue } from '../../admission-visibility-rules';
import { formatAssessmentSchedule } from '../../assessments/assessment-date-time';
import { ParentRegistrationEmailHistoryDrawer } from './parent-registration-email-history-drawer';

type Action =
  | 'copy'
  | 'email'
  | 'send'
  | 'reactivate'
  | 'corrections'
  | 'apply'
  | 'revoke'
  | 'takeover'
  | 'retry-delivery';
const labels: Record<Action, string> = {
  copy: 'Copy Registration Link',
  email: 'Update Link',
  send: 'Send Registration Link',
  reactivate: 'Reactivate Registration Link',
  corrections: 'Request Parent Documents',
  apply: 'Review Parent Corrections',
  revoke: 'Revoke Parent Link',
  takeover: 'Take Over Registration',
  'retry-delivery': 'Retry Link Delivery',
};
const actionLabels: Record<Action, string> = {
  copy: 'Copy link',
  email: 'Submit',
  send: 'Send link',
  reactivate: 'Reactivate link',
  corrections: 'Request corrections',
  apply: 'Apply corrections',
  revoke: 'Revoke link',
  takeover: 'Take over',
  'retry-delivery': 'Retry delivery',
};
const defaultLinkValidityDays = '7';
const millisecondsPerDay = 24 * 60 * 60 * 1000;
const latestLinkExpiry = Date.UTC(9999, 11, 31, 23, 59, 59, 999);
const readLinkValidityDays = (value: string | undefined) => {
  if (!value || !/^\d+$/.test(value)) return null;
  const days = Number(value);
  if (
    !Number.isSafeInteger(days) ||
    days <= 0 ||
    Date.now() + days * millisecondsPerDay > latestLinkExpiry
  )
    return null;
  return days;
};
const hasParentEmailChange = (email: string, savedEmail?: string | null) =>
  email.trim().toLowerCase() !== (savedEmail || '').trim().toLowerCase();

export function ParentRegistrationPanel({
  applicationId,
  canView,
  canManage,
  disabled = false,
  dirty = false,
  currentValues,
  documentStageId,
  onBusyChange,
  onProgressChange,
  placement = 'inline',
  formActions,
  statusElement,
  completionStatus,
}: {
  applicationId: string;
  canView: boolean;
  canManage: boolean;
  disabled?: boolean;
  dirty?: boolean;
  currentValues: Record<string, string>;
  /** Document-only requests belong to the existing verification stage. */
  documentStageId?: string;
  onBusyChange?: (busy: boolean) => void;
  onProgressChange?: () => void;
  /** Registration form header presentation, including link status and copying. */
  placement?: 'inline' | 'header';
  formActions?: { print: ReactNode; refresh: ReactNode };
  statusElement?: HTMLElement | null;
  completionStatus?: ReactNode;
}) {
  const [pollingInterval, setPollingInterval] = useState(0);
  const [emailHistoryOpen, setEmailHistoryOpen] = useState(false);
  const query: ReturnType<typeof useGetParentRegistrationQuery> = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetParentRegistrationQuery,
    params: applicationId,
    options: {
      skip: !canView,
      pollingInterval,
      skipPollingIfUnfocused: true,
    },
    popupConfig: {
      errorMessage:
        'Parent registration status is unavailable. Staff can continue editing the application.',
    },
  });
  const context: StaffParentRegistrationContext | undefined =
    canView && !query.isError ? query.currentData : undefined;
  const emailHistoryQuery = useGetParentRegistrationEmailHistoryQuery(applicationId, {
    skip: !canView || !emailHistoryOpen,
    refetchOnMountOrArgChange: true,
  });
  const observedProgress = useRef<{ applicationId: string; marker: string } | null>(null);
  useEffect(() => {
    if (!canView || !context) return;
    const { request } = context;
    const marker = JSON.stringify([request?.id, request?.lastSavedAt, request?.handedInAt]);
    const previous = observedProgress.current;
    observedProgress.current = { applicationId, marker };
    if (
      previous?.applicationId === applicationId &&
      previous.marker !== marker &&
      (request?.lastSavedAt || request?.handedInAt)
    )
      onProgressChange?.();
  }, [applicationId, canView, context, onProgressChange]);
  useEffect(() => {
    const request = context?.request;
    if (request && ['Pending', 'Sending'].includes(request.deliveryStatus)) {
      setPollingInterval(5000);
    } else {
      setPollingInterval(request && ['Invited', 'InProgress'].includes(request.status) ? 30000 : 0);
    }
  }, [context?.request]);
  const [action, setAction] = useState<Action | null>(null);
  const [snapshot, setSnapshot] = useState<StaffParentRegistrationContext | null>(null);
  const [send] = useSendParentRegistrationMutation();
  const [copyRegistrationLink] = useCopyParentRegistrationLinkMutation();
  const [reactivate] = useReactivateParentRegistrationMutation();
  const [changeEmail] = useChangeParentRegistrationEmailMutation();
  const [revoke] = useRevokeParentRegistrationMutation();
  const [takeover] = useTakeoverParentRegistrationMutation();
  const [corrections] = useRequestParentRegistrationCorrectionsMutation();
  const [apply] = useApplyParentRegistrationMutation();
  const [retryDelivery] = useRetryParentRegistrationDeliveryMutation();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const retry = useRef<{ fingerprint: string; key: string } | null>(null);
  const validityInput = useRef<HTMLInputElement>(null);
  const showLinkValidity = action === 'copy' || action === 'send' || action === 'reactivate';
  const canReactivate = Boolean(context?.canReactivate && context.request);
  const reactivationUnavailable =
    action === 'reactivate' && (!canReactivate || context?.request?.id !== snapshot?.request?.id);
  const commandDisabled =
    disabled ||
    dirty ||
    !canManage ||
    !context ||
    snapshot?.applicationId !== applicationId ||
    reactivationUnavailable ||
    (action === 'copy' && !context.canCreateLink) ||
    (action === 'send' && !context.canSend) ||
    (action === 'retry-delivery' && !context.canRetryDelivery) ||
    (['send', 'retry-delivery', 'corrections'].includes(action ?? '') &&
      Boolean(context.emailDeliveryBlockedReason));
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  async function copyLink(input: ParentRegistrationCopyLinkInput) {
    const { copied } = await copyRegistrationLink({ applicationId, input }).unwrap();
    if (copied) {
      shikshaMitraToast.success({ message: 'Registration link copied.' });
    } else {
      shikshaMitraToast.error({
        message: 'Unable to copy the registration link. Try Copy link again.',
      });
    }
  }
  const formik = useFormik({
    initialValues: {
      recipient: '' as ParentRecipientRelationship | '',
      notes: '',
      email: '',
      documents: [] as string[],
      validityDays: defaultLinkValidityDays,
    },
    validationSchema: Yup.object({
      validityDays: Yup.string().test(
        'link-validity',
        'Enter a positive whole number of days within the supported date range.',
        (value) => !showLinkValidity || readLinkValidityDays(value) !== null
      ),
      email: Yup.string()
        .trim()
        .test(
          'email-required',
          'Enter a valid email address.',
          (value) => action !== 'email' || Boolean(value && Yup.string().email().isValidSync(value))
        ),
      recipient: Yup.string().test(
        'saved-recipient',
        'Select a saved contact with an email.',
        (value) =>
          !['copy', 'send', 'corrections'].includes(action || '') ||
          Boolean(
            snapshot?.recipients.some(
              (recipient) =>
                recipient.relationship === value && recipient.canSend && recipient.email
            )
          )
      ),
      notes: Yup.string()
        .trim()
        .max(1024, 'Use 1,024 characters or fewer.')
        .test(
          'reason',
          'Give a reason for these corrections.',
          (value) => !['corrections', 'apply'].includes(action || '') || Boolean(value)
        ),
      documents: Yup.array().test(
        'requested-item',
        'Select at least one document.',
        (value) => action !== 'corrections' || Boolean(documentStageId && value?.length)
      ),
    }),
    onSubmit: async (values) => {
      if (!snapshot || !action || busyRef.current || conflict || commandDisabled) return;
      if (
        action === 'email' &&
        !hasParentEmailChange(
          values.email,
          snapshot.recipients.find((contact) => contact.relationship === values.recipient)?.email
        )
      )
        return;
      if (
        action === 'email' &&
        !context?.recipients.some(
          (contact) => contact.relationship === values.recipient && contact.canChangeEmail
        )
      )
        return;
      const validityDays = showLinkValidity ? readLinkValidityDays(values.validityDays) : null;
      const payload = {
        concurrencyStamp: snapshot.concurrencyStamp,
        ...(validityDays !== null ? { validityDays } : {}),
        ...(action === 'reactivate' ? { requestId: snapshot.request?.id } : {}),
        ...(['copy', 'send', 'corrections', 'email'].includes(action)
          ? { recipientRelationship: values.recipient as ParentRecipientRelationship }
          : {}),
        ...(action === 'email'
          ? {
              email: values.email.trim(),
              expectedEmail:
                snapshot.recipients.find((contact) => contact.relationship === values.recipient)
                  ?.email ?? null,
            }
          : {}),
        ...(action === 'corrections'
          ? {
              notes: values.notes.trim(),
              fieldCodes: [],
              documents: values.documents.map((value) => {
                const [stageInstanceId, requirementCode] = JSON.parse(value) as string[];
                return { stageInstanceId, requirementCode };
              }),
            }
          : {}),
        ...(action === 'apply' ? { reason: values.notes.trim() } : {}),
      };
      const fingerprint = JSON.stringify({ action, payload });
      if (retry.current?.fingerprint !== fingerprint)
        retry.current = { fingerprint, key: crypto.randomUUID() };
      const input = { ...payload, idempotencyKey: retry.current.key };
      busyRef.current = true;
      setBusy(true);
      setError('');
      try {
        const command = { applicationId, input };
        if (action === 'copy') await copyLink(input as ParentRegistrationCopyLinkInput);
        else if (action === 'email')
          await changeEmail(command as Parameters<typeof changeEmail>[0]).unwrap();
        else if (action === 'send') await send(command as Parameters<typeof send>[0]).unwrap();
        else if (action === 'reactivate')
          await reactivate(command as Parameters<typeof reactivate>[0]).unwrap();
        else if (action === 'corrections')
          await corrections(command as Parameters<typeof corrections>[0]).unwrap();
        else if (action === 'apply') await apply(command as Parameters<typeof apply>[0]).unwrap();
        else if (action === 'revoke') await revoke(command).unwrap();
        else if (action === 'takeover') await takeover(command).unwrap();
        else await retryDelivery(command).unwrap();
        retry.current = null;
        setAction(null);
        setSnapshot(null);
        formik.resetForm();
        if (action !== 'copy') {
          shikshaMitraToast.success({
            message:
              action === 'email'
                ? 'Parent email saved. Send a registration link when ready.'
                : action === 'apply'
                  ? 'Parent corrections applied. Review the application before continuing.'
                  : action === 'reactivate'
                    ? 'Registration link reactivated.'
                    : 'Parent registration updated. Check email history for the latest status.',
          });
        }
      } catch (failure) {
        const conflictError =
          (failure as { status?: number; data?: { error?: { code?: string } } }).status === 409 ||
          (failure as { data?: { error?: { code?: string } } }).data?.error?.code ===
            'Admissions.ParentRegistration.Conflict';
        setConflict(conflictError);
        const message =
          (failure as { status?: string }).status === 'FETCH_ERROR'
            ? 'Unable to complete this request. Your choices are retained. Try again.'
            : parseApiProblemDetail(failure).detail ||
              'Unable to complete this request. Your choices are retained. Try again.';
        shikshaMitraToast.error({ message });
        setError(
          conflictError
            ? 'The application changed. Close this dialog and review the latest application before retrying.'
            : ''
        );
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
  });
  useEffect(() => {
    if (formik.submitCount && !formik.isSubmitting && formik.errors.validityDays)
      validityInput.current?.focus();
  }, [formik.submitCount, formik.isSubmitting, formik.errors.validityDays]);
  const router = useRouter();
  const guard = useUnsavedNavigation(Boolean(action && formik.dirty), {
    guardContextChanges: Boolean(action),
    push: router.push,
    blockNavigation: busy,
  });
  const close = () =>
    guard.requestNavigation(() => {
      setAction(null);
      setSnapshot(null);
      formik.resetForm();
      setError('');
      setConflict(false);
    });
  const open = (next: Action, relationship?: ParentRecipientRelationship) => {
    if (!context || disabled || dirty || busyRef.current || !canManage) return;
    setSnapshot(context);
    setAction(next);
    setError('');
    setConflict(false);
    retry.current = null;
    const recipient =
      context.recipients.find((item) => item.relationship === relationship) ??
      (next === 'email'
        ? (context.recipients.find((item) => item.canChangeEmail && item.isMainContact) ??
          context.recipients.find((item) => item.canChangeEmail))
        : undefined) ??
      context.recipients.find((item) => item.isMainContact && item.canSend) ??
      context.recipients.find((item) => item.canSend);
    formik.resetForm({
      values: {
        recipient: recipient?.relationship ?? '',
        notes: '',
        email: recipient?.email || '',
        documents: [],
        validityDays: defaultLinkValidityDays,
      },
    });
  };
  const handleCopyLink = async () => {
    if (!context || disabled || dirty || busyRef.current || !canManage) return;
    if (!context.canCopyLink || !context.request) {
      if (context.canCreateLink) open('copy');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await copyLink({
        requestId: context.request.id,
        concurrencyStamp: context.concurrencyStamp,
        idempotencyKey: crypto.randomUUID(),
      });
    } catch (failure) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(failure).detail || 'Unable to copy the registration link.',
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const loadingContext = canView && !query.isError && query.isLoading;
  if (!context && !loadingContext && !formActions) return null;
  const request = context?.request;
  const inHeader = placement === 'header';
  const validityDays =
    action === 'reactivate' ? readLinkValidityDays(formik.values.validityDays) : null;
  const estimatedExpiry =
    validityDays === null
      ? null
      : formatAssessmentSchedule(
          new Date(Date.now() + validityDays * millisecondsPerDay).toISOString()
        );
  const validityError = formik.touched.validityDays ? formik.errors.validityDays : undefined;
  const dialogError =
    error ||
    (!busy && reactivationUnavailable
      ? 'This link is no longer available to reactivate. Close this dialog to review the latest state.'
      : '');
  const copyAvailable = Boolean(context?.canCopyLink || context?.canCreateLink);
  const showCopyLink = inHeader && canManage && Boolean(context?.canSend || copyAvailable);
  const emailSent = Boolean(inHeader && request?.deliveryStatus === 'Sent');
  const emailStatus = emailSent && (
    <Label color="success" role="status" startIcon={<Iconify icon="mdi:check" width={14} />}>
      Email sent
    </Label>
  );
  const editableRecipients = context?.recipients.filter((contact) => contact.canChangeEmail) ?? [];
  const emailChangeBlockedReason = context?.recipients.find(
    (contact) => contact.emailChangeBlockedReason
  )?.emailChangeBlockedReason;
  const showUpdateLink =
    canManage && Boolean(editableRecipients.length || emailChangeBlockedReason);
  const primaryDeliveryAction = context?.canRetryDelivery
    ? 'retry-delivery'
    : context?.canSend
      ? 'send'
      : null;
  const recipient = snapshot?.recipients.find(
    (item) => item.relationship === formik.values.recipient
  );
  const hasMoreActions = Boolean(
    context &&
    canManage &&
    (context.canApply ||
      context.canRevoke ||
      context.canTakeover ||
      (primaryDeliveryAction === 'retry-delivery' && context.canSend))
  );
  const headerIconSx = {
    width: { xs: 44, sm: 36 },
    height: { xs: 44, sm: 36 },
    border: 1,
    borderColor: 'divider',
    borderRadius: 1,
  };
  return (
    <>
      {!documentStageId && (
        <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 0, width: 1, textAlign: 'end' }}>
          <Stack
            role="group"
            aria-label={formActions ? 'Registration form actions' : 'Parent registration actions'}
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={formActions ? 'space-between' : 'flex-end'}
            useFlexGap
            flexWrap={completionStatus ? 'wrap' : undefined}
            sx={{ width: 1, minWidth: 0 }}
          >
            {formActions && (
              <Typography
                variant="subtitle2"
                component="h3"
                sx={{ display: { xs: 'none', md: 'block' }, mr: 'auto' }}
              >
                Registration
              </Typography>
            )}
            {completionStatus && (
              <Box sx={{ flexBasis: { xs: '100%', lg: 'auto' }, minWidth: 0, textAlign: 'start' }}>
                {completionStatus}
              </Box>
            )}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
              useFlexGap
              flexWrap="wrap"
              sx={{ minWidth: 0, maxWidth: 1, ml: completionStatus ? 'auto' : undefined }}
            >
              <Stack
                role={formActions ? 'group' : undefined}
                aria-label={formActions ? 'Registration link actions' : undefined}
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
                useFlexGap
                flexWrap="wrap"
                sx={{ minWidth: 0, '&:empty': { display: 'none' } }}
              >
                {loadingContext && (
                  <Skeleton
                    width={168}
                    height={30}
                    aria-label="Loading parent registration actions"
                  />
                )}
                {canManage && canReactivate && (
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon="mdi:link-variant" width={18} />}
                    disabled={disabled || dirty || busy}
                    onClick={() => open('reactivate')}
                  >
                    Reactivate link
                  </Button>
                )}
                {showCopyLink && (
                  <CustomTooltip
                    title={
                      copyAvailable ? '' : 'The current registration link is unavailable to copy.'
                    }
                    arrow
                  >
                    <span>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<Iconify icon="mdi:link-variant" width={18} />}
                        disabled={disabled || dirty || busy || !copyAvailable}
                        onClick={handleCopyLink}
                      >
                        Copy link
                      </Button>
                    </span>
                  </CustomTooltip>
                )}
                {canManage && primaryDeliveryAction && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon={GlobalIcons.email} width={18} />}
                    disabled={
                      disabled || dirty || busy || Boolean(context?.emailDeliveryBlockedReason)
                    }
                    onClick={() => open(primaryDeliveryAction)}
                  >
                    Send email
                  </Button>
                )}
                {showUpdateLink && (
                  <CustomTooltip
                    title={
                      editableRecipients.length
                        ? 'Update the saved parent email. Send a new link separately after saving.'
                        : emailChangeBlockedReason
                    }
                    describeChild
                    placement="right"
                  >
                    <Box component="span" sx={{ display: 'inline-flex' }}>
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<Iconify icon={GlobalIcons.edit} width={18} />}
                        disabled={!editableRecipients.length || disabled || dirty || busy}
                        onClick={() => open('email')}
                      >
                        Update link
                      </Button>
                    </Box>
                  </CustomTooltip>
                )}
              </Stack>
              <Stack
                role={formActions ? 'group' : undefined}
                aria-label={formActions ? 'Registration utilities' : undefined}
                direction="row"
                alignItems="center"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                justifyContent="flex-end"
                sx={{ minWidth: 0, '&:empty': { display: 'none' } }}
              >
                {formActions?.print}
                {formActions?.refresh}
                {emailStatus &&
                  (statusElement ? createPortal(emailStatus, statusElement) : emailStatus)}
                {request && (
                  <CustomTooltip title="Email history" arrow>
                    <span>
                      <IconButton
                        size="small"
                        aria-label="Email history"
                        onClick={() => setEmailHistoryOpen(true)}
                        sx={placement === 'header' ? headerIconSx : undefined}
                      >
                        <Iconify icon="mdi:email-sync-outline" />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                )}
                {context && hasMoreActions && (
                  <ThreeDotsActions
                    moreLabel="More parent registration actions"
                    sx={
                      placement === 'header'
                        ? { '& > .MuiIconButton-root': headerIconSx }
                        : undefined
                    }
                    actions={({ popover }) => (
                      <MenuList>
                        {context.canApply && (
                          <MenuItem
                            disabled={disabled || dirty || busy}
                            onClick={() => {
                              popover.onClose();
                              open('apply');
                            }}
                          >
                            <Iconify icon={GlobalIcons.admissionDetails} />
                            Review parent corrections
                          </MenuItem>
                        )}
                        {primaryDeliveryAction === 'retry-delivery' && context.canSend && (
                          <MenuItem
                            disabled={
                              disabled ||
                              dirty ||
                              busy ||
                              Boolean(context.emailDeliveryBlockedReason)
                            }
                            onClick={() => {
                              popover.onClose();
                              open('send');
                            }}
                          >
                            <Iconify icon={GlobalIcons.email} />
                            Send a new link
                          </MenuItem>
                        )}
                        {context.canRevoke && (
                          <MenuItem
                            disabled={disabled || dirty || busy}
                            onClick={() => {
                              popover.onClose();
                              open('revoke');
                            }}
                          >
                            <Iconify icon={GlobalIcons.cancel} />
                            Revoke link
                          </MenuItem>
                        )}
                        {context.canTakeover && (
                          <MenuItem
                            disabled={disabled || dirty || busy}
                            onClick={() => {
                              popover.onClose();
                              open('takeover');
                            }}
                          >
                            <Iconify icon={GlobalIcons.edit} />
                            Take over
                          </MenuItem>
                        )}
                      </MenuList>
                    )}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
          {context?.emailDeliveryBlockedReason && primaryDeliveryAction && (
            <Typography variant="caption" color="text.secondary" role="status">
              {context.emailDeliveryBlockedReason}
            </Typography>
          )}
          {context && !context.recipients.some((contact) => contact.canSend) && !request && (
            <Typography variant="caption" color="text.secondary" role="status">
              Save a parent contact with an email address before sending a link.
            </Typography>
          )}
          {request?.deliveryError && (
            <Typography variant="body2" color="error" role="alert">
              {request.deliveryError}
            </Typography>
          )}
          {request?.deliveryStatus === 'Unknown' && (
            <Typography variant="body2" role="status">
              Delivery could not be confirmed. Review email history before sending another link.
            </Typography>
          )}
          {context && dirty && !inHeader && (
            <Typography variant="caption" color="text.secondary" role="status">
              Save your current form edits before sending email or changing parent access.
            </Typography>
          )}
          {context?.blockedReason && !primaryDeliveryAction && (
            <Typography variant="caption" color="text.secondary" role="status">
              {context.blockedReason}
            </Typography>
          )}
        </Stack>
      )}
      {!documentStageId && context && (
        <ParentRegistrationEmailHistoryDrawer
          open={emailHistoryOpen}
          onClose={() => setEmailHistoryOpen(false)}
          history={emailHistoryQuery.currentData}
          isLoading={
            emailHistoryQuery.isLoading ||
            (emailHistoryQuery.isFetching && !emailHistoryQuery.currentData)
          }
          isError={emailHistoryQuery.isError}
          onRetry={emailHistoryQuery.refetch}
        />
      )}
      {documentStageId &&
        canManage &&
        context?.canRequestDocumentCorrections &&
        context.availableDocuments.some(
          (document) => document.stageInstanceId === documentStageId
        ) && (
          <Stack spacing={1} alignItems="flex-start">
            {context.emailDeliveryBlockedReason && (
              <Typography variant="body2" color="text.secondary" role="status">
                {context.emailDeliveryBlockedReason}
              </Typography>
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.email} />}
              disabled={disabled || dirty || busy || Boolean(context.emailDeliveryBlockedReason)}
              onClick={() => open('corrections')}
            >
              Request parent documents
            </Button>
          </Stack>
        )}
      {action && snapshot && context && (
        <CustomDialog
          open
          formProps={{
            onSubmit: (event) => {
              event.preventDefault();
              formik.submitForm();
            },
            noValidate: true,
          }}
          title={labels[action]}
          titleInfo={
            showLinkValidity
              ? 'Validity starts when the school confirms this action.'
              : 'The school retains admission decisions and formal submission.'
          }
          titleInfoPlacement={action === 'email' ? 'right' : undefined}
          handleClose={close}
          disableClose={busy}
          hasUnsavedChanges={formik.dirty}
          guardUnsavedChanges={false}
          maxWidth={
            action === 'email' || action === 'corrections' || action === 'apply' ? 'sm' : 'xs'
          }
        >
          <DialogScrollContent>
            <Stack spacing={2}>
              {['copy', 'send', 'corrections'].includes(action) && (
                <FormSectionCard
                  title="Parent Contact"
                  icon={GlobalIcons.admissionDetails}
                  descriptionTooltip="Choose a saved Father, Mother or authorized Guardian. Save a missing email in the contact editor first."
                >
                  <Stack spacing={2}>
                    <ShakingTextField
                      error={Boolean(formik.touched.recipient && formik.errors.recipient)}
                    >
                      <CustomSelect
                        name="recipient"
                        label={action === 'copy' ? 'Share with' : 'Send to'}
                        required
                        fullWidth
                        size="small"
                        value={formik.values.recipient}
                        options={snapshot.recipients.map((item) => ({
                          value: item.relationship,
                          label: `${item.relationshipLabel || item.relationship} · ${item.fullName}${!item.email ? ' · Email missing' : ''}`,
                        }))}
                        labelKey="label"
                        valueKey="value"
                        disabledValues={snapshot.recipients
                          .filter((item) => !item.canSend || !item.email)
                          .map((item) => item.relationship)}
                        disabledLabel="Save an email first"
                        disabled={busy}
                        onChange={(value) => formik.setFieldValue('recipient', value)}
                        error={Boolean(formik.touched.recipient && formik.errors.recipient)}
                        helperText={formik.touched.recipient ? formik.errors.recipient : undefined}
                      />
                    </ShakingTextField>
                    <TextField
                      size="small"
                      fullWidth
                      label="Email"
                      value={recipient?.email || ''}
                      slotProps={{ input: { readOnly: true } }}
                      helperText={
                        !recipient?.email
                          ? 'Save the contact email through staff editing before sending a link.'
                          : undefined
                      }
                    />
                    {(action === 'corrections' || (action === 'send' && snapshot.request)) && (
                      <Typography variant="body2" color="text.secondary">
                        {snapshot.request ? 'Sending a new link closes the previous link. ' : ''}
                        {action === 'corrections' &&
                          'Parent completes the form. Staff review and submit the application.'}
                      </Typography>
                    )}
                  </Stack>
                </FormSectionCard>
              )}
              {action === 'reactivate' && (
                <Stack spacing={1} alignItems="flex-start">
                  <Label color="warning">Link expired</Label>
                  <Typography variant="body2">
                    The parent can reopen the same link and continue with their saved answers. Share
                    the link separately if needed.
                  </Typography>
                </Stack>
              )}
              {showLinkValidity && (
                <ShakingTextField error={Boolean(validityError)}>
                  <NumericFormatCustom
                    required
                    fullWidth
                    size="small"
                    name="validityDays"
                    label="Link valid for"
                    value={formik.values.validityDays}
                    inputRef={validityInput}
                    prefix=""
                    allowNegative
                    valueIsNumericString
                    roundToWholeRupees={false}
                    thousandSeparator={false}
                    isAllowed={undefined}
                    slotProps={{
                      htmlInput: { 'aria-label': 'Link valid for (days)' },
                      input: {
                        endAdornment: <InputAdornment position="end">days</InputAdornment>,
                      },
                    }}
                    disabled={busy}
                    onBlur={formik.handleBlur}
                    onValueChange={({ value }, { source }) => {
                      if (source === 'event') formik.setFieldValue('validityDays', value);
                    }}
                    error={Boolean(validityError)}
                    helperText={
                      validityError ||
                      (action === 'reactivate' && (
                        <>
                          Enter a whole number of days greater than zero.
                          {estimatedExpiry && (
                            <>
                              <br />
                              Estimated expiry is {estimatedExpiry.date}, {estimatedExpiry.time}.
                            </>
                          )}
                        </>
                      ))
                    }
                  />
                </ShakingTextField>
              )}
              {action === 'email' && (
                <FormSectionCard
                  title="Parent Contact"
                  icon={GlobalIcons.admissionDetails}
                  descriptionTooltip="Save the parent contact email first. Saving does not send a registration link and closes existing parent access."
                >
                  <Stack spacing={2}>
                    {snapshot.recipients.filter((item) => item.canChangeEmail).length > 1 && (
                      <CustomSelect
                        name="recipient"
                        label="Parent contact"
                        fullWidth
                        size="small"
                        value={formik.values.recipient}
                        options={snapshot.recipients
                          .filter((item) => item.canChangeEmail)
                          .map((item) => ({
                            value: item.relationship,
                            label: `${item.relationshipLabel || item.relationship} · ${item.fullName}`,
                          }))}
                        labelKey="label"
                        valueKey="value"
                        disabled={busy}
                        onChange={(value) => {
                          const contact = snapshot.recipients.find(
                            (item) => item.relationship === value
                          );
                          formik.setValues({
                            ...formik.values,
                            recipient: contact?.relationship ?? '',
                            email: contact?.email || '',
                          });
                        }}
                      />
                    )}
                    {snapshot.recipients.filter((item) => item.canChangeEmail).length === 1 && (
                      <Typography variant="body2">
                        {recipient?.relationshipLabel || recipient?.relationship} ·{' '}
                        {recipient?.fullName}
                      </Typography>
                    )}
                    <ShakingTextField error={Boolean(formik.touched.email && formik.errors.email)}>
                      <TextField
                        required
                        name="email"
                        label="Email"
                        type="email"
                        size="small"
                        fullWidth
                        value={formik.values.email}
                        disabled={busy}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(formik.touched.email && formik.errors.email)}
                        helperText={formik.touched.email ? formik.errors.email : undefined}
                      />
                    </ShakingTextField>
                    <Typography variant="body2" color="text.secondary">
                      Saving closes the existing parent link. Send a new link separately when ready.
                    </Typography>
                  </Stack>
                </FormSectionCard>
              )}
              {action === 'corrections' && (
                <FormSectionCard
                  title="Requested Documents"
                  icon={GlobalIcons.edit}
                  descriptionTooltip="Request replacement files for this open document verification stage."
                >
                  <Stack spacing={2}>
                    <ShakingTextField
                      error={Boolean(formik.touched.documents && formik.errors.documents)}
                    >
                      <CustomSelect
                        name="documents"
                        label="Documents to replace"
                        required
                        multiple
                        fullWidth
                        size="small"
                        value={formik.values.documents}
                        options={snapshot.availableDocuments
                          .filter((document) => document.stageInstanceId === documentStageId)
                          .map((document) => ({
                            value: JSON.stringify([document.stageInstanceId, document.code]),
                            label: document.name,
                          }))}
                        labelKey="label"
                        valueKey="value"
                        disabled={busy}
                        onChange={(value) => formik.setFieldValue('documents', value)}
                        error={Boolean(formik.touched.documents && formik.errors.documents)}
                        helperText={
                          formik.touched.documents && typeof formik.errors.documents === 'string'
                            ? formik.errors.documents
                            : 'Only documents from this open verification stage can be requested.'
                        }
                      />
                    </ShakingTextField>
                  </Stack>
                </FormSectionCard>
              )}
              {action === 'apply' && (
                <FormSectionCard
                  title="Proposed Answers"
                  icon={GlobalIcons.admissionDetails}
                  descriptionTooltip="Applying uses the audited application correction process. It does not advance admission."
                >
                  <Stack spacing={2}>
                    {snapshot.request?.proposedValues.map((value) => (
                      <Box key={value.fieldCode}>
                        <Typography variant="subtitle2">
                          {snapshot.availableFields.find((field) => field.code === value.fieldCode)
                            ?.label || value.fieldCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current: {readableRegistrationValue(currentValues[value.fieldCode] || '')}
                        </Typography>
                        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                          Proposed:{' '}
                          {readableRegistrationValue(readAdmissionFormValue(value.valueJson))}
                        </Typography>
                      </Box>
                    ))}
                    {!snapshot.request?.proposedValues.length && (
                      <Typography variant="body2">
                        No answer changes are proposed. Review uploaded document versions through
                        the document checklist.
                      </Typography>
                    )}
                  </Stack>
                </FormSectionCard>
              )}
              {['corrections', 'apply'].includes(action) && (
                <ShakingTextField error={Boolean(formik.touched.notes && formik.errors.notes)}>
                  <TextField
                    name="notes"
                    label={action === 'apply' ? 'Correction reason' : 'Instructions for the parent'}
                    required
                    multiline
                    minRows={3}
                    fullWidth
                    size="small"
                    value={formik.values.notes}
                    disabled={busy}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.notes && formik.errors.notes)}
                    helperText={formik.touched.notes ? formik.errors.notes : undefined}
                  />
                </ShakingTextField>
              )}
              {action === 'revoke' && (
                <Typography variant="body2">
                  The current parent link will stop opening this registration. Saved answers and
                  document history are retained.
                </Typography>
              )}
              {action === 'takeover' && (
                <Typography variant="body2">
                  Close parent access and continue completing the application as staff. Saved parent
                  answers and documents are retained.
                </Typography>
              )}
              {action === 'retry-delivery' && (
                <Typography variant="body2">
                  Retry delivery through the school communication workflow. Check the resulting
                  delivery or approval status.
                </Typography>
              )}
              {dialogError && (
                <Typography role="alert" color="error" variant="body2">
                  {dialogError}
                </Typography>
              )}
            </Stack>
          </DialogScrollContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              onClick={close}
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              color="inherit"
              loading={busy}
              disabled={
                conflict ||
                commandDisabled ||
                (action === 'email' && !hasParentEmailChange(formik.values.email, recipient?.email))
              }
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
            >
              {action === 'corrections' ? 'Submit' : actionLabels[action]}
            </LoadingButton>
          </DialogActions>
        </CustomDialog>
      )}
      {guard.confirmation}
    </>
  );
}
