'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import AutoApplyButton from './AutoApplyButton';
import AdjustmentPreview from './AdjustmentPreview';
import AdjustmentStudentCard from './AdjustmentStudentCard';
import AdjustmentSummaryCards from './AdjustmentSummaryCards';
import { useApplyAdjustment } from '../hooks/useApplyAdjustment';
import AdjustmentPendingFeesTable from './AdjustmentPendingFeesTable';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type { ApplyAdjustmentDialogSubmitResult } from '../types/adjustmentApply.types';

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

const ApplyAdjustmentSkeleton = () => (
  <Stack spacing={1.5} sx={{ p: 3 }}>
    {/* Summary cards skeleton */}
    <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />

    {/* Student Details card skeleton */}
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="60%" height={16} />
    </Card>

    {/* Auto-apply button row skeleton */}
    <Box display="flex" justifyContent="flex-end" gap={1}>
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={160} height={32} sx={{ borderRadius: 1 }} />
    </Box>

    {/* Pending fees table skeleton */}
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Table header */}
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 0 }} />
      {/* Table rows */}
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ px: 1.5, py: 1.25, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton
            variant="rectangular"
            width={20}
            height={20}
            sx={{ borderRadius: 0.5, flexShrink: 0 }}
          />
          <Skeleton variant="text" width="20%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
          <Box flex={1} />
          <Skeleton variant="text" width={70} height={16} />
          <Skeleton variant="text" width={70} height={16} />
          <Skeleton variant="text" width={70} height={16} />
          <Skeleton variant="rectangular" width={110} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width={70} height={16} />
        </Box>
      ))}
    </Card>

    {/* Notes field skeleton */}
    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
  </Stack>
);

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ApplyAdjustmentScreenProps {
  approvedBy: string;
  adjustment: AdjustmentRequest | null;
  /** true = came from View Adjustment screen; false = came from the list table */
  fromView?: boolean;
  onBack: () => void;
  onApplied: (result: ApplyAdjustmentDialogSubmitResult) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ApplyAdjustmentScreen = ({
  approvedBy,
  adjustment,
  fromView = false,
  onBack,
  onApplied,
}: ApplyAdjustmentScreenProps) => {
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
    open: true,
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
      shikshaMitraToast.success({ message: 'Adjustment approved and applied successfully.' });
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.message || 'Unable to submit adjustment application.',
      });
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'var(--shadows-4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      {isPreviewMode && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2} color="text.primary">
            Adjustment Preview
          </Typography>

          <Divider sx={{ mt: 1.5 }} />
        </Box>
      )}

      {/* ── Body ───────────────────────────────────────────── */}
      <Scrollbar sx={{ flex: 1, px: 3, pb: 2 }}>
        {!adjustment ? (
          <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No adjustment selected.
            </Typography>
          </Card>
        ) : isLoadingPendingFees && !isPreviewMode ? (
          <ApplyAdjustmentSkeleton />
        ) : (
          <Stack spacing={1.5}>
            {/* ── 2. Student Details Card (always first) ── */}
            <AdjustmentStudentCard adjustment={adjustment} />
            {/* ── 1. Summary Cards ── */}
            <AdjustmentSummaryCards summary={summary} />

            {errorText && <Alert severity="error">{errorText}</Alert>}

            {/* ── 3. Apply / Preview mode content ── */}
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

      {/* ── Actions ────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          boxShadow: 'var(--shadows-10)',
        }}
      >
        {!isPreviewMode ? (
          <>
            <Button
              variant="outlined"
              color="inherit"
              disabled={isSubmitting}
              onClick={onBack}
              size="small"
              startIcon={<Iconify icon="mdi:arrow-left" />}
            >
              {fromView ? 'Back to View' : 'Back'}
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
      </Box>
    </Card>
  );
};

export default ApplyAdjustmentScreen;
