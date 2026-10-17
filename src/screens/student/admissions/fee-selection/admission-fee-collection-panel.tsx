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
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useDownloadReceiptPdfMutation } from 'src/redux/feeCollection/feeCollection';
import FeeCollectComponentForm from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm';
import {
  Box,
  Alert,
  Stack,
  Button,
  Skeleton,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useCollectAdmissionFeeMutation,
  useGetAdmissionFeeCollectFormQuery,
  useGetAdmissionFeeCollectionSummaryQuery,
  usePrepareAdmissionFeeCollectionMutation,
} from 'src/redux/student/admissions/admission-fee-collection-api';

import { AdmissionFeePreparationDialog } from './admission-fee-preparation-dialog';
import { getAdmissionFeeCollectionAccess } from './admission-fee-collection-permissions';

type Props = {
  applicationId: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  stretch?: boolean;
  footerAction?: ReactNode;
};

const collectionGuardError = (status: number, detail: string) =>
  Object.assign(new Error(detail), { status, data: { detail } });

export default function AdmissionFeeCollectionPanel({
  applicationId,
  disabled = false,
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
  const prepareAndOpen = async (variableFeeHeads: AdmissionVariableFeeHead[]) => {
    await prepare({ applicationId, variableFeeHeads }).unwrap();
    variableAmounts.onFalse();
    dialog.onTrue();
  };
  const open = async () => {
    if (
      opening.current ||
      preparing.isLoading ||
      disabled ||
      !access.canCollect ||
      state?.isSettled ||
      !state?.canCollect ||
      summary.isFetching ||
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
      <Stack
        role="status"
        aria-label="Loading fee collection"
        spacing={1.5}
        useFlexGap
        sx={panelSx}
      >
        <Skeleton variant="text" width={180} />
        <Skeleton variant="rounded" height={76} />
        {footerAction && <Box sx={{ mt: 'auto', alignSelf: 'flex-end' }}>{footerAction}</Box>}
      </Stack>
    );
  if (!state)
    return (
      <Stack component="section" aria-label="Fee collection" spacing={1.5} useFlexGap sx={panelSx}>
        <Typography variant="subtitle2">Fee collection</Typography>
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => summary.refetch()}>
              Retry
            </Button>
          }
        >
          Fee collection details could not be loaded.
        </Alert>
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
      loading={preparing.isLoading}
      disabled={
        disabled ||
        !access.canCollect ||
        !state.canCollect ||
        summary.isFetching ||
        summary.isError ||
        dialog.value ||
        variableAmounts.value
      }
      onClick={open}
      sx={{ flexShrink: 0 }}
    >
      Collect fees
    </Button>
  );
  return (
    <Stack component="section" aria-label="Fee collection" spacing={1.5} useFlexGap sx={panelSx}>
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
      <Stack spacing={1.5} useFlexGap sx={{ flex: stretch ? 1 : undefined, minWidth: 0 }}>
        {summary.isFetching && <LinearProgress aria-label="Refreshing fee collection" />}
        {summary.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => summary.refetch()}>
                Retry
              </Button>
            }
          >
            Fee collection details could not be refreshed. Retry before collecting fees.
          </Alert>
        )}
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
            ['Scheduled fees', state.totalAmount],
            ['Confirmed payments', state.confirmedPaidAmount],
            ['Fee balance', state.outstandingAmount],
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
          <Alert severity="warning">
            {amount(state.pendingVerificationAmount)} is awaiting Finance verification. It is shown
            separately from confirmed payments.
          </Alert>
        )}
        {state.blocker &&
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
            <Alert severity="info">{state.blocker}</Alert>
          ))}
        {!access.canCollect && !state.isSettled && (
          <Typography variant="caption" color="text.secondary">
            An authorized fee collection user can record payments here.
          </Typography>
        )}
        {openingError && <Alert severity="error">{openingError}</Alert>}
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
                isFilter: false,
                isSort: false,
                minWidth: 140,
              },
              {
                id: 'collectedAt',
                label: 'Collected',
                isFilter: false,
                isSort: false,
                minWidth: 160,
                render: (value) => fDateTime(value),
              },
              {
                id: 'amount',
                label: 'Amount',
                align: 'right',
                isFilter: false,
                isSort: false,
                render: (value) => amount(Number(value)),
              },
              {
                id: 'status',
                label: 'Status',
                isFilter: false,
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
