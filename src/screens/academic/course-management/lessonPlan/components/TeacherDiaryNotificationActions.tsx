'use client';

import type { AcademicNotificationRecipient } from 'src/redux/academic-notifications/manual-types';

import { useState } from 'react';
import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDiaryFollowUpRecipientsQuery } from 'src/redux/academic-notifications/manual-api';
import { academicNotificationCacheOwner } from 'src/redux/academic-notifications/request-context';
import { AcademicNotificationAction, useAcademicNotificationActionContext } from 'src/components/academic-notification-action';

const audienceLabels: Record<string, string> = {
  AssignedTeacher: 'Diary author',
  ConfiguredReviewer: 'Configured reviewer',
};

export function TeacherDiaryNotificationActions({ diaryId, teacherName }: { diaryId: string; teacherName?: string }) {
  const context = useAcademicNotificationActionContext('Academic.Diary.FollowUpRequested', diaryId);
  const recipients = useDiaryFollowUpRecipientsQuery(
    context ? { ...context.identity, diaryId: context.source.sourceId } : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  const [target, setTarget] = useState<{ key: string; recipient: AcademicNotificationRecipient }>();
  if (!context || recipients.isError) return null;

  const available = (recipients.currentData ?? []).filter((recipient) => recipient.userId && audienceLabels[recipient.kind]);
  const key = `${academicNotificationCacheOwner(context.identity)}/${context.source.sourceId}`;
  const selected = target?.key === key && available.find(
    (recipient) => recipient.kind === target.recipient.kind && recipient.userId === target.recipient.userId &&
      recipient.employeeId === target.recipient.employeeId
  );

  return (
    <>
      {available.map((recipient) => (
        <Button
          key={`${recipient.kind}/${recipient.userId}`}
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
          onClick={() => setTarget({ key, recipient })}
        >
          {recipient.kind === 'AssignedTeacher' ? 'Notify teacher' : 'Notify reviewer'}
        </Button>
      ))}
      {selected && (
        <AcademicNotificationAction
          context={context}
          recordLabel="Teacher diary follow-up"
          audienceLabel={selected.kind === 'AssignedTeacher' && teacherName ? teacherName : audienceLabels[selected.kind]}
          selectedRecipients={[selected]}
          onClose={() => setTarget(undefined)}
        />
      )}
    </>
  );
}
