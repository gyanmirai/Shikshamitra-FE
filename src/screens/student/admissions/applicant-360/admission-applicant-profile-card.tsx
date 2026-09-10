'use client';

import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { shikshaMitraToast } from 'src/components/toast';
import { useBoolean } from 'src/hooks/use-boolean';
import { Card, Alert, Stack, Button, Typography, CardContent } from '@mui/material';
import { useUpdateAdmissionApplicantProfileMutation } from 'src/redux/student/admissions/admission-applicants-api';

import { AdmissionApplicantProfileDialog } from './admission-applicant-profile-dialog';

type Props = { data: AdmissionApplicant360 };

export function AdmissionApplicantProfileCard({ data }: Props) {
  const dialog = useBoolean();
  const [updateProfile, updateState] = useUpdateAdmissionApplicantProfileMutation();
  const locked = data.applications.some(
    (application) => application.status === 10 || application.status === 11
  );
  const name = [data.applicant.firstName, data.applicant.middleName, data.applicant.lastName]
    .filter(Boolean)
    .join(' ');
  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Stack spacing={0.5}>
            <Typography variant="h6">{name}</Typography>
            <Typography color="text.secondary">
              Date of birth:{' '}
              {data.applicant.dateOfBirth
                ? new Date(data.applicant.dateOfBirth).toLocaleDateString()
                : 'Missing'}{' '}
              · Gender: {data.applicant.gender ?? 'Missing'}
            </Typography>
            <Typography color="text.secondary">
              {data.primaryGuardian?.firstName} {data.primaryGuardian?.lastName} ·{' '}
              {data.primaryGuardian?.mobile}
            </Typography>
            <Typography color="text.secondary">
              Family {data.family?.familyNumber ?? '—'}
            </Typography>
          </Stack>
          <Button variant="outlined" disabled={locked} onClick={dialog.onTrue}>
            Edit identity
          </Button>
        </Stack>
        {locked && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This admission is finalized. Update identity details from the Student record.
          </Alert>
        )}
      </CardContent>
      <AdmissionApplicantProfileDialog
        open={dialog.value}
        busy={updateState.isLoading}
        applicant={data.applicant}
        onClose={dialog.onFalse}
        onSubmit={async (body) => {
          try {
            await updateProfile({ applicantId: data.applicant.id, body }).unwrap();
            shikshaMitraToast.success({ message: 'Applicant identity updated' });
            return true;
          } catch {
            shikshaMitraToast.error({ message: 'Unable to update applicant identity' });
            return false;
          }
        }}
      />
    </Card>
  );
}
