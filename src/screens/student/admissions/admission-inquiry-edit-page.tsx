'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Paper, Stack, Button, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetAdmissionInquiryQuery } from 'src/redux/student/admissions/admission-inquiries-api';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { getAdmissionInquiryAccess } from './inquiry-access';
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
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const { canManage } = getAdmissionInquiryAccess(permissions);
  const [draft, setDraft] = useState({ dirty: false, busy: false });
  const discard = useBoolean();
  const returnToList = () => {
    if (draft.busy) return;
    if (draft.dirty) discard.onTrue();
    else router.push(returnUrl);
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
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        {(inquiry.isLoading || management.isLoading) && (
          <Stack spacing={2} sx={{ p: 2 }} aria-label="Loading inquiry details" aria-busy="true">
            <Skeleton variant="rounded" height={84} />
            <Skeleton variant="rounded" height={280} />
          </Stack>
        )}
        {(inquiry.isError || management.isError) && (
          <StudentFeedback
            notificationKey="STU-0072"
            presentation="toast"
            severity="error"
            sx={{ m: 2 }}
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
          </StudentFeedback>
        )}
        {inquiry.data && management.data && !inquiry.isError && !management.isError && (
          <>
            {management.data.isLocked && (
              <StudentFeedback
                notificationKey="STU-0073"
                presentation="inline"
                severity="info"
                sx={{ mx: 2, mt: 2 }}
              >
                This inquiry is read-only because its application has already started.
              </StudentFeedback>
            )}
            <InquiryOverviewForm
              inquiry={inquiry.data}
              readOnly={
                !canManage || management.data.isLocked || Boolean(inquiry.data.isTransferred)
              }
              onCancel={returnToList}
              onDraftChange={setDraft}
              title="Admission interest"
              fullHeight
            />
          </>
        )}
      </Paper>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        icon="warning"
        title="Discard changes?"
        content="Your unsaved inquiry form changes will be lost."
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => {
              discard.onFalse();
              router.push(returnUrl);
            }}
          >
            Discard
          </Button>
        }
      />
    </Box>
  );
}
