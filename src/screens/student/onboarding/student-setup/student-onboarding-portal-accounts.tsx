'use client';

import type { RootState } from 'src/redux/store';
import type { StudentPortalAccountOwner } from 'src/redux/student/onboarding/student-onboarding-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Alert,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useGetStudentPortalAccountsQuery,
  useProvisionStudentPortalAccountMutation,
  useGetStudentOnboardingServiceHandoffsQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';

import { StudentSetupLoadingRows } from './student-setup-loading';
import GuardianProfileEmailDialog from './guardian-profile-email-dialog';
import StudentOnboardingCredentialEmails from './student-onboarding-credential-emails';

import type { StudentOnboardingItem } from './student-onboarding-model';

export default function StudentOnboardingPortalAccounts({
  student,
  canManage,
  profileOwners,
  profilesLoading = false,
  profilesError = false,
  onRefreshProfiles,
}: {
  student: StudentOnboardingItem;
  canManage: boolean;
  profileOwners?: StudentPortalAccountOwner[];
  profilesLoading?: boolean;
  profilesError?: boolean;
  onRefreshProfiles?: () => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [profileChange, setProfileChange] = useState<{
    id: string;
    status: string;
    relationship: string;
  } | null>(null);
  const [profileCorrection, setProfileCorrection] = useState<
    'father' | 'mother' | 'guardian' | null
  >(null);
  const accounts = useGetStudentPortalAccountsQuery(student.id);
  const handoffs = useGetStudentOnboardingServiceHandoffsQuery(student.id);
  const [provision, mutation] = useProvisionStudentPortalAccountMutation();
  const canCreate = canManage && hasGrantedPermission(permissions, 'AbpIdentity.Users.Create');
  const canLink = hasGrantedPermission(permissions, 'AbpIdentity.Users.Update');
  const required = (handoffs.data ?? []).filter((item) =>
    ['student-account', 'guardian-account'].includes(item.serviceKey)
  );
  const missingAccounts = required.filter(
    (item) =>
      !accounts.data?.some((account) => `${account.accountType}-account` === item.serviceKey)
  );
  const nextAccount = missingAccounts[0] ?? required[0];
  const initialAccountType =
    nextAccount?.serviceKey === 'guardian-account' ? 'guardian' : 'student';
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      accountType: initialAccountType as 'student' | 'guardian',
      relationship: initialAccountType === 'student' ? 'self' : '',
      email: '',
      relationshipVerified: false,
      linkExistingGuardian: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email('Enter a valid email.')
        .max(256)
        .required('Email is required.'),
      accountType: Yup.string().oneOf(['student', 'guardian']).required(),
      relationship: Yup.string().when('accountType', {
        is: 'guardian',
        then: (schema) =>
          schema
            .oneOf(['father', 'mother', 'guardian'])
            .required('Choose Father, Mother, or Other guardian.'),
        otherwise: (schema) => schema.oneOf(['self']).required(),
      }),
      relationshipVerified: Yup.boolean().oneOf(
        [true],
        'Confirm the account owner and relationship.'
      ),
    }),
    onSubmit: async (values, helpers) => {
      if (disabled || !selectedRequired || selectedLinked) return;
      try {
        await provision({
          id: student.id,
          ...values,
          email: values.email.trim(),
          concurrencyStamp: student.concurrencyStamp,
        }).unwrap();
        helpers.resetForm();
        shikshaMitraToast.success({
          message:
            'Portal account linked. Credential emails follow this case’s saved school settings; check the sending status below.',
        });
      } catch (error: any) {
        helpers.setStatus(
          parseApiProblemDetail(error).detail ||
            'Account setup failed. Check the saved person’s email and relationship.'
        );
      }
    },
  });
  const selectedOwner = profileOwners?.find(
    (owner) =>
      owner.accountType === formik.values.accountType &&
      owner.relationship === formik.values.relationship
  );
  const savedEmail = selectedOwner?.email?.trim() ?? '';
  const { setFieldValue, setStatus } = formik;
  const enteredEmail = formik.values.email;
  useEffect(() => {
    if (profileOwners !== undefined && enteredEmail !== savedEmail) {
      setFieldValue('email', savedEmail, false);
      setFieldValue('relationshipVerified', false, false);
      setFieldValue('linkExistingGuardian', false, false);
      setStatus(undefined);
    }
  }, [profileOwners, savedEmail, enteredEmail, setFieldValue, setStatus]);
  const selectedRequired = required.some(
    (item) => item.serviceKey === `${formik.values.accountType}-account`
  );
  const selectedLinked = accounts.data?.some(
    (item) => item.accountType === formik.values.accountType
  );
  const closed = student.backendStatus === 4 || student.backendStatus === 5;
  const disabled =
    !canCreate ||
    closed ||
    profilesLoading ||
    profilesError ||
    mutation.isLoading ||
    accounts.isFetching ||
    handoffs.isFetching;
  if (accounts.isError || handoffs.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button
            size="small"
            onClick={() => {
              accounts.refetch();
              handoffs.refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        Portal account status could not be loaded.
      </Alert>
    );
  if (!student.studentEnrollmentId)
    return (
      <Typography variant="body2">
        Required portal accounts can be created after enrollment activation.
      </Typography>
    );
  if ((accounts.isFetching && !accounts.data) || (handoffs.isFetching && !handoffs.data)) {
    return <StudentSetupLoadingRows label="Loading portal accounts" count={2} />;
  }
  return (
    <Stack spacing={1}>
      {(accounts.data ?? []).map((account) => (
        <Alert
          key={account.accountType}
          severity={account.isActive ? 'info' : 'warning'}
          variant="outlined"
        >
          {account.accountType === 'student' ? 'Student' : 'Guardian'}: {account.email} —{' '}
          {account.isActive ? 'Linked' : 'Inactive'}.
          {!account.emailConfirmed && ' Owner email verification is pending.'}
        </Alert>
      ))}
      {!required.length && !handoffs.isFetching && (
        <Typography variant="body2">
          No portal accounts are required by this case’s saved settings.
        </Typography>
      )}
      {!!missingAccounts.length && !closed && (
        <>
          <Alert severity="info" variant="outlined">
            Use the selected person’s saved profile email. Confirm it belongs to them. Credential
            emails follow the saved school settings and readiness checks.
          </Alert>
          {profilesError && (
            <Alert
              severity="error"
              action={
                onRefreshProfiles && (
                  <Button size="small" onClick={onRefreshProfiles}>
                    Retry
                  </Button>
                )
              }
            >
              Saved account-owner profiles could not be loaded.
            </Alert>
          )}
          {!canCreate && (
            <Alert severity="warning">
              An authorized identity administrator must create the required accounts.
            </Alert>
          )}
          <Stack component="form" spacing={1} onSubmit={formik.handleSubmit}>
            <CustomSelect
              label="Account type"
              size="small"
              value={formik.values.accountType}
              disabled={disabled}
              options={required.map((item) => ({
                value: item.serviceKey.replace('-account', ''),
                label: item.serviceKey === 'student-account' ? 'Student' : 'Parent / Guardian',
              }))}
              onChange={(value) => {
                formik.setFieldValue('accountType', value);
                formik.setFieldValue('relationship', value === 'student' ? 'self' : '');
                formik.setFieldValue('email', '');
                formik.setFieldValue('relationshipVerified', false);
                formik.setFieldValue('linkExistingGuardian', false);
                formik.setStatus(undefined);
              }}
            />
            {formik.values.accountType === 'guardian' && (
              <CustomSelect
                label="Relationship"
                size="small"
                value={formik.values.relationship}
                disabled={disabled}
                options={[
                  { value: '', label: 'Select relationship' },
                  { value: 'father', label: 'Father' },
                  { value: 'mother', label: 'Mother' },
                  { value: 'guardian', label: 'Other guardian' },
                ]}
                error={Boolean(formik.touched.relationship && formik.errors.relationship)}
                helperText={
                  (formik.touched.relationship && formik.errors.relationship) ||
                  'Father, Mother and Other guardian use separate saved profiles.'
                }
                onChange={(value) => {
                  formik.setFieldValue('relationship', value);
                  formik.setFieldValue('relationshipVerified', false);
                  formik.setFieldValue('linkExistingGuardian', false);
                  formik.setStatus(undefined);
                }}
              />
            )}
            <ShakingTextField error={Boolean(formik.touched.email && formik.errors.email)}>
              <TextField
                fullWidth
                required
                size="small"
                label="Profile email"
                name="email"
                value={formik.values.email}
                disabled={disabled}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                slotProps={{ input: { readOnly: profileOwners !== undefined } }}
                error={Boolean(formik.touched.email && formik.errors.email)}
                helperText={
                  (formik.touched.email && formik.errors.email) ||
                  (formik.values.relationship && profileOwners !== undefined
                    ? savedEmail
                      ? `Saved ${formik.values.relationship === 'self' ? 'student' : formik.values.relationship === 'guardian' ? 'other guardian' : formik.values.relationship} profile${selectedOwner?.name ? `: ${selectedOwner.name}` : ''}.`
                      : 'No email is saved for this person. Correct the contact in Student Records, then refresh the profile.'
                    : 'Select the account owner and use their saved profile email.')
                }
              />
            </ShakingTextField>
            {onRefreshProfiles && (
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon="mdi:refresh" width={18} />}
                onClick={onRefreshProfiles}
                disabled={disabled}
                sx={{ alignSelf: 'flex-start' }}
              >
                Refresh saved profile
              </Button>
            )}
            {canManage &&
              !closed &&
              student.studentId &&
              selectedOwner?.name &&
              formik.values.accountType === 'guardian' &&
              hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
              hasGrantedPermission(permissions, 'Students.Records.Changes.Create') && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:pencil-outline" />}
                  disabled={disabled}
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() =>
                    setProfileCorrection(
                      formik.values.relationship as 'father' | 'mother' | 'guardian'
                    )
                  }
                >
                  Correct saved profile email
                </Button>
              )}
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  name="relationshipVerified"
                  checked={formik.values.relationshipVerified}
                  onChange={formik.handleChange}
                  disabled={disabled}
                />
              }
              label="I verified this person’s identity, mailbox ownership, and authority to access this student’s portal."
            />
            {profileChange &&
              profileChange.relationship === formik.values.relationship &&
              profileChange.status !== 'Applied' && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      component={RouterLink}
                      href={`${studentPaths.records.changes}?request=${encodeURIComponent(profileChange.id)}`}
                      size="small"
                    >
                      Review correction
                    </Button>
                  }
                >
                  {profileChange.status === 'Pending'
                    ? 'Profile email correction is pending Records approval. The saved email updates after approval.'
                    : `Profile email correction status: ${profileChange.status}. Review the change in Student Records.`}
                </Alert>
              )}
            {formik.touched.relationshipVerified && formik.errors.relationshipVerified && (
              <Alert severity="error">{formik.errors.relationshipVerified}</Alert>
            )}
            {formik.values.accountType === 'guardian' && canLink && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    name="linkExistingGuardian"
                    checked={formik.values.linkExistingGuardian}
                    onChange={formik.handleChange}
                    disabled={disabled}
                  />
                }
                label="Link a verified existing guardian portal account for a sibling, if this email already exists."
              />
            )}
            {formik.status && <Alert severity="error">{formik.status}</Alert>}
            {selectedLinked && (
              <Typography variant="body2">
                This account is already linked. Identity changes require an administrator’s review.
              </Typography>
            )}
            <LoadingButton
              size="small"
              type="submit"
              variant="outlined"
              startIcon={<Iconify icon="mdi:account-plus-outline" width={18} />}
              loading={mutation.isLoading}
              disabled={
                disabled ||
                !selectedRequired ||
                selectedLinked ||
                Boolean(profileOwners !== undefined && !savedEmail)
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              Create and link account
            </LoadingButton>
          </Stack>
        </>
      )}
      <StudentOnboardingCredentialEmails
        caseId={student.id}
        concurrencyStamp={student.concurrencyStamp}
        caseLabel={`${student.studentName} · ${student.applicationNumber}`}
        canEnableGuardianEmail={
          canManage &&
          !closed &&
          Boolean(student.studentEnrollmentId) &&
          !profilesLoading &&
          !profilesError &&
          required.some((item) => item.serviceKey === 'guardian-account')
        }
      />
      {profileCorrection && student.studentId && (
        <GuardianProfileEmailDialog
          studentId={student.studentId}
          relationship={profileCorrection}
          caseLabel={`${student.studentName} · ${student.applicationNumber}`}
          onClose={() => setProfileCorrection(null)}
          onSaved={(change) => {
            setProfileChange({ ...change, relationship: profileCorrection });
            onRefreshProfiles?.();
          }}
        />
      )}
    </Stack>
  );
}
