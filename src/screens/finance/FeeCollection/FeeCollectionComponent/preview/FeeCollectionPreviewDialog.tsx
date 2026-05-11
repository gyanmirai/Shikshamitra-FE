'use client';

import { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Button, Divider, Typography } from '@mui/material';

import PaymentInfoPreview from './PaymentInfoPreview';
import { allocatePayment } from './paymentAllocationUtils';
import StudentInfoPreviewCard from './StudentInfoPreviewCard';
import AllocationPreviewTable from './AllocationPreviewTable';

import type { IFeeCharge, IStudentFee, FeeCollectionFormValues } from '../../Components/type';

// ─── Re-export types so consumers can import from one place ────────────────────
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
  academicYear?: string;
  feeStructureName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parsePaidAmount = (raw: string | number): number => {
  const n = Number(String(raw || 0).replace(/[₹,\s]/g, ''));
  return Number.isNaN(n) ? 0 : n;
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
  academicYear,
  feeStructureName,
}: FeeCollectionPreviewDialogProps) => {
  // ── Derived values ─────────────────────────────────────────────────────────
  const paidAmount = useMemo(
    () => parsePaidAmount(formValues.payment.amount),
    [formValues.payment.amount]
  );

  const selectedCharges = useMemo(
    () => chargesData.filter((c) => formValues.charges.includes(c.chargeId)),
    [chargesData, formValues.charges]
  );
  // ── Allocation (pure, memoised) ────────────────────────────────────────────
  const { allocatedRows, allocatedAmount, unallocatedAmount } = useMemo(
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
        <Box display="flex" alignItems="center" gap={1}>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Payment Preview
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Review fee details before confirming collection
            </Typography>
          </Box>
        </Box>
      }
    >
      <Scrollbar sx={{ maxHeight: 'calc(100dvh - 220px)', px: 2, py: 1.5 }}>
        <Stack spacing={1.5}>
          {/* Student Info */}
          <StudentInfoPreviewCard
            student={student}
            academicYear={academicYear}
            feeStructureName={feeStructureName}
          />

          {/* Summary Cards */}
          {/* <PaymentSummaryCards
                        allocatedAmount={allocatedAmount}
                        unallocatedAmount={unallocatedAmount}
                    /> */}

          {/* Allocation Breakdown Table */}
          <AllocationPreviewTable allocatedRows={allocatedRows} />

          {/* Payment Method & Remarks */}
          <PaymentInfoPreview payment={formValues.payment} remarks={formValues.remarks} />
        </Stack>
      </Scrollbar>

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            flex: 1,
            px: 2,
            py: 1,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" color="primary.contrastText" fontWeight={700}>
            Collecting Today
          </Typography>
          <Typography variant="subtitle1" color="primary.contrastText" fontWeight={800}>
            ₹{formatNumber(paidAmount)}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            disabled={loading}
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="primary"
            size="small"
            loading={loading}
            onClick={onConfirm}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            Confirm &amp; Collect Fee
          </LoadingButton>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default FeeCollectionPreviewDialog;
