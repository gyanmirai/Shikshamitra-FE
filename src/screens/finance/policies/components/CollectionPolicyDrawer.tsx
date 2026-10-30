'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';
import { varAlpha } from 'src/theme/styles';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  Box,
  Stack,
  Drawer,
  Button,
  Switch,
  Typography,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import { useCollectionPolicyForm } from '../hooks/useCollectionPolicyForm';
import CollectionFooterActions from './collection/CollectionFooterActions';
import CollectionGeneralSection from './collection/CollectionGeneralSection';
import CollectionLateFeeSection from './collection/CollectionLateFeeSection';
import CollectionReceiptSection from './collection/CollectionReceiptSection';
import FinancePrerequisiteState from '../../components/FinancePrerequisiteState';
import CollectionAllocationSection from './collection/CollectionAllocationSection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

interface CollectionPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// Scope form hooks to the open drawer so discarded drafts and simulation state
// cannot survive into the next create, edit, or duplicate session.
export default function CollectionPolicyDrawer(props: CollectionPolicyDrawerProps) {
  const { open } = props;
  return open ? <CollectionPolicyDrawerSession {...props} /> : null;
}

function CollectionPolicyDrawerSession({
  open,
  onClose,
  editData,
  academicYearId = '',
}: CollectionPolicyDrawerProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const {
    formik,
    prerequisites = [],
    refreshPrerequisites,
    checks,
    feeHeads,
    isFeeHeadsLoading,
    isSaving,
    unsavedChangesDialog,
    otherDefaultPolicyName,
    handleCustomSubmit,
    handleCloseAttempt,
    addSlab,
    removeSlab,
  } = useCollectionPolicyForm({
    open,
    onClose,
    editData,
    academicYearId,
  });

  const isPrerequisiteBlocked = prerequisites.length > 0;
  const busy = isSaving || formik.isSubmitting;
  const close = () => {
    if (!busy) handleCloseAttempt();
  };
  const handleAddSlab = useCallback(() => {
    addSlab();
  }, [addSlab]);

  const handleRemoveSlab = useCallback(
    (idx: number) => {
      removeSlab(idx);
    },
    [removeSlab]
  );

  const isAlreadyActive = editData?.status === 'Active';
  const selectedStatus = formik.values.status === 'Active' ? 'Active' : 'Draft';
  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!busy && !isPrerequisiteBlocked) handleCustomSubmit(selectedStatus);
    },
    [busy, isPrerequisiteBlocked, handleCustomSubmit, selectedStatus]
  );

  if (!open) return null;

  return (
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
        'aria-labelledby': 'collection-policy-title',
        sx: {
          width: { xs: '100%', sm: 'min(840px, 96vw)' },
          maxWidth: '100%',
        },
      }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        aria-busy={busy}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          bgcolor: 'background.paper',
        }}
      >
        <FinancePolicyDrawerHeader
          description={`Configure payment priority, receipts, and late fees · ${editData?.academicYearName || currentYear?.name || 'Current academic year'}`}
          title={editData ? 'Edit Collection Policy' : 'Create Collection Policy'}
          titleId="collection-policy-title"

          descriptionDisplay="tooltip"
          onClose={close}
          disabled={busy}
          badges={
            <>
              <Label color={formik.values.status === 'Active' ? 'success' : 'warning'}>
                {formik.values.status}
              </Label>
              {editData?.policyCode && <Label color="default">{editData.policyCode}</Label>}
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
          {/* Scrollable Form */}
          <Scrollbar fillContent={isPrerequisiteBlocked} sx={{ height: 1 }}>
            <Box
              component="fieldset"
              disabled={busy}
              inert={busy}
              sx={{
                border: 0,
                m: 0,
                minWidth: 0,
                minHeight: 1,
                flex: isPrerequisiteBlocked ? 1 : undefined,
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={2} sx={{ minWidth: 0, flex: 1 }}>
                {isPrerequisiteBlocked ? (
                  <>
                    <CustomSelect
                      fullWidth
                      size="small"
                      name="status"
                      label="Status"
                      value={formik.values.status}
                      options={[
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Active', label: 'Active' },
                      ]}
                      disabledValues={formik.initialValues.isDefault ? ['Draft'] : []}
                      onChange={(value) => {
                        formik.setFieldValue('status', value);
                        if (value !== 'Active') formik.setFieldValue('isDefault', false);
                      }}
                    />
                    <FormControlLabel
                      label="Enable late fee charges"
                      control={
                        <Switch
                          size="small"
                          checked={formik.values.enableLateFee}
                          onChange={(_, checked) => formik.setFieldValue('enableLateFee', checked)}
                        />
                      }
                    />
                    <FinancePrerequisiteState
                      requirements={prerequisites}
                      onRefresh={refreshPrerequisites}
                      sx={{ flex: 1 }}
                    />
                  </>
                ) : (
                  <>
                    <CollectionGeneralSection
                      formik={formik}
                      otherDefaultPolicyName={otherDefaultPolicyName}
                      activeEdit={isAlreadyActive}
                    />
                    <CollectionAllocationSection formik={formik} />
                    <CollectionReceiptSection formik={formik} />
                    <CollectionLateFeeSection
                      formik={formik}
                      feeHeads={feeHeads}
                      isFeeHeadsLoading={isFeeHeadsLoading}
                      addSlab={handleAddSlab}
                      removeSlab={handleRemoveSlab}
                    />
                  </>
                )}
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
                bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.72),
              }}
            >
              <CircularProgress size={28} />
              <Typography variant="body2">Saving policy…</Typography>
            </Stack>
          )}
        </Box>

        {/* Sticky Footer */}
        <CollectionFooterActions
          isSaving={busy}
          invalid={!checks.numericValid || isPrerequisiteBlocked}
          onCancel={close}
        />

        {/* Unsaved changes confirmation dialog */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          disableBackdropClick
          title="Discard Unsaved Changes?"
          content="Your changes to this collection policy will be lost."
          action={
            <Button
              startIcon={<Iconify icon="mdi:exit-to-app" />}
              variant="contained"
              color="error"
              size="small"
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
