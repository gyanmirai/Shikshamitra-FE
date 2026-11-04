'use client';

import type { RootState } from 'src/redux/store';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { shikshaMitraToast } from 'src/components/toast';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { financePermissions } from 'src/constants/finance-menu';
import { formatNumber } from 'src/utils/formate_number';
import { useGetFeeAdjustmentQuery } from 'src/redux/finance/adjustments/adjustmentApi';
import type { ApplyAdjustmentDialogSubmitResult } from '../types/adjustmentApply.types';
import type { AdjustmentRequest } from '../types/adjustment.types';

import AdjustmentPreview from './AdjustmentPreview';
import AdjustmentStudentCard from './AdjustmentStudentCard';
import AdjustmentSummaryCards from './AdjustmentSummaryCards';
import { useApplyAdjustment } from '../hooks/useApplyAdjustment';
import { useFinancePermissions } from '../../hooks/useFinancePermissions';
import { mapDetailToAdjustmentRequest } from '../utils/mapAdjustmentDetail';
import { AdjustmentStatusEnum } from '../enums/adjustment.enum';

interface Props {
  approvedBy: string;
  adjustment: AdjustmentRequest | null;
  fromView?: boolean;
  onBack: () => void;
  onBusyChange?: (busy: boolean) => void;
  onApplied: (result: ApplyAdjustmentDialogSubmitResult) => void | Promise<void>;
}

export default function ApplyAdjustmentScreen({
  approvedBy,
  adjustment,
  fromView = false,
  onBack,
  onApplied,
  onBusyChange,
}: Props) {
  const access = useFinancePermissions(financePermissions.fees.adjustment);
  const actorId = useSelector((state: RootState) => state.auth.user?.sub);
  const detailQuery = useGetFeeAdjustmentQuery(adjustment?.id ?? '', {
    skip: !adjustment?.id || !access.canView,
  });
  const detail = detailQuery.currentData;
  const request = detail ? mapDetailToAdjustmentRequest(detail) : adjustment;
  const {
    items,
    notes,
    setNotes,
    errorText,
    summary,
    isLoadingPendingFees,
    isSubmitting,
    isContextError,
    hasInvalidAmounts,
    retryLoad,
    submit,
    selectedLines,
  } = useApplyAdjustment({ open: true, adjustment, approvedBy });
  const loading = isLoadingPendingFees || detailQuery.isLoading || detailQuery.isFetching;
  const mayApply = Boolean(
    detail &&
    access.canAdd &&
    actorId &&
    detail.requestedByUserId !== actorId &&
    [AdjustmentStatusEnum.Pending, AdjustmentStatusEnum.PartiallyApplied].includes(detail.status)
  );
  const canApprove =
    mayApply &&
    !loading &&
    !detailQuery.isError &&
    !isContextError &&
    !hasInvalidAmounts &&
    selectedLines.length > 0;
  useEffect(() => {
    onBusyChange?.(isSubmitting);
    return () => onBusyChange?.(false);
  }, [isSubmitting, onBusyChange]);
  const apply = async () => {
    if (!canApprove || isSubmitting) return;
    try {
      const result = await submit();
      shikshaMitraToast.success({ message: 'Adjustment approved and applied successfully.' });
      await onApplied(result);
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'Unable to apply the adjustment.',
      });
    }
  };
  const allocationValues = items
    .filter((item) => item.isSelected)
    .map((item) => ({
      id: item.installmentId,
      amount: item.amountDraft ?? String(item.appliedAmount),
    }));

  return (
    <Card
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2, minWidth: 0 }}>
          <FormBusyRegion busy={isSubmitting} label="Applying adjustment…">
            <BackPopUpChecked
              initialValues={{ notes: '', allocations: allocationValues }}
              currentValues={{ notes, allocations: allocationValues }}
            >
              <Stack spacing={2}>
                {loading ? (
                  <Stack spacing={2} aria-label="Loading adjustment approval" aria-busy="true">
                    {[0, 1, 2].map((section) => (
                      <Skeleton key={section} variant="rounded" height={160} />
                    ))}
                  </Stack>
                ) : detailQuery.isError || isContextError || !request || !detail ? (
                  <Alert
                    severity="error"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => {
                          if (detailQuery.isError || !detail) detailQuery.refetch();
                          if (isContextError) retryLoad();
                        }}
                      >
                        Retry
                      </Button>
                    }
                  >
                    {isContextError
                      ? errorText
                      : 'Could not load the adjustment request. Please try again.'}
                  </Alert>
                ) : (
                  <>
                    <AdjustmentStudentCard adjustment={request} />
                    <AdjustmentSummaryCards summary={summary} adjustment={request} />
                    {!mayApply ? (
                      <Alert severity="info">
                        {detail.requestedByUserId === actorId
                          ? 'The requester cannot approve their own adjustment.'
                          : 'This adjustment is not available for you to apply.'}
                      </Alert>
                    ) : (
                      <>
                        {errorText && <Alert severity="error">{errorText}</Alert>}
                        <FormSectionCard
                          title="Applicable Adjustment"
                          icon={GlobalIcons.receiptIcon}
                          descriptionTooltip="The adjustment is automatically applied to eligible outstanding installments in due order, up to each fee's available balance. This allocation is fixed at approval."
                        >
                          <AdjustmentPreview lines={selectedLines} />
                        </FormSectionCard>
                        <FormSectionCard
                          title="Approval Notes"
                          icon={GlobalIcons.notebook}
                          descriptionTooltip="Optional notes recorded with this application of the adjustment."
                        >
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            minRows={3}
                            label="Approval notes"
                            name="approvalNotes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            disabled={isSubmitting}
                          />
                        </FormSectionCard>
                      </>
                    )}
                  </>
                )}
              </Stack>
            </BackPopUpChecked>
          </FormBusyRegion>
        </Box>
      </Scrollbar>
      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
          {selectedLines.length
            ? `${formatNumber(summary.totalAppliedAmount, 'INR', { fractionDigits: 2 })} will be applied across ${selectedLines.length} installment${selectedLines.length === 1 ? '' : 's'}`
            : 'No eligible fee balance to apply'}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          disabled={isSubmitting}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onBack}
        >
          {fromView ? 'Back to view' : 'Cancel'}
        </Button>
        <LoadingButton
          variant="contained"
          size="small"
          loading={isSubmitting}
          disabled={!canApprove}
          startIcon={<Iconify icon={GlobalIcons.tick} />}
          onClick={apply}
        >
          Approve adjustment
        </LoadingButton>
      </DialogActions>
    </Card>
  );
}
