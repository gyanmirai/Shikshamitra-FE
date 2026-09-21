'use client';

import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatDateOnly } from 'src/utils/date-only';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Card, Alert, Stack, Avatar, Button, Typography, CardContent } from '@mui/material';
import { useUpdateAdmissionApplicantProfileMutation } from 'src/redux/student/admissions/admission-applicants-api';

import { AdmissionApplicantProfileDialog } from './admission-applicant-profile-dialog';
import { formatAdmissionReference } from '../admission-reference';
import {
  getApplicantName,
  getApplicantInitials,
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
  const name = getApplicantName(data);
  const journey = getApplicantJourneyState(data.applications);
  const missingDetails = getApplicantMissingDetails(data);
  const guardianName = [data.primaryGuardian?.firstName, data.primaryGuardian?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <Card variant="outlined" sx={{ overflow: 'visible' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'flex-start' }}
            gap={2}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  color: 'primary.main',
                  bgcolor: 'action.selected',
                  border: 1,
                  borderColor: 'divider',
                  fontWeight: 700,
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                }}
              >
                {getApplicantInitials(data)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary">
                  Applicant profile
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                  <Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>
                    {name}
                  </Typography>
                  <Label color={journey.color}>{journey.label}</Label>
                  {missingDetails.length > 0 && <Label color="warning">Profile incomplete</Label>}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {journey.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Family reference: {formatAdmissionReference(data.family?.familyNumber)}
                </Typography>
              </Box>
            </Stack>
            <Button
              size="small"
              variant="outlined"
              disabled={locked}
              onClick={dialog.onTrue}
              startIcon={<Iconify icon="mdi:account-edit-outline" />}
            >
              Edit identity
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <ProfileDetail
              icon="mdi:cake-variant-outline"
              label="Date of birth"
              value={
                data.applicant.dateOfBirth
                  ? formatDateOnly(data.applicant.dateOfBirth, 'DD MMM YYYY')
                  : 'Not provided'
              }
              missing={!data.applicant.dateOfBirth}
            />
            <ProfileDetail
              icon="mdi:account-outline"
              label="Gender"
              value={data.applicant.gender ?? 'Not provided'}
              missing={!data.applicant.gender}
            />
            <ProfileDetail
              icon="mdi:account-heart-outline"
              label="Primary guardian"
              value={guardianName || 'Not provided'}
              secondary={data.primaryGuardian?.email ?? undefined}
            />
            <ProfileDetail
              icon="mdi:phone-outline"
              label="Contact number"
              value={data.primaryGuardian?.mobile ?? 'Not provided'}
              missing={!data.primaryGuardian?.mobile}
            />
          </Box>

          {missingDetails.length > 0 && !locked && (
            <Alert severity="warning">
              Add the applicant’s {missingDetails.join(' and ')} before the admission reaches
              eligibility, documents, or finalization.
            </Alert>
          )}

          {locked && (
            <Alert severity="info">
              This admission is finalized. Update identity details from the Student record.
            </Alert>
          )}
        </Stack>
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

function ProfileDetail({
  icon,
  label,
  value,
  secondary,
  missing = false,
}: {
  icon: string;
  label: string;
  value: string;
  secondary?: string;
  missing?: boolean;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
      sx={{
        minWidth: 0,
        p: 1.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'action.hover',
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1,
          color: missing ? 'warning.main' : 'text.secondary',
          bgcolor: 'background.paper',
        }}
      >
        <Iconify icon={icon} width={18} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
        {secondary && (
          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {secondary}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
