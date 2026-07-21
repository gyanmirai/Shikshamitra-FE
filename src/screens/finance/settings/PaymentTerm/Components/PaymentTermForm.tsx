'use client';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Alert, Button, Typography } from '@mui/material';

import { FormFooter } from './FormFooter';
import { SummaryPanel } from './panels/SummaryPanel';
import { usePaymentTermForm } from '../hooks/usePaymentTermForm';
import { GeneralInfoSection } from './sections/GeneralInfoSection';
import { InstallmentSection } from './sections/InstallmentSection';
import { BillingScheduleSection } from './sections/BillingScheduleSection';

import type { IPaymentTermFormProps } from '../type';

export default function PaymentTermForm({ open: _open, onClose, editData }: IPaymentTermFormProps) {
  const {
    formik,
    boards,
    checks,
    demandLabel,
    isSubmitting,
    codeManuallyEdited,
    setCodeManuallyEdited,
    handleSubmit,
    addInstallment,
    removeInstallment,
    duplicateInstallment,
  } = usePaymentTermForm(editData, onClose);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            {editData ? 'Edit Payment Term' : 'Create Payment Term'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {editData
              ? 'Update installments, demand rules, and payment options.'
              : 'Configure installment schedules, due dates, and payment rules.'}
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => onClose()}
          startIcon={<Iconify icon="mdi:close" />}
          color="inherit"
        >
          Close
        </Button>
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
          <Box sx={{ p: 3, pb: 5 }}>
            <GeneralInfoSection
              formik={formik}
              boards={boards}
              codeManuallyEdited={codeManuallyEdited}
              setCodeManuallyEdited={setCodeManuallyEdited}
            />
            <InstallmentSection
              formik={formik}
              onAdd={addInstallment}
              onRemove={removeInstallment}
              onDuplicate={duplicateInstallment}
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
        isEdit={Boolean(editData)}
        onCancel={() => onClose()}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
