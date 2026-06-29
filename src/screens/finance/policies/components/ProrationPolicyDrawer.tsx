'use client';

/**
 * ProrationPolicyDrawer
 *
 * Full-featured create/edit drawer for Proration Policies.
 *
 * Layout:
 *   Header (title + close)
 *   ├── Left scrollable form
 *   │     Card 1 — Policy Information (General)
 *   │     Card 2 — Fee Head Configuration (expandable table)
 *   └── Right sticky summary panel (validation + live summary)
 *   Footer (Cancel + Save Policy)
 *   Unsaved Changes dialog
 */

import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Button, Drawer, Typography } from '@mui/material';

import { ProrationSummaryPanel } from './proration/ProrationCommon';
import ProrationFooterActions from './proration/ProrationFooterActions';
import { useProrationPolicyForm } from '../hooks/useProrationPolicyForm';
import ProrationGeneralSection from './proration/ProrationGeneralSection';
import ProrationFeeHeadsSection from './proration/ProrationFeeHeadsSection';

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
  const { formik, isSaving, unsavedChangesDialog, checks, handleCloseAttempt, handleCustomSubmit } =
    useProrationPolicyForm({ open, onClose, editData, academicYearId });

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
        {/* ── Header ──────────────────────────────────────────────────────── */}
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
              {editData ? 'Edit Proration Policy' : 'Create Proration Policy'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Define per-fee-head proration rules. This policy is reusable across multiple Fee
              Structures. Changes only affect future demand generation.
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

        {/* ── Main Body ────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Scrollable Form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ p: 2, pb: 6 }}>
              {/* Card 1 — Policy Information */}
              <ProrationGeneralSection formik={formik} />

              {/* Card 2 — Fee Head Configuration */}
              <ProrationFeeHeadsSection formik={formik} />
            </Box>
          </Scrollbar>

          {/* Sticky Right Summary Panel */}
          <ProrationSummaryPanel formik={formik} checks={checks} />
        </Box>

        {/* ── Sticky Footer ────────────────────────────────────────────────── */}
        <ProrationFooterActions
          isSaving={isSaving}
          isReadyToPublish={checks.isReadyToPublish}
          onCancel={handleCloseAttempt}
          onPublish={handlePublish}
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
              Discard
            </Button>
          }
        />
      </Box>
    </Drawer>
  );
}
