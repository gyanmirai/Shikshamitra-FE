import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import NextLink from 'next/link';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import {
  Box,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { InquiryFollowUps } from './inquiry-follow-ups';
import { InquiryTimeline } from './inquiry-timeline';
import { InquiryContactForm } from './inquiry-contact-form';
import { InquiryOverviewForm } from './inquiry-overview-form';
import { InquiryManagementSummary } from './inquiry-management-summary';
import { InquiryQualificationForm } from './inquiry-qualification-form';

export function AdmissionInquiryManagementDrawer({
  inquiry,
  onClose,
}: {
  inquiry: AdmissionInquiry | null;
  onClose: () => void;
}) {
  const query = useGetAdmissionInquiryManagementQuery(inquiry?.id ?? '', { skip: !inquiry });
  return (
    <Drawer
      anchor="right"
      open={Boolean(inquiry)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 560 }, maxWidth: 1 } }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6">Manage inquiry</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {inquiry?.inquiryNumber} · {inquiry?.applicantName}
          </Typography>
        </Box>
        {inquiry?.applicantId && (
          <Button
            component={NextLink}
            href={`${studentPaths.enrollment.root}/applicants/${inquiry.applicantId}?inquiryId=${encodeURIComponent(inquiry.id)}`}
            size="small"
            variant="outlined"
          >
            Applicant 360
          </Button>
        )}
        <IconButton aria-label="Close inquiry management" onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Stack spacing={2.5} sx={{ p: 2, overflowY: 'auto' }}>
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
        {query.data && !query.data.managed && (
          <>
            <Alert severity="info">
              This inquiry uses the Basic process. Enable Managed Inquiry on its workflow to use
              contact notes, follow-ups and qualification.
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
    </Drawer>
  );
}
