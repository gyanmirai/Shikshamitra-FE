'use client';

/**
 * ConcessionPolicyDrawer
 *
 * Full-featured concession policy create/edit drawer adhering to the ShikshaMitra UI skill.
 * Left: General Information · Calculation Rules · Application Behaviour
 * Right: Live Parameter Summary · Impact Simulator · Validation Checklist
 * Footer: Cancel · LoadingButton Submit
 */

import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Chip, Drawer, Stack, Typography, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { ConcessionSummaryPanel } from './concession/ConcessionCommon';
import { useConcessionPolicyForm } from '../hooks/useConcessionPolicyForm';
import ConcessionFooterActions from './concession/ConcessionFooterActions';
import ConcessionGeneralSection from './concession/ConcessionGeneralSection';
import ConcessionCalculationSection from './concession/ConcessionCalculationSection';
import ConcessionApplicationSection from './concession/ConcessionApplicationSection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConcessionPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConcessionPolicyDrawer({
  open,
  onClose,
  editData,
  academicYearId = '',
}: ConcessionPolicyDrawerProps) {
  const {
    formik,
    isSaving,
    unsavedChangesDialog,
    checks,
    simulation,
    simFeeAmount,
    setSimFeeAmount,
    simAlreadyPaid,
    setSimAlreadyPaid,
    simLateFee,
    setSimLateFee,
    handleNameChange,
    handleCloseAttempt,
    handleCustomSubmit,
    activeEdit,
    impact,
    isImpactLoading,
  } = useConcessionPolicyForm({ open, onClose, editData, academicYearId });

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      handleCustomSubmit();
    },
    [handleCustomSubmit]
  );

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to submit
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleCustomSubmit();
      }
    },
    [handleCustomSubmit]
  );

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCloseAttempt}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', lg: 'min(1120px, 95vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.default, 0.5)
                : alpha(theme.palette.grey[50], 0.8),
            flexShrink: 0,
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.25,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify
                icon={editData ? GlobalIcons.edit : 'solar:tag-price-bold'}
                width={22}
                height={22}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h6" fontWeight={700}>
                  {editData ? 'Edit Concession Policy' : 'Create Concession Policy'}
                </Typography>

                <CustomTooltip
                  title="Concession policies define reusable calculation formulas and maximum discount ceilings. Fee-head eligibility is configured when attaching this policy to fee structures."
                  placement="right"
                  arrow
                >
                  <Iconify
                    icon={GlobalIcons.info}
                    color="info.main"
                    width={16}
                    height={16}
                    sx={{ cursor: 'pointer' }}
                  />
                </CustomTooltip>

                <Label
                  color={
                    formik.values.status === 'Active'
                      ? 'success'
                      : 'warning'
                  }
                  sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                >
                  {formik.values.status || 'Draft'}
                </Label>

                {editData?.version && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`v${editData.version}`}
                    sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                  />
                )}
              </Stack>

              <Typography variant="caption" color="text.secondary" display="block">
                Configure reusable calculation limits and application behaviour. Fee-head
                eligibility is attached at the fee structure level.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={handleCloseAttempt}
            sx={{
              p: 0.75,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="mdi:close" width={20} height={20} />
          </IconButton>
        </Box>

        {/* ── Main Body ──────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Scrollable Form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 6 }}>
              {/* Card 1 — General Information */}
              <ConcessionGeneralSection
                formik={formik}
                onNameChange={handleNameChange}
                activeEdit={activeEdit}
                impact={impact}
                isImpactLoading={isImpactLoading}
              />

              {/* Card 2 — Calculation Rules */}
              <ConcessionCalculationSection formik={formik} />

              {/* Card 3 — Application Behaviour */}
              <ConcessionApplicationSection formik={formik} />
            </Box>
          </Scrollbar>

          {/* Sticky Right Summary Panel */}
          <ConcessionSummaryPanel
            formik={formik}
            checks={checks}
            simulation={simulation}
            simFeeAmount={simFeeAmount}
            setSimFeeAmount={setSimFeeAmount}
            simAlreadyPaid={simAlreadyPaid}
            setSimAlreadyPaid={setSimAlreadyPaid}
            simLateFee={simLateFee}
            setSimLateFee={setSimLateFee}
          />
        </Box>

        {/* ── Sticky Footer ──────────────────────────────────────────────── */}
        <ConcessionFooterActions
          isSaving={isSaving}
          onCancel={handleCloseAttempt}
          isEditing={Boolean(editData)}
        />

        {/* ── Unsaved Changes Confirmation Dialog ────────────────────────── */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          title="Unsaved Changes"
          content="You have unsaved changes in this concession policy form. Are you sure you want to discard them?"
          action={
            <Box
              component="button"
              onClick={() => {
                unsavedChangesDialog.onFalse();
                onClose();
              }}
              sx={{
                px: 2,
                py: 0.75,
                bgcolor: 'error.main',
                color: 'error.contrastText',
                border: 'none',
                borderRadius: 1,
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              Discard Changes
            </Box>
          }
        />
      </Box>
    </Drawer>
  );
}
