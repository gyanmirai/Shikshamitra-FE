'use client';

/**
 * ConcessionPolicyDrawer
 *
 * Full-featured concession policy create/edit drawer.
 * Cards: General · Calculation Rules · Applicable Fee Heads · Application Behaviour · Demand Behaviour
 * Right panel: Live Summary + Impact Simulation + Validation
 * Footer: Cancel · Save Draft · Publish
 */

import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Button, Drawer, Typography } from '@mui/material';

import { ConcessionSummaryPanel } from './concession/ConcessionCommon';
import { useConcessionPolicyForm } from '../hooks/useConcessionPolicyForm';
import ConcessionDemandSection from './concession/ConcessionDemandSection';
import ConcessionFooterActions from './concession/ConcessionFooterActions';
import ConcessionGeneralSection from './concession/ConcessionGeneralSection';
import ConcessionFeeHeadsSection from './concession/ConcessionFeeHeadsSection';
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
    feeHeads,
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
  } = useConcessionPolicyForm({ open, onClose, editData, academicYearId });

  const handlePublish = useCallback(() => {
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
        {/* ── Header ─────────────────────────────────────────────────────── */}
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
              {editData ? 'Edit Concession Policy' : 'Create Concession Policy'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configure calculation rules, fee head scope, application behaviour, and demand
              recalculation logic. This policy is reusable across concession requests.
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

        {/* ── Main Body ──────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Scrollable Form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: 2, pb: 6 }}>
              {/* Card 1 — General Information */}
              <ConcessionGeneralSection formik={formik} onNameChange={handleNameChange} />

              {/* Card 2 — Calculation Rules */}
              <ConcessionCalculationSection formik={formik} />

              {/* Card 3 — Applicable Fee Heads */}
              <ConcessionFeeHeadsSection formik={formik} feeHeads={feeHeads} />

              {/* Card 4 — Application Behaviour */}
              <ConcessionApplicationSection formik={formik} />

              {/* Card 5 — Demand Behaviour */}
              <ConcessionDemandSection formik={formik} />
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
          isReadyToPublish={checks.isReadyToPublish}
          onCancel={handleCloseAttempt}
          onPublish={handlePublish}
        />

        {/* ── Unsaved Changes Dialog ─────────────────────────────────────── */}
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
