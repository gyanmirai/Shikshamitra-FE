'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Tooltip, Divider, Typography } from '@mui/material';

import type { IStudentFee, FeeCollectionFormValues } from '../../Components/type';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FinalPaymentReviewDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called for immediate collection & receipt generation */
  onConfirmCollect: () => void;
  /** Called for non-CASH "Save as Pending Verification" */
  onSavePending: () => void;
  loading?: boolean;
  formValues: FeeCollectionFormValues;
  student: IStudentFee | null;
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
  bankAccounts,
}: FinalPaymentReviewDialogProps) => {
  const theme = useTheme();

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

  const feeHeadCount = formValues.selectedItems.length;
  const chargeCount = formValues.charges.length;

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="sm"
      hasForm={false}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2} color="text.primary">
              {isCash ? 'Confirm Cash Payment' : 'Payment Verification'}
            </Typography>
          </Box>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="Finalize collection and generate receipt"
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
    >
      <Scrollbar sx={{ maxHeight: 'calc(100dvh - 260px)', px: 2.5, pt: 1.5, pb: 1 }}>
        <Stack spacing={2.5}>
          {/* ── Payment Summary Card ── */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              // bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            {/* Student */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:user-bold" width={18} sx={{ color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {student?.name ?? 'Student'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {student?.className} {student?.division} • Roll #{student?.rollNumber}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Amount & Method */}
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  ₹{formatNumber(paidAmount)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Payment Mode
                </Typography>
                <Label color={isCash ? 'success' : 'info'} variant="soft">
                  {paymentMethod}
                </Label>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Fee Heads
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {feeHeadCount} item{feeHeadCount !== 1 ? 's' : ''}
                  {chargeCount > 0 ? ` + ${chargeCount} charge${chargeCount !== 1 ? 's' : ''}` : ''}
                </Typography>
              </Box>
            </Stack>

            {/* Reference Details (non-cash) */}
            {!isCash && detailEntries.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={600}
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    fontSize: '10px',
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Reference Details
                </Typography>
                <Stack spacing={0.75}>
                  {detailEntries.map(([key, value]) => (
                    <Box key={key} display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {formatDetailValue(key, value, bankAccounts)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Box>

          {/* ── Status Preview ── */}
          {!isCash && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(
                  theme.palette[isChequeOrDemandDraft(paymentMethod) ? 'info' : 'warning'].main,
                  0.06
                ),
                border: `1px dashed ${alpha(
                  theme.palette[isChequeOrDemandDraft(paymentMethod) ? 'info' : 'warning'].main,
                  0.3
                )}`,
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                <Iconify
                  icon={
                    isChequeOrDemandDraft(paymentMethod)
                      ? 'solar:inbox-archive-bold'
                      : 'solar:info-circle-bold'
                  }
                  width={20}
                  sx={{
                    color: isChequeOrDemandDraft(paymentMethod) ? 'info.main' : 'warning.main',
                    mt: 0.25,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color={isChequeOrDemandDraft(paymentMethod) ? 'info.dark' : 'warning.dark'}
                    mb={0.5}
                  >
                    {isChequeOrDemandDraft(paymentMethod)
                      ? 'Move to Reconciliation'
                      : 'Payment Verification Required'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" lineHeight={1.6}>
                    {isChequeOrDemandDraft(paymentMethod)
                      ? 'This payment will be moved to reconciliation. The finance team will verify and generate the receipt once the cheque/demand draft is cleared.'
                      : 'Non-cash payments require verification before a receipt is generated. You can either confirm immediately or save for later verification by the finance team.'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </Scrollbar>

      {/* ── Footer Actions ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          // bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(8px)',
        }}
      >
        {isCash ? (
          /* ── CASH: Single action ── */
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Tooltip describeChild title="Collect cash payment and generate receipt immediately">
              <LoadingButton
                variant="contained"
                color="success"
                loading={loading}
                onClick={onConfirmCollect}
                startIcon={<Iconify icon="solar:bill-check-bold" />}
                size="small"
                sx={{ fontWeight: 700 }}
              >
                Final Submit &amp; Generate Receipt
              </LoadingButton>
            </Tooltip>
          </Stack>
        ) : isChequeOrDemandDraft(paymentMethod) ? (
          /* ── CHEQUE/DEMAND DRAFT: Single action for reconciliation ── */
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Tooltip
              describeChild
              title="Move payment to reconciliation - receipt will be generated after verification by finance team"
            >
              <LoadingButton
                variant="contained"
                color="warning"
                loading={loading}
                onClick={onSavePending}
                startIcon={<Iconify icon="ic:round-arrow-forward" />}
                size="small"
                sx={{ fontWeight: 600 }}
              >
                Move to Reconciliation
              </LoadingButton>
            </Tooltip>
          </Stack>
        ) : (
          /* ── OTHER NON-CASH: Two actions ── */
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} flexWrap="wrap">
            <Tooltip
              describeChild
              title="Save payment as pending - receipt will be generated after verification by finance team"
            >
              <LoadingButton
                variant="contained"
                color="warning"
                loading={loading}
                onClick={onSavePending}
                startIcon={<Iconify icon="ic:round-arrow-forward" />}
                size="small"
                sx={{ fontWeight: 600 }}
              >
                Move to Reconciliation
              </LoadingButton>
            </Tooltip>

            <Tooltip describeChild title="Accept this payment immediately and generate receipt now">
              <LoadingButton
                variant="contained"
                color="success"
                loading={loading}
                onClick={onConfirmCollect}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
                size="small"
                sx={{ fontWeight: 700 }}
              >
                Accept &amp; Confirm
              </LoadingButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    </CustomDialog>
  );
};

export default FinalPaymentReviewDialog;
