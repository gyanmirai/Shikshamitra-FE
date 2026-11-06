'use client';

import type {
  ParentRecipientRelationship,
  StaffParentRegistrationContext,
} from 'src/redux/student/admissions/admission-parent-registration-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
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
} from '@mui/material';
import {
  useGetParentRegistrationQuery,
  useSendParentRegistrationMutation,
  useApplyParentRegistrationMutation,
  useRevokeParentRegistrationMutation,
  useTakeoverParentRegistrationMutation,
  useChangeParentRegistrationEmailMutation,
  useGetParentRegistrationEmailHistoryQuery,
  useRetryParentRegistrationDeliveryMutation,
  useRequestParentRegistrationCorrectionsMutation,
} from 'src/redux/student/admissions/admission-parent-registration-api';

import { readAdmissionFormValue } from '../../admission-visibility-rules';
import { ParentRegistrationEmailHistoryDrawer } from './parent-registration-email-history-drawer';

type Action = 'email' | 'send' | 'corrections' | 'apply' | 'revoke' | 'takeover' | 'retry-delivery';
const labels: Record<Action, string> = {
  email: 'Update Link',
  send: 'Send Registration Link',
  corrections: 'Request Parent Documents',
  apply: 'Review Parent Corrections',
  revoke: 'Revoke Parent Link',
  takeover: 'Take Over Registration',
  'retry-delivery': 'Retry Link Delivery',
};
const actionLabels: Record<Action, string> = {
  email: 'Submit',
  send: 'Send link',
  corrections: 'Request corrections',
  apply: 'Apply corrections',
  revoke: 'Revoke link',
  takeover: 'Take over',
  'retry-delivery': 'Retry delivery',
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
  /** Reuse these actions in the applicant header without a second controller or query. */
  placement?: 'inline' | 'header';
}) {
  const [polling, setPolling] = useState(false);
  const [emailHistoryOpen, setEmailHistoryOpen] = useState(false);
  const query: ReturnType<typeof useGetParentRegistrationQuery> = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetParentRegistrationQuery,
    params: applicationId,
    options: {
      skip: !canView,
      pollingInterval: polling ? 30000 : 0,
      skipPollingIfUnfocused: true,
    },
    popupConfig: {
      errorMessage:
        'Parent registration status is unavailable. Staff can continue editing the application.',
    },
  });
  const context: StaffParentRegistrationContext | undefined = query.currentData;
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
    setPolling(
      Boolean(context?.request && ['Invited', 'InProgress'].includes(context.request.status))
    );
  }, [context?.request]);
  const [action, setAction] = useState<Action | null>(null);
  const [snapshot, setSnapshot] = useState<StaffParentRegistrationContext | null>(null);
  const [send] = useSendParentRegistrationMutation();
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
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  const formik = useFormik({
    initialValues: {
      recipient: '' as ParentRecipientRelationship | '',
      notes: '',
      email: '',
      documents: [] as string[],
    },
    validationSchema: Yup.object({
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
          !['send', 'corrections'].includes(action || '') ||
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
      if (!snapshot || !action || busyRef.current || conflict || !canManage) return;
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
      if (
        ['send', 'retry-delivery', 'corrections'].includes(action) &&
        context?.emailDeliveryBlockedReason
      )
        return;
      const payload = {
        concurrencyStamp: snapshot.concurrencyStamp,
        ...(['send', 'corrections', 'email'].includes(action)
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
        if (action === 'email')
          await changeEmail(command as Parameters<typeof changeEmail>[0]).unwrap();
        else if (action === 'send') await send(command as Parameters<typeof send>[0]).unwrap();
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
        shikshaMitraToast.success({
          message:
            action === 'email'
              ? 'Parent email saved. Send a registration link when ready.'
              : action === 'apply'
                ? 'Parent corrections applied. Review the application before continuing.'
                : 'Parent registration updated. Check email history for the latest status.',
        });
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
  const router = useRouter();
  const guard = useUnsavedNavigation(Boolean(action && formik.dirty), {
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
    if (!context || disabled || dirty || busy || !canManage) return;
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
      },
    });
  };
  if (!canView || query.isError || (!context && !query.isLoading)) return null;
  const request = context?.request;
  const editableRecipients = context?.recipients.filter((contact) => contact.canChangeEmail) ?? [];
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
      (primaryDeliveryAction === 'retry-delivery' && context.canSend) ||
      context.recipients.some(
        (contact) => contact.canChangeEmail || contact.emailChangeBlockedReason
      ))
  );
  const hasActions = Boolean((canManage && primaryDeliveryAction) || request || hasMoreActions);
  const headerIconSx = {
    width: { xs: 44, sm: 36 },
    height: { xs: 44, sm: 36 },
    border: 1,
    borderColor: 'divider',
    borderRadius: 1,
  };
  return (
    <>
      {!documentStageId &&
        (query.isLoading ? (
          <Skeleton
            width={168}
            height={40}
            sx={{ alignSelf: 'center', ...(placement === 'inline' && { ml: 'auto' }) }}
            aria-label="Loading parent registration actions"
          />
        ) : (
          context && (
            <Stack
              role="group"
              aria-label="Parent registration actions"
              spacing={1}
              alignItems="flex-end"
              sx={
                placement === 'header'
                  ? {
                      minWidth: 0,
                      maxWidth: { xs: '100%', sm: 360 },
                      ...(hasActions && { borderRight: 1, borderColor: 'divider', pr: 1 }),
                    }
                  : { width: 1 }
              }
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
                useFlexGap
                flexWrap="wrap"
              >
                {canManage && primaryDeliveryAction && (
                  <Button
                    size="small"
                    variant="outlined"
                    color={placement === 'header' ? 'inherit' : 'primary'}
                    startIcon={<Iconify icon={GlobalIcons.email} />}
                    disabled={
                      disabled || dirty || busy || Boolean(context.emailDeliveryBlockedReason)
                    }
                    onClick={() => open(primaryDeliveryAction)}
                  >
                    Send email
                  </Button>
                )}
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
                {hasMoreActions && (
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
                        {context.recipients.some(
                          (contact) => contact.canChangeEmail || contact.emailChangeBlockedReason
                        ) && (
                          <CustomTooltip
                            title={
                              editableRecipients.length
                                ? 'Update the saved parent email. Send a new link separately after saving.'
                                : context.recipients.find(
                                    (contact) => contact.emailChangeBlockedReason
                                  )?.emailChangeBlockedReason
                            }
                            placement="left"
                          >
                            <span>
                              <MenuItem
                                disabled={!editableRecipients.length || disabled || dirty || busy}
                                onClick={() => {
                                  popover.onClose();
                                  open('email');
                                }}
                              >
                                <Iconify icon={GlobalIcons.edit} />
                                Update link
                              </MenuItem>
                            </span>
                          </CustomTooltip>
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
              {context.emailDeliveryBlockedReason && primaryDeliveryAction && (
                <Typography variant="caption" color="text.secondary" role="status">
                  {context.emailDeliveryBlockedReason}
                </Typography>
              )}
              {!context.recipients.some((contact) => contact.canSend) && !request && (
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
              {dirty && (
                <Typography variant="caption" color="text.secondary" role="status">
                  Save your current form edits before sending email or changing parent access.
                </Typography>
              )}
              {context.blockedReason && !primaryDeliveryAction && (
                <Typography variant="caption" color="text.secondary" role="status">
                  {context.blockedReason}
                </Typography>
              )}
            </Stack>
          )
        ))}
      {!documentStageId && (
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
      {action && snapshot && (
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
          titleInfo="The private link is valid for seven days. The school retains admission decisions and formal submission."
          handleClose={close}
          disableClose={busy}
          hasUnsavedChanges={formik.dirty}
          guardUnsavedChanges={false}
          maxWidth={action === 'corrections' || action === 'apply' ? 'sm' : 'xs'}
        >
          <DialogScrollContent>
            <Stack spacing={2}>
              {['send', 'corrections'].includes(action) && (
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
                        label="Send to"
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
                    <Typography variant="body2" color="text.secondary">
                      {snapshot.request ? 'Sending a new link closes the previous link. ' : ''}
                      Parent completes the form. Staff review and submit the application.
                    </Typography>
                  </Stack>
                </FormSectionCard>
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
              {error && (
                <Typography role="alert" color="error" variant="body2">
                  {error}
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
                !canManage ||
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
