'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useRef, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { Box, Alert, Stack, Drawer, Button, Typography, CircularProgress } from '@mui/material';

import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import ProrationFooterActions from './proration/ProrationFooterActions';
import { useProrationPolicyForm } from '../hooks/useProrationPolicyForm';
import ProrationGeneralSection from './proration/ProrationGeneralSection';
import ProrationFeeHeadsSection from './proration/ProrationFeeHeadsSection';
import { useProrationValidationFocus } from '../hooks/useProrationValidationFocus';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProrationPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

// Scope form hooks to the open drawer so discarded drafts cannot survive into
// the next create, edit, or duplicate session.
export default function ProrationPolicyDrawer(props: ProrationPolicyDrawerProps) {
  const { open } = props;
  return open ? <ProrationPolicyDrawerSession {...props} /> : null;
}

function ProrationPolicyDrawerSession({
  open,
  onClose,
  editData,
  academicYearId = '',
}: ProrationPolicyDrawerProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canActivate = hasGrantedPermission(
    permissions,
    financePermissions.policies.prorationPolicyActions.activate
  );

  const {
    formik,
    isSaving,
    isLoading,
    isFeeHeadsError,
    activeEdit,
    otherDefaultPolicyName,
    unsavedChangesDialog,
    handleCloseAttempt,
    handleCustomSubmit,
  } = useProrationPolicyForm({ open, onClose, editData, academicYearId });

  const formRef = useRef<HTMLFormElement>(null);
  const busy = isSaving || isLoading || formik.isSubmitting;
  useProrationValidationFocus(formik, formRef);

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!busy) handleCustomSubmit();
    },
    [busy, handleCustomSubmit]
  );

  const close = () => {
    if (!busy) handleCloseAttempt();
  };

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.32),
          },
        },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'proration-policy-title',
        sx: {
          width: { xs: '100%', sm: 'min(840px, 96vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: (theme) => theme.shadows[16],
        },
      }}
    >
      <Box
        component="form"
        ref={formRef}
        aria-label={editData ? 'Edit Proration Policy' : 'Create Proration Policy'}
        aria-busy={busy}
        noValidate
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          bgcolor: 'background.paper',
        }}
      >
        <FinancePolicyDrawerHeader
          title={editData ? 'Edit Proration Policy' : 'Create Proration Policy'}
          titleId="proration-policy-title"
          description={`Configure admission and early withdrawal rules per fee head · ${editData?.academicYearName || currentYear?.name || 'Current academic year'}. Existing recorded dues and receipts keep their amounts.`}
          descriptionDisplay="tooltip"
          onClose={close}
          disabled={busy}
          badges={
            <>
              <Label color={formik.values.status === 'Active' ? 'success' : 'warning'}>
                {formik.values.status || 'Draft'}
              </Label>
              {editData?.version && <Label color="default">v{editData.version}</Label>}
            </>
          }
        />

        {/* ── Main Body ────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'background.neutral',
          }}
        >
          <Box
            component="fieldset"
            disabled={busy}
            inert={busy}
            sx={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0, border: 0, p: 0, m: 0 }}
          >
            {/* Scrollable Form */}
            <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
              <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
                {isFeeHeadsError && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.25 }}>
                    Active fee heads could not be loaded from server. Saving is disabled to prevent
                    an incomplete policy.
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
              </Stack>
            </Scrollbar>
          </Box>
          {busy && (
            <Stack
              role="status"
              aria-live="polite"
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.72),
              }}
            >
              <CircularProgress size={28} />
              <Typography variant="body2">
                {isLoading ? 'Loading policy settings…' : 'Saving policy…'}
              </Typography>
            </Stack>
          )}
        </Box>

        {/* ── Sticky Footer ────────────────────────────────────────────────── */}
        <ProrationFooterActions
          isSaving={busy}
          disabled={isFeeHeadsError}
          onCancel={close}
          isEditing={Boolean(editData?.id)}
        />

        {/* ── Unsaved Changes Dialog ──────────────────────────────────────── */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          title="Discard Unsaved Changes?"
          content="Your changes to this proration policy will be lost."
          action={
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<Iconify icon="mdi:exit-to-app" />}
              onClick={() => {
                unsavedChangesDialog.onFalse();
                formik.resetForm();
                onClose();
              }}
            >
              Discard changes
            </Button>
          }
        />
      </Box>
    </Drawer>
  );
}
