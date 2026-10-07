import type { RootState } from 'src/redux/store';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import NextLink from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingButton } from 'src/components/loading-button';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Paper, Button, Divider, Skeleton } from '@mui/material';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';
import {
  useGetAdmissionInquiryQuery,
  useGetAdmissionInquiryAssignableCounsellorsQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { InquiryTimeline } from './inquiry-timeline';
import { InquiryFollowUps } from './inquiry-follow-ups';
import { InquiryContactForm } from './inquiry-contact-form';
import { getAdmissionInquiryAccess } from '../inquiry-access';
import { InquiryOverviewForm } from './inquiry-overview-form';
import { formatAdmissionReference } from '../admission-reference';
import { InquiryManagementSummary } from './inquiry-management-summary';
import { InquiryQualificationForm } from './inquiry-qualification-form';
import { useInquiryHandoff, inquiryHandoffBlocker } from './use-inquiry-handoff';
import { AdmissionInquiryAssignmentDialog } from './admission-inquiry-assignment-dialog';

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
  const handoff = useInquiryHandoff();
  const assignment = useBoolean();
  const [draft, setDraft] = useState({ dirty: false, busy: false });
  const close = () => {
    if (draft.busy || handoff.moving) return;
    if (draft.dirty && !window.confirm('Discard unsaved inquiry changes?')) return;
    onClose();
  };
  const canReassign = query.data?.canReassign === true;
  const counsellors = useGetAdmissionInquiryAssignableCounsellorsQuery(
    { admissionOfferingId: current.admissionOfferingId ?? undefined },
    { skip: !assignment.value || !canReassign || !current.admissionOfferingId }
  );
  const readOnly =
    !canManage || !query.data || query.data.isLocked || Boolean(current.isTransferred);
  const blocker =
    inquiryHandoffBlocker(current) ||
    (query.data && !query.data.canStartApplication ? query.data.blockers.join(' ') : undefined);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Edit / Follow-up"
        description={`${formatAdmissionReference(current.inquiryNumber)} · ${current.applicantName}`}
        isBack
        onBack={close}
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          {
            name: origin === 'pipeline' ? 'Pipeline' : 'Inquiries',
            href:
              origin === 'pipeline'
                ? studentPaths.enrollment.pipeline
                : studentPaths.enrollment.inquiries,
          },
          { name: 'Edit / Follow-up' },
        ]}
        action={
          current.applicationId ? (
            <Button
              component={NextLink}
              href={`${studentPaths.enrollment.applications}/${current.applicationId}`}
              size="small"
              variant="contained"
            >
              Open application
            </Button>
          ) : handoff.canMove ? (
            <LoadingButton
              size="small"
              variant="contained"
              loading={handoff.moving}
              disabled={
                !query.data || !detail.data || Boolean(blocker) || draft.dirty || draft.busy
              }
              onClick={() => handoff.move(current)}
              startIcon={<Iconify icon="mdi:arrow-right-circle-outline" />}
            >
              Move to next stage
            </LoadingButton>
          ) : undefined
        }
      />
      <Paper
        variant="outlined"
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }}
      >
        <Stack spacing={2} sx={{ width: 1, maxWidth: 1200, mx: 'auto' }}>
          {(query.isLoading || detail.isLoading) && (
            <>
              <Skeleton height={100} />
              <Skeleton height={180} />
            </>
          )}
          {(query.isError || detail.isError) && (
            <Alert
              severity="error"
              action={
                <Button
                  size="small"
                  onClick={() => {
                    if (query.isError) query.refetch();
                    if (detail.isError) detail.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Inquiry details could not be loaded.
            </Alert>
          )}
          {query.data && detail.data && (
            <>
              {(query.data.isLocked || current.isTransferred) && (
                <Alert severity="info">
                  This inquiry is read-only because its application has already started. Continue
                  the application from Pipeline.
                </Alert>
              )}
              {!current.admissionOfferingId && (
                <Alert severity="warning">
                  This older inquiry needs its admission offering resolved before it can move to the
                  next stage. Select an open offering in the inquiry form.
                </Alert>
              )}
              <InquiryOverviewForm inquiry={current} readOnly={readOnly} onDraftChange={setDraft} />
              <Divider />
              <InquiryManagementSummary
                value={query.data}
                counsellorName={current.assignedCounsellorName}
              />
              {canReassign && !query.data.isLocked && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={assignment.onTrue}
                  startIcon={<Iconify icon="mdi:account-arrow-right-outline" />}
                >
                  Change counsellor
                </Button>
              )}
              {!readOnly && (
                <>
                  <Divider />
                  <InquiryQualificationForm value={query.data} inquiry={current} />
                </>
              )}
              {query.data.managed && (
                <>
                  {!readOnly && (
                    <>
                      <Divider />
                      <InquiryContactForm value={query.data} />
                    </>
                  )}
                  <Divider />
                  <InquiryFollowUps value={query.data} readOnly={readOnly} />
                </>
              )}
              {!query.data.managed && (
                <Alert severity="info">
                  No intake setup is available for this record. Contact the admission administrator
                  to configure its offering.
                </Alert>
              )}
              <Divider />
              <InquiryTimeline inquiryId={current.id} />
            </>
          )}
        </Stack>
      </Paper>
      <AdmissionInquiryAssignmentDialog
        inquiry={assignment.value && canReassign ? current : null}
        counsellors={counsellors.data ?? []}
        counsellorsLoading={counsellors.isLoading}
        counsellorsError={counsellors.isError}
        onClose={assignment.onFalse}
      />
    </Box>
  );
}
