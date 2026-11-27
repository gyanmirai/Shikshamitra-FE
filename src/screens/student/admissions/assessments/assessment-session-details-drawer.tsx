'use client';

import type { AssessmentSession } from 'src/redux/student/admissions/admission-assessment-types';

import { useId } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';
import { useGetAssessmentSessionByIdQuery } from 'src/redux/student/admissions/admission-assessment-planning-api';
import {
  Box,
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

type Props = { session: AssessmentSession; onClose: () => void };

function SessionField({ label, value }: { label: string; value: string | number }) {
  return (
    <DetailField
      label={label}
      value={value}
      labelTypographyProps={{
        color: 'text.secondary',
        sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
      }}
    />
  );
}

export function AssessmentSessionDetailsDrawer({ session, onClose }: Props) {
  const titleId = useId();
  const { closing, closeAfterExit, onExited } = useStudentDrawerExit();
  const close = () => closeAfterExit(onClose);
  const { currentData, isError, refetch } = useGetAssessmentSessionByIdQuery(session.id, {
    refetchOnMountOrArgChange: true,
  });
  const detail = currentData?.id === session.id ? currentData : null;
  const scopes = detail?.scopeDetails?.length ? detail.scopeDetails : (session.scopeDetails ?? []);
  const roomReservationStatus = detail?.roomReservationStatus ?? session.roomReservationStatus;
  const status =
    (detail?.isCancelled ?? session.isCancelled)
      ? 'Cancelled'
      : roomReservationStatus === 2
        ? 'Room Approval Pending'
        : roomReservationStatus === 8
          ? 'Room Rejected'
          : Date.parse(detail?.endsAt ?? session.endsAt) <= Date.now()
            ? 'Ended'
            : Date.parse(detail?.startsAt ?? session.startsAt) <= Date.now()
              ? 'Ongoing'
              : 'Scheduled';
  const sessionType = detail?.sessionType ?? session.sessionType;
  const typeLabel =
    sessionType === 'individualInterview'
      ? 'Individual interview'
      : sessionType === 'groupInterview'
        ? 'Group interview'
        : 'School exam';

  return (
    <Drawer
      anchor="right"
      open={!closing}
      onClose={close}
      onTransitionExited={onExited}
      PaperProps={{
        inert: closing || undefined,
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': titleId,
        sx: { width: { xs: 1, sm: 560 }, maxWidth: 1 },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{ px: 2, py: 1.5, flexShrink: 0 }}
      >
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75}>
            <Typography id={titleId} component="h2" variant="h6">
              Session Details
            </Typography>
            <Label
              color={status === 'Cancelled' || status === 'Room Rejected' ? 'error' : 'default'}
            >
              {status}
            </Label>
            <InfoTooltipIcon
              label="Session details information"
              title="Review which assessments use this session, how many students are booked and when it takes place."
            />
          </Stack>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {session.name}
          </Typography>
        </Stack>
        <IconButton
          aria-label="Close session details"
          onClick={close}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: 2 }}>
          {isError ? (
            <Stack spacing={1} alignItems="flex-start">
              <Typography color="error">Unable to load session details.</Typography>
              <Button size="small" color="inherit" variant="outlined" onClick={refetch}>
                Retry
              </Button>
            </Stack>
          ) : !detail ? (
            <Stack spacing={1} aria-label="Loading session details">
              <Skeleton variant="rounded" height={110} />
              <Skeleton variant="rounded" height={170} />
            </Stack>
          ) : (
            <>
              <DetailSection
                title="Session"
                icon={GlobalIcons.admissionDetails}
                helpText="See the covered classes and assessment stages, the session type and the number of booked places."
              >
                <DetailGrid>
                  <SessionField label="Type" value={typeLabel} />
                  <SessionField
                    label="Classes"
                    value={
                      [...new Set(scopes.map((scope) => scope.className).filter(Boolean))].join(
                        ', '
                      ) || '—'
                    }
                  />
                  <SessionField
                    label="Booked / capacity"
                    value={`${detail.bookedCount} / ${detail.capacity}`}
                  />
                </DetailGrid>
                {scopes.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Assessment scope
                    </Typography>
                    {scopes.map((scope) => (
                      <Typography
                        key={`${scope.admissionOfferingId}:${scope.workflowStageDefinitionId}`}
                        variant="body2"
                      >
                        {scope.offeringName} · {scope.stageName}
                      </Typography>
                    ))}
                  </Box>
                )}
              </DetailSection>
              <DetailSection
                title="Schedule"
                icon={GlobalIcons.calendar}
                helpText="Check when and where the session takes place and who is interviewing, where applicable."
              >
                <DetailGrid>
                  <SessionField label="Starts" value={fDateTime(detail.startsAt) ?? '—'} />
                  <SessionField label="Ends" value={fDateTime(detail.endsAt) ?? '—'} />
                  <SessionField label="Location" value={detail.location || '—'} />
                  {detail.interviewerName && (
                    <SessionField label="Interviewer" value={detail.interviewerName} />
                  )}
                  {detail.slotDurationMinutes && (
                    <SessionField
                      label="Slot duration"
                      value={`${detail.slotDurationMinutes} minutes`}
                    />
                  )}
                </DetailGrid>
              </DetailSection>
            </>
          )}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
