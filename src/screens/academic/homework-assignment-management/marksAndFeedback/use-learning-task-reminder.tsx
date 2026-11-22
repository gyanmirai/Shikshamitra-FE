import type { IData } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { notificationRecordId } from 'src/redux/academic-notifications/delivery-adapters';
import { academicNotificationCacheOwner } from 'src/redux/academic-notifications/request-context';
import { AcademicNotificationAction, useAcademicNotificationActionContext } from 'src/components/academic-notification-action';

export function useLearningTaskReminder(
  kind: 'Homework' | 'Assignment',
  sourceId: string | undefined,
  recordLabel: string,
  divisionId: string
) {
  const context = useAcademicNotificationActionContext(`Academic.${kind}.Due`, sourceId);
  const [target, setTarget] = useState<{ key: string; studentId: string; studentName: string }>();
  const key = context ? `${academicNotificationCacheOwner(context.identity)}/${context.source.sourceId}/${divisionId}` : '';

  function selectRecipient(row: IData) {
    const studentId = notificationRecordId(String(row.studentId ?? ''));
    if (!key || !studentId) return;
    setTarget({ key, studentId, studentName: String(row.studentName || 'Selected student') });
  }

  return {
    onNotify: context ? selectRecipient : undefined,
    dialog: context && target?.key === key ? (
      <AcademicNotificationAction context={context} recordLabel={recordLabel || kind}
        audienceLabel={`Family notification for ${target.studentName}`}
        selectedRecipients={[{ kind: 'Student', studentId: target.studentId }]}
        onClose={() => setTarget(undefined)} />
    ) : null,
  };
}
