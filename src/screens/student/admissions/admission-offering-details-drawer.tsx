'use client';

import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatDateOnly } from 'src/utils/date-only';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import {
  Box,
  Grid,
  Stack,
  Button,
  Drawer,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { AdmissionOfferingReadiness } from './admission-offering-readiness';
import { admissionTrackLabels, admissionEntryModeLabels } from './admission-offering-model';

import type { AdmissionOfferingRecoveryAccess } from './admission-offering-configuration-issues';

type Props = AdmissionOfferingRecoveryAccess & {
  open: boolean;
  offering: AdmissionOffering | null;
  onClose: () => void;
  loadingDetail?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
};

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function AdmissionOfferingDetailsDrawer({
  open,
  offering,
  onClose,
  loadingDetail,
  detailError,
  onRetryDetail,
  canReviewForms,
  canRestoreForms,
  canReviewWorkflows,
  canReviewCycles,
}: Props) {
  const recoveryAvailable = !loadingDetail && !detailError;
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        'aria-labelledby': 'admission-offering-details-title',
        sx: {
          width: { xs: 1, sm: 720 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={2}
        sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography
              id="admission-offering-details-title"
              variant="h6"
              component="h2"
              sx={{ overflowWrap: 'anywhere', minWidth: 0 }}
            >
              {offering?.name || offering?.code || 'Offering Details'}
            </Typography>
            {offering && (
              <Label color={offering.isActive ? 'success' : 'default'}>
                {offering.isActive ? 'Active' : 'Inactive'}
              </Label>
            )}
            <InfoTooltipIcon
              label="Admission Offering Details information"
              title="View the offering's academic scope, admission dates, linked forms, and configuration readiness."
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            Admission Offering
            {offering && ` · ${offering.admissionCycleName}`}
            {offering?.name && offering.name !== offering.code ? ` · ${offering.code}` : ''}
          </Typography>
        </Box>
        <IconButton
          aria-label="Close Admission Offering Details"
          onClick={onClose}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon="mdi:close" width={22} />
        </IconButton>
      </Stack>
      <Divider />

      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        {!offering && (
          <Stack
            spacing={2}
            sx={{ p: 2 }}
            aria-busy={Boolean(loadingDetail)}
            role={detailError ? undefined : 'status'}
            aria-label={detailError ? undefined : 'Loading Offering Details'}
          >
            {detailError ? (
              <StudentFeedback
                notificationKey="admission-offering:view-detail"
                presentation="toast"
                severity="error"
                toastAction={
                  <Button size="small" color="inherit" onClick={onRetryDetail}>
                    Retry
                  </Button>
                }
              >
                {detailError}
              </StudentFeedback>
            ) : (
              <>
                <Skeleton variant="rounded" height={160} />
                <Skeleton variant="rounded" height={160} />
              </>
            )}
          </Stack>
        )}
        {offering && (
          <Stack spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <FormSectionCard
              aria-label="Academic Scope"
              icon={GlobalIcons.admissionInterest}
              title="Academic Scope"
              descriptionTooltip="The class, academic hierarchy, and admission route configured for this offering."
            >
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem label="Class" value={offering.standardName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem
                    label="Admission track"
                    value={admissionTrackLabels[offering.track]}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem label="Board" value={offering.boardName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem label="Medium" value={offering.mediumName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem label="School level" value={offering.stageName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem
                    label="Entry mode"
                    value={admissionEntryModeLabels[offering.entryMode]}
                  />
                </Grid>
                {offering.campusName && (
                  <Grid size={{ xs: 12 }}>
                    <DetailItem label="Campus" value={offering.campusName} />
                  </Grid>
                )}
              </Grid>
            </FormSectionCard>

            <FormSectionCard
              aria-label="Admission Window"
              icon={GlobalIcons.calendar}
              title="Admission Window"
              descriptionTooltip="The effective opening and closing dates, and the number of applications for this offering."
            >
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem
                    label="Opens"
                    value={formatDateOnly(offering.effectiveOpenDate, ADMISSION_DATE_FORMAT)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem
                    label="Closes"
                    value={formatDateOnly(offering.effectiveCloseDate, ADMISSION_DATE_FORMAT)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem label="Applications" value={offering.applicationCount} />
                </Grid>
              </Grid>
            </FormSectionCard>

            <FormSectionCard
              aria-label="Process and Forms"
              icon={GlobalIcons.assignedRoute}
              title="Process and Forms"
              descriptionTooltip="The workflow and published form versions linked to the configured admission route."
            >
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <DetailItem
                    label="Workflow"
                    value={
                      offering.workflowName
                        ? `${offering.workflowName} v${offering.workflowVersion}`
                        : 'Not configured'
                    }
                  />
                </Grid>
                {offering.entryMode === 0 && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailItem
                      label="Inquiry form"
                      value={
                        offering.inquiryFormName
                          ? `${offering.inquiryFormName} v${offering.inquiryFormVersion}`
                          : 'Not configured'
                      }
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailItem
                    label="Application form"
                    value={
                      offering.applicationFormName
                        ? `${offering.applicationFormName} v${offering.applicationFormVersion}`
                        : 'Not configured'
                    }
                  />
                </Grid>
              </Grid>
            </FormSectionCard>

            <FormSectionCard
              aria-label="Configuration Readiness"
              icon={offering.configuration?.isValid ? undefined : GlobalIcons.warning}
              title="Configuration Readiness"
              descriptionTooltip="Whether the saved offering configuration is ready for its admission route."
            >
              {offering.configuration?.isValid ? (
                <Stack spacing={1} alignItems="flex-start">
                  <Label color="success">Ready</Label>
                  <Typography variant="body2" color="text.secondary">
                    This configuration is ready to receive inquiries and applications during its
                    effective window.
                  </Typography>
                </Stack>
              ) : (
                <AdmissionOfferingReadiness
                  result={offering.configuration}
                  cycleName={offering.admissionCycleName}
                  canReviewForms={recoveryAvailable && canReviewForms}
                  canRestoreForms={recoveryAvailable && canRestoreForms}
                  canReviewWorkflows={recoveryAvailable && canReviewWorkflows}
                  canReviewCycles={recoveryAvailable && canReviewCycles}
                />
              )}
            </FormSectionCard>
          </Stack>
        )}
      </Scrollbar>

      <Divider />
    </Drawer>
  );
}
