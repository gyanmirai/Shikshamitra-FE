import NextLink from 'next/link';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';
import {
  type AdmissionInquiry,
  useGetAdmissionInquiryQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import { InquiryTimeline } from './inquiry-timeline';
import { InquiryFollowUps } from './inquiry-follow-ups';
import { InquiryContactForm } from './inquiry-contact-form';
import { InquiryOverviewForm } from './inquiry-overview-form';
import { formatAdmissionReference } from '../admission-reference';
import { InquiryManagementSummary } from './inquiry-management-summary';
import { InquiryQualificationForm } from './inquiry-qualification-form';
import { AdmissionInquiryConfirmOffering } from './admission-inquiry-confirm-offering';

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
  const originLabel = origin === 'pipeline' ? 'Inquiry pipeline' : 'Inquiries';
  const originHref =
    origin === 'pipeline' ? studentPaths.enrollment.pipeline : studentPaths.enrollment.inquiries;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Manage inquiry"
        description={`${formatAdmissionReference(inquiry.inquiryNumber)} · ${inquiry.applicantName}`}
        isBack
        onBack={onClose}
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: originLabel, href: originHref },
          { name: 'Manage inquiry' },
        ]}
        action={
          inquiry.applicantId ? (
            <Button
              component={NextLink}
              href={`${studentPaths.enrollment.root}/applicants/${inquiry.applicantId}?inquiryId=${encodeURIComponent(inquiry.id)}`}
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:account-circle-outline" />}
            >
              Applicant 360
            </Button>
          ) : undefined
        }
      />
      <Paper
        variant="outlined"
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }}
      >
        <Stack spacing={2} sx={{ width: 1, maxWidth: 1200, mx: 'auto' }}>
          {inquiry && !inquiry.admissionOfferingId && (
            <AdmissionInquiryConfirmOffering inquiry={inquiry} onConfirmed={onClose} />
          )}
          {query.isLoading && (
            <>
              <Skeleton height={100} />
              <Skeleton height={180} />
            </>
          )}
          {query.isError && (
            <Alert
              severity="error"
              action={
                <IconButton aria-label="Retry" onClick={() => query.refetch()}>
                  <Iconify icon="mdi:refresh" />
                </IconButton>
              }
            >
              Inquiry management could not be loaded.
            </Alert>
          )}
          {query.data && inquiry && (
            <InquiryOverviewForm inquiry={inquiry} readOnly={query.data.isLocked} />
          )}
          {detail.data?.formAnswers?.length ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" component="h3" sx={{ mb: 1.5 }}>
                Submitted inquiry form
              </Typography>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                {detail.data.formAnswers.map((answer) => (
                  <Box key={answer.fieldCode} sx={{ minWidth: 0 }}>
                    <Typography component="dt" variant="caption" color="text.secondary">
                      {answer.label}
                    </Typography>
                    <Typography
                      component="dd"
                      variant="body2"
                      sx={{ m: 0, overflowWrap: 'anywhere' }}
                    >
                      {answer.value || '—'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ) : null}
          {detail.isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => detail.refetch()}>
                  Retry
                </Button>
              }
            >
              Submitted form answers could not be loaded.
            </Alert>
          )}
          {query.data && !query.data.managed && (
            <>
              <Alert severity="info">
                This inquiry has no selected intake setup yet. Confirm its offering to apply the
                inquiry rules, contact reminders, and counsellor assignment.
              </Alert>
              <Divider />
              <InquiryTimeline inquiryId={query.data.inquiryId} />
            </>
          )}
          {query.data?.managed && (
            <>
              <Divider />
              <InquiryManagementSummary value={query.data} />
              {query.data.isLocked && (
                <Alert severity="info">
                  This inquiry is read-only because its application has already started.
                </Alert>
              )}
              <Divider />
              {!query.data.isLocked && <InquiryContactForm value={query.data} />}
              {!query.data.isLocked && <Divider />}
              <InquiryFollowUps value={query.data} readOnly={query.data.isLocked} />
              {!query.data.isLocked && <Divider />}
              {!query.data.isLocked && <InquiryQualificationForm value={query.data} />}
              <Divider />
              <InquiryTimeline inquiryId={query.data.inquiryId} />
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
