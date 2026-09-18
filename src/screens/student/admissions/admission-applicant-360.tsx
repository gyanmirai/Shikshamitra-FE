'use client';

import { useParams } from 'next/navigation';
import { useResponsive } from 'src/hooks/use-responsive';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Alert, Stack, Button, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionApplicant360Query } from 'src/redux/student/admissions/admission-applicants-api';

import AdmissionApplicantNotes from './admission-applicant-notes';
import { getApplicantName } from './applicant-360/admission-applicant-360-model';
import { AdmissionApplicantStartCard } from './applicant-360/admission-applicant-start-card';
import { AdmissionApplicantProfileCard } from './applicant-360/admission-applicant-profile-card';
import { AdmissionApplicantActivityCard } from './applicant-360/admission-applicant-activity-card';
import { AdmissionApplicantApplicationsCard } from './applicant-360/admission-applicant-applications-card';

function Applicant360Loading() {
  return (
    <Stack spacing={2} aria-label="Loading applicant workspace">
      <Skeleton variant="rounded" height={176} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(320px, 1fr)' },
          gap: 2,
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={180} />
          <Skeleton variant="rounded" height={280} />
        </Stack>
        <Skeleton variant="rounded" height={360} />
      </Box>
    </Stack>
  );
}

export default function AdmissionApplicant360Screen() {
  const { id } = useParams<{ id: string }>();
  const compactHeader = useResponsive('down', 'md');
  const { data, isLoading, isError, refetch } = useGetAdmissionApplicant360Query(id);
  const name = data ? getApplicantName(data) : 'Applicant 360';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        layout={compactHeader ? 'stacked' : 'inline'}
        heading={name}
        description={
          data
            ? 'Review this family’s identity, admission journey, recent activity, and next action in one place.'
            : 'Review applicant identity, admission progress, family activity, and staff notes in one place.'
        }
        descriptionDisplay="visible"
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'CRM', href: studentPaths.enrollment.inquiries },
          { name: 'Applicant 360' },
        ]}
      />

      {isLoading && <Applicant360Loading />}

      {isError && !data && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          Applicant 360 could not be loaded. Check your connection and try again.
        </Alert>
      )}

      {data && (
        <Stack spacing={2}>
          <AdmissionApplicantProfileCard data={data} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 2fr) minmax(320px, 1fr)',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <AdmissionApplicantStartCard applicantId={id} applications={data.applications} />
              <AdmissionApplicantApplicationsCard applications={data.applications} />
              <AdmissionApplicantActivityCard activities={data.activities} />
            </Stack>
            <AdmissionApplicantNotes applicantId={id} notes={data.notes} />
          </Box>
        </Stack>
      )}
    </Box>
  );
}
