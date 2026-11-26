'use client';

import type { Dayjs } from 'dayjs';
import type { Ref, ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { FeeCollectionAdapter } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm';
import type {
  AdmissionVariableFeeHead,
  AdmissionCollectionReceipt,
} from 'src/redux/student/admissions/admission-fee-collection-types';

import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { toDateOnly } from 'src/utils/date-only';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { fCurrency } from 'src/utils/format-number';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { EmptyContent } from 'src/components/empty-content';
import CustomAccordion from 'src/components/custom-accordian';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { useDownloadReceiptPdfMutation } from 'src/redux/feeCollection/feeCollection';
import { useId, useRef, useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { Box, Stack, Paper, Button, Tooltip, Skeleton, Typography, IconButton } from '@mui/material';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import FeeProrationResult from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeProrationResult';
import FeeCollectComponentForm from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm';
import {
  useCollectAdmissionFeeMutation,
  useGetAdmissionFeeCollectFormQuery,
  useGetAdmissionFeeCollectionSummaryQuery,
  usePrepareAdmissionFeeCollectionMutation,
} from 'src/redux/student/admissions/admission-fee-collection-api';

import { useAdmissionJoiningDate } from './use-admission-joining-date';
import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { AdmissionJoiningDateField } from './admission-joining-date-field';
import { AdmissionFeePreparationDialog } from './admission-fee-preparation-dialog';
import { getAdmissionFeeCollectionAccess } from './admission-fee-collection-permissions';

type Props = {
  applicationId: string;
  disabled?: boolean;
  refreshing?: boolean;
  onOpenChange?: (open: boolean) => void;
  stretch?: boolean;
  defaultJoiningDateToToday?: boolean;
  autoSaveEarlyDate?: boolean;
  saveJoiningDateBeforeDeferralRef?: Ref<() => Promise<void>>;
  footerAction?: ReactNode;
  actionsElement?: HTMLElement | null;
};

// A valid no-policy choice needs a non-empty select value; Finance still receives null.
const NO_PRORATION_POLICY_OPTION = '__no_proration_policy__';
const REGISTRATION_JOINING_DATE_BLOCKER =
  'Complete the actual joining date in the registration form before preparing fees.';

function PaymentCollectionSection({
  framed,
  collapsible = false,
  title,
  icon,
  help,
  children,
}: {
  framed: boolean;
  collapsible?: boolean;
  title: string;
  icon: string;
  help?: string;
  children: ReactNode;
}) {
  const expanded = useBoolean(true);
  const id = useId();

  if (!framed) return <>{children}</>;

  if (collapsible) {
    const toggleLabel = `${expanded.value ? 'Collapse' : 'Expand'} ${title}`;
    const contentId = `${id}-content`;

    return (
      <Paper
        component="section"
        aria-label={title}
        variant="outlined"
        sx={{ minWidth: 0, borderRadius: 2, overflow: 'hidden' }}
      >
        <CustomAccordion
          title={title}
          expanded={expanded.value}
          summary={
            <Box
              id={`${id}-summary`}
              role="group"
              aria-label={`${title} details`}
              aria-controls={contentId}
              sx={{ p: { xs: 1.5, sm: 2 } }}
            >
              <FormSectionHeader
                title={title}
                titleTypographyProps={{ component: 'h4', color: 'text.primary' }}
                icon={icon}
                iconSize={16}
                iconContainerSize={28}
                descriptionTooltip={help}
                action={
                  <Tooltip title={toggleLabel}>
                    <IconButton
                      size="small"
                      aria-label={toggleLabel}
                      aria-expanded={expanded.value}
                      aria-controls={contentId}
                      onClick={expanded.onToggle}
                    >
                      <Iconify
                        icon={expanded.value ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                        aria-hidden
                      />
                    </IconButton>
                  </Tooltip>
                }
              />
            </Box>
          }
          content={
            <Box sx={{ px: { xs: 0.5, sm: 1 }, pb: { xs: 0.5, sm: 1 }, color: 'text.primary' }}>
              {children}
            </Box>
          }
        />
      </Paper>
    );
  }

  return (
    <FormSectionCard
      aria-label={title}
      title={title}
      titleTypographyProps={{ component: 'h4' }}
      icon={icon}
      iconSize={16}
      iconContainerSize={28}
      descriptionTooltip={help}
      contentSpacing={1}
      sx={{ minWidth: 0, boxShadow: 'none' }}
    >
      {children}
    </FormSectionCard>
  );
}

const collectionGuardError = (status: number, detail: string) =>
  Object.assign(new Error(detail), { status, data: { detail } });

function FeeCollectionSkeleton({ refreshing = false }: { refreshing?: boolean }) {
  return (
    <Stack
      role="status"
      aria-label={refreshing ? 'Refreshing Fee Collection' : 'Loading Fee Collection'}
      aria-busy
      spacing={2}
      sx={{ flex: 1, minWidth: 0 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {[0, 1, 2].map((column) => (
          <Stack key={column} spacing={0.5}>
            <Skeleton variant="text" width="70%" height={18} />
            <Skeleton variant="text" width="55%" height={28} />
          </Stack>
        ))}
      </Box>
      <Stack spacing={1.5}>
        <Skeleton variant="text" width={120} height={24} />
        {[0, 1, 2].map((row) => (
          <Stack key={row} direction="row" spacing={2} justifyContent="space-between">
            <Skeleton variant="text" width="45%" height={40} />
            <Skeleton variant="text" width="25%" height={40} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export default function AdmissionFeeCollectionPanel({
  applicationId,
  disabled = false,
  refreshing = false,
  onOpenChange,
  stretch = false,
  defaultJoiningDateToToday = false,
  autoSaveEarlyDate = false,
  saveJoiningDateBeforeDeferralRef,
  footerAction,
  actionsElement,
}: Props) {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const access = getAdmissionFeeCollectionAccess(permissions);
  const summary = useGetAdmissionFeeCollectionSummaryQuery(applicationId, {
    skip: !applicationId || !access.canView,
  });
  const dialog = useBoolean();
  const variableAmounts = useBoolean();
  const [prepare, preparing] = usePrepareAdmissionFeeCollectionMutation();
  const [collect, collecting] = useCollectAdmissionFeeMutation();
  const [downloadReceipt] = useDownloadReceiptPdfMutation();
  const [formBusy, setFormBusy] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [openingError, setOpeningError] = useState<string>();
  const [receiptBusy, setReceiptBusy] = useState<string>();
  const opening = useRef(false);
  const attemptedPayments = useRef(new Set<string>());
  const openChange = useRef(onOpenChange);
  openChange.current = onOpenChange;
  const form = useGetAdmissionFeeCollectFormQuery(applicationId, {
    skip: !dialog.value || !access.canCollect,
    refetchOnMountOrArgChange: true,
  });
  const close = useCallback(() => {
    if (formBusy || collecting.isLoading) return;
    dialog.onFalse();
    setFormDirty(false);
    onOpenChange?.(false);
  }, [collecting.isLoading, dialog, formBusy, onOpenChange]);
  const closeGuard = useUnsavedNavigation(dialog.value && formDirty, {
    push: router.push,
    blockNavigation: dialog.value && (formBusy || collecting.isLoading),
    guardContextChanges: dialog.value,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy: formBusy || collecting.isLoading }),
  });
  const requestClose = () => closeGuard.requestNavigation(close);
  useEffect(() => {
    if ((dialog.value || variableAmounts.value) && !access.canCollect) {
      dialog.onFalse();
      variableAmounts.onFalse();
      setFormDirty(false);
      setFormBusy(false);
      onOpenChange?.(false);
    }
  }, [access.canCollect, dialog, variableAmounts, onOpenChange]);
  useEffect(() => () => openChange.current?.(false), []);
  const state = summary.currentData;
  const refreshingCollection = refreshing || summary.isFetching;
  const joiningDate = useAdmissionJoiningDate(applicationId, {
    enabled: access.canView,
    requiresVariableAmounts: Boolean(state?.variableFeeHeads?.length),
    defaultToToday: defaultJoiningDateToToday,
  });
  const [savingJoiningDate, setSavingJoiningDate] = useState(false);
  const [joiningDateSaveError, setJoiningDateSaveError] = useState<string>();
  const [lastSavedDate, setLastSavedDate] = useState<string>();
  const earlyDateEntry =
    autoSaveEarlyDate &&
    access.canCollect &&
    joiningDate.state?.canEdit &&
    !joiningDate.state.canPreview;
  const saveEarlyDate = async (candidate: Dayjs | null) => {
    if (
      !earlyDateEntry ||
      disabled ||
      refreshingCollection ||
      opening.current ||
      !joiningDate.canSaveValue(candidate)
    )
      return;
    opening.current = true;
    setSavingJoiningDate(true);
    setJoiningDateSaveError(undefined);
    onOpenChange?.(true);
    try {
      await joiningDate.saveDate(candidate);
      setLastSavedDate(toDateOnly(candidate));
    } catch (error) {
      setJoiningDateSaveError(
        parseApiProblemDetail(error).detail || 'Could not save the actual joining date. Try again.'
      );
    } finally {
      opening.current = false;
      setSavingJoiningDate(false);
      onOpenChange?.(false);
    }
  };
  useImperativeHandle(saveJoiningDateBeforeDeferralRef, () => async () => {
    if (!joiningDate.hasUnsavedDateEdit) return;
    try {
      if (!access.canCollect) throw new Error('Joining date editing is unavailable.');
      await joiningDate.saveDate();
    } catch (error) {
      throw new Error(
        parseApiProblemDetail(error).detail ||
          (error instanceof Error
            ? error.message
            : 'Could not save the actual joining date. Try again.')
      );
    }
  });
  const earlyDateNeedsSave =
    joiningDate.state?.canEdit && !joiningDate.state.canPreview && joiningDate.canSaveDate;
  const canPrepare =
    !earlyDateNeedsSave && Boolean(state?.canCollect || joiningDate.state?.canPreview);
  const showingDatePreview = Boolean(joiningDate.state?.canPreview);
  const activePreview = showingDatePreview ? joiningDate.preview : undefined;
  const prorationResult = showingDatePreview ? activePreview?.proration : state?.proration;
  const prorationPolicy = showingDatePreview
    ? activePreview?.prorationPolicy
    : state?.prorationPolicy;
  const feeCalculationReady = showingDatePreview
    ? Boolean(activePreview)
    : state?.totalAmount != null;
  const prepareAndOpen = async (variableFeeHeads: AdmissionVariableFeeHead[]) => {
    await joiningDate.confirm();
    const prepared = await prepare({
      applicationId,
      variableFeeHeads,
      ...(joiningDate.state?.canSelectProrationPolicy &&
        joiningDate.prorationPolicyEligible && {
          prorationPolicyVersionId: joiningDate.selectedPolicyVersionId,
        }),
    }).unwrap();
    variableAmounts.onFalse();
    if (prepared.isSettled) {
      onOpenChange?.(false);
      await summary.refetch();
      return;
    }
    dialog.onTrue();
  };
  const open = async () => {
    if (
      opening.current ||
      preparing.isLoading ||
      disabled ||
      refreshingCollection ||
      !access.canCollect ||
      !state ||
      state?.isSettled ||
      !canPrepare ||
      joiningDate.blocked ||
      summary.isError
    )
      return;
    opening.current = true;
    setOpeningError(undefined);
    setJoiningDateSaveError(undefined);
    onOpenChange?.(true);
    try {
      if (state.variableFeeHeads?.length) {
        variableAmounts.onTrue();
      } else {
        await prepareAndOpen([]);
      }
    } catch (error) {
      setOpeningError(
        parseApiProblemDetail(error).detail ||
          'Fees could not be prepared. Retry after refreshing the fee structure.'
      );
      onOpenChange?.(false);
    } finally {
      opening.current = false;
    }
  };
  const download = async (receipt: AdmissionCollectionReceipt) => {
    if (!access.canViewReceipts || receiptBusy) return;
    setReceiptBusy(receipt.id);
    try {
      const blob = await downloadReceipt({
        receiptId: receipt.id,
        receiptType: receipt.scope ?? 'fee',
      }).unwrap();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      try {
        anchor.href = url;
        anchor.download = `${receipt.receiptNumber.replace(/[\\/]/g, '-')}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
      } finally {
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      shikshaMitraToast.error({
        message:
          parseApiProblemDetail(error).detail || 'The receipt could not be downloaded. Retry.',
      });
    } finally {
      setReceiptBusy(undefined);
    }
  };
  const adapter: FeeCollectionAdapter = {
    contextKey: applicationId,
    data: form.currentData,
    isLoading: form.isLoading,
    isFetching: form.isFetching,
    error: form.error,
    refetch: form.refetch,
    collect: (input) => {
      if (!access.canCollect)
        return Promise.reject(collectionGuardError(403, 'Fee collection access is unavailable.'));
      if (
        (disabled || state?.isSettled) &&
        (!input.idempotencyKey || !attemptedPayments.current.has(input.idempotencyKey))
      )
        return Promise.reject(
          collectionGuardError(
            409,
            'Fee details must be refreshed before recording another payment.'
          )
        );
      // A lost response may already be committed. Replaying the same Finance command
      // stays safe even when the parent read needs recovery; a new payment remains blocked.
      if (input.idempotencyKey) attemptedPayments.current.add(input.idempotencyKey);
      return collect({ applicationId, input }).unwrap();
    },
    isCollecting: collecting.isLoading,
    canViewReceipts: access.canViewReceipts,
    downloadReceiptPdf: (receiptId, receiptType) => {
      if (!access.canViewReceipts)
        return Promise.reject(new Error('Receipt access is unavailable.'));
      return downloadReceipt({ receiptId, receiptType }).unwrap();
    },
  };

  if (!applicationId || !access.canView) return null;
  const panelSx = {
    p: 2,
    minWidth: 0,
    ...(stretch ? { flex: 1 } : { border: 1, borderColor: 'divider', borderRadius: 1.5 }),
  };
  const header = (
    <FormSectionHeader
      icon={stretch ? 'mdi:receipt-text-outline' : undefined}
      title="Fee Collection"
      titleTypographyProps={{ component: 'h3', variant: stretch ? 'subtitle1' : 'subtitle2' }}
      descriptionTooltip={
        <Box sx={{ maxWidth: '11rem' }}>
          Partial payments are allowed. The collection form lists charges and late fees separately.
          Collecting later requires a reason.
        </Box>
      }
      descriptionTooltipLabel="Fee Collection Information"
    />
  );
  const renderActions = (action?: ReactNode) => {
    if (!footerAction && !action) return null;
    const actions = (
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
        {footerAction}
        {action}
      </Stack>
    );
    return actionsElement ? createPortal(actions, actionsElement) : actions;
  };
  if (summary.isLoading || (!state && summary.isFetching))
    return (
      <Stack spacing={1.5} useFlexGap sx={panelSx}>
        {header}
        <FeeCollectionSkeleton />
        {renderActions()}
      </Stack>
    );
  if (!state)
    return (
      <Stack component="section" aria-label="Fee Collection" spacing={1.5} useFlexGap sx={panelSx}>
        {header}
        <StudentFeedback notificationKey="STU-0332" presentation="toast" severity="error">
          Fee collection details could not be loaded.
        </StudentFeedback>
        <Button
          size="small"
          variant="outlined"
          onClick={() => summary.refetch()}
          sx={{ alignSelf: 'flex-start' }}
        >
          Retry
        </Button>
        {renderActions()}
      </Stack>
    );
  const amount = (value: number) => fCurrency(value, { currency: state.currency });
  const requiresVariableAmounts = Boolean(state.variableFeeHeads?.length);
  const collectionBlocker =
    stretch &&
    (state.blocker === 'Confirm a published fee structure before collecting fees.' ||
      state.blocker === REGISTRATION_JOINING_DATE_BLOCKER)
      ? null
      : state.blocker;
  const collectAction = state.isSettled ? (
    <Label color="success">Settled</Label>
  ) : (
    <Button
      type="button"
      size="small"
      variant="contained"
      startIcon={<Iconify icon="mdi:cash-plus" width={16} />}
      loading={preparing.isLoading || (joiningDate.saving && !savingJoiningDate)}
      disabled={
        disabled ||
        refreshingCollection ||
        savingJoiningDate ||
        !access.canCollect ||
        !canPrepare ||
        joiningDate.blocked ||
        summary.isError ||
        dialog.value ||
        variableAmounts.value
      }
      onClick={open}
      sx={{ flexShrink: 0 }}
    >
      {state.totalAmount === 0 && state.outstandingAmount === 0 && !requiresVariableAmounts
        ? 'Confirm No Payment Due'
        : 'Collect Fees'}
    </Button>
  );
  return (
    <Stack
      component="section"
      aria-label="Fee Collection"
      aria-busy={refreshingCollection}
      spacing={1.5}
      useFlexGap
      sx={panelSx}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
      >
        {header}
        {!stretch && collectAction}
      </Stack>
      {refreshingCollection && <FeeCollectionSkeleton refreshing />}
      <Stack
        spacing={1.5}
        useFlexGap
        sx={{
          flex: stretch ? 1 : undefined,
          minWidth: 0,
          display: refreshingCollection ? 'none' : 'flex',
        }}
      >
        {summary.isError && (
          <Stack alignItems="flex-start" spacing={1}>
            <StudentFeedback notificationKey="STU-0333" presentation="toast" severity="error">
              Fee collection details could not be refreshed. Retry before collecting fees.
            </StudentFeedback>
            <Button size="small" variant="outlined" onClick={() => summary.refetch()}>
              Retry
            </Button>
          </Stack>
        )}
        <PaymentCollectionSection
          framed={stretch}
          title="Payment Details"
          icon="mdi:calendar-range"
        >
          <Stack
            spacing={1.5}
            useFlexGap
            sx={{ width: 1, maxWidth: stretch ? undefined : '15rem' }}
          >
            <AdmissionJoiningDateField
              controller={joiningDate}
              compact={stretch}
              onDateCommit={earlyDateEntry ? saveEarlyDate : undefined}
              disabled={
                disabled ||
                refreshingCollection ||
                dialog.value ||
                variableAmounts.value ||
                preparing.isLoading ||
                savingJoiningDate
              }
            />
            {joiningDate.prorationPolicyEligible &&
              joiningDate.state?.canSelectProrationPolicy &&
              access.canOverridePolicies && (
                <CustomSelect<'value' | 'label', false>
                  label="Proration policy"
                  fullWidth
                  size="small"
                  value={joiningDate.selectedPolicyVersionId ?? NO_PRORATION_POLICY_OPTION}
                  options={[
                    ...(!joiningDate.state.defaultProrationPolicyVersionId
                      ? [{ value: NO_PRORATION_POLICY_OPTION, label: 'No policy · Full charge' }]
                      : []),
                    ...(joiningDate.state.prorationPolicies ?? []).map((policy) => ({
                      value: policy.policyVersionId,
                      label: `${policy.policyName} · v${policy.policyVersion}${policy.isDefault ? ' · Default' : ''}`,
                    })),
                  ]}
                  disabled={
                    disabled ||
                    joiningDate.state.isLocked ||
                    preparing.isLoading ||
                    dialog.value ||
                    variableAmounts.value
                  }
                  isLoading={joiningDate.query.isFetching}
                  isSearch={(joiningDate.state.prorationPolicies?.length ?? 0) > 6}
                  noOptionsMessage="No active proration policies are available for this academic year."
                  onChange={(value) => {
                    joiningDate.changePolicy(
                      value === NO_PRORATION_POLICY_OPTION ? null : String(value) || null
                    );
                  }}
                  helperText={
                    stretch ? undefined : 'Used to calculate fees from the actual joining date.'
                  }
                />
              )}
          </Stack>
          {(savingJoiningDate || (lastSavedDate && lastSavedDate === joiningDate.date)) &&
            !joiningDateSaveError && (
              <Typography variant="caption" color="text.secondary" role="status">
                {savingJoiningDate ? 'Saving joining date…' : 'Joining date saved.'}
              </Typography>
            )}
          {joiningDateSaveError && (
            <StudentFeedback
              notificationKey="admission-joining-date-save"
              presentation="persistent"
              severity="error"
            >
              {joiningDateSaveError}
              {earlyDateEntry && joiningDate.canSaveDate && !disabled && (
                <Button size="small" onClick={() => saveEarlyDate(joiningDate.value)}>
                  Retry
                </Button>
              )}
            </StudentFeedback>
          )}
        </PaymentCollectionSection>
        {joiningDate.preview &&
          (joiningDate.preview.proration || joiningDate.preview.prorationPolicy) && (
            <Label sx={{ alignSelf: 'flex-end' }}>Preview</Label>
          )}
        {prorationResult && <FeeProrationResult result={prorationResult} compact={stretch} />}
        {feeCalculationReady && prorationResult && prorationPolicy?.source === 'FinanceDefault' && (
          <Typography variant="caption" color="text.secondary">
            Finance default for {state?.academicYear?.name ?? 'this academic year'}.
          </Typography>
        )}
        {!prorationResult && prorationPolicy ? (
          <DetailSection
            title="Proration policy"
            icon="mdi:calendar-range"
            helpText="Finance applies the active academic-year default. The policy and version shown here are the ones used for this fee calculation."
          >
            <DetailGrid>
              <DetailField
                label={
                  prorationPolicy.source === 'FinanceDefault' ? 'Finance default' : 'Policy used'
                }
                value={`${prorationPolicy.policyName} · v${prorationPolicy.policyVersion}`}
                secondary={
                  prorationPolicy.source === 'FinanceDefault'
                    ? `Default for ${state?.academicYear?.name ?? 'this academic year'}`
                    : undefined
                }
              />
            </DetailGrid>
            <Typography variant="caption" color="text.secondary">
              {feeCalculationReady
                ? 'No joining-date reduction applies to this fee calculation.'
                : 'Finance uses this default when preparing fees; its effect depends on the joining date and fee-head schedule.'}
            </Typography>
          </DetailSection>
        ) : !prorationResult && feeCalculationReady ? (
          <StudentFeedback notificationKey="STU-0340" presentation="inline" severity="info">
            {joiningDate.date &&
            joiningDate.state?.academicYearStartDate &&
            !joiningDate.prorationPolicyEligible ? (
              'Full fees apply because the joining date is on or before the school start date.'
            ) : (
              <>
                No active default proration policy is configured for this academic year. Fees use
                the existing full-charge treatment.
              </>
            )}
          </StudentFeedback>
        ) : null}
        <PaymentCollectionSection
          framed={stretch}
          collapsible
          title="Payment Summary"
          icon="mdi:cash-multiple"
          help="Shows calculated fees, confirmed payments and the remaining fee balance."
        >
          <Box
            component="dl"
            sx={{
              m: 0,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
              gap: stretch ? 0 : 1.5,
            }}
          >
            {[
              [
                'Scheduled fees',
                joiningDate.state?.canPreview
                  ? (joiningDate.preview?.totalAmount ?? null)
                  : state.totalAmount,
              ],
              ['Confirmed payments', state.confirmedPaidAmount],
              [
                'Fee balance',
                joiningDate.state?.canPreview
                  ? (joiningDate.preview?.totalAmount ?? null)
                  : state.outstandingAmount,
              ],
            ].map(([title, value], index) => (
              <Box
                key={title}
                sx={{
                  minWidth: 0,
                  ...(stretch && {
                    pr: { sm: 1.5 },
                    py: 1,
                    ...(index > 0 && {
                      pl: { sm: 1.5 },
                      borderTop: { xs: 1, sm: 0 },
                      borderInlineStart: { sm: 1 },
                      borderColor: 'divider',
                    }),
                  }),
                }}
              >
                <Typography component="dt" variant="caption" color="text.secondary">
                  {title}
                </Typography>
                <Typography
                  component="dd"
                  variant="subtitle1"
                  sx={{ m: 0, overflowWrap: 'anywhere' }}
                >
                  {requiresVariableAmounts && title !== 'Confirmed payments' ? (
                    'Set Variable Amounts'
                  ) : value == null && stretch ? (
                    <Typography component="span" variant="body2" color="text.secondary">
                      Not calculated
                    </Typography>
                  ) : value == null ? (
                    <Box component="span" aria-label="Not Calculated">
                      —
                    </Box>
                  ) : (
                    amount(Number(value))
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        </PaymentCollectionSection>
        {!stretch && !state.isSettled && (
          <Typography variant="caption" color="text.secondary">
            Charges and late fees are shown separately in the collection form.
          </Typography>
        )}
        {state.pendingVerificationAmount > 0 && (
          <StudentFeedback notificationKey="STU-0334" presentation="persistent" severity="warning">
            {amount(state.pendingVerificationAmount)} is awaiting Finance verification. It is shown
            separately from confirmed payments.
          </StudentFeedback>
        )}
        {collectionBlocker &&
          !joiningDate.state?.canPreview &&
          (stretch ? (
            <Stack direction="row" spacing={1} alignItems="flex-start" role="status">
              <Iconify
                icon="mdi:information-outline"
                width={18}
                sx={{ color: 'info.main', flexShrink: 0 }}
              />
              <Typography variant="body2" color="text.secondary">
                {collectionBlocker}
              </Typography>
            </Stack>
          ) : (
            <StudentFeedback notificationKey="STU-0336" presentation="persistent" severity="info">
              {collectionBlocker}
            </StudentFeedback>
          ))}
        {!access.canCollect && !state.isSettled && (
          <Typography variant="caption" color="text.secondary">
            An authorized fee collection user can record payments here.
          </Typography>
        )}
        {openingError && (
          <StudentFeedback notificationKey="STU-0337" presentation="persistent" severity="error">
            {openingError}
          </StudentFeedback>
        )}
        {((access.canViewReceipts && Boolean(state.receipts.length)) ||
          !state.hasPaymentEvidence) && (
          <PaymentCollectionSection
            framed={stretch}
            collapsible
            title="Payment History"
            icon="mdi:receipt-text-outline"
            help="Shows recorded payments and receipts available to you."
          >
            {access.canViewReceipts && Boolean(state.receipts.length) && (
              <CustomizableTable
                tableId="admission-fee-collection-receipts"
                tableTitle="Receipts"
                data={state.receipts}
                isSearch={false}
                isFilter={false}
                isPagination={false}
                isShowedDense={false}
                showToolbar={false}
                wrapperProps={{ sx: { minWidth: 0, minHeight: 0 } }}
                tableContainerProps={{ sx: { minWidth: 0 }, 'aria-label': 'Fee Receipts' }}
                columns={[
                  {
                    id: 'receiptNumber',
                    label: 'Receipt',
                    filterType: 'string' as const,
                    isFilter: true,
                    isSort: false,
                    minWidth: 140,
                  },
                  {
                    id: 'collectedAt',
                    label: 'Collected',
                    filterType: 'date' as const,
                    isFilter: true,
                    isSort: false,
                    minWidth: 160,
                    render: (value) => fDateTime(value, ADMISSION_DATE_TIME_FORMAT),
                  },
                  {
                    id: 'amount',
                    label: 'Amount',
                    filterType: 'number' as const,
                    align: 'right',
                    isFilter: true,
                    isSort: false,
                    render: (value) => amount(Number(value)),
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    filterType: 'string' as const,
                    isFilter: true,
                    isSort: false,
                    render: (value) => (
                      <Label
                        color={
                          value === 'confirmed'
                            ? 'success'
                            : value === 'reversed'
                              ? 'default'
                              : 'warning'
                        }
                      >
                        {value === 'confirmed'
                          ? 'Confirmed'
                          : value === 'reversed'
                            ? 'Reversed'
                            : 'Awaiting Verification'}
                      </Label>
                    ),
                  },
                  {
                    id: 'actions',
                    label: 'Receipt',
                    isFilter: false,
                    isSort: false,
                    excludeFromExport: true,
                    sticky: true,
                    render: (_, row) => (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="mdi:download" width={16} />}
                        disabled={Boolean(receiptBusy)}
                        loading={receiptBusy === row.id}
                        aria-label={`Download Receipt ${row.receiptNumber}`}
                        onClick={() => download(row as AdmissionCollectionReceipt)}
                      >
                        Download
                      </Button>
                    ),
                  },
                ]}
              />
            )}
            {!state.hasPaymentEvidence &&
              (stretch ? (
                <EmptyContent
                  title={
                    <Stack component="span" spacing={1.5} alignItems="center">
                      <Iconify
                        icon="mdi:receipt-text-outline"
                        width={24}
                        sx={{ color: 'text.disabled' }}
                      />
                      <Typography component="span" variant="body2" color="text.secondary">
                        No payments recorded yet.
                      </Typography>
                    </Stack>
                  }
                  sx={{ flexGrow: 0, height: 'auto', py: 2 }}
                  slotProps={{ img: { display: 'none' }, title: { mt: 0 } }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No payments recorded yet.
                </Typography>
              ))}
          </PaymentCollectionSection>
        )}
      </Stack>
      {stretch && renderActions(collectAction)}
      {variableAmounts.value && state.variableFeeHeads && (
        <AdmissionFeePreparationDialog
          key={applicationId}
          applicantName={state.applicantName}
          heads={state.variableFeeHeads}
          busy={preparing.isLoading}
          previewContext={
            joiningDate.state?.canPreview
              ? {
                  applicationId,
                  joiningDate: joiningDate.date,
                  ...(joiningDate.state.canSelectProrationPolicy &&
                    joiningDate.prorationPolicyEligible && {
                      prorationPolicyVersionId: joiningDate.selectedPolicyVersionId,
                    }),
                }
              : undefined
          }
          onClose={() => {
            if (preparing.isLoading) return;
            variableAmounts.onFalse();
            onOpenChange?.(false);
          }}
          onSubmit={prepareAndOpen}
        />
      )}
      <CustomDialog
        open={dialog.value}
        title={`Collect Fees · ${state.applicantName}`}
        titleInfo="Review the applicant's current dues and payment details before recording collection through Finance."
        fullScreen
        hasForm={false}
        transitionDuration={{ enter: 0, exit: 0 }}
        handleClose={requestClose}
        disableClose={formBusy || collecting.isLoading}
        guardUnsavedChanges={false}
      >
        {dialog.value && (
          <FeeCollectComponentForm
            student={null}
            academicYear={state.academicYear}
            collectionAdapter={adapter}
            onBusyChange={setFormBusy}
            onDirtyChange={setFormDirty}
            onCancel={(_event, submitted) => (submitted ? close() : requestClose())}
          />
        )}
      </CustomDialog>
      {closeGuard.confirmation}
    </Stack>
  );
}
