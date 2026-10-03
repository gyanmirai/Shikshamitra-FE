'use client';

import type { PayslipDocument } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useReplacePayslipFactsMutation, useRecordPayslipPaymentMutation } from 'src/redux/hr/payslip-api';

type Props = { document: PayslipDocument; mode: 'payment' | 'replace'; onClose: () => void };

export default function PayslipDocumentActionDialog({ document, mode, onClose }: Props) {
  const router = useRouter();
  const [recordPayment] = useRecordPayslipPaymentMutation();
  const [replaceFacts] = useReplacePayslipFactsMutation();
  const [error, setError] = useState<string | null>(null);
  const request = useRef<{ payload: string; key: string } | null>(null);
  const payment = mode === 'payment';
  const form = useFormik({
    initialValues: { description: '', paidAt: dayjs().format('YYYY-MM-DDTHH:mm') },
    validationSchema: Yup.object({
      description: Yup.string().trim().required(payment ? 'Enter a payment reference.' : 'Enter a correction reason.')
        .max(payment ? 200 : 1000),
      paidAt: payment ? Yup.string().required('Enter the payment date.').test('date', 'Enter a valid date that is not in the future.',
        (value) => !!value && dayjs(value).isValid() && !dayjs(value).isAfter(dayjs())) : Yup.string(),
    }),
    onSubmit: async (values) => {
      setError(null);
      const payload = JSON.stringify({ documentId: document.id, mode, ...values });
      if (request.current?.payload !== payload) request.current = { payload, key: crypto.randomUUID() };
      try {
        if (payment) await recordPayment({ documentId: document.id, idempotencyKey: request.current.key,
          paidAt: dayjs(values.paidAt).toISOString(), reference: values.description.trim() }).unwrap();
        else await replaceFacts({ documentId: document.id, idempotencyKey: request.current.key,
          reason: values.description.trim() }).unwrap();
        onClose();
      } catch (problem) { setError(parseApiProblemDetail(problem).detail || 'The change could not be saved.'); }
    },
  });
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.dirty, { push: router.push });
  const close = () => { if (!form.isSubmitting) requestNavigation(onClose); };
  return <>
    <CustomDialog open title={payment ? 'Record payment' : 'Replace document details'} handleClose={close}
      disableClose={form.isSubmitting} guardUnsavedChanges={false} hasForm={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}>
      <form onSubmit={form.handleSubmit}>
        <DialogScrollContent><Stack spacing={2}>
          {!payment && <Typography variant="body2">Use the current employee and school details to issue a replacement. Earnings, deductions and attendance remain unchanged.</Typography>}
          {error && <Alert severity="error">{error}</Alert>}
          {payment && <TextField label="Payment date and time" type="datetime-local" size="small" name="paidAt"
            value={form.values.paidAt} onChange={form.handleChange} onBlur={form.handleBlur}
            slotProps={{ inputLabel: { shrink: true } }} disabled={form.isSubmitting}
            error={!!(form.touched.paidAt && form.errors.paidAt)} helperText={form.touched.paidAt && form.errors.paidAt} />}
          <TextField label={payment ? 'Payment reference' : 'Correction reason'} size="small" name="description"
            multiline={!payment} minRows={payment ? undefined : 3} value={form.values.description}
            onChange={form.handleChange} onBlur={form.handleBlur} disabled={form.isSubmitting}
            error={!!(form.touched.description && form.errors.description)} helperText={form.touched.description && form.errors.description} />
        </Stack></DialogScrollContent>
        <DialogActions><Button size="small" onClick={close} disabled={form.isSubmitting}>Cancel</Button>
          <Button size="small" variant="contained" type="submit" disabled={form.isSubmitting}>
            {payment ? 'Record payment' : 'Issue replacement'}</Button></DialogActions>
      </form>
    </CustomDialog>
    {confirmation}
  </>;
}
