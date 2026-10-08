'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Alert, Stack, Button, Drawer, Typography, CircularProgress } from '@mui/material';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';

import { FormFooter } from './FormFooter';
import { usePaymentTermForm } from '../hooks/usePaymentTermForm';
import { GeneralInfoSection } from './sections/GeneralInfoSection';
import { InstallmentSection } from './sections/InstallmentSection';
import { PaymentTermUsageSummary, PaymentTermDefaultSummary } from './PaymentTermUsage';

import type { IPaymentTermFormProps } from '../type';

export default function PaymentTermForm(props: IPaymentTermFormProps) {
  const { open } = props;
  return open ? <PaymentTermFormSession {...props} /> : null;
}

function PaymentTermFormSession({ open, onClose, editData }: IPaymentTermFormProps) {
  const dispatch = useDispatch();
  const discardDialog = useBoolean();
  useEffect(
    () => () => {
      dispatch(setIsChanges(false));
    },
    [dispatch]
  );
  const {
    defaultImpact,
    confirmationImpact,
    cancelDefaultConfirmation,
    termUsage,
    isLoadingImpact,
    impactError,
    formik,
    boards,
    checks,
    isSubmitting,
    isLoadingDetail,
    handleSubmit,
    addInstallment,
    removeInstallment,
  } = usePaymentTermForm(editData, onClose);

  const nextVersion = editData?.id
    ? (formik.values.currentVersionNumber ?? 1) +
      (formik.values.currentVersionStatus === 'Draft' ? 0 : 1)
    : 1;
  const busy = isSubmitting || isLoadingDetail;
  const requestClose = () => {
    if (busy || discardDialog.value || confirmationImpact) return;
    if (formik.dirty) {
      discardDialog.onTrue();
      return;
    }
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={requestClose}
      slotProps={{
        backdrop: { sx: { bgcolor: (theme) => alpha(theme.palette.common.black, 0.32) } },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'payment-term-title',
        sx: { width: { xs: '100%', sm: 'min(840px, 96vw)' }, maxWidth: '100%' },
      }}
    >
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <FinancePolicyDrawerHeader
            title={editData ? 'Edit Payment Term' : 'Create Payment Term'}
            titleId="payment-term-title"
            description="Configure a reusable installment and invoice schedule."
            descriptionDisplay="tooltip"
            helpText="Payment terms set installment and invoice dates. Drafts remain editable; active terms are available to fee structures."
            badges={
              <Label color={formik.values.status === 'Active' ? 'success' : 'warning'}>
                {formik.values.status === 'Active' ? 'Active' : 'Draft'}
              </Label>
            }
            onClose={requestClose}
            disabled={busy}
          />

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'background.neutral',
            }}
          >
            <Scrollbar sx={{ height: 1 }}>
              <Box
                component="fieldset"
                disabled={busy}
                sx={{ border: 0, m: 0, minWidth: 0, p: { xs: 2, sm: 3 } }}
              >
                <Stack spacing={2} sx={{ minWidth: 0 }}>
                  {(editData?.isUsedInDownstream || editData?.canDirectEdit === false) && (
                    <Alert severity="warning">
                      This term is mapped to fee structures. Saving creates a revision and preserves
                      existing assignments.
                    </Alert>
                  )}
                  <GeneralInfoSection formik={formik} boards={boards} />
                  {formik.values.isDefaultTerm &&
                    (isLoadingImpact || impactError || defaultImpact) && (
                      <Alert severity={impactError ? 'error' : 'info'}>
                        {isLoadingImpact
                          ? 'Loading default impact…'
                          : impactError
                            ? 'Unable to load default impact. Retry before saving.'
                            : defaultImpact && (
                                <PaymentTermDefaultSummary
                                  impact={defaultImpact}
                                  name={formik.values.paymentTermName}
                                  version={nextVersion}
                                />
                              )}
                      </Alert>
                    )}
                  {termUsage && <PaymentTermUsageSummary usage={termUsage} />}
                  <InstallmentSection
                    formik={formik}
                    board={boards.find((board) => board.id === formik.values.boardId)}
                    onAdd={addInstallment}
                    onRemove={removeInstallment}
                  />
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
                <Typography variant="body2">
                  {isSubmitting ? 'Saving payment term…' : 'Loading payment term…'}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* ── Footer ─────────────────────────────────────────────────────────── */}
          <FormFooter
            isSubmitting={busy}
            disabled={
              isSubmitting ||
              isLoadingDetail ||
              !formik.dirty ||
              !checks.isReadyToPublish ||
              !formik.isValid ||
              formik.isValidating
            }
            disabledReason={
              isLoadingDetail
                ? 'Loading payment term details'
                : checks.validationMessage ||
                  (!checks.isReadyToPublish
                    ? 'Complete the required schedule fields before submitting.'
                    : !formik.dirty
                      ? 'Make a change before submitting'
                      : 'Checking payment term validation')
            }
            onCancel={requestClose}
            onSubmit={() => handleSubmit()}
          />
          <ConfirmDialog
            open={Boolean(confirmationImpact)}
            icon="warning"
            title="Replace default payment term?"
            onClose={cancelDefaultConfirmation}
            disableCancel={isSubmitting}
            disableBackdropClick={isSubmitting}
            content={
              confirmationImpact && (
                <PaymentTermDefaultSummary
                  impact={confirmationImpact}
                  name={formik.values.paymentTermName}
                  version={nextVersion}
                />
              )
            }
            action={
              <Button
                variant="contained"
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
              >
                Confirm
              </Button>
            }
          />
          <ConfirmDialog
            open={discardDialog.value}
            icon="warning"
            title="Discard unsaved changes?"
            content="You have unsaved changes. Discard them?"
            onClose={discardDialog.onFalse}
            disableBackdropClick
            cancelText="Stay"
            action={
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  discardDialog.onFalse();
                  formik.resetForm();
                  onClose();
                }}
              >
                Discard
              </Button>
            }
          />
        </Box>
      </BackPopUpChecked>
    </Drawer>
  );
}
