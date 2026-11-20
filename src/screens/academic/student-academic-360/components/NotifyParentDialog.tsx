'use client';

import type { AcademicNotificationActionContext } from 'src/components/academic-notification-action/preview-dialog';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { skipToken } from '@reduxjs/toolkit/query';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, DialogActions, LinearProgress } from '@mui/material';
import { useAcademicNotificationTemplateOptionsQuery } from 'src/redux/academic-notifications/api';
import { useStudent360NotificationAudienceQuery } from 'src/redux/academic-notifications/manual-api';
import { AcademicNotificationAction, useAcademicNotificationActionContext } from 'src/components/academic-notification-action';

const guardianMessage = 'Academic.Student360.GuardianMessage';
const meetingRequested = 'Academic.Student360.MeetingRequested';

export type Student360NotificationEvent = typeof guardianMessage | typeof meetingRequested;

const eventLabels = {
  [guardianMessage]: 'Send academic message',
  [meetingRequested]: 'Request a meeting',
};

const familyLabels = { father: 'Father', mother: 'Mother', guardian: 'Other guardian', self: 'Student account' };

type Student360NotificationActionsProps = {
  studentId: string;
  studentName: string;
  event: Student360NotificationEvent | undefined;
  onEventChange: (event: Student360NotificationEvent | undefined) => void;
};

export function Student360NotificationActions({ studentId, studentName, event, onEventChange }: Student360NotificationActionsProps) {
  const messageContext = useAcademicNotificationActionContext(guardianMessage, studentId);
  const meetingContext = useAcademicNotificationActionContext(meetingRequested, studentId);
  const context = event === guardianMessage ? messageContext : event === meetingRequested ? meetingContext : undefined;

  if (!messageContext && !meetingContext) return null;

  return (
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ px: 1.5, py: 1 }}>
      {messageContext && <Button size="small" variant="outlined" color="inherit"
        startIcon={<Iconify icon={GlobalIcons.sendNotification} />} onClick={() => onEventChange(guardianMessage)}>
        {eventLabels[guardianMessage]}
      </Button>}
      {meetingContext && <Button size="small" variant="outlined" color="inherit"
        startIcon={<Iconify icon={GlobalIcons.sendNotification} />} onClick={() => onEventChange(meetingRequested)}>
        {eventLabels[meetingRequested]}
      </Button>}
      {event && context && <NotifyParentDialog key={`${event}/${studentId}`} context={context}
        studentName={studentName} event={event} onClose={() => onEventChange(undefined)} />}
    </Stack>
  );
}

function NotifyParentDialog({ context, studentName, event, onClose }: {
  context: AcademicNotificationActionContext;
  studentName: string;
  event: Student360NotificationEvent;
  onClose: () => void;
}) {
  const { identity, source } = context;
  const audience = useStudent360NotificationAudienceQuery({
    ...identity, studentId: source.sourceId, eventKey: event,
  }, { refetchOnMountOrArgChange: true });
  const templates = useAcademicNotificationTemplateOptionsQuery(audience.currentData && !audience.isFetching ? {
    ...identity, eventKey: event, academicMediumId: audience.currentData.academicMediumId,
  } : skipToken);
  const roster = audience.currentData;
  const templateOptions = templates.currentData;
  const error = audience.isError || templates.isError;

  if (error || !roster || !templateOptions || audience.isFetching) {
    return (
      <CustomDialog open title="Prepare Notification" maxWidth="sm" handleClose={onClose} guardUnsavedChanges={false}>
        <DialogScrollContent>
          {error ? <Alert severity="error">Unable to load the recipients or published templates.</Alert> :
            <LinearProgress aria-label="Loading recipients and templates" />}
        </DialogScrollContent>
        <DialogActions>
          <Button size="small" variant="outlined" color="inherit" onClick={onClose}>Close</Button>
          {error && <Button size="small" variant="contained" onClick={() => {
            if (audience.isError) audience.refetch();
            else templates.refetch();
          }}>Retry</Button>}
        </DialogActions>
      </CustomDialog>
    );
  }

  const child = { kind: 'Student', studentId: source.sourceId };
  const family = roster.family.map(({ relationship, isPrimary }) => ({
    key: relationship, relationship, defaultSelected: isPrimary, recipient: child,
    label: isPrimary ? `Primary guardian (${familyLabels[relationship].toLowerCase()})` : familyLabels[relationship],
  }));
  const staff = roster.staff.map((recipient) => ({
    key: recipient.userId ?? recipient.kind, label: 'Class teacher', recipient,
  }));
  const templateNames = new Map(templateOptions.items.map(({ templateId, templateName }) => [templateId, templateName]));
  return (
    <AcademicNotificationAction context={context} recordLabel={eventLabels[event]} audienceLabel={studentName} selectedRecipients={[]}
      choices={{
        audience: [...family, ...staff],
        templates: Array.from(templateNames, ([value, label]) => ({ value, label })),
      }}
      onClose={onClose} />
  );
}
