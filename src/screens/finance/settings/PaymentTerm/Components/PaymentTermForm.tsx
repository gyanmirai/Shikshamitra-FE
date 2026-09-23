'use client';

import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Alert, Button, Divider, LinearProgress } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { DrawerHeader } from 'src/screens/hr/policies/components/HRPolicySharedUI';

import { FormFooter } from './FormFooter';
import { SummaryPanel } from './panels/SummaryPanel';
import { usePaymentTermForm } from '../hooks/usePaymentTermForm';
import { GeneralInfoSection } from './sections/GeneralInfoSection';
import { InstallmentSection } from './sections/InstallmentSection';
import { BillingScheduleSection } from './sections/BillingScheduleSection';

import type { IPaymentTermFormProps } from '../type';

export default function PaymentTermForm({ open: _open, onClose, editData }: IPaymentTermFormProps) {
  const discardDialog = useBoolean();
  const {
    formik,
    boards,
    checks,
    demandLabel,
    isSubmitting,
    isLoadingDetail,
    handleSubmit,
    addInstallment,
    removeInstallment,
  } = usePaymentTermForm(editData, onClose);

  const requestClose = () => {
    if (formik.dirty && !isSubmitting) {
      discardDialog.onTrue();
      return;
    }
    onClose();
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flexShrink: 0, bgcolor: 'background.paper' }}>
          <DrawerHeader
            title={editData ? 'Edit Payment Term' : 'Create Payment Term'}
            subtitle={
              editData
                ? 'Update the schedule, billing rule, and lifecycle status.'
                : 'Configure a reusable installment and invoice schedule.'
            }
            helpText="Payment Terms define when student-fee installments are billed and due. Payment behaviour remains controlled by Finance policies."
            onClose={requestClose}
            closeDisabled={isSubmitting}
          />
          <Divider />
          {(isLoadingDetail || isSubmitting) && (
            <LinearProgress
              aria-label={isSubmitting ? 'Saving payment term' : 'Loading payment term'}
            />
          )}
        </Box>

        {/* ── Downstream warning ─────────────────────────────────────────────── */}
        {(editData?.isUsedInDownstream || editData?.canDirectEdit === false) && (
          <Alert
            severity="warning"
            variant="filled"
            sx={{ mx: 3, mt: 1.5, borderRadius: 1, flexShrink: 0, py: 0.75 }}
          >
            This term is mapped to active fee structures. Saving will create a new draft revision
            automatically.
          </Alert>
        )}

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: Scrollable form */}
          <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                p: 3,
                pb: 5,
                opacity: isLoadingDetail ? 0.55 : 1,
                pointerEvents: isLoadingDetail ? 'none' : 'auto',
              }}
            >
              <Alert severity="info" variant="outlined" sx={{ mb: 2.5 }}>
                Choose <strong>Draft</strong> to keep the schedule editable, or{' '}
                <strong>Active</strong> to publish it. If this is selected as default, the previous
                default for the selected board is replaced automatically.
              </Alert>
              <GeneralInfoSection formik={formik} boards={boards} />
              <InstallmentSection
                formik={formik}
                board={boards.find((board) => board.id === formik.values.boardId)}
                onAdd={addInstallment}
                onRemove={removeInstallment}
              />
              <BillingScheduleSection formik={formik} />
            </Box>
          </Scrollbar>

          {/* Right: Sticky summary panel */}
          <SummaryPanel
            values={formik.values}
            boards={boards}
            checks={checks}
            demandLabel={demandLabel}
          />
        </Box>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <FormFooter
          isSubmitting={isSubmitting}
          disabled={isLoadingDetail || !formik.dirty}
          onCancel={requestClose}
          onSubmit={handleSubmit}
        />
        <ConfirmDialog
          open={discardDialog.value}
          icon="warning"
          title="Discard unsaved changes?"
          content="Your Payment Term draft has not been saved. Closing now will discard these changes."
          onClose={discardDialog.onFalse}
          action={
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                discardDialog.onFalse();
                onClose();
              }}
            >
              Discard changes
            </Button>
          }
        />
      </Box>
    </BackPopUpChecked>
  );
}
