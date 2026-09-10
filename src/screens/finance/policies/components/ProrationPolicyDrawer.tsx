'use client';

import type { RootState } from 'src/redux/store';

/**
 * ProrationPolicyDrawer
 *
 * Full-featured create/edit drawer for Proration Policies adhering to the ShikshaMitra UI skill.
 * Left: Policy Information · Fee Head Rules Configuration · Calculation Simulator
 * Right: Live Summary Panel · Rule Breakdown · Validation Checklist · Policy Guarantees
 * Footer: Cancel · Create/Update Policy
 */

import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { Box, Chip, Alert, Stack, Drawer, Button, Typography, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { ProrationSummaryPanel } from './proration/ProrationCommon';
import ProrationFooterActions from './proration/ProrationFooterActions';
import { useProrationPolicyForm } from '../hooks/useProrationPolicyForm';
import ProrationGeneralSection from './proration/ProrationGeneralSection';
import ProrationFeeHeadsSection from './proration/ProrationFeeHeadsSection';
import ProrationSimulationSection from './proration/ProrationSimulationSection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProrationPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProrationPolicyDrawer({
  open,
  onClose,
  editData,
  academicYearId = '',
}: ProrationPolicyDrawerProps) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canActivate = hasGrantedPermission(
    permissions,
    financePermissions.policies.prorationPolicyActions.activate
  );
  const canSimulate = hasGrantedPermission(
    permissions,
    financePermissions.policies.prorationPolicyActions.simulate
  );

  const {
    formik,
    isSaving,
    isLoading,
    isFeeHeadsError,
    activeEdit,
    otherDefaultPolicyName,
    unsavedChangesDialog,
    checks,
    handleCloseAttempt,
    handleCustomSubmit,
  } = useProrationPolicyForm({ open, onClose, editData, academicYearId });

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
        {/* ── Header ──────────────────────────────────────────────────────── */}
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
                icon={editData ? GlobalIcons.edit : 'solar:calculator-bold-duotone'}
                width={22}
                height={22}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h6" fontWeight={700}>
                  {editData ? 'Edit Proration Policy' : 'Create Proration Policy'}
                </Typography>

                <CustomTooltip
                  title="Proration policies define reusable per-fee-head rules for mid-term joiners and exits. Attached to Fee Structures."
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
                  color={formik.values.status === 'Active' ? 'success' : 'warning'}
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
                Configure calculation rules per fee head. Attached to Fee Structures for automated
                demand adjustments.
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

        {/* ── Main Body ────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Scrollable Form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 6 }}>
              {isFeeHeadsError && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.25 }}>
                  Active fee heads could not be loaded from server. Saving is disabled to prevent an
                  incomplete policy.
                </Alert>
              )}

              {isLoading && (
                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 1.25 }}>
                  Loading policy and fee head data…
                </Alert>
              )}

              {/* Card 1 — Policy Information */}
              <ProrationGeneralSection
                formik={formik}
                activeEdit={activeEdit}
                canActivate={canActivate}
                otherDefaultPolicyName={otherDefaultPolicyName}
              />

              {/* Card 2 — Fee Head Configuration */}
              <ProrationFeeHeadsSection formik={formik} />

              {/* Card 3 — Calculation Simulator (when editing saved policy) */}
              {editData?.id && canSimulate && (
                <ProrationSimulationSection
                  policyId={editData.id}
                  rules={formik.values.feeHeadRules}
                />
              )}
            </Box>
          </Scrollbar>

          {/* Sticky Right Summary Panel */}
          <ProrationSummaryPanel formik={formik} checks={checks} />
        </Box>

        {/* ── Sticky Footer ────────────────────────────────────────────────── */}
        <ProrationFooterActions
          isSaving={isSaving || isLoading}
          onCancel={handleCloseAttempt}
          isEditing={Boolean(editData?.id)}
        />

        {/* ── Unsaved Changes Dialog ──────────────────────────────────────── */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          title="Unsaved Changes"
          content="You have unsaved changes in this proration policy form. Are you sure you want to discard them?"
          action={
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                unsavedChangesDialog.onFalse();
                onClose();
              }}
            >
              Discard Changes
            </Button>
          }
        />
      </Box>
    </Drawer>
  );
}
