'use client';

import { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';

import { Box, Card, Stack, Button, Typography } from '@mui/material';

import PaymentInfoPreview from './PaymentInfoPreview';
import StudentInfoPreviewCard from './StudentInfoPreviewCard';
import AllocationPreviewTable from './AllocationPreviewTable';
import { allocatePayment, selectedChargesInOrder } from './paymentAllocationUtils';

import type { IFeeCharge, IStudentFee, FeeCollectionFormValues } from '../../Components/type';

// ─── Re-export types so consumers can import from one place ───────────────────
export type { AllocatedRow, AllocatedFeeRow, AllocatedChargeRow } from './paymentAllocationUtils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FeeCollectionPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  formValues: FeeCollectionFormValues;
  student: IStudentFee | null;
  chargesData: IFeeCharge[];
  feeHeadMap: Record<string, string>;
  preserveAllocationOrder?: boolean;
  academicYear?: string;
  feeStructureName?: string;
  bankAccounts?: { id: string; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parsePaidAmount = (raw: string | number): number => {
  const n = Number(String(raw || 0).replace(/[₹,\s]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

// ─── Hero Payment Section ─────────────────────────────────────────────────────

interface HeroSectionProps {
  paidAmount: number;
  paymentMethod?: string;
  selectedItems: { period?: string; feeHeadId?: string }[];
}

const HeroSection = ({ paidAmount, paymentMethod, selectedItems }: HeroSectionProps) => {
  const theme = useTheme();

  // derive unique months for subtitle
  const uniquePeriods = useMemo(() => {
    const seen = new Set<string>();
    return selectedItems.reduce<string[]>((acc, item) => {
      if (item.period && !seen.has(item.period)) {
        seen.add(item.period);
        acc.push(item.period);
      }
      return acc;
    }, []);
  }, [selectedItems]);

  const feeHeadCount = new Set(selectedItems.map((item) => item.feeHeadId).filter(Boolean)).size;

  return (
    <Card
      sx={{
        p: 1,
        borderRadius: 1.5,
        textAlign: 'center',
        boxShadow: 'var(--shadows-4)',
      }}
    >
      {/* Label */}
      <Typography
        variant="caption"
        color="text.disabled"
        fontWeight={600}
        sx={{
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: '10px',
          display: 'block',
          mb: 1,
        }}
      >
        Collecting Today
      </Typography>

      {/* Hero Amount */}
      <Typography
        variant="h3"
        fontWeight={800}
        sx={{
          fontSize: { xs: '2.4rem', sm: '3rem' },
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
          fontVariantNumeric: 'tabular-nums',
          mb: 1.5,
        }}
      >
        ₹{formatNumber(paidAmount)}
      </Typography>

      {/* Divider */}
      <Box
        sx={{
          height: '1px',
          maxWidth: 200,
          mx: 'auto',
          mb: 1.5,
        }}
      />

      {/* Metadata */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1.5}
        flexWrap="wrap"
      >
        {paymentMethod && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:card-bold" width={13} />
            <Typography variant="caption" fontWeight={600}>
              via {paymentMethod}
            </Typography>
          </Stack>
        )}

        {feeHeadCount > 0 && (
          <>
            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.3),
              }}
            />
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:bill-list-bold" width={13} />
              <Typography variant="caption" fontWeight={600}>
                {feeHeadCount} fee {feeHeadCount === 1 ? 'head' : 'heads'}
              </Typography>
            </Stack>
          </>
        )}

        {uniquePeriods.length > 0 && (
          <>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%' }} />
            <Typography variant="caption" fontWeight={600}>
              {uniquePeriods.length === 1 ? uniquePeriods[0] : `${uniquePeriods.length} months`}
            </Typography>
          </>
        )}
      </Stack>
    </Card>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const FeeCollectionPreviewDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  formValues,
  student,
  chargesData,
  feeHeadMap,
  preserveAllocationOrder,
  academicYear,
  feeStructureName,
  bankAccounts,
}: FeeCollectionPreviewDialogProps) => {
  const theme = useTheme();

  // ── Derived values ─────────────────────────────────────────────────────────
  const paidAmount = useMemo(
    () => parsePaidAmount(formValues.payment.amount),
    [formValues.payment.amount]
  );

  const selectedCharges = useMemo(
    () => selectedChargesInOrder(chargesData, formValues.charges),
    [chargesData, formValues.charges]
  );

  // ── Allocation (pure, memoised) ────────────────────────────────────────────
  const { allocatedRows } = useMemo(
    () => allocatePayment(formValues.selectedItems, selectedCharges, feeHeadMap, paidAmount),
    [formValues.selectedItems, selectedCharges, feeHeadMap, paidAmount]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="md"
      hasForm={false}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">Payment Details</Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="You can update the payment details including amount and method."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
    >
      <Scrollbar sx={{ maxHeight: 'calc(100dvh - 220px)', px: 2.5, pt: 1, pb: 0.5 }}>
        <Stack spacing={2}>
          {/* ── Hero Payment Section ── */}
          <HeroSection
            paidAmount={paidAmount}
            paymentMethod={formValues.payment.paymentMethod}
            selectedItems={formValues.selectedItems}
          />

          {/* ── Student Info ── */}
          <StudentInfoPreviewCard
            student={student}
            academicYear={academicYear}
            feeStructureName={feeStructureName}
          />

          {/* ── Allocation Breakdown ── */}
          <AllocationPreviewTable
            allocatedRows={allocatedRows}
            preserveOrder={preserveAllocationOrder}
          />

          {/* ── Payment Method & Remarks ── */}
          <PaymentInfoPreview
            payment={formValues.payment}
            remarks={formValues.remarks}
            bankAccounts={bankAccounts}
          />
        </Stack>
      </Scrollbar>

      {/* ── Sticky Footer ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
          // bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box display="flex" gap={1} flexShrink={0}>
          <Button
            variant="outlined"
            color="inherit"
            disabled={loading}
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
          >
            Cancel
          </Button>

          <LoadingButton
            variant="contained"
            loading={loading}
            onClick={onConfirm}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            size="small"
          >
            Confirm &amp; Collect Fee
          </LoadingButton>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default FeeCollectionPreviewDialog;
