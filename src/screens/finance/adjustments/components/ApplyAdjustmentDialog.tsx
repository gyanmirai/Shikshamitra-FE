import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import AutoApplyButton from './AutoApplyButton';
import AdjustmentPreview from './AdjustmentPreview';
import AdjustmentSummaryCards from './AdjustmentSummaryCards';
import { useApplyAdjustment } from '../hooks/useApplyAdjustment';
import AdjustmentPendingFeesTable from './AdjustmentPendingFeesTable';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type { ApplyAdjustmentDialogSubmitResult } from '../types/adjustmentApply.types';

interface ApplyAdjustmentDialogProps {
  open: boolean;
  approvedBy: string;
  adjustment: AdjustmentRequest | null;
  onClose: () => void;
  onApplied: (result: ApplyAdjustmentDialogSubmitResult) => void;
}

const ApplyAdjustmentDialog = ({
  open,
  approvedBy,
  adjustment,
  onClose,
  onApplied,
}: ApplyAdjustmentDialogProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const {
    items,
    notes,
    setNotes,
    errorText,
    summary,
    isLoadingPendingFees,
    isSubmitting,
    setSelection,
    setAppliedAmount,
    autoApply,
    clearAutoSelection,
    submit,
    selectedLines,
  } = useApplyAdjustment({
    open,
    adjustment,
    approvedBy,
  });

  const handleMoveToPreview = () => {
    if (!selectedLines.length) {
      shikshaMitraToast.error({ message: 'Select at least one installment to continue.' });
      return;
    }
    setIsPreviewMode(true);
  };

  const handleBackToApply = () => {
    setIsPreviewMode(false);
  };

  const handleSubmit = async () => {
    try {
      const result = await submit();
      onApplied(result);
      setIsPreviewMode(false);
      onClose();
      shikshaMitraToast.success({ message: 'Adjustment approved and applied successfully.' });
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.message || 'Unable to submit adjustment application.',
      });
    }
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="lg"
      hasForm={false}
      title={
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2} color="text.primary">
            {isPreviewMode ? 'Adjustment Preview' : 'Apply Adjustment'}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {isPreviewMode
              ? 'Review final pending fee impact before final submit'
              : 'Distribute approved adjustment amount across pending fees'}
          </Typography>
        </Box>
      }
    >
      <Scrollbar sx={{ maxHeight: 'calc(100dvh - 220px)', px: 2.5, pt: 1, pb: 0.5 }}>
        {!adjustment ? (
          <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No adjustment selected.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={1}>
            <AdjustmentSummaryCards summary={summary} />

            {errorText && <Alert severity="warning">{errorText}</Alert>}

            {!isPreviewMode && (
              <>
                <AutoApplyButton
                  disabled={isLoadingPendingFees || isSubmitting || !items.length}
                  onAutoApply={autoApply}
                  onClear={clearAutoSelection}
                />

                <AdjustmentPendingFeesTable
                  items={items}
                  onSelectRow={setSelection}
                  onChangeAmount={setAppliedAmount}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Approval Notes"
                  placeholder="Add approval remarks for audit trail"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </>
            )}

            {isPreviewMode && <AdjustmentPreview adjustment={adjustment} lines={selectedLines} />}
          </Stack>
        )}
      </Scrollbar>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        {!isPreviewMode ? (
          <>
            <Button
              variant="outlined"
              color="inherit"
              disabled={isSubmitting}
              onClick={onClose}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              variant="soft"
              color="info"
              onClick={handleMoveToPreview}
              size="small"
              disabled={isLoadingPendingFees || isSubmitting || !selectedLines.length}
              startIcon={<Iconify icon="mdi:eye-outline" />}
            >
              Preview
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              color="inherit"
              disabled={isSubmitting}
              onClick={handleBackToApply}
              size="small"
              startIcon={<Iconify icon="mdi:arrow-left" />}
            >
              Back
            </Button>
            <Button
              variant="soft"
              color="success"
              onClick={handleSubmit}
              size="small"
              disabled={isSubmitting}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit Adjustment
            </Button>
          </>
        )}
      </DialogActions>
    </CustomDialog>
  );
};

export default ApplyAdjustmentDialog;
