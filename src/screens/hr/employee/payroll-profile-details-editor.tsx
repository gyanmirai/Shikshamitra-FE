import type { PayrollProfileDetails } from 'src/redux/hr/employee-payroll-profile-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { setIn, useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { shikshaMitraToast } from 'src/components/toast';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useUpdatePayrollProfileDetailsMutation } from 'src/redux/hr/employee-payroll-profile-api';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Button,
  Drawer,
  Divider,
  Backdrop,
  TextField,
  CircularProgress,
} from '@mui/material';

import { changedPayrollProfileGroups } from './payroll-profile-utils';
import { DrawerHeader } from '../policies/components/HRPolicySharedUI';
import { payrollProfilePatchSchema } from './payroll-profile-validation';

export function PayrollProfileDetailsEditor({
  employeeId,
  initialValues,
  onClose,
}: {
  employeeId: string;
  initialValues: PayrollProfileDetails;
  onClose: () => void;
}) {
  const [save, saveState] = useUpdatePayrollProfileDetailsMutation();
  const [error, setError] = useState('');
  const router = useRouter();
  const formik = useFormik({
    initialValues,
    validate: (values) => {
      try {
        payrollProfilePatchSchema.validateSync(changedPayrollProfileGroups(initialValues, values), {
          abortEarly: false,
        });
        return {};
      } catch (validation) {
        if (!(validation instanceof Yup.ValidationError)) throw validation;
        return validation.inner.reduce(
          (errors, item) => setIn(errors, item.path || '', item.message),
          {}
        );
      }
    },
    onSubmit: async (values) => {
      setError('');
      try {
        await save({
          employeeId,
          body: changedPayrollProfileGroups(initialValues, values),
        }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Payroll profile details saved.' });
        onClose();
      } catch (err) {
        setError(parseApiProblemDetail(err).detail);
      }
    },
  });
  const busy = formik.isSubmitting || saveState.isLoading;
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    push: router.push,
  });
  const close = () => {
    if (!busy) requestNavigation(onClose);
  };
  const field = (name: string, label: string, type = 'text') => {
    const props = formik.getFieldProps(name);
    const meta = formik.getFieldMeta(name);
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={name}>
        <TextField
          {...props}
          value={props.value ?? ''}
          label={label}
          type={type}
          fullWidth
          size="small"
          disabled={busy}
          onChange={
            type === 'number'
              ? (event) =>
                  formik.setFieldValue(
                    name,
                    event.target.value === '' ? null : Number(event.target.value)
                  )
              : formik.handleChange
          }
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
        />
      </Grid>
    );
  };
  return (
    <Drawer
      anchor="right"
      open
      onClose={close}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 640 } },
          role: 'dialog',
          'aria-label': 'Edit details',
        },
      }}
    >
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          formik.submitForm();
        }}
        sx={{ display: 'flex', flexDirection: 'column', height: 1 }}
      >
        <DrawerHeader title="Edit details" onClose={close} closeDisabled={busy} />
        <Divider />
        <Stack
          spacing={1}
          sx={{ p: 2, flex: 1, overflow: 'auto', position: 'relative' }}
          useFlexGap
          aria-busy={busy}
        >
          <Backdrop
            open={busy}
            sx={{ position: 'absolute', zIndex: 1, bgcolor: 'action.disabledBackground' }}
          >
            <CircularProgress size={24} aria-label="Saving or reviewing changes" />
          </Backdrop>
          <FormSectionCard icon="mdi:bank-outline" title="Bank details">
            <Grid container spacing={1}>
              {field('bankDetails.bankName', 'Bank name *')}
              {field('bankDetails.branchName', 'Branch name')}
              {field('bankDetails.accountHolderName', 'Account holder name *')}
              {field('bankDetails.accountNumber', 'Account number *')}
              {field('bankDetails.ifscCode', 'IFSC code *')}
            </Grid>
          </FormSectionCard>
          <FormSectionCard icon="mdi:clock-outline" title="Attendance integration">
            <Grid container spacing={1}>
              {field('attendanceIntegration.punchId', 'Punch ID')}
              {field(
                'attendanceIntegration.totalWorkingHourPerMonth',
                'Working hours per month',
                'number'
              )}
            </Grid>
          </FormSectionCard>
        </Stack>
        <Divider />
        <Stack spacing={1} sx={{ p: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button size="small" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              variant="contained"
              color="inherit"
              loading={busy}
              disabled={!formik.dirty}
            >
              Save details
            </Button>
          </Stack>
        </Stack>
        {confirmation}
      </Box>
    </Drawer>
  );
}
