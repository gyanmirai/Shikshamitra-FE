'use client';

import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Drawer, Button, Tooltip, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CollectionSummaryPanel from './collection/CollectionSummaryPanel';
import { useCollectionPolicyForm } from '../hooks/useCollectionPolicyForm';
import CollectionWaiverSection from './collection/CollectionWaiverSection';
import CollectionOnlineSection from './collection/CollectionOnlineSection';
import CollectionFooterActions from './collection/CollectionFooterActions';
import CollectionGeneralSection from './collection/CollectionGeneralSection';
import CollectionLateFeeSection from './collection/CollectionLateFeeSection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';
import { Close } from '@mui/icons-material';

interface CollectionPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export default function CollectionPolicyDrawer({
  open,
  onClose,
  editData,
  academicYearId = '',
}: CollectionPolicyDrawerProps) {
  const {
    formik,
    feeHeads,
    isSaving,
    unsavedChangesDialog,
    checks,
    otherDefaultPolicyName,
    calcAmount,
    setCalcAmount,
    calcDaysLate,
    setCalcDaysLate,
    calcPayment,
    setCalcPayment,
    calculatedLateFee,
    allocatedPayment,
    remainingBalance,
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
  const theme = useTheme();
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
      handleCustomSubmit(selectedStatus);
    },
    [handleCustomSubmit, selectedStatus]
  );

  const submitLabel =
    selectedStatus === 'Draft' ? 'Save as Draft' : isAlreadyActive ? 'Save Changes' : 'Activate Policy';

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCloseAttempt}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: '90vw', lg: 'min(1180px, 95vw)' },
          maxWidth: '100%',
        },
      }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
        }}
      >
        {/* Drawer Header */}
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
                ? alpha(theme.palette.background.default, 0.4)
                : alpha(theme.palette.grey[50], 0.6),
            flexShrink: 0,
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
                icon={editData ? GlobalIcons.edit : GlobalIcons.addIcon}
                width={22}
                height={22}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h6" fontWeight={700} noWrap>
                  {editData ? 'Edit Collection Policy' : 'Create Collection Policy'}
                </Typography>
                {editData?.policyCode && (
                  <Label color="default" sx={{ height: 20, fontSize: '0.7rem' }}>
                    {editData.policyCode}
                  </Label>
                )}
                <Label
                  color={formik.values.status === 'Active' ? 'success' : 'warning'}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                >
                  {formik.values.status}
                </Label>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                Define grace period days, late fee computation slabs, waiver workflows, and online payment options.
              </Typography>
            </Box>
          </Stack>
          <IconButton
            aria-label="close"
            onClick={handleCloseAttempt}
            sx={{
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'scale(1.1)',
              },
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Main Body */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Scrollable Form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 6 }}>
              <CollectionGeneralSection
                formik={formik}
                otherDefaultPolicyName={otherDefaultPolicyName}
                activeEdit={isAlreadyActive}
              />
              <CollectionLateFeeSection
                formik={formik}
                feeHeads={feeHeads}
                addSlab={handleAddSlab}
                removeSlab={handleRemoveSlab}
              />
              <CollectionWaiverSection formik={formik} feeHeads={feeHeads} />
              <CollectionOnlineSection formik={formik} />
            </Box>
          </Scrollbar>

          {/* Sticky Right Summary Panel */}
          <CollectionSummaryPanel
            formik={formik}
            checks={checks}
            calcAmount={calcAmount}
            setCalcAmount={setCalcAmount}
            calcDaysLate={calcDaysLate}
            setCalcDaysLate={setCalcDaysLate}
            calcPayment={calcPayment}
            setCalcPayment={setCalcPayment}
            calculatedLateFee={calculatedLateFee}
            allocatedPayment={allocatedPayment}
            remainingBalance={remainingBalance}
          />
        </Box>

        {/* Sticky Footer */}
        <CollectionFooterActions
          isSaving={isSaving}
          onCancel={handleCloseAttempt}
          submitLabel={submitLabel}
        />

        {/* Unsaved changes confirmation dialog */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          title="Discard Unsaved Changes?"
          content="You have unsaved modifications in this Collection Policy form. Closing will discard all current changes."
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
