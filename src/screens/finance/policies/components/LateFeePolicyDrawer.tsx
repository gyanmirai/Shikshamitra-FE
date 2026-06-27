'use client';

import { LoadingButton } from '@mui/lab';
import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Drawer, Button, Typography } from '@mui/material';

import LateFeeSummaryPanel from './late-fee/LateFeeSummaryPanel';
import LateFeeLimitsSection from './late-fee/LateFeeLimitsSection';
import LateFeeChargeSection from './late-fee/LateFeeChargeSection';
import LateFeeWaiverSection from './late-fee/LateFeeWaiverSection';
import LateFeeFooterActions from './late-fee/LateFeeFooterActions';
import { useLateFeePolicyForm } from '../hooks/useLateFeePolicyForm';
import LateFeeGeneralSection from './late-fee/LateFeeGeneralSection';
import LateFeePreviewSection from './late-fee/LateFeePreviewSection';
import LateFeeSlabRulesSection from './late-fee/LateFeeSlabRulesSection';
import LateFeeCalculationSection from './late-fee/LateFeeCalculationSection';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

interface LateFeePolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export default function LateFeePolicyDrawer({
  open,
  onClose,
  editData,
  academicYearId = '',
}: LateFeePolicyDrawerProps) {
  const {
    formik,
    academicYears,
    unsavedChangesDialog,
    expandedSections,
    toggleSection,
    isSaving,
    calcFeeDue,
    setCalcFeeDue,
    calcPaidAfterDays,
    setCalcPaidAfterDays,
    calcLateFeeResult,
    handleRequestClose,
    handleDiscardChanges,
    handleSaveAndClose,
  } = useLateFeePolicyForm({
    open,
    onClose,
    editData,
    academicYearId,
  });

  /**
   * Memoization Justification:
   * Prevents re-creating section toggle handler closures on form edits, keeping prop references stable.
   */
  const handleToggleSection = useCallback(
    (key: any) => {
      toggleSection(key);
    },
    [toggleSection]
  );

  /**
   * Memoization Justification:
   * Prevents recreation of submit handlers.
   */
  const handleSubmit = useCallback(() => {
    formik.submitForm();
  }, [formik]);

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleRequestClose}
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
              {editData ? 'Edit Late Fee Policy' : 'Create Late Fee Policy'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {editData
                ? 'Update calculation types, escalation rules, waiver configuration, and portal visibilities.'
                : 'Create enterprise rules for penalizing late payments and automating ledger syncs.'}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={handleRequestClose}
            startIcon={<Iconify icon="mdi:close" />}
            color="inherit"
          >
            Close
          </Button>
        </Box>

        {/* Body container split */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Left Side scrollable form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: 0 }}>
              <LateFeeGeneralSection
                formik={formik}
                academicYears={academicYears || []}
                expanded={expandedSections.has('general')}
                onToggle={() => handleToggleSection('general')}
              />

              <LateFeeCalculationSection
                formik={formik}
                expanded={expandedSections.has('calculation')}
                onToggle={() => handleToggleSection('calculation')}
              />

              <LateFeeSlabRulesSection
                formik={formik}
                expanded={expandedSections.has('escalation')}
                onToggle={() => handleToggleSection('escalation')}
              />

              <LateFeeLimitsSection
                formik={formik}
                expanded={expandedSections.has('limits')}
                onToggle={() => handleToggleSection('limits')}
              />

              <LateFeeChargeSection
                formik={formik}
                expanded={expandedSections.has('charge')}
                onToggle={() => handleToggleSection('charge')}
              />

              <LateFeeWaiverSection
                formik={formik}
                expanded={expandedSections.has('waiver')}
                onToggle={() => handleToggleSection('waiver')}
              />

              <LateFeePreviewSection
                formik={formik}
                calcFeeDue={calcFeeDue}
                setCalcFeeDue={setCalcFeeDue}
                calcPaidAfterDays={calcPaidAfterDays}
                setCalcPaidAfterDays={setCalcPaidAfterDays}
                calcLateFeeResult={calcLateFeeResult}
                expanded={expandedSections.has('preview')}
                onToggle={() => handleToggleSection('preview')}
              />
            </Box>
          </Scrollbar>

          {/* Right Side summary card */}
          <LateFeeSummaryPanel
            formik={formik}
            academicYears={academicYears || []}
            calcLateFeeResult={calcLateFeeResult}
            calcFeeDue={calcFeeDue}
            calcPaidAfterDays={calcPaidAfterDays}
          />
        </Box>

        {/* Drawer Footer Actions */}
        <LateFeeFooterActions
          isSaving={isSaving}
          onCancel={handleRequestClose}
          onSubmit={handleSubmit}
        />

        {/* Confirmation Dialog for Unsaved Changes */}
        <ConfirmDialog
          open={unsavedChangesDialog.value}
          icon="warning"
          onClose={unsavedChangesDialog.onFalse}
          title="Unsaved Changes"
          content={
            <Typography variant="body2">
              You have unsaved changes in this Late Fee Policy drawer. What would you like to do?
            </Typography>
          }
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </Button>
              <LoadingButton
                size="small"
                variant="contained"
                color="success"
                loading={isSaving}
                onClick={handleSaveAndClose}
              >
                Save & Close
              </LoadingButton>
            </Stack>
          }
        />
      </Box>
    </Drawer>
  );
}
