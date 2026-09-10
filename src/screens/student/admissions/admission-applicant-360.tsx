'use client';

import { useParams } from 'next/navigation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionApplicant360Query } from 'src/redux/student/admissions/admission-applicants-api';
import { Box, Alert, Stack, Skeleton } from '@mui/material';

import AdmissionApplicantNotes from './admission-applicant-notes';
import { AdmissionApplicantStartCard } from './applicant-360/admission-applicant-start-card';
import { AdmissionApplicantProfileCard } from './applicant-360/admission-applicant-profile-card';
import { AdmissionApplicantActivityCard } from './applicant-360/admission-applicant-activity-card';
import { AdmissionApplicantApplicationsCard } from './applicant-360/admission-applicant-applications-card';

export default function AdmissionApplicant360Screen() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetAdmissionApplicant360Query(id);
  if (isLoading) return <Skeleton variant="rounded" height={240} sx={{ m: 3 }} />;
  if (isError || !data)
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Unable to load applicant.
      </Alert>
    );
  const name = [data.applicant.firstName, data.applicant.middleName, data.applicant.lastName]
    .filter(Boolean)
    .join(' ');
  return (
    <Box>
      <CustomBreadcrumbs
        heading={name}
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Applicant 360' },
        ]}
        sx={{ mb: 3 }}
      />
      <Stack spacing={2}>
        <AdmissionApplicantStartCard applicantId={id} />
        <AdmissionApplicantProfileCard data={data} />
        <AdmissionApplicantApplicationsCard applications={data.applications} />
        <AdmissionApplicantActivityCard activities={data.activities} />
        <AdmissionApplicantNotes applicantId={id} notes={data.notes} />
      </Stack>
    </Box>
  );
}
