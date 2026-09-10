'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Drawer,
  Button,
  Typography,
  IconButton,
} from '@mui/material';

import RefundFooterActions from './refund/RefundFooterActions';
import RefundGeneralSection from './refund/RefundGeneralSection';
import { useRefundPolicyForm } from '../hooks/useRefundPolicyForm';
import RefundEligibilitySection from './refund/RefundEligibilitySection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface RefundPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RefundPolicyDrawer({
  open,
  onClose,
  editData,
  academicYearId = '',
}: RefundPolicyDrawerProps) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const refundPermissions = financePermissions.policies.refundPolicyActions;

  const canCreate = hasGrantedPermission(permissions, refundPermissions.create);
  const canEdit = hasGrantedPermission(permissions, refundPermissions.edit);
  const canActivate = editData ? canEdit : canCreate;

  const {
    formik,
    activeEdit,
    impact,
    isImpactLoading,
    feeHeads,
    isFeeHeadsLoading,
    isSaving,
    isDetailLoading,
    unsavedChangesDialog,
    checks,
    handleCloseAttempt,
    handleCustomSubmit,
  } = useRefundPolicyForm({ open, onClose, editData, academicYearId });

  const isAlreadyActive = editData?.status === 'Active';
  const selectedStatus = formik.values.status === 'Active' ? 'Active' : 'Draft';
  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      handleCustomSubmit(selectedStatus);
    },
    [handleCustomSubmit, selectedStatus]
  );
  const submitLabel =
    selectedStatus === 'Draft'
      ? 'Save as Draft'
      : isAlreadyActive
        ? 'Save Changes'
        : 'Activate Policy';

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to submit
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (checks.isReadyToPublish && canActivate) {
          handleSubmit();
        }
      }
    },
    [checks.isReadyToPublish, canActivate, handleSubmit]
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
          width: { xs: '100%', md: 'min(860px, 95vw)' },
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
                icon={editData ? GlobalIcons.edit : 'solar:card-recive-bold-duotone'}
                width={22}
                height={22}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h6" fontWeight={700}>
                  {editData ? 'Edit Refund Policy' : 'Create Refund Policy'}
                </Typography>

                <CustomTooltip
                  title="Refund policies decide which settled payments and fee heads school staff may refund."
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
                Choose which paid fees can be refunded and when.
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
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 6 }}>
              {isDetailLoading && (
                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 1.25 }}>
                  Loading policy details from server...
                </Alert>
              )}

              {/* Section 1: General Information */}
              <RefundGeneralSection
                formik={formik}
                activeEdit={activeEdit}
                impact={impact}
                isImpactLoading={isImpactLoading}
              />

              {/* Section 2: Eligibility & Scope */}
              <RefundEligibilitySection
                formik={formik}
                feeHeads={feeHeads}
                isFeeHeadsLoading={isFeeHeadsLoading}
              />

              <Alert severity="info" sx={{ borderRadius: 1.25 }}>
                {editData
                  ? 'Saved calculation behavior is kept automatically. Refund amounts remain limited to the student’s eligible paid balance.'
                  : 'Refund amounts are entered when a refund is processed and can never exceed the student’s eligible paid balance. New policies use no automatic deduction, cap, or rounding.'}
              </Alert>
            </Box>
          </Scrollbar>
        </Box>

        {/* ── Sticky Footer Actions ──────────────────────────────────────── */}
        <RefundFooterActions
          isSaving={isSaving || isDetailLoading}
          canSubmit={selectedStatus === 'Draft' || canActivate}
          onCancel={handleCloseAttempt}
          submitLabel={submitLabel}
        />

        {/* ── Unsaved Changes Confirmation Dialog ────────────────────────── */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          title="Unsaved Changes"
          content="You have unsaved changes in this refund policy form. Are you sure you want to discard them?"
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
