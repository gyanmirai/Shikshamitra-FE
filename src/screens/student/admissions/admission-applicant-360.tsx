'use client';

import { studentPaths } from 'src/constants/student-menu';
import { Box, Alert, Stack, Button, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetAdmissionApplicant360Query } from 'src/redux/student/admissions/admission-applicants-api';

import { AdmissionApplicantProfileCard } from './applicant-360/admission-applicant-profile-card';
import { AdmissionApplicantApplicationsCard } from './applicant-360/admission-applicant-applications-card';

function Applicant360Loading() {
  return (
    <Stack spacing={1.5} aria-label="Loading applicant workspace" role="status">
      <Skeleton variant="rounded" height={96} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr)' },
          gap: 1.5,
        }}
      >
        <Skeleton variant="rounded" height={440} />
        <Skeleton variant="rounded" height={440} />
      </Box>
    </Stack>
  );
}

export default function AdmissionApplicant360Screen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get('inquiryId');
  const { data, isLoading, isError, refetch } = useGetAdmissionApplicant360Query(id);

  const handleBack = () => {
    router.push(
      inquiryId
        ? `${studentPaths.enrollment.inquiries}?inquiryId=${encodeURIComponent(inquiryId)}`
        : studentPaths.enrollment.inquiries
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}>
      <Box
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar - 1,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
        })}
      >
        <CustomBreadcrumbs
          heading="Applicant 360"
          description="Review applicant identity, admission progress, and the next staff action in one place."
          isBack
          onBack={handleBack}
          links={[
            { name: 'Students', href: studentPaths.dashboard },
            { name: 'Admissions', href: studentPaths.enrollment.root },
            { name: 'Inquiries', href: studentPaths.enrollment.inquiries },
            { name: 'Applicant 360' },
          ]}
          slotProps={{
            action: {},
            heading: {},
            moreLink: {},
            breadcrumbs: {
              '& .MuiBreadcrumbs-li': { flexShrink: 0 },
            },
          }}
        />
      </Box>

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
        <Stack spacing={1.5} sx={{ minWidth: 0 }}>
          <AdmissionApplicantProfileCard data={data} />
          <AdmissionApplicantApplicationsCard applicantId={id} data={data} />
        </Stack>
      )}
    </Box>
  );
}
