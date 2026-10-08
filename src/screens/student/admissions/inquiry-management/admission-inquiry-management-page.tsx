import type { RootState } from 'src/redux/store';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Paper, Button, Skeleton } from '@mui/material';
import { useGetAdmissionInquiryQuery } from 'src/redux/student/admissions/admission-inquiries-api';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { InquiryTimeline } from './inquiry-timeline';
import { getAdmissionInquiryAccess } from '../inquiry-access';
import { InquiryOverviewForm } from './inquiry-overview-form';
import { formatAdmissionReference } from '../admission-reference';

export function AdmissionInquiryManagementPage({
  inquiry,
  onClose,
  origin = 'inquiries',
}: {
  inquiry: AdmissionInquiry;
  onClose: () => void;
  origin?: 'inquiries' | 'pipeline';
}) {
  const query = useGetAdmissionInquiryManagementQuery(inquiry.id);
  const detail = useGetAdmissionInquiryQuery(inquiry.id);
  const current = detail.data ?? inquiry;
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const { canManage } = getAdmissionInquiryAccess(permissions);
  const [draft, setDraft] = useState({ dirty: false, busy: false });
  const discard = useBoolean();
  const close = () => {
    if (draft.busy) return;
    if (draft.dirty) discard.onTrue();
    else onClose();
  };
  const readOnly =
    !canManage || !query.data || query.data.isLocked || Boolean(current.isTransferred);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Edit inquiry"
        description={`${formatAdmissionReference(current.inquiryNumber)} · ${current.applicantName}`}
        isBack
        onBack={close}
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          {
            name: origin === 'pipeline' ? 'Pipeline' : 'Inquiries',
            href:
              origin === 'pipeline'
                ? studentPaths.enrollment.pipeline
                : studentPaths.enrollment.inquiries,
          },
          { name: 'Edit inquiry' },
        ]}
      />
      <Paper
        variant="outlined"
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }}
      >
        <Stack spacing={2} sx={{ width: 1, maxWidth: 1200, mx: 'auto' }}>
          {(query.isLoading || detail.isLoading) && (
            <Stack spacing={2} aria-label="Loading inquiry form" aria-busy="true">
              <Skeleton variant="rounded" height={84} />
              <Skeleton variant="rounded" height={280} />
            </Stack>
          )}
          {(query.isError || detail.isError) && (
            <Alert
              severity="error"
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    if (query.isError) query.refetch();
                    if (detail.isError) detail.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Inquiry form could not be loaded. Try again.
            </Alert>
          )}
          {query.data && detail.data && !query.isError && !detail.isError && (
            <>
              <InquiryOverviewForm inquiry={current} readOnly={readOnly} onDraftChange={setDraft} />
              <InquiryTimeline inquiryId={current.id} scope="form" />
            </>
          )}
        </Stack>
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
              onClose();
            }}
          >
            Discard
          </Button>
        }
      />
    </Box>
  );
}
