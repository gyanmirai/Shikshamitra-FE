'use client';

import type { RootState } from 'src/redux/store';
import type { EmployeeAccountEmail } from 'src/redux/hr/employee-account-email-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { useRef, useState, useEffect } from 'react';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { payslipActionError } from 'src/screens/hr/payroll/salarySlip-generate/payslip-action-error';
import { Alert, Stack, Button, Checkbox, Skeleton, TextField, Typography, DialogActions, FormControlLabel } from '@mui/material';
import { useGetEmployeeAccountEmailQuery, useChangeEmployeeAccountEmailMutation } from 'src/redux/hr/employee-account-email-api';

export default function EmployeeAccountEmailAction({ employeeId, disabled = false }: { employeeId: string; disabled?: boolean }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (open || disabled || !restoreFocus.current) return undefined;
    const frame = requestAnimationFrame(() => {
      if (!opener.current || opener.current.disabled) return;
      restoreFocus.current = false;
      if (document.activeElement === document.body) opener.current.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, disabled]);
  if (!hasGrantedPermission(permissions, `${hrPermissions.employee.list}.Edit`) ||
      !hasGrantedPermission(permissions, 'AbpIdentity.Users.Update')) return null;
  return <>
    <Button ref={opener} size="small" disabled={disabled} sx={{ height: 30, display: 'flex', ml: 'auto', alignSelf: 'flex-end' }} onClick={() => setOpen(true)}>Change account email</Button>
    {open && <EmployeeAccountEmailDialog key={employeeId} employeeId={employeeId} onClose={() => { restoreFocus.current = true; setOpen(false); }} />}
  </>;
}

const initialValues = { email: '', reason: '', confirmEmployeeVerified: false };
const messages: Record<string, string> = {
  'HR:Employee:010039': 'The account changed. Reload the account, review the address and try again.',
  'HR:Employee:010040': 'This employee has no unique linked account. Ask an account administrator to review the link.',
  'HR:Employee:010041': 'This email or sign-in name is already in use. Enter a different email.',
  'HR:Employee:010042': 'Identity could not accept this address. Check the email and try again.',
};

export function EmployeeAccountEmailDialog({ employeeId, onClose }: { employeeId: string; onClose: () => void }) {
  const router = useRouter();
  const query = useGetEmployeeAccountEmailQuery(employeeId, { refetchOnMountOrArgChange: true });
  const [changeEmail] = useChangeEmployeeAccountEmailMutation();
  const baseline = useRef<EmployeeAccountEmail | null>(null);
  const request = useRef<{ payload: string; key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);
  const [writeDenied, setWriteDenied] = useState(false);
  const accessDenied = writeDenied || (query.isError && query.error && 'status' in query.error &&
    (query.error.status === 401 || query.error.status === 403));
  const form = useFormik({
    initialValues,
    validationSchema: Yup.object({
      email: Yup.string().trim().email('Enter a valid email.').required('Enter the new email.').max(256),
      reason: Yup.string().trim().min(5, 'Enter a reason with at least five characters.').max(512).required('Enter a reason.'),
      confirmEmployeeVerified: Yup.boolean().oneOf([true], 'Confirm that HR verified the address with the employee.'),
    }),
    onSubmit: async (values) => {
      if (!baseline.current || query.isFetching || query.isError || reloading) return;
      const body = { ...values, email: values.email.trim(), reason: values.reason.trim(), concurrencyToken: baseline.current.concurrencyToken };
      const payload = JSON.stringify(body);
      if (request.current?.payload !== payload) request.current = { payload, key: crypto.randomUUID() };
      setError(null);
      try {
        await changeEmail({ employeeId, body: { ...body, idempotencyKey: request.current.key } }).unwrap();
        onClose();
      } catch (failure) {
        if (failure && typeof failure === 'object' && 'status' in failure && (failure.status === 401 || failure.status === 403)) setWriteDenied(true);
        const { errorCode } = parseApiProblemDetail(failure);
        setError(messages[errorCode ?? ''] || payslipActionError(failure, 'The email could not be changed. Try again.'));
      }
    },
  });
  const { dirty, isSubmitting, resetForm } = form;
  useEffect(() => {
    if (!query.currentData || query.isFetching || query.isError || dirty || isSubmitting || reloading) return;
    baseline.current = query.currentData;
    resetForm({ values: { ...initialValues, email: query.currentData.accountEmail } });
  }, [query.currentData, query.isFetching, query.isError, dirty, isSubmitting, reloading, resetForm]);
  const blocked = isSubmitting || reloading || !baseline.current || !!accessDenied;
  const { requestNavigation, confirmation } = useUnsavedNavigation(dirty, { push: router.push });
  const close = () => { if (!isSubmitting && !reloading) requestNavigation(onClose); };
  const reload = async () => {
    if (isSubmitting || reloading) return;
    setReloading(true);
    try {
      const result = await query.refetch().unwrap();
      baseline.current = result;
      setWriteDenied(false);
      await form.setFieldValue('confirmEmployeeVerified', false, false);
      request.current = null;
      setError(null);
    } catch { setError('The account could not be loaded. Your changes have been kept. Try again.'); }
    finally { setReloading(false); }
  };
  return <>
    <CustomDialog open title="Change account email" handleClose={close} disableClose={isSubmitting || reloading}
      guardUnsavedChanges={false} hasForm={false} paperProps={{ sx: { backgroundImage: 'none' } }}>
      <form onSubmit={form.handleSubmit}>
        <DialogScrollContent><Stack spacing={2}>
          <Typography variant="body2">Update the account email and payslip recipient together.
            {baseline.current && baseline.current.userName.toLowerCase() === baseline.current.accountEmail.toLowerCase() && ' The new email becomes the sign-in name.'}</Typography>
          {(error || query.isError) && <Alert severity="error" action={<Button size="small" disabled={isSubmitting || reloading} onClick={reload}>Reload account</Button>}>
            {accessDenied ? 'You do not have access to change this account.' : error || (baseline.current ? 'The account could not be refreshed. Your changes have been kept.' : 'The account could not be loaded. Try again.')}</Alert>}
          {!baseline.current || accessDenied ? <Stack spacing={2} aria-label="Loading account email" aria-busy={!query.isError}>
            <Skeleton variant="rounded" height={40} /><Skeleton variant="rounded" height={40} /><Skeleton variant="rounded" height={80} />
          </Stack> : <>
            <TextField label="Current account email" size="small" fullWidth value={baseline.current.accountEmail} slotProps={{ input: { readOnly: true } }} />
            {baseline.current.userName.toLowerCase() !== baseline.current.accountEmail.toLowerCase() &&
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>Sign-in name remains {baseline.current.userName}.</Typography>}
            <ShakingTextField error={!!(form.touched.email && form.errors.email)}><TextField label="New email" size="small" fullWidth autoFocus name="email" type="email"
              value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} disabled={blocked}
              error={!!(form.touched.email && form.errors.email)} helperText={form.touched.email && form.errors.email} /></ShakingTextField>
            <ShakingTextField error={!!(form.touched.reason && form.errors.reason)}><TextField label="Reason" size="small" fullWidth name="reason" multiline minRows={3}
              value={form.values.reason} onChange={form.handleChange} onBlur={form.handleBlur} disabled={blocked}
              error={!!(form.touched.reason && form.errors.reason)} helperText={form.touched.reason && form.errors.reason} /></ShakingTextField>
            <FormControlLabel control={<Checkbox size="small" name="confirmEmployeeVerified" checked={form.values.confirmEmployeeVerified}
              onChange={form.handleChange} disabled={blocked} />} label="HR verified this address with the employee" />
            {form.touched.confirmEmployeeVerified && form.errors.confirmEmployeeVerified &&
              <Typography variant="caption" color="error" role="alert">{form.errors.confirmEmployeeVerified}</Typography>}
          </>}
        </Stack></DialogScrollContent>
        <DialogActions><Button size="small" disabled={isSubmitting || reloading} onClick={close}>Cancel</Button>
          <Button size="small" sx={{ height: 30 }} type="submit" variant="contained" loading={isSubmitting} disabled={blocked || query.isFetching || query.isError}>Change email</Button></DialogActions>
      </form>
    </CustomDialog>
    {confirmation}
  </>;
}
