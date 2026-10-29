'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { LoadingButton } from 'src/components/loading-button';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { Box, Stack, Divider, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { allocatePayment, selectedChargesInOrder } from './paymentAllocationUtils';

import type { IFeeCharge, IStudentFee, FeeCollectionFormValues } from '../../Components/type';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FinalPaymentReviewDialogProps {
  open: boolean;
  onClose: () => void;
  /** Accept payment; only cash settles immediately. Non-cash awaits finance verification. */
  onConfirmCollect: () => void;
  /** Called for non-CASH "Save as Pending Verification" */
  onSavePending: () => void;
  loading?: boolean;
  formValues: FeeCollectionFormValues;
  student: IStudentFee | null;
  feeHeadMap: Record<string, string>;
  chargesData: IFeeCharge[];
  bankAccounts?: { id: string; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parsePaidAmount = (raw: string | number): number => {
  const n = Number(String(raw || 0).replace(/[₹,\s]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

const isCashPayment = (method: string): boolean => method?.toLowerCase() === 'cash';

const isChequeOrDemandDraft = (method: string): boolean => {
  const normalizedMethod = method?.toLowerCase().trim() || '';
  return (
    normalizedMethod === 'cheque' ||
    normalizedMethod.includes('demand draft') ||
    normalizedMethod === 'dd'
  );
};

const formatDetailValue = (
  key: string,
  value: any,
  bankAccounts?: { id: string; name: string }[]
): string => {
  if (!value) return '';
  if (key === 'bankAccount' && bankAccounts) {
    const found = bankAccounts.find((acc) => acc.id === value);
    if (found) return found.name;
  }
  if (dayjs.isDayjs(value)) return dayjs(value).format('DD/MM/YYYY');
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))
    return dayjs(value).format('DD/MM/YYYY');
  if (key.toLowerCase().includes('date')) {
    const d = dayjs(value);
    if (d.isValid()) {
      return d.format('DD/MM/YYYY');
    }
  }
  return String(value);
};

// ─── Component ────────────────────────────────────────────────────────────────

const FinalPaymentReviewDialog = ({
  open,
  onClose,
  onConfirmCollect,
  onSavePending,
  loading = false,
  formValues,
  student,
  feeHeadMap,
  chargesData,
  bankAccounts,
}: FinalPaymentReviewDialogProps) => {
  const handleAccept = () => {
    if (loading) return;
    onConfirmCollect();
  };
  const handlePending = () => {
    if (loading) return;
    onSavePending();
  };

  const { paymentMethod } = formValues.payment;
  const isCash = isCashPayment(paymentMethod);
  const paidAmount = useMemo(
    () => parsePaidAmount(formValues.payment.amount),
    [formValues.payment.amount]
  );

  const detailEntries = useMemo(
    () => Object.entries(formValues.payment.details ?? {}).filter(([, v]) => Boolean(v)),
    [formValues.payment.details]
  );

  const { allocatedRows, unallocatedAmount } = useMemo(
    () =>
      allocatePayment(
        formValues.selectedItems,
        selectedChargesInOrder(chargesData, formValues.charges),
        feeHeadMap,
        paidAmount
      ),
    [formValues.selectedItems, formValues.charges, chargesData, feeHeadMap, paidAmount]
  );

  const paymentSummary = (
    <Stack spacing={2.5}>
      <Stack
        component="ul"
        aria-label="Payment breakdown"
        spacing={2}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {allocatedRows.map((row) => (
          <Stack
            key={row.key}
            component="li"
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            spacing={2}
          >
            <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <Typography variant="body1">
                {row.type === 'fee' ? row.feeHeadName : row.chargeName}
              </Typography>
              {row.type === 'fee' && allocatedRows.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  {row.installmentLabel || row.period}
                </Typography>
              )}
            </Box>
            <Typography variant="body1" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(row.paidAmount, 'INR')}
            </Typography>
          </Stack>
        ))}
        {unallocatedAmount > 0 && (
          <Stack component="li" direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Unallocated amount
            </Typography>
            <Typography variant="body2">{formatNumber(unallocatedAmount, 'INR')}</Typography>
          </Stack>
        )}
      </Stack>

      <Divider />

      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="body1">Total · {paymentMethod}</Typography>
        <Typography
          variant="h3"
          sx={{
            overflowWrap: 'anywhere',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatNumber(paidAmount, 'INR')}
        </Typography>
      </Stack>
    </Stack>
  );

  if (isCash) {
    return (
      <CustomDialog
        open={open}
        handleClose={onClose}
        disableClose={loading}
        guardUnsavedChanges={false}
        maxWidth="sm"
        hasForm={false}
        title="Review Cash Payment"
        titleInfo="Review the student and allocated amounts before collecting cash and issuing an official receipt."
        paperProps={{ sx: { backgroundImage: 'none' } }}
      >
        <DialogScrollContent>
          <Stack spacing={2.5}>
            <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <Typography variant="subtitle1">
                {student?.name || formValues.studentName || 'Student'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {[student?.className, student?.division].filter(Boolean).join(' ')}
                {student?.className || student?.division ? ' · ' : ''}
                Roll #{student?.rollNumber || '—'}
              </Typography>
            </Box>

            <Divider />

            {paymentSummary}
          </Stack>
        </DialogScrollContent>

        <DialogActions sx={{ p: 2, flexShrink: 0 }}>
          {/* Full width is scoped to the supplied cash-review reference; keep theme button sizing. */}
          <LoadingButton
            type="button"
            variant="contained"
            color="inherit"
            size="small"
            fullWidth
            loading={loading}
            disabled={loading}
            loadingPosition="start"
            startIcon={<Iconify icon="mdi:receipt-text-check-outline" width={18} />}
            onClick={handleAccept}
          >
            Collect &amp; issue receipt
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    );
  }

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      disableClose={loading}
      guardUnsavedChanges={false}
      maxWidth="sm"
      hasForm={false}
      title="Payment Verification"
      titleInfo="Review the payment and reference details before recording a provisional receipt for finance verification."
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <Typography variant="subtitle1">
              {student?.name || formValues.studentName || 'Student'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {[student?.className, student?.division].filter(Boolean).join(' ')}
              {student?.className || student?.division ? ' · ' : ''}
              Roll #{student?.rollNumber || '—'}
            </Typography>
          </Box>

          <FormSectionCard
            title="Payment Summary"
            icon={GlobalIcons.paymentSummary}
            descriptionTooltip="Fee and charge amounts allocated to this payment, in collection order."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            {paymentSummary}
          </FormSectionCard>

          {detailEntries.length > 0 && (
            <FormSectionCard
              title="Reference Details"
              icon={GlobalIcons.bankAccount}
              descriptionTooltip="The payment references, dates, and receiving bank account entered for verification."
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              sx={{ containerType: 'inline-size', boxShadow: 'none' }}
            >
              <DetailGrid>
                {detailEntries.map(([key, value]) => (
                  <DetailField
                    key={key}
                    label={key
                      .replace(/([A-Z])/g, ' $1')
                      .toLowerCase()
                      .replace(/^./, (s) => s.toUpperCase())}
                    value={formatDetailValue(key, value, bankAccounts)}
                  />
                ))}
              </DetailGrid>
            </FormSectionCard>
          )}

          <FormSectionCard
            title="Verification Status"
            icon={GlobalIcons.history}
            descriptionTooltip="When the provisional receipt becomes a linked official receipt."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            <Stack spacing={1}>
              <Typography variant="body2">
                {isChequeOrDemandDraft(paymentMethod)
                  ? 'Move to reconciliation'
                  : 'Payment verification required'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isChequeOrDemandDraft(paymentMethod)
                  ? 'A provisional receipt is generated immediately and appears in Receipts. The finance team issues a linked official receipt after clearance and approval in reconciliation.'
                  : 'A provisional receipt is generated immediately and appears in Receipts. Approval in reconciliation issues a linked official receipt.'}
              </Typography>
            </Stack>
          </FormSectionCard>
        </Stack>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, flexShrink: 0, justifyContent: 'flex-end' }}>
        <LoadingButton
          type="button"
          variant="contained"
          color="inherit"
          size="small"
          loading={loading}
          disabled={loading}
          loadingPosition="start"
          onClick={handlePending}
          startIcon={<Iconify icon={GlobalIcons.paymentSummary} width={18} />}
        >
          Record &amp; issue provisional receipt
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default FinalPaymentReviewDialog;
