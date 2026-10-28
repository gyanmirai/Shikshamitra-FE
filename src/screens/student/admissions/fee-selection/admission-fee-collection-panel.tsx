'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { FeeCollectionAdapter } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm';
import type {
  AdmissionVariableFeeHead,
  AdmissionCollectionReceipt,
} from 'src/redux/student/admissions/admission-fee-collection-types';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { fCurrency } from 'src/utils/format-number';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { useRef, useState, useEffect, useCallback } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Stack, Button, Skeleton, IconButton, Typography } from '@mui/material';
import { useDownloadReceiptPdfMutation } from 'src/redux/feeCollection/feeCollection';
import FeeProrationResult from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeProrationResult';
import FeeCollectComponentForm from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm';
import {
  useCollectAdmissionFeeMutation,
  useGetAdmissionFeeCollectFormQuery,
  useGetAdmissionFeeCollectionSummaryQuery,
  usePrepareAdmissionFeeCollectionMutation,
} from 'src/redux/student/admissions/admission-fee-collection-api';

import { useAdmissionJoiningDate } from './use-admission-joining-date';
import { AdmissionJoiningDateField } from './admission-joining-date-field';
import { AdmissionFeePreparationDialog } from './admission-fee-preparation-dialog';
import { getAdmissionFeeCollectionAccess } from './admission-fee-collection-permissions';

type Props = {
  applicationId: string;
  disabled?: boolean;
  refreshing?: boolean;
  onOpenChange?: (open: boolean) => void;
  stretch?: boolean;
  footerAction?: ReactNode;
};

const collectionGuardError = (status: number, detail: string) =>
  Object.assign(new Error(detail), { status, data: { detail } });

function FeeCollectionSkeleton({ refreshing = false }: { refreshing?: boolean }) {
  return (
    <Stack
      role="status"
      aria-label={refreshing ? 'Refreshing fee collection' : 'Loading fee collection'}
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
  footerAction,
}: Props) {
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
  });
  const canPrepare = Boolean(state?.canCollect || joiningDate.state?.canPreview);
  const prepareAndOpen = async (variableFeeHeads: AdmissionVariableFeeHead[]) => {
    await joiningDate.confirm();
    const prepared = await prepare({ applicationId, variableFeeHeads }).unwrap();
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
    border: 1,
    borderColor: 'divider',
    borderRadius: 1.5,
    minWidth: 0,
    ...(stretch && { flex: 1, minHeight: 0 }),
  };
  if (summary.isLoading || (!state && summary.isFetching))
    return (
      <Stack spacing={1.5} useFlexGap sx={panelSx}>
        <Typography variant="subtitle2" component="h3">
          Fee collection
        </Typography>
        <FeeCollectionSkeleton />
        {footerAction && <Box sx={{ mt: 'auto', alignSelf: 'flex-end' }}>{footerAction}</Box>}
      </Stack>
    );
  if (!state)
    return (
      <Stack component="section" aria-label="Fee collection" spacing={1.5} useFlexGap sx={panelSx}>
        <Typography variant="subtitle2">Fee collection</Typography>
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
        {footerAction && <Box sx={{ mt: 'auto' }}>{footerAction}</Box>}
      </Stack>
    );
  const amount = (value: number) => fCurrency(value, { currency: state.currency });
  const requiresVariableAmounts = Boolean(state.variableFeeHeads?.length);
  const collectAction = state.isSettled ? (
    <Label color="success">Settled</Label>
  ) : (
    <Button
      type="button"
      size="small"
      variant="contained"
      startIcon={<Iconify icon="mdi:cash-plus" width={16} />}
      loading={preparing.isLoading || joiningDate.saving}
      disabled={
        disabled ||
        refreshingCollection ||
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
        ? 'Confirm no payment due'
        : 'Collect fees'}
    </Button>
  );
  return (
    <Stack
      component="section"
      aria-label="Fee collection"
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
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="subtitle2" component="h3">
            Fee collection
          </Typography>
          {stretch && (
            <CustomTooltip title="Partial collection is allowed. Charges and late fees are shown separately in the collection form. Collect later opens a required-reason dialog.">
              <IconButton
                size="small"
                color="info"
                aria-label="Fee collection information"
                sx={{ width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } }}
              >
                <Iconify icon="mdi:information-outline" width={16} />
              </IconButton>
            </CustomTooltip>
          )}
        </Stack>
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
        <AdmissionJoiningDateField
          controller={joiningDate}
          disabled={
            disabled ||
            refreshingCollection ||
            dialog.value ||
            variableAmounts.value ||
            preparing.isLoading
          }
        />
        {joiningDate.preview?.proration && <Label sx={{ alignSelf: 'flex-end' }}>Preview</Label>}
        <FeeProrationResult
          result={joiningDate.state?.canPreview ? joiningDate.preview?.proration : state.proration}
        />
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            gap: 1.5,
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
          ].map(([title, value]) => (
            <Box key={title} sx={{ minWidth: 0 }}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {title}
              </Typography>
              <Typography
                component="dd"
                variant="subtitle1"
                sx={{ m: 0, overflowWrap: 'anywhere' }}
              >
                {requiresVariableAmounts && title !== 'Confirmed payments' ? (
                  'Set variable amounts'
                ) : value == null ? (
                  <Box component="span" aria-label="Not calculated">
                    —
                  </Box>
                ) : (
                  amount(Number(value))
                )}
              </Typography>
            </Box>
          ))}
        </Box>
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
        {state.blocker &&
          !joiningDate.state?.canPreview &&
          (stretch ? (
            <Stack direction="row" spacing={1} alignItems="flex-start" role="status">
              <Iconify
                icon="mdi:information-outline"
                width={18}
                sx={{ color: 'info.main', flexShrink: 0 }}
              />
              <Typography variant="body2" color="text.secondary">
                {state.blocker}
              </Typography>
            </Stack>
          ) : (
            <StudentFeedback notificationKey="STU-0336" presentation="persistent" severity="info">
              {state.blocker}
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
            tableContainerProps={{ sx: { minWidth: 0 }, 'aria-label': 'Fee receipts' }}
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
                render: (value) => fDateTime(value),
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
                        : 'Awaiting verification'}
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
                    aria-label={`Download receipt ${row.receiptNumber}`}
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
                    width={32}
                    sx={{ color: 'text.disabled' }}
                  />
                  <Typography component="span" variant="body2" color="text.secondary">
                    No payments recorded yet.
                  </Typography>
                </Stack>
              }
              sx={{ flex: 1, height: 'auto', py: 2 }}
              slotProps={{ img: { display: 'none' } }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              No payments recorded yet.
            </Typography>
          ))}
      </Stack>
      {stretch && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ mt: 'auto', pt: 1.5, borderTop: 1, borderColor: 'divider' }}
        >
          {footerAction}
          {collectAction}
        </Stack>
      )}
      {variableAmounts.value && state.variableFeeHeads && (
        <AdmissionFeePreparationDialog
          key={applicationId}
          applicantName={state.applicantName}
          heads={state.variableFeeHeads}
          busy={preparing.isLoading}
          previewContext={
            joiningDate.state?.canPreview
              ? { applicationId, joiningDate: joiningDate.date }
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
        fullScreen
        hasForm={false}
        transitionDuration={{ enter: 0, exit: 0 }}
        handleClose={close}
        disableClose={formBusy || collecting.isLoading}
        hasUnsavedChanges={formDirty}
      >
        {dialog.value && (
          <FeeCollectComponentForm
            student={null}
            academicYear={state.academicYear}
            collectionAdapter={adapter}
            onBusyChange={setFormBusy}
            onDirtyChange={setFormDirty}
            onCancel={close}
          />
        )}
      </CustomDialog>
    </Stack>
  );
}
