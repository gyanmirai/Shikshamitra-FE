'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { Alert, Stack, Button, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';
import {
  useGetStudentPortalAccountsQuery,
  useProvisionStudentPortalAccountMutation,
  useGetStudentOnboardingServiceHandoffsQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem } from './student-onboarding-model';

export default function StudentOnboardingPortalAccounts({ student, canManage }: {
  student: StudentOnboardingItem; canManage: boolean;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const accounts = useGetStudentPortalAccountsQuery(student.id);
  const handoffs = useGetStudentOnboardingServiceHandoffsQuery(student.id);
  const [provision, mutation] = useProvisionStudentPortalAccountMutation();
  const canCreate = canManage && hasGrantedPermission(permissions, 'AbpIdentity.Users.Create');
  const canLink = hasGrantedPermission(permissions, 'AbpIdentity.Users.Update');
  const required = (handoffs.data ?? []).filter(item => ['student-account', 'guardian-account'].includes(item.serviceKey));
  const nextAccount = required.find(item => !accounts.data?.some(account => `${account.accountType}-account` === item.serviceKey)) ?? required[0];
  const initialAccountType = nextAccount?.serviceKey === 'guardian-account' ? 'guardian' : 'student';
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { accountType: initialAccountType as 'student' | 'guardian', relationship: initialAccountType === 'student' ? 'self' : 'guardian', email: '', relationshipVerified: false, linkExistingGuardian: false },
    validationSchema: Yup.object({
      email: Yup.string().trim().email('Enter a valid email.').max(256).required('Email is required.'),
      accountType: Yup.string().oneOf(['student', 'guardian']).required(),
      relationship: Yup.string().required(),
      relationshipVerified: Yup.boolean().oneOf([true], 'Confirm the account owner and relationship.'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await provision({ id: student.id, ...values, email: values.email.trim(), concurrencyStamp: student.concurrencyStamp }).unwrap();
        helpers.resetForm();
        shikshaMitraToast.success({ message: 'Portal account linked. The owner must verify their email and set their password through the account service.' });
      } catch (error: any) {
        helpers.setStatus(error?.data?.error?.data?.Reason || error?.data?.detail || 'Account setup failed. Check the saved person’s email, existing identity, and your identity permissions.');
      }
    },
  });
  const selectedRequired = required.some(item => item.serviceKey === `${formik.values.accountType}-account`);
  const selectedLinked = accounts.data?.some(item => item.accountType === formik.values.accountType);
  const closed = student.backendStatus === 4 || student.backendStatus === 5;
  const disabled = !canCreate || closed || mutation.isLoading || accounts.isFetching || handoffs.isFetching;
  if (accounts.isError || handoffs.isError) return <Alert severity="error" action={<Button size="small" onClick={() => { accounts.refetch(); handoffs.refetch(); }}>Retry</Button>}>Portal account status could not be loaded.</Alert>;
  if (!student.studentEnrollmentId) return <Typography variant="body2">Required portal accounts can be created after enrollment activation.</Typography>;
  return (
    <Stack spacing={1}>
      {(accounts.data ?? []).map(account => <Alert key={account.accountType} severity={account.isActive ? 'info' : 'warning'}>
        {account.accountType === 'student' ? 'Student' : 'Guardian'}: {account.email} — {account.isActive ? 'Linked' : 'Inactive'}.
        {!account.emailConfirmed && ' Owner email verification is pending.'}
      </Alert>)}
      {!required.length && !handoffs.isFetching && <Typography variant="body2">No portal accounts are required by this case’s saved settings.</Typography>}
      {!!required.length && !closed && <>
        <Alert severity="info">Use the selected person’s saved profile email. Confirm it belongs to them. No password or invitation is sent from this screen.</Alert>
        {!canCreate && <Alert severity="warning">An authorized identity administrator must create the required accounts.</Alert>}
        <Stack component="form" spacing={1} onSubmit={formik.handleSubmit}>
          <CustomSelect label="Account type" size="small" value={formik.values.accountType}
            disabled={disabled} options={required.map(item => ({ value: item.serviceKey.replace('-account', ''), label: item.serviceKey === 'student-account' ? 'Student' : 'Guardian' }))}
            onChange={value => { formik.setFieldValue('accountType', value); formik.setFieldValue('relationship', value === 'student' ? 'self' : 'guardian'); formik.setFieldValue('email', ''); formik.setFieldValue('relationshipVerified', false); formik.setFieldValue('linkExistingGuardian', false); }} />
          {formik.values.accountType === 'guardian' && <CustomSelect label="Relationship" size="small" value={formik.values.relationship} disabled={disabled}
            options={[{ value: 'father', label: 'Father' }, { value: 'mother', label: 'Mother' }, { value: 'guardian', label: 'Guardian' }]}
            onChange={value => { formik.setFieldValue('relationship', value); formik.setFieldValue('relationshipVerified', false); }} />}
          <ShakingTextField error={Boolean(formik.touched.email && formik.errors.email)}>
            <TextField fullWidth required size="small" label="Profile email" name="email" value={formik.values.email}
              disabled={disabled} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={Boolean(formik.touched.email && formik.errors.email)} helperText={formik.touched.email && formik.errors.email} />
          </ShakingTextField>
          <FormControlLabel control={<Checkbox size="small" name="relationshipVerified" checked={formik.values.relationshipVerified} onChange={formik.handleChange} disabled={disabled} />}
            label="I verified this person’s identity, mailbox ownership, and authority to access this student’s portal." />
          {formik.touched.relationshipVerified && formik.errors.relationshipVerified && <Alert severity="error">{formik.errors.relationshipVerified}</Alert>}
          {formik.values.accountType === 'guardian' && canLink && <FormControlLabel control={<Checkbox size="small" name="linkExistingGuardian" checked={formik.values.linkExistingGuardian} onChange={formik.handleChange} disabled={disabled} />}
            label="Link a verified existing guardian portal account for a sibling, if this email already exists." />}
          {formik.status && <Alert severity="error">{formik.status}</Alert>}
          {selectedLinked && <Typography variant="body2">This account is already linked. Identity changes require an administrator’s review.</Typography>}
          <Button size="small" type="submit" variant="outlined" disabled={disabled || !selectedRequired || selectedLinked}>
            {mutation.isLoading ? 'Creating and linking…' : 'Create and link account'}
          </Button>
        </Stack>
      </>}
    </Stack>
  );
}
