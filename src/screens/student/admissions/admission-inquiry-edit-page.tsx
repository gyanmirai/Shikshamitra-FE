'use client';

import { useState } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Box, Alert, Stack, Paper, Button, Skeleton } from '@mui/material';
import { useGetAdmissionInquiryQuery } from 'src/redux/student/admissions/admission-inquiries-api';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { formatAdmissionReference } from './admission-reference';
import { InquiryOverviewForm } from './inquiry-management/inquiry-overview-form';

export function getInquiryEditReturnUrl(value: string | null) {
  const allowed = [studentPaths.enrollment.inquiries, studentPaths.enrollment.pipeline];
  return allowed.some((path) => value === path || value?.startsWith(`${path}?`))
    ? (value as string)
    : studentPaths.enrollment.inquiries;
}

export default function AdmissionInquiryEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = params;
  const returnUrl = getInquiryEditReturnUrl(searchParams.get('returnTo'));
  const originLabel = returnUrl.startsWith(studentPaths.enrollment.pipeline)
    ? 'Pipeline'
    : 'Inquiries';
  const originHref = returnUrl.startsWith(studentPaths.enrollment.pipeline)
    ? studentPaths.enrollment.pipeline
    : studentPaths.enrollment.inquiries;
  const inquiry = useGetAdmissionInquiryQuery(id, { skip: !id });
  const management = useGetAdmissionInquiryManagementQuery(id, { skip: !id });
  const [draft, setDraft] = useState({ dirty: false, busy: false });
  const returnToList = () => {
    if (draft.busy) return;
    if (draft.dirty && !window.confirm('Discard unsaved inquiry changes?')) return;
    router.push(returnUrl);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Edit inquiry"
        description={
          inquiry.data
            ? `${formatAdmissionReference(inquiry.data.inquiryNumber)} · ${inquiry.data.applicantName}`
            : 'Update the family’s contact and inquiry details.'
        }
        isBack
        onBack={returnToList}
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: originLabel, href: originHref },
          { name: 'Edit inquiry' },
        ]}
      />
      <Paper
        variant="outlined"
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }}
      >
        <Stack spacing={2} sx={{ width: 1, maxWidth: 1200, mx: 'auto' }}>
          {(inquiry.isLoading || management.isLoading) && (
            <Stack spacing={2} aria-label="Loading inquiry details" aria-busy="true">
              <Skeleton variant="rounded" height={84} />
              <Skeleton variant="rounded" height={280} />
            </Stack>
          )}
          {(inquiry.isError || management.isError) && (
            <Alert
              severity="error"
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    if (inquiry.isError) inquiry.refetch();
                    if (management.isError) management.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Inquiry details could not be loaded. Try again.
            </Alert>
          )}
          {inquiry.data && management.data && (
            <>
              {management.data.isLocked && (
                <Alert severity="info">
                  This inquiry is read-only because its application has already started.
                </Alert>
              )}
              <Box
                component="section"
                sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: { xs: 1.5, sm: 2 } }}
              >
                <InquiryOverviewForm
                  inquiry={inquiry.data}
                  readOnly={management.data.isLocked}
                  onCancel={() => router.push(returnUrl)}
                  onDraftChange={setDraft}
                  title="Inquiry details"
                />
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
