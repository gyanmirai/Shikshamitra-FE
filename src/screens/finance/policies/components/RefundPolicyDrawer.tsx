'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import FinanceRoutingFields from 'src/screens/finance/components/FinanceRoutingFields';
import {
  Box,
  Stack,
  Alert,
  Drawer,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { SectionCard } from './refund/RefundCommon';
import FinancePolicySkeleton from './FinancePolicySkeleton';
import RefundFooterActions from './refund/RefundFooterActions';
import RefundGeneralSection from './refund/RefundGeneralSection';
import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import RefundEligibilitySection from './refund/RefundEligibilitySection';
import { PAYOUT_METHODS, useRefundPolicyForm } from '../hooks/useRefundPolicyForm';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

interface RefundPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

// Scope form hooks to the open drawer so discarded drafts and simulation state
// cannot survive into the next create, edit, or duplicate session.
export default function RefundPolicyDrawer(props: RefundPolicyDrawerProps) {
  const { open } = props;
  return open ? <RefundPolicyDrawerSession {...props} /> : null;
}

function RefundPolicyDrawerSession({
  open,
  onClose,
  editData,
  academicYearId = '',
}: RefundPolicyDrawerProps) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const canSubmit = hasGrantedPermission(
    permissions,
    editData
      ? financePermissions.policies.refundPolicyActions.edit
      : financePermissions.policies.refundPolicyActions.create
  );
  const {
    formik,
    activeEdit,
    impact,
    isImpactLoading,
    feeHeads,
    detail,
    isFeeHeadsLoading,
    isSaving,
    isInitializing,
    isLoadError,
    retryLoading,
    unsavedChangesDialog,
    handleCloseAttempt,
    handleCustomSubmit,
  } = useRefundPolicyForm({ open, onClose, editData, academicYearId });
  const busy = isSaving || formik.isSubmitting;
  const close = () => {
    if (!busy) handleCloseAttempt();
  };
  const selectedStatus = formik.values.status === 'Active' ? 'Active' : 'Draft';
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!busy && !isInitializing && !isLoadError && canSubmit) handleCustomSubmit(selectedStatus);
    },
    [busy, isInitializing, isLoadError, canSubmit, handleCustomSubmit, selectedStatus]
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
          'aria-labelledby': 'refund-policy-title',
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
          aria-busy={busy || isInitializing}
          sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}
        >
          <FinancePolicyDrawerHeader
            title={editData ? 'Edit Refund Policy' : 'Create Refund Policy'}
            titleId="refund-policy-title"
            description={`Choose refundable paid fees and payment methods · ${editData?.academicYearName || currentYear?.name || 'Current academic year'}. Refunds remain limited to the eligible paid balance.`}
            descriptionDisplay="tooltip"
            onClose={close}
            disabled={busy}
            badges={
              <>
                {isInitializing || isLoadError ? (
                  <Skeleton variant="rounded" width={48} height={24} />
                ) : (
                  <Label color={formik.values.status === 'Active' ? 'success' : 'warning'}>
                    {formik.values.status}
                  </Label>
                )}
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
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {isInitializing ? (
                  <FinancePolicySkeleton label="Loading refund policy" />
                ) : isLoadError ? (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" color="inherit" onClick={retryLoading}>
                        Retry
                      </Button>
                    }
                  >
                    Unable to load the refund policy or its options. Retry before continuing.
                  </Alert>
                ) : (
                  <Box
                    component="fieldset"
                    disabled={busy}
                    inert={busy}
                    sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}
                  >
                    <Stack spacing={2}>
                      <RefundGeneralSection
                        formik={formik}
                        activeEdit={activeEdit}
                        impact={impact}
                        isImpactLoading={isImpactLoading}
                      />
                      <RefundEligibilitySection
                        formik={formik}
                        feeHeads={feeHeads}
                        selectedFeeHeadNames={detail?.feeHeadNames}
                        selectedFeeHeadStatuses={detail?.feeHeadStatuses}
                        isFeeHeadsLoading={isFeeHeadsLoading}
                      />
                      <SectionCard
                        title="Refund Accounting"
                        subtitle="Choose payment methods, expense category, and default bank account for refund payments."
                        icon="solar:card-recive-linear"
                      >
                        <Stack spacing={2}>
                          <CustomSelect
                            name="allowedPayoutMethods"
                            label="Payment methods *"
                            multiple
                            fullWidth
                            size="small"
                            options={PAYOUT_METHODS}
                            value={formik.values.allowedPayoutMethods}
                            onChange={(methods) =>
                              formik.setFieldValue('allowedPayoutMethods', methods)
                            }
                            onBlur={formik.handleBlur}
                            disabled={busy}
                            error={Boolean(
                              formik.touched.allowedPayoutMethods &&
                              formik.errors.allowedPayoutMethods
                            )}
                            helperText={
                              formik.touched.allowedPayoutMethods &&
                              formik.errors.allowedPayoutMethods
                                ? String(formik.errors.allowedPayoutMethods)
                                : 'Only selected methods are available for refund requests and payments.'
                            }
                          />
                          <FinanceRoutingFields
                            formik={formik}
                            academicYearId={formik.values.academicYearId || academicYearId}
                            operation="refund-policy"
                            categoryField="expenseCategoryId"
                            categoryLabel="Expense category"
                            disabled={busy}
                            bankField={
                              formik.values.allowedPayoutMethods.some((method) => method !== 'Cash')
                                ? 'defaultPayingBankAccountId'
                                : undefined
                            }
                            bankLabel="Default paying bank account"
                            skeletonLoading
                          />
                        </Stack>
                      </SectionCard>
                    </Stack>
                  </Box>
                )}
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
                <LinearProgress aria-label="Saving refund policy" sx={{ width: 160 }} />
                <Typography variant="body2">Saving policy…</Typography>
              </Stack>
            )}
          </Box>
          <RefundFooterActions
            isSaving={busy}
            disabled={isInitializing || isLoadError || !canSubmit || !formik.values.academicYearId}
            onCancel={close}
          />
        </Box>
      </Drawer>
      <ConfirmDialog
        open={unsavedChangesDialog.value}
        icon="warning"
        disableBackdropClick
        onClose={unsavedChangesDialog.onFalse}
        title="Discard Unsaved Changes?"
        content="Your changes to this refund policy will be lost."
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
    </>
  );
}
