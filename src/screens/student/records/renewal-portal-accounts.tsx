import type { RootState } from 'src/redux/store';
import type { StudentRenewal } from 'src/redux/student/records/student-record-transitions-api';

import * as Yup from 'yup';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Stack,
  Alert,
  Button,
  Checkbox,
  TextField,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetStudentRecordRenewalPortalOptionsQuery,
  useProvisionStudentRecordRenewalPortalMutation,
} from 'src/redux/student/records/student-record-transitions-api';

type Props = {
  renewal: StudentRenewal;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
};

export default function RenewalPortalAccounts({ renewal, onDirtyChange, onBusyChange }: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = [
    'Students.Records.Transitions.Add',
    'Students.Onboarding.Add',
    'AbpIdentity.Users.Create',
  ].every((permission) => hasGrantedPermission(permissions, permission));
  const canLink = hasGrantedPermission(permissions, 'AbpIdentity.Users.Update');
  const query = useGetStudentRecordRenewalPortalOptionsQuery(renewal.id, {
    skip: renewal.status === 'PendingChecklist' || renewal.status === 'Cancelled',
    refetchOnMountOrArgChange: true,
  });
  const [provision, mutation] = useProvisionStudentRecordRenewalPortalMutation();
  const options = query.currentData;
  const choices = [
    ...(options?.studentRequired && options.studentEmail
      ? [
          {
            value: 'student:self',
            label: 'Student',
            accountType: 'student' as const,
            relationship: 'self' as const,
            email: options.studentEmail,
          },
        ]
      : []),
    ...(options?.guardianRequired
      ? options.guardians.map((person) => ({
          value: `guardian:${person.relationship}`,
          label: `${person.relationship[0].toUpperCase()}${person.relationship.slice(1)}${person.name ? ` · ${person.name}` : ''}`,
          accountType: 'guardian' as const,
          relationship: person.relationship,
          email: person.email,
        }))
      : []),
  ];
  const form = useFormik({
    initialValues: {
      owner: '',
      email: '',
      relationshipVerified: false,
      linkExistingGuardian: false,
    },
    validationSchema: Yup.object({
      owner: Yup.string().required('Choose an account owner.'),
      email: Yup.string()
        .trim()
        .email('The saved profile email is invalid.')
        .max(256)
        .required('A saved profile email is required.'),
      relationshipVerified: Yup.boolean().oneOf(
        [true],
        'Confirm the person’s identity, mailbox ownership, and relationship.'
      ),
    }),
    onSubmit: async (values, helpers) => {
      const person = choices.find((choice) => choice.value === values.owner);
      if (
        !person ||
        person.email.trim() !== values.email.trim() ||
        query.isFetching ||
        query.isError ||
        !canCreate ||
        !options?.canProvision ||
        (values.linkExistingGuardian && (!canLink || person.accountType !== 'guardian')) ||
        options.accounts.some((account) => account.accountType === person.accountType)
      ) {
        helpers.setStatus(
          'Review the current person, saved email, account status, and your permissions before linking.'
        );
        return;
      }
      helpers.setStatus(undefined);
      try {
        await provision({
          id: renewal.id,
          accountType: person.accountType,
          relationship: person.relationship,
          email: values.email.trim(),
          relationshipVerified: values.relationshipVerified,
          linkExistingGuardian: values.linkExistingGuardian,
          concurrencyStamp: renewal.concurrencyStamp,
        }).unwrap();
        helpers.resetForm();
        shikshaMitraToast.success({
          message: 'Portal account linked. Refresh required handoffs to check renewal completion.',
        });
      } catch (error) {
        const details = (
          error as { data?: { error?: { code?: string; data?: { Reason?: string } } } }
        )?.data?.error;
        helpers.setStatus(
          details?.code?.includes('ConcurrencyConflict')
            ? 'This renewal changed. Reopen it to review the current state. Your selection has been kept.'
            : details?.data?.Reason ||
                'Account setup failed. Check the recorded email, existing account, and identity permissions, then retry. Your selection has been kept.'
        );
      }
    },
  });
  const busy = mutation.isLoading || form.isSubmitting;
  useEffect(() => {
    onDirtyChange(form.dirty);
    return () => onDirtyChange(false);
  }, [form.dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const person = choices.find((choice) => choice.value === form.values.owner);
  const emailChanged = Boolean(person && person.email.trim() !== form.values.email.trim());
  const linked = Boolean(
    person && options?.accounts.some((account) => account.accountType === person.accountType)
  );
  const disabled = busy || query.isFetching || !canCreate || !options?.canProvision;
  const selectPerson = (value: string) => {
    const selectedPerson = choices.find((choice) => choice.value === value);
    form.setValues({
      owner: value,
      email: selectedPerson?.email ?? '',
      relationshipVerified: false,
      linkExistingGuardian: false,
    });
    form.setStatus(undefined);
  };
  return (
    <FormSectionCard icon="mdi:account-key-outline" title="Required portal accounts">
      <Stack spacing={1.5}>
        {renewal.status === 'Cancelled' ? (
          <Typography variant="body2">
            This renewal was cancelled before activation. Its history remains available.
          </Typography>
        ) : renewal.status === 'PendingChecklist' ? (
          <Typography variant="body2">
            Activate this renewal before setting up its required portal accounts.
          </Typography>
        ) : query.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => query.refetch()}>
                Retry portal status
              </Button>
            }
          >
            Portal account status could not be loaded with your current access.
          </Alert>
        ) : !options ? (
          <LinearProgress aria-label="Loading renewal portal accounts" />
        ) : (
          <>
            {query.isFetching && <LinearProgress aria-label="Refreshing renewal portal accounts" />}
            {options.accounts.map((account) => (
              <Alert
                key={`${account.accountType}:${account.userId}`}
                severity={account.isActive ? 'info' : 'warning'}
              >
                {account.accountType === 'student' ? 'Student' : 'Guardian'} · {account.email} ·{' '}
                {account.isActive ? 'Linked' : 'Inactive'}.
                {!account.emailConfirmed && ' Email verification is pending.'}
              </Alert>
            ))}
            {!options.studentRequired && !options.guardianRequired && (
              <Typography variant="body2">
                This renewal does not require portal accounts.
              </Typography>
            )}
            {renewal.status === 'Provisioning' &&
              (options.studentRequired || options.guardianRequired) && (
                <>
                  {!canCreate || !options.canProvision ? (
                    <Alert severity="info">
                      An authorized onboarding and identity administrator must link the required
                      accounts.
                    </Alert>
                  ) : (
                    <>
                      <Typography variant="body2">
                        Use the person’s saved profile email. The account owner completes email
                        verification and password setup through the account service.
                      </Typography>
                      {options.studentRequired && !options.studentEmail && (
                        <Alert severity="warning">
                          Add the student’s email through a reviewed contact correction before
                          creating their account.
                        </Alert>
                      )}
                      {options.guardianRequired && !options.guardians.length && (
                        <Alert severity="warning">
                          Add a guardian’s email through a reviewed family correction before
                          creating their account.
                        </Alert>
                      )}
                      <Stack component="form" spacing={1.5} onSubmit={form.handleSubmit} noValidate>
                        <CustomSelect
                          label="Account owner"
                          value={form.values.owner}
                          options={choices.map((choice) => ({
                            value: choice.value,
                            label: choice.label,
                          }))}
                          onChange={(value) => selectPerson(String(value))}
                          disabled={disabled || !choices.length}
                          error={Boolean(form.touched.owner && form.errors.owner)}
                          helperText={form.touched.owner ? form.errors.owner : undefined}
                        />
                        <TextField
                          fullWidth
                          label="Saved profile email"
                          value={form.values.email}
                          slotProps={{ input: { readOnly: true } }}
                          error={Boolean(form.touched.email && form.errors.email)}
                          helperText={form.touched.email ? form.errors.email : undefined}
                        />
                        {emailChanged && (
                          <Alert
                            severity="warning"
                            action={
                              <Button
                                disabled={disabled}
                                onClick={() => selectPerson(form.values.owner)}
                              >
                                Review updated person
                              </Button>
                            }
                          >
                            The saved email changed. Review it and confirm ownership again.
                          </Alert>
                        )}
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="relationshipVerified"
                              checked={form.values.relationshipVerified}
                              onChange={form.handleChange}
                              disabled={disabled || !person || linked || emailChanged}
                            />
                          }
                          label="I verified this person’s identity, mailbox ownership, and authority to access this student’s portal."
                        />
                        {form.touched.relationshipVerified && form.errors.relationshipVerified && (
                          <Alert severity="error">{form.errors.relationshipVerified}</Alert>
                        )}
                        {person?.accountType === 'guardian' && canLink && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="linkExistingGuardian"
                                checked={form.values.linkExistingGuardian}
                                onChange={form.handleChange}
                                disabled={disabled || linked || emailChanged}
                              />
                            }
                            label="Link a verified existing guardian account for a sibling if this email already exists."
                          />
                        )}
                        {linked && (
                          <Typography variant="body2">
                            This account is already linked. An identity administrator must review
                            any repair.
                          </Typography>
                        )}
                        {form.status && <Alert severity="error">{form.status}</Alert>}
                        <Button
                          type="submit"
                          variant="contained"
                          loading={busy}
                          disabled={disabled || !person || linked || emailChanged}
                        >
                          Create and link account
                        </Button>
                      </Stack>
                    </>
                  )}
                </>
              )}
          </>
        )}
      </Stack>
    </FormSectionCard>
  );
}
