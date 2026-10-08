'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Drawer, Button, Typography, CircularProgress } from '@mui/material';

import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import { useConcessionPolicyForm } from '../hooks/useConcessionPolicyForm';
import ConcessionFooterActions from './concession/ConcessionFooterActions';
import ConcessionGeneralSection from './concession/ConcessionGeneralSection';
import ConcessionCalculationSection from './concession/ConcessionCalculationSection';
import ConcessionApplicationSection from './concession/ConcessionApplicationSection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

interface ConcessionPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// Scope form hooks to the open drawer so discarded drafts and simulation state
// cannot survive into the next create, edit, or duplicate session.
export default function ConcessionPolicyDrawer(props: ConcessionPolicyDrawerProps) {
  const { open } = props;
  return open ? <ConcessionPolicyDrawerSession {...props} /> : null;
}

function ConcessionPolicyDrawerSession({
  open,
  onClose,
  editData,
  academicYearId = '',
}: ConcessionPolicyDrawerProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const {
    formik,
    isSaving,
    unsavedChangesDialog,
    handleNameChange,
    handleCloseAttempt,
    handleCustomSubmit,
    activeEdit,
    impact,
    isImpactLoading,
  } = useConcessionPolicyForm({ open, onClose, editData, academicYearId });
  const busy = isSaving || formik.isSubmitting;
  const close = () => {
    if (!busy) handleCloseAttempt();
  };
  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!busy) handleCustomSubmit();
    },
    [busy, handleCustomSubmit]
  );
  if (!open) return null;
  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={close}
        slotProps={{
          backdrop: { sx: { bgcolor: (theme) => alpha(theme.palette.common.black, 0.32) } },
        }}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'concession-policy-title',
          sx: {
            width: { xs: '100%', sm: 'min(840px, 96vw)' },
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}
          aria-busy={busy}
        >
          <FinancePolicyDrawerHeader
            title={editData ? 'Edit Concession Policy' : 'Create Concession Policy'}
            titleId="concession-policy-title"
            description={`Configure calculation rules and limits · ${editData?.academicYearName || currentYear?.name || 'Current academic year'}`}
            descriptionDisplay="tooltip"
            onClose={close}
            disabled={busy}
            badges={
              <>
                <Label color={formik.values.status === 'Active' ? 'success' : 'warning'}>
                  {formik.values.status}
                </Label>
                {editData?.version && <Label color="default">v{editData.version}</Label>}
              </>
            }
          />
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              bgcolor: 'background.neutral',
              overflow: 'hidden',
            }}
          >
            <Scrollbar sx={{ height: 1 }}>
              <Box
                component="fieldset"
                disabled={busy}
                inert={busy}
                sx={{ border: 0, m: 0, p: { xs: 2, sm: 3 }, minWidth: 0 }}
              >
                <Stack spacing={2} sx={{ minWidth: 0 }}>
                  <ConcessionGeneralSection
                    formik={formik}
                    onNameChange={handleNameChange}
                    activeEdit={activeEdit}
                    impact={impact}
                    isImpactLoading={isImpactLoading}
                  />
                  <ConcessionCalculationSection formik={formik} />
                  <ConcessionApplicationSection formik={formik} />
                </Stack>
              </Box>
            </Scrollbar>
            {busy && (
              <Stack
                role="status"
                alignItems="center"
                justifyContent="center"
                spacing={1.5}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.72),
                }}
              >
                <CircularProgress size={28} />
                <Typography variant="body2">Saving policy…</Typography>
              </Stack>
            )}
          </Box>
          <ConcessionFooterActions isSaving={busy} onCancel={close} isEditing={Boolean(editData)} />
        </Box>
      </Drawer>
      <ConfirmDialog
        open={unsavedChangesDialog.value}
        icon="warning"
        disableBackdropClick
        onClose={unsavedChangesDialog.onFalse}
        title="Discard Unsaved Changes?"
        content="Your changes to this concession policy will be lost."
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
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
    </>
  );
}
