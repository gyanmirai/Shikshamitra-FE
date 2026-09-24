'use client';

import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatDateOnly } from 'src/utils/date-only';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Card,
  Alert,
  Stack,
  Avatar,
  Button,
  Divider,
  Typography,
  CardContent,
} from '@mui/material';
import { useUpdateAdmissionApplicantProfileMutation } from 'src/redux/student/admissions/admission-applicants-api';

import { AdmissionApplicantProfileDialog } from './admission-applicant-profile-dialog';
import { formatAdmissionReference } from '../admission-reference';
import {
  getApplicantName,
  getApplicantInitials,
  getPrimaryApplication,
  getApplicantJourneyState,
  getApplicantMissingDetails,
} from './admission-applicant-360-model';

type Props = { data: AdmissionApplicant360 };

export function AdmissionApplicantProfileCard({ data }: Props) {
  const dialog = useBoolean();
  const [updateProfile, updateState] = useUpdateAdmissionApplicantProfileMutation();
  const locked = data.applications.some(
    (application) => application.status === 10 || application.status === 11
  );
  const application = getPrimaryApplication(data.applications);
  const name = getApplicantName(data);
  const journey = getApplicantJourneyState(data.applications);
  const missingDetails = getApplicantMissingDetails(data);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              sx={{
                width: { xs: 52, sm: 56 },
                height: { xs: 52, sm: 56 },
                color: 'success.dark',
                bgcolor: 'success.lighter',
                border: 1,
                borderColor: 'success.light',
                fontWeight: 700,
                fontSize: '1.125rem',
              }}
            >
              {getApplicantInitials(data)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>
                  {name}
                </Typography>
                <Label color={journey.color}>{journey.label}</Label>
                {missingDetails.length > 0 && <Label color="warning">Profile incomplete</Label>}
              </Stack>
              <Stack
                direction="row"
                divider={<Divider orientation="vertical" flexItem />}
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 0.5 }}
              >
                {application && (
                  <Typography variant="caption" color="text.secondary">
                    Application: {formatAdmissionReference(application.applicationNumber)}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Family reference: {formatAdmissionReference(data.family?.familyNumber)}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            disabled={locked}
            onClick={dialog.onTrue}
            startIcon={<Iconify icon="mdi:account-edit-outline" />}
            sx={{ minHeight: 44, alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Edit identity
          </Button>
        </Stack>
      </CardContent>
      <AdmissionApplicantProfileDialog
        open={dialog.value}
        busy={updateState.isLoading}
        applicant={data.applicant}
        guardian={data.primaryGuardian}
        onClose={dialog.onFalse}
        onSubmit={async (body) => {
          try {
            await updateProfile({ applicantId: data.applicant.id, body }).unwrap();
            shikshaMitraToast.success({ message: 'Applicant identity and guardian contact updated' });
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

export function AdmissionApplicantEssentials({ data }: Props) {
  const locked = data.applications.some(
    (application) => application.status === 10 || application.status === 11
  );
  const guardianName = [data.primaryGuardian?.firstName, data.primaryGuardian?.lastName]
    .filter(Boolean)
    .join(' ');
  const details = [
    {
      label: 'Date of birth',
      value: data.applicant.dateOfBirth
        ? formatDateOnly(data.applicant.dateOfBirth, 'DD MMM YYYY')
        : 'Not provided',
      missing: !data.applicant.dateOfBirth,
    },
    {
      label: 'Gender',
      value: data.applicant.gender ?? 'Not provided',
      missing: !data.applicant.gender,
    },
    {
      label: 'Primary guardian',
      value: guardianName || 'Not provided',
      missing: false,
    },
    {
      label: 'Contact number',
      value: data.primaryGuardian?.mobile ?? 'Not provided',
      missing: false,
    },
  ];

  return (
    <Box component="section" aria-labelledby="applicant-essentials-heading">
      <Typography id="applicant-essentials-heading" variant="h6" sx={{ mb: 1 }}>
        Applicant essentials
      </Typography>
      <Stack divider={<Divider flexItem />}>
        {details.map((detail) => (
          <Box
            key={detail.label}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(104px, 0.8fr) minmax(0, 1.2fr)', sm: '1fr 2fr' },
              gap: 1.5,
              alignItems: 'start',
              py: 1.25,
              minWidth: 0,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {detail.label}
            </Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {detail.value}
              </Typography>
              {detail.missing && !locked && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                  <Iconify icon="mdi:alert-outline" width={16} sx={{ color: 'warning.main' }} />
                  <Typography variant="caption" color="warning.main">
                    Required before finalization.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
      {locked && getApplicantMissingDetails(data).length > 0 && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          This admission is finalized. Update identity details from the Student record.
        </Alert>
      )}
    </Box>
  );
}
