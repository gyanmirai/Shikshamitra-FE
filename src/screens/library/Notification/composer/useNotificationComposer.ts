import type { NotificationSendResult } from 'src/redux/library/notification-types';
import type { LibraryNotificationSettings } from 'src/redux/library/library-adapters';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useSendLibraryNotificationMutation } from 'src/redux/library/notifications-api';

import { composeSchema } from './compose-model';

import type { ComposeValues } from './compose-model';

export function useNotificationComposer(
  canAct: boolean,
  settings: LibraryNotificationSettings | undefined,
  onComplete: (result: NotificationSendResult) => void
) {
  const [send, response] = useSendLibraryNotificationMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const formik = useFormik<ComposeValues>({
    initialValues: { eventType: '', channel: '', subject: '', message: '', recipients: [] },
    validationSchema: composeSchema,
    onSubmit: async (values) => {
      if (!canAct || inFlight.current) return;
      const enabled = settings?.items.some(
        (item) =>
          item.eventType === values.eventType &&
          item.channel === values.channel &&
          item.recipientRole === 'Member' &&
          item.isActive &&
          item.isChannelAvailable &&
          !item.isComingSoon
      );
      if (!enabled) {
        setError('The chosen event or channel is no longer enabled. Review the current settings.');
        return;
      }
      inFlight.current = true;
      setError('');
      try {
        const result = await send({
          eventType: values.eventType,
          channel: values.channel,
          subject: values.subject,
          message: values.message,
          recipients: values.recipients.map((member) => ({
            memberId: member.id,
            recipientRole: 'Member',
          })),
        }).unwrap();
        formik.resetForm({ values });
        onComplete(result);
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not submit this message. Your content and recipients are retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  return { formik, error, busy: response.isLoading || formik.isSubmitting };
}
