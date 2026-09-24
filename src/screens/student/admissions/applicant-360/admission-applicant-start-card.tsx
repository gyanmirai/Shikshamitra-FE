'use client';

import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import NextLink from 'next/link';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import { useStartAdmissionApplicationMutation } from 'src/redux/student/admissions/admission-applications-api';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';

import {
  getCurrentStage,
  getPrimaryApplication,
  isActiveAdmissionApplication,
} from './admission-applicant-360-model';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';

type Application = AdmissionApplicant360['applications'][number];

export function AdmissionApplicantStartCard({
  applicantId,
  applications,
  embedded = false,
  showCurrentApplicationSummary = true,
}: {
  applicantId: string;
  applications: Application[];
  embedded?: boolean;
  showCurrentApplicationSummary?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get('inquiryId') || undefined;
  const [offeringId, setOfferingId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const activeApplication = applications.find(isActiveAdmissionApplication);
  const currentApplication = getPrimaryApplication(applications);
  const currentStage = getCurrentStage(currentApplication);
  const { data: offerings, isFetching } = useGetAdmissionOfferingsQuery(
    {
      availabilityStatus: 2,
      maxResultCount: 100,
      skipCount: 0,
    },
    { skip: Boolean(activeApplication) }
  );
  const inquiryState = useGetAdmissionInquiryManagementQuery(inquiryId ?? '', {
    skip: !inquiryId,
  });
  const [startApplication, startState] = useStartAdmissionApplicationMutation();
  const blockers = inquiryState.data?.blockers ?? [];
  const applicationStartBlocked = Boolean(
    activeApplication ||
    (inquiryId && inquiryState.data?.managed && !inquiryState.data.canStartApplication)
  );
  const readinessMessage = blockers.length
    ? blockers.join(' ')
    : inquiryState.data?.isLocked
      ? 'This inquiry is already linked to an application. Continue that application below.'
      : 'Complete the required inquiry steps before starting an application.';

  const start = async () => {
    if (!offeringId || applicationStartBlocked) return;
    setSubmitError('');
    try {
      const application = await startApplication({ applicantId, offeringId, inquiryId }).unwrap();
      shikshaMitraToast.success({ message: 'Application started successfully.' });
      router.push(`${studentPaths.enrollment.applications}/${application.id}`);
    } catch (error) {
      const message = parseApiProblemDetail(error).detail || 'Application could not be started.';
      setSubmitError(message);
      shikshaMitraToast.error({ message });
    }
  };

  const content = (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            display: 'flex',
            color: 'primary.main',
            bgcolor: 'action.hover',
          }}
        >
          <Iconify icon="mdi:arrow-decision-outline" width={24} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6">Next action</Typography>
          <Typography variant="body2" color="text.secondary">
            {activeApplication
              ? 'Continue the current admission journey before starting another application.'
              : 'Choose the school offering this family wants to apply for.'}
          </Typography>
        </Box>
      </Stack>

      {showCurrentApplicationSummary && currentApplication && (
        <Box
          sx={{
            p: 2,
            border: 1,
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <Typography variant="subtitle1">
                  {activeApplication ? 'Continue application' : 'Review previous application'}
                </Typography>
                <Label color={getAdmissionApplicationStatusColor(currentApplication.status)}>
                  {getAdmissionApplicationStatusLabel(currentApplication.status)}
                </Label>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {currentStage
                  ? `Current stage: ${currentStage.name}`
                  : 'Review application details'}
              </Typography>
              {currentStage?.enteredAt && (
                <Typography variant="caption" color="text.secondary">
                  Stage entered {fDateTime(currentStage.enteredAt)}
                </Typography>
              )}
            </Stack>
            <Button
              component={NextLink}
              href={`${studentPaths.enrollment.applications}/${currentApplication.id}`}
              variant="contained"
              endIcon={<Iconify icon="mdi:arrow-right" />}
            >
              Open application
            </Button>
          </Stack>
        </Box>
      )}

      <Box>
        <Typography variant="subtitle2">Start application</Typography>
        <Typography variant="caption" color="text.secondary">
          {activeApplication
            ? 'Unavailable while this applicant has an active application.'
            : 'Only offerings that are active, configured, and currently open are available.'}
        </Typography>
      </Box>

      {applicationStartBlocked && !activeApplication && (
        <Alert
          severity="warning"
          action={
            <Button
              component={NextLink}
              href={`${studentPaths.enrollment.inquiries}?inquiryId=${encodeURIComponent(inquiryId!)}`}
              color="inherit"
              size="small"
            >
              Manage inquiry
            </Button>
          }
        >
          <Typography variant="subtitle2">Complete the Inquiry handoff first</Typography>
          <Typography variant="body2">{readinessMessage}</Typography>
        </Alert>
      )}

      {submitError && <Alert severity="error">{submitError}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Admission offering"
          value={offeringId}
          disabled={isFetching || applicationStartBlocked}
          onChange={(event) => {
            setOfferingId(event.target.value);
            setSubmitError('');
          }}
          helperText={
            activeApplication
              ? 'Finish the current application before starting another.'
              : isFetching
                ? 'Loading open offerings…'
                : !(offerings?.items.length ?? 0)
                  ? 'No open offerings are currently available.'
                  : 'Cycle, class, board, and medium'
          }
        >
          {(offerings?.items ?? []).map((offering) => (
            <MenuItem key={offering.id} value={offering.id}>
              {offering.name || offering.code}
              {offering.name && offering.name !== offering.code ? ` (${offering.code})` : ''} ·{' '}
              {offering.standardName} · {offering.boardName} / {offering.mediumName} ·{' '}
              {offering.admissionCycleName}
            </MenuItem>
          ))}
        </TextField>
        <LoadingButton
          size="small"
          variant={currentApplication ? 'outlined' : 'contained'}
          loading={startState.isLoading}
          disabled={!offeringId || applicationStartBlocked}
          onClick={start}
          startIcon={<Iconify icon="mdi:file-document-plus-outline" />}
          sx={{ minWidth: 170, minHeight: 44 }}
        >
          Start application
        </LoadingButton>
      </Stack>

      {inquiryId && inquiryState.isError && (
        <Alert severity="info">
          Inquiry readiness could not be checked in advance. The application will still be validated
          safely when you start it.
        </Alert>
      )}
    </Stack>
  );

  if (embedded) return <Box id="next-action">{content}</Box>;

  return (
    <Card id="next-action" variant="outlined">
      <CardContent>{content}</CardContent>
    </Card>
  );
}
