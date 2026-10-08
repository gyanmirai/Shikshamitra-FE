import type { PayrollProfileDetails } from 'src/redux/hr/employee-payroll-profile-api';

import * as Yup from 'yup';
import { setIn, useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Alert, Stack, TextField } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';
import { useUpdatePayrollProfileDetailsMutation } from 'src/redux/hr/employee-payroll-profile-api';

import { changedPayrollProfileGroups } from './payroll-profile-utils';
import { payrollProfilePatchSchema } from './payroll-profile-validation';

export type PayrollEditHandle = { save: () => Promise<boolean> };
export type PayrollEditState = { dirty: boolean; busy: boolean; ready: boolean };
export const PayrollEditDetails = forwardRef<
  PayrollEditHandle,
  {
    employeeId: string;
    initialValues: PayrollProfileDetails;
    canEdit: boolean;
    onStateChange: (state: PayrollEditState) => void;
  }
>(({ employeeId, initialValues, canEdit, onStateChange }, ref) => {
  // Hold the saved baseline independently of refetches caused by policy changes.
  const [baseline, setBaseline] = useState(initialValues);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [update] = useUpdatePayrollProfileDetailsMutation();
  const router = useRouter();
  const formik = useFormik({
    initialValues: baseline,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: () => undefined,
  });
  const { confirmation } = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: busy,
  });
  useEffect(() => {
    onStateChange({ dirty: formik.dirty, busy, ready: true });
  }, [formik.dirty, busy, onStateChange]);
  useEffect(
    () => () => onStateChange({ dirty: false, busy: false, ready: false }),
    [onStateChange]
  );
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (saving.current) return false;
      const body = changedPayrollProfileGroups(baseline, formik.values);
      if (!Object.keys(body).length) return true;
      if (!canEdit) {
        setError('You do not have permission to edit payroll details.');
        return false;
      }
      setError('');
      try {
        payrollProfilePatchSchema.validateSync(body, { abortEarly: false });
      } catch (validation) {
        if (!(validation instanceof Yup.ValidationError)) throw validation;
        const errors = validation.inner.reduce(
          (acc, item) => setIn(acc, item.path || '', item.message),
          {}
        );
        const touched = validation.inner.reduce(
          (acc, item) => setIn(acc, item.path || '', true),
          {}
        );
        formik.setErrors(errors);
        await formik.setTouched(touched, false);
        focusFirstFormikError(errors);
        return false;
      }
      saving.current = true;
      setBusy(true);
      try {
        await update({ employeeId, body }).unwrap();
        setBaseline(formik.values);
        formik.resetForm({ values: formik.values });
        onStateChange({ dirty: false, busy: false, ready: true });
        shikshaMitraToast.success({ message: 'Payroll details saved.' });
        return true;
      } catch (err) {
        setError(parseApiProblemDetail(err).detail);
        return false;
      } finally {
        saving.current = false;
        setBusy(false);
      }
    },
  }));
  const field = (name: string, label: string, type = 'text') => {
    const props = formik.getFieldProps(name);
    const meta = formik.getFieldMeta(name);
    return (
      <TextField
        {...props}
        value={props.value ?? ''}
        label={label}
        type={type}
        size="small"
        fullWidth
        disabled={busy || !canEdit}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        onChange={(event) => {
          formik.setFieldError(name, undefined);
          formik.setFieldValue(
            name,
            type === 'number'
              ? event.target.value === ''
                ? null
                : Number(event.target.value)
              : event.target.value
          );
        }}
      />
    );
  };
  const grid = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  };
  return (
    <Stack spacing={1} aria-busy={busy}>
      {!canEdit && (
        <Alert severity="info">You do not have permission to edit payroll details.</Alert>
      )}
      <FormSectionCard icon="mdi:bank-outline" title="Bank details">
        <Box sx={grid}>
          {field('bankDetails.bankName', 'Bank name *')}
          {field('bankDetails.branchName', 'Branch name')}
          {field('bankDetails.accountHolderName', 'Account holder name *')}
          {field('bankDetails.accountNumber', 'Account number *')}
          {field('bankDetails.ifscCode', 'IFSC code *')}
        </Box>
      </FormSectionCard>
      <FormSectionCard icon="mdi:card-account-details-outline" title="Statutory identifiers">
        <Box sx={grid}>
          {field('statutoryIdentifiers.epfNumber', 'EPF number')}
          {field('statutoryIdentifiers.uanNumber', 'UAN number')}
        </Box>
      </FormSectionCard>
      <FormSectionCard icon="mdi:clock-outline" title="Attendance integration">
        <Box sx={grid}>
          {field('attendanceIntegration.punchId', 'Punch ID')}
          {field(
            'attendanceIntegration.totalWorkingHourPerMonth',
            'Working hours per month',
            'number'
          )}
        </Box>
      </FormSectionCard>
      {error && <Alert severity="error">{error}</Alert>}
      {confirmation}
    </Stack>
  );
});
