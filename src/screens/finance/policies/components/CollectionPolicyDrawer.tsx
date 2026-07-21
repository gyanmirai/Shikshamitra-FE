'use client';

import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Drawer, Button, Typography } from '@mui/material';

import CollectionSummaryPanel from './collection/CollectionSummaryPanel';
import { useCollectionPolicyForm } from '../hooks/useCollectionPolicyForm';
import CollectionWaiverSection from './collection/CollectionWaiverSection';
import CollectionOnlineSection from './collection/CollectionOnlineSection';
import CollectionFooterActions from './collection/CollectionFooterActions';
import CollectionGeneralSection from './collection/CollectionGeneralSection';
import CollectionLateFeeSection from './collection/CollectionLateFeeSection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

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

  /**
   * Memoization Justification:
   * Prevents creating a new slab adder closure on every form render,
   * keeping references stable for children components.
   */
  const handleAddSlab = useCallback(() => {
    addSlab();
  }, [addSlab]);

  /**
   * Memoization Justification:
   * Stabilizes reference of slab remover callback passed to Slab builder lists.
   */
  const handleRemoveSlab = useCallback(
    (idx: number) => {
      removeSlab(idx);
    },
    [removeSlab]
  );

  /**
   * Memoization Justification:
   * Avoids recreating submission callback on every keystroke.
   */
  const handleSubmit = useCallback(() => {
    handleCustomSubmit('Active');
  }, [handleCustomSubmit]);

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCloseAttempt}
      PaperProps={{
        sx: {
          width: { xs: '100%', lg: 'min(1100px, 95vw)' },
          maxWidth: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {editData ? 'Edit Collection Policy' : 'Create Collection Policy'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configure fee collection restrictions, grace days, waivers, and late fee
              configurations.
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={handleCloseAttempt}
            startIcon={<Iconify icon="mdi:close" />}
            color="inherit"
          >
            Close
          </Button>
        </Box>

        {/* Main Body */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Scrollable Form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: 3, pb: 6 }}>
              <CollectionGeneralSection
                formik={formik}
                otherDefaultPolicyName={otherDefaultPolicyName}
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
          onSubmit={handleSubmit}
          isSubmitDisabled={!checks.isReadyToPublish}
        />

        {/* Unsaved changes confirmation dialog */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          title="Unsaved Changes"
          content="You have unsaved changes in this policy form. Are you sure you want to discard them?"
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
              Discard
            </Button>
          }
        />
      </Box>
    </Drawer>
  );
}
