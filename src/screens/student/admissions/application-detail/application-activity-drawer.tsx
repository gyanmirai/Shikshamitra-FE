'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { hasGrantedPermission } from 'src/utils/permissions';
import { fDateTime, fTimestamp } from 'src/utils/format-time';
import { useId, useState, useEffect, useCallback } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useGetAdmissionApplicant360Query } from 'src/redux/student/admissions/admission-applicants-api';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Stack,
  Button,
  Drawer,
  Divider,
  Skeleton,
  Typography,
  IconButton,
} from '@mui/material';

import { formatAdmissionReference } from '../admission-reference';
import AdmissionApplicantNotes from '../admission-applicant-notes';
import { useApplicationFollowUps } from './use-application-follow-ups';
import { FollowUpCard } from '../inquiry-management/inquiry-follow-ups';
import { useFollowUpScheduler } from '../inquiry-management/use-follow-up-scheduler';
import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';
import { InquiryFollowUpScheduler } from '../inquiry-management/inquiry-follow-up-scheduler';

import type { ApplicantNote } from '../admission-applicant-notes';

type Props = {
  open: boolean;
  application: AdmissionApplication;
  onClose: () => void;
  onBusyChange?: (busy: boolean) => void;
};

/** Mount queries and drafts only for an open drawer; closing discards only after the shared guard. */
export function ApplicationActivityDrawer({ open, ...props }: Props) {
  return open ? <ApplicationActivityContent key={props.application.id} {...props} /> : null;
}

function ApplicationActivityContent({ application, onClose, onBusyChange }: Omit<Props, 'open'>) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewNotes =
    Boolean(application.applicantId) &&
    hasGrantedPermission(permissions, 'Students.Admissions.Applicants.View');
  const canEditNotes =
    canViewNotes && hasGrantedPermission(permissions, 'Students.Admissions.Applicants.Add');
  const canViewFollowUps =
    Boolean(application.inquiryId) &&
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view);
  const notesQuery = useGetAdmissionApplicant360Query(application.applicantId ?? '', {
    skip: !canViewNotes,
  });
  const followUps = useApplicationFollowUps(application.id, !canViewFollowUps);
  const [mode, setMode] = useState<'note' | 'follow-up'>(canEditNotes ? 'note' : 'follow-up');
  const [noteBusy, setNoteBusy] = useState(false);
  const [noteDirty, setNoteDirty] = useState(false);
  const [finishing, setFinishing] = useState<Record<string, boolean>>({});
  const [finishDrafts, setFinishDrafts] = useState<Record<string, boolean>>({});
  const updateFinishBusy = useCallback((id: string, value: boolean) => {
    setFinishing((previous) => (previous[id] === value ? previous : { ...previous, [id]: value }));
  }, []);
  const updateFinishDirty = useCallback((id: string, value: boolean) => {
    setFinishDrafts((previous) =>
      previous[id] === value ? previous : { ...previous, [id]: value }
    );
  }, []);
  const canSchedule =
    canViewFollowUps && !followUps.query.isError && Boolean(followUps.value?.canManageFollowUps);
  const loading =
    (canViewNotes && notesQuery.isFetching) || (canViewFollowUps && followUps.query.isFetching);
  const mutationBusy = noteBusy || followUps.saving || Object.values(finishing).some(Boolean);
  const scheduler = useFollowUpScheduler({
    actions: followUps.actions,
    blocked: !canSchedule || loading || mutationBusy,
  });
  const busy = loading || mutationBusy || scheduler.scheduling;
  const dirty = noteDirty || scheduler.dirty || Object.values(finishDrafts).some(Boolean);
  const router = useRouter();
  const guard = useUnsavedNavigation(dirty, {
    push: router.push,
    blockNavigation: busy,
    title: 'Discard Unsaved Activity?',
    description: 'Your unsaved note or follow-up changes will be discarded.',
  });
  const close = () => guard.requestNavigation(onClose);
  const titleId = useId();
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  const notes: ApplicantNote[] = canViewNotes ? (notesQuery.currentData?.notes ?? []) : [];
  const items = canViewFollowUps ? (followUps.value?.followUps ?? []) : [];
  const entries = [
    ...notes.map((note) => ({ kind: 'note' as const, note, time: note.creationTime })),
    ...items.map((followUp) => ({
      kind: 'follow-up' as const,
      followUp,
      time: followUp.completedAt || followUp.scheduledAt,
    })),
  ].sort((a, b) => (Number(fTimestamp(b.time)) || 0) - (Number(fTimestamp(a.time)) || 0));
  const selectedMode =
    mode === 'note' && canEditNotes ? 'note' : canSchedule ? 'follow-up' : 'note';
  const history = (onEdit?: (note: ApplicantNote) => void) => (
    <Stack spacing={1.5}>
      <Divider />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">History</Typography>
        <Label>{items.filter((item) => item.status === 0).length} open</Label>
      </Stack>
      {entries.length === 0 && !loading && !notesQuery.isError && !followUps.query.isError && (
        <EmptyContent
          title="No notes or follow-ups yet"
          description="Saved team notes and follow-ups will appear here."
          filled
          slotProps={{ img: { maxWidth: 80 } }}
        />
      )}
      {entries.map((entry) =>
        entry.kind === 'follow-up' ? (
          <Paper key={`follow-up-${entry.followUp.id}`} variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Follow-up
            </Typography>
            <FollowUpCard
              compact
              item={entry.followUp}
              readOnly={!canSchedule}
              busy={busy}
              actions={followUps.actions}
              onBusyChange={updateFinishBusy}
              onDirtyChange={updateFinishDirty}
            />
          </Paper>
        ) : (
          <Paper key={`note-${entry.note.id}`} variant="outlined" sx={{ p: 1.5 }}>
            <Stack spacing={0.75}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Team note</Typography>
                {canEditNotes && onEdit && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={busy || noteDirty}
                    onClick={() => onEdit(entry.note)}
                  >
                    Edit
                  </Button>
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {fDateTime(entry.note.creationTime)}
                {entry.note.lastEditedAt ? ` · edited ${fDateTime(entry.note.lastEditedAt)}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {entry.note.text}
              </Typography>
            </Stack>
          </Paper>
        )
      )}
    </Stack>
  );
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={close}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': titleId,
            sx: {
              width: { xs: '100%', sm: 560 },
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack spacing={0.5} sx={{ p: 2, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography id={titleId} variant="h6">
              Notes &amp; Follow-ups
            </Typography>
            <CustomTooltip title="Team notes keep applicant context. Follow-ups record the next contact or task for this application.">
              <IconButton size="small" aria-label="About notes and follow-ups">
                <Iconify icon="mdi:information-outline" color="info.main" />
              </IconButton>
            </CustomTooltip>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton disabled={busy} aria-label="Close Notes & Follow-ups" onClick={close}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {application.applicantName} · {formatAdmissionReference(application.applicationNumber)}
          </Typography>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {canViewNotes && notesQuery.isError && (
              <StudentFeedback
                notificationKey="STU-0167"
                presentation="toast"
                severity="error"
                action={
                  <Button size="small" disabled={busy} onClick={notesQuery.refetch}>
                    Retry notes
                  </Button>
                }
              >
                Applicant notes could not be loaded. Try again.
              </StudentFeedback>
            )}
            {canViewFollowUps && followUps.query.isError && (
              <StudentFeedback
                notificationKey="STU-0168"
                presentation="toast"
                severity="error"
                action={
                  !followUps.sourceUnavailable && (
                    <Button size="small" disabled={busy} onClick={followUps.query.refetch}>
                      Retry follow-ups
                    </Button>
                  )
                }
              >
                {followUps.problem?.detail && followUps.problem.detail !== 'Something went wrong'
                  ? followUps.problem.detail
                  : 'Unable to load application follow-ups.'}
              </StudentFeedback>
            )}
            {!canViewNotes && (
              <StudentFeedback notificationKey="STU-0169" presentation="inline" severity="info">
                Applicant notes require applicant View access.
              </StudentFeedback>
            )}
            {!canViewFollowUps && (
              <StudentFeedback notificationKey="STU-0170" presentation="inline" severity="info">
                {application.inquiryId
                  ? 'Application access is required to view follow-ups.'
                  : 'No source inquiry is linked to this application. Follow-ups are unavailable.'}
              </StudentFeedback>
            )}
            {loading && (
              <Stack role="status" aria-label="Loading notes and follow-ups" spacing={1}>
                <Skeleton height={48} />
                <Skeleton variant="rounded" height={96} />
              </Stack>
            )}
            {(canEditNotes || canSchedule) && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Add activity</Typography>
                <Tabs
                  value={selectedMode}
                  onChange={(_, value) => setMode(value)}
                  aria-label="Activity type"
                >
                  <Tab value="note" label="Note" disabled={!canEditNotes || busy} />
                  <Tab value="follow-up" label="Follow-up" disabled={!canSchedule || busy} />
                </Tabs>
              </Stack>
            )}
            {selectedMode === 'follow-up' && canSchedule && (
              <InquiryFollowUpScheduler
                embedded
                scheduledAt={scheduler.scheduledAt}
                purpose={scheduler.purpose}
                disabled={busy}
                scheduling={scheduler.scheduling}
                dateError={scheduler.dateError}
                error={scheduler.scheduleError}
                onDateChange={scheduler.setScheduledAt}
                onDateError={scheduler.setDateError}
                onPurposeChange={scheduler.setPurpose}
                onSchedule={scheduler.schedule}
              />
            )}
            {canViewNotes && notesQuery.currentData ? (
              <AdmissionApplicantNotes
                applicantId={application.applicantId!}
                notes={notes}
                embedded
                compact
                readOnly={!canEditNotes}
                disabled={busy || notesQuery.isError}
                showEditor={selectedMode === 'note'}
                onBusyChange={setNoteBusy}
                onDirtyChange={setNoteDirty}
                onEditStart={() => setMode('note')}
                renderHistory={history}
              />
            ) : (
              history()
            )}
          </Stack>
        </Scrollbar>
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
        >
          <Button size="small" variant="outlined" disabled={busy} onClick={close}>
            Close
          </Button>
        </Stack>
      </Drawer>
      {guard.confirmation}
    </>
  );
}
