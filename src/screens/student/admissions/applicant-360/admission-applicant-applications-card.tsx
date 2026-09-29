'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import NextLink from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomAccordion from 'src/components/custom-accordian';
import { Box, Paper, Stack, Button, Divider, Typography, LinearProgress } from '@mui/material';

import { formatAdmissionReference } from '../admission-reference';
import AdmissionApplicantNotes from '../admission-applicant-notes';
import { AdmissionApplicantStartCard } from './admission-applicant-start-card';
import { AdmissionApplicantEssentials } from './admission-applicant-profile-card';
import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';
import {
  getCurrentStage,
  getPrimaryApplication,
  isActiveAdmissionApplication,
} from './admission-applicant-360-model';

type Application = AdmissionApplicant360['applications'][number];
type Stage = Application['stages'][number];
type ExpandedSection = 'application' | 'notes' | false;

export function AdmissionApplicantApplicationsCard({
  applicantId,
  data,
}: {
  applicantId: string;
  data: AdmissionApplicant360;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(false);
  const application = getPrimaryApplication(data.applications);
  const activeApplication = data.applications.find(isActiveAdmissionApplication);
  const canOverride = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);

  if (!application) {
    return (
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <AdmissionApplicantEssentials data={data} />
        </Box>
        <Divider />
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <AdmissionApplicantStartCard
            embedded
            showCurrentApplicationSummary={false}
            applicantId={applicantId}
            applications={data.applications}
          />
        </Box>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <DisclosureSection
            title={getNotesTitle(data.notes.length)}
            expanded={expandedSection === 'notes'}
            onChange={() =>
              setExpandedSection((current) => (current === 'notes' ? false : 'notes'))
            }
          >
            <AdmissionApplicantNotes embedded applicantId={applicantId} notes={data.notes} />
          </DisclosureSection>
        </Box>
      </Paper>
    );
  }

  const stages = [...application.stages].sort((a, b) => a.displayOrder - b.displayOrder);
  const currentStage = getCurrentStage(application);
  const applicationHref = `${studentPaths.enrollment.applications}/${application.id}`;
  const showOverride =
    canOverride && isActiveAdmissionApplication(application) && currentStage?.status === 1;

  return (
    <Box sx={{ minWidth: 0 }}>
      <MobileJourney
        application={application}
        stages={stages}
        currentStage={currentStage}
        applicationHref={applicationHref}
        showOverride={showOverride}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '280px minmax(0, 1fr)' },
          gap: 1.5,
          alignItems: 'stretch',
          minWidth: 0,
        }}
      >
        <DesktopJourney
          application={application}
          stages={stages}
          currentStage={currentStage}
          applicationHref={applicationHref}
          showOverride={showOverride}
        />

        <Paper
          component="section"
          variant="outlined"
          aria-label="Applicant admission details"
          sx={{ minWidth: 0, overflow: 'hidden' }}
        >
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CurrentStageHeader
              stage={currentStage}
              application={application}
              applicationHref={applicationHref}
            />
          </Box>
          <Divider />
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <AdmissionApplicantEssentials data={data} />
          </Box>
          <Divider />
          <Stack spacing={1} sx={{ p: { xs: 1, sm: 1.5 } }}>
            <DisclosureSection
              title="Application information"
              expanded={expandedSection === 'application'}
              onChange={() =>
                setExpandedSection((current) => (current === 'application' ? false : 'application'))
              }
            >
              <ApplicationInformation
                application={application}
                applications={data.applications}
                applicantId={applicantId}
                canStartAnother={!activeApplication}
              />
            </DisclosureSection>
            <DisclosureSection
              title={getNotesTitle(data.notes.length)}
              expanded={expandedSection === 'notes'}
              onChange={() =>
                setExpandedSection((current) => (current === 'notes' ? false : 'notes'))
              }
            >
              <AdmissionApplicantNotes embedded applicantId={applicantId} notes={data.notes} />
            </DisclosureSection>
          </Stack>
        </Paper>
      </Box>

      <Paper
        elevation={8}
        sx={{
          display: { xs: 'block', lg: 'none' },
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: 1,
          p: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <OpenApplicationButton href={applicationHref} fullWidth />
      </Paper>
    </Box>
  );
}

function DesktopJourney({
  application,
  stages,
  currentStage,
  applicationHref,
  showOverride,
}: {
  application: Application;
  stages: Stage[];
  currentStage?: Stage;
  applicationHref: string;
  showOverride: boolean;
}) {
  const completedCount = stages.filter((stage) => stage.status === 2).length;

  return (
    <Paper
      component="aside"
      variant="outlined"
      aria-labelledby="admission-journey-heading"
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        p: 2,
        minWidth: 0,
      }}
    >
      <Typography id="admission-journey-heading" variant="h6">
        Admission journey
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {completedCount} of {stages.length} completed
      </Typography>

      {stages.length > 0 ? (
        <Stack sx={{ mt: 2, flex: 1 }}>
          {stages.map((stage, index) => (
            <JourneyStage
              key={stage.code}
              stage={stage}
              index={index}
              isLast={index === stages.length - 1}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No admission stages are available for this application.
        </Typography>
      )}

      {showOverride && (
        <Button
          component={NextLink}
          href={applicationHref}
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="mdi:routes" />}
          sx={{ minHeight: 44, mt: 2 }}
          aria-label={`Override route for ${formatAdmissionReference(application.applicationNumber)}`}
        >
          Override route
        </Button>
      )}
      {!showOverride && currentStage?.status === 1 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          Workflow actions are available inside the application when permitted.
        </Typography>
      )}
    </Paper>
  );
}

function JourneyStage({ stage, index, isLast }: { stage: Stage; index: number; isLast: boolean }) {
  const completed = stage.status === 2;
  const current = stage.status === 1;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '36px minmax(0, 1fr)',
        gap: 1,
        p: 1,
        mx: -1,
        borderRadius: 1.5,
        bgcolor: current ? 'action.hover' : 'transparent',
        minWidth: 0,
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        {!isLast && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: 32,
              bottom: -16,
              left: '50%',
              borderLeft: 2,
              borderColor: completed ? 'success.light' : 'divider',
            }}
          />
        )}
        <Box
          sx={{
            width: 32,
            height: 32,
            zIndex: 1,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            border: 2,
            borderColor: completed
              ? 'success.main'
              : current
                ? 'text.primary'
                : 'action.disabledBackground',
            bgcolor: completed
              ? 'success.main'
              : current
                ? 'background.paper'
                : 'action.disabledBackground',
            color: completed ? 'success.contrastText' : current ? 'text.primary' : 'text.disabled',
            fontWeight: 700,
          }}
        >
          {completed ? <Iconify icon="mdi:check" width={18} /> : index + 1}
        </Box>
      </Box>
      <Box sx={{ minWidth: 0, pb: isLast ? 0 : 1.25 }}>
        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
          {stage.name}
        </Typography>
        <Label color={completed ? 'success' : 'default'} sx={{ mt: 0.5 }}>
          {completed ? 'Completed' : current ? 'Current step' : 'Upcoming'}
        </Label>
      </Box>
    </Box>
  );
}

function MobileJourney({
  application,
  stages,
  currentStage,
  applicationHref,
  showOverride,
}: {
  application: Application;
  stages: Stage[];
  currentStage?: Stage;
  applicationHref: string;
  showOverride: boolean;
}) {
  const completedCount = stages.filter((stage) => stage.status === 2).length;
  const currentIndex = currentStage
    ? Math.max(
        stages.findIndex((stage) => stage.code === currentStage.code),
        0
      )
    : Math.max(completedCount - 1, 0);
  const progress =
    stages.length === 0
      ? 0
      : currentStage?.status === 2 && completedCount === stages.length
        ? 100
        : ((currentIndex + 1) / stages.length) * 100;

  return (
    <Paper
      component="section"
      variant="outlined"
      aria-label="Admission journey progress"
      sx={{ display: { xs: 'block', lg: 'none' }, p: 1.5, mb: 1.5 }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">
              {stages.length > 0
                ? `Step ${currentIndex + 1} of ${stages.length}`
                : 'Admission journey'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {currentStage?.name ?? 'No admission stage available'}
            </Typography>
          </Box>
          {currentStage && (
            <Label color={currentStage.status === 2 ? 'success' : 'default'}>
              {currentStage.status === 2 ? 'Completed' : 'Current step'}
            </Label>
          )}
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label="Admission journey progress"
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: 'action.selected',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
              bgcolor:
                currentStage?.status === 2 && completedCount === stages.length
                  ? 'success.main'
                  : 'text.primary',
            },
          }}
        />
        {showOverride && (
          <Button
            component={NextLink}
            href={applicationHref}
            fullWidth
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="mdi:routes" />}
            sx={{ minHeight: 44 }}
            aria-label={`Override route for ${formatAdmissionReference(application.applicationNumber)}`}
          >
            Override route
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function CurrentStageHeader({
  stage,
  application,
  applicationHref,
}: {
  stage?: Stage;
  application: Application;
  applicationHref: string;
}) {
  const completed = stage?.status === 2;
  const current = stage?.status === 1;
  const recordedAt = completed ? stage?.completedAt : stage?.enteredAt;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ sm: 'flex-start' }}
      spacing={1.5}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          <Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>
            {stage?.name ?? 'Application details'}
          </Typography>
          <Label color={completed ? 'success' : 'default'}>
            {!stage
              ? 'Stage unavailable'
              : completed
                ? 'Completed'
                : current
                  ? 'Current step'
                  : 'Upcoming'}
          </Label>
          <Label color={getAdmissionApplicationStatusColor(application.status)}>
            {getAdmissionApplicationStatusLabel(application.status)}
          </Label>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {current
            ? 'Open the application to review and complete the work required for this stage.'
            : completed
              ? 'This is the latest completed stage recorded for the application.'
              : 'Open the application to review its admission progress.'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {recordedAt
            ? `${completed ? 'Completed' : 'Entered'} ${fDateTime(recordedAt)}`
            : 'Stage time not recorded'}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: 'none', lg: 'block' }, flexShrink: 0 }}>
        <OpenApplicationButton href={applicationHref} />
      </Box>
    </Stack>
  );
}

function OpenApplicationButton({ href, fullWidth = false }: { href: string; fullWidth?: boolean }) {
  return (
    <Button
      component={NextLink}
      href={href}
      fullWidth={fullWidth}
      size="small"
      variant="contained"
      color="inherit"
      endIcon={<Iconify icon="mdi:arrow-right" />}
      sx={{
        minHeight: 44,
        bgcolor: 'text.primary',
        color: 'background.paper',
        '&:hover': { bgcolor: 'text.secondary' },
      }}
    >
      Open application
    </Button>
  );
}

function ApplicationInformation({
  application,
  applications,
  applicantId,
  canStartAnother,
}: {
  application: Application;
  applications: Application[];
  applicantId: string;
  canStartAnother: boolean;
}) {
  const details = [
    {
      label: 'Application number',
      value: formatAdmissionReference(application.applicationNumber),
    },
    {
      label: 'Journey counsellor',
      value: application.assignedCounsellorName ||
        (application.assignedCounsellorId ? 'Assigned counsellor' : 'Not assigned'),
    },
    {
      label: 'Started',
      value: fDateTime(application.creationTime) || 'Time not recorded',
    },
    {
      label: 'Last saved',
      value: fDateTime(application.lastSavedAt) || 'Not recorded',
    },
    {
      label: 'Submitted',
      value: fDateTime(application.submittedAt) || 'Not submitted',
    },
  ];

  return (
    <Stack spacing={1.5}>
      <Stack divider={<Divider flexItem />}>
        {details.map((detail) => (
          <Stack
            key={detail.label}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={0.5}
            sx={{ py: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              {detail.label}
            </Typography>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {detail.value}
            </Typography>
          </Stack>
        ))}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ py: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Status
          </Typography>
          <Label color={getAdmissionApplicationStatusColor(application.status)}>
            {getAdmissionApplicationStatusLabel(application.status)}
          </Label>
        </Stack>
      </Stack>

      {applications.length > 1 && (
        <Typography variant="caption" color="text.secondary">
          {applications.length} applications are recorded for this applicant. The active or most
          recent application is shown in this workspace.
        </Typography>
      )}

      {canStartAnother && (
        <>
          <Divider />
          <AdmissionApplicantStartCard
            embedded
            showCurrentApplicationSummary={false}
            applicantId={applicantId}
            applications={applications}
          />
        </>
      )}
    </Stack>
  );
}

function DisclosureSection({
  title,
  expanded,
  onChange,
  children,
}: {
  title: string;
  expanded: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        '& .MuiAccordion-root': { m: 0 },
        '& .MuiAccordionSummary-root': { minHeight: 44 },
      }}
    >
      <CustomAccordion title={title} expanded={expanded} onChange={onChange} content={children} />
    </Box>
  );
}

const getNotesTitle = (count: number) =>
  `Team notes · ${count === 0 ? 'No notes' : `${count} ${count === 1 ? 'note' : 'notes'}`}`;
