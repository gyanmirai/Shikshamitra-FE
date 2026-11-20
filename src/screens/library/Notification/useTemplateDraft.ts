import type { LibraryNotificationSetting } from 'src/redux/library/library-adapters';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUpdateLibraryNotificationSettingsMutation } from 'src/redux/library/notifications-api';

import { supportsOffset, supportsCadence } from './notification-display';

const days = (min: number) =>
  Yup.string()
    .required('Enter the number of days')
    .matches(/^\d+$/, 'Enter a whole number')
    .test('range', `Use ${min}–365 days`, (value) => Number(value) >= min && Number(value) <= 365);
export function useTemplateDraft(
  setting: LibraryNotificationSetting,
  canEdit: boolean,
  onClose: () => void
) {
  const [save, result] = useUpdateLibraryNotificationSettingsMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const initialValues = {
    subjectTemplate: setting.subjectTemplate,
    messageTemplate: setting.messageTemplate,
    reminderOffsetDays:
      setting.reminderOffsetDays == null ? '' : String(setting.reminderOffsetDays),
    repeatIntervalDays:
      setting.repeatIntervalDays == null ? '' : String(setting.repeatIntervalDays),
  };
  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      subjectTemplate: Yup.string().max(300, 'Use at most 300 characters'),
      messageTemplate: Yup.string().max(2000, 'Use at most 2000 characters'),
      reminderOffsetDays: supportsOffset(setting.eventType) ? days(0) : Yup.string(),
      repeatIntervalDays: supportsCadence(setting.eventType) ? days(1) : Yup.string(),
    }),
    onSubmit: async (values) => {
      if (!canEdit || inFlight.current) return;
      inFlight.current = true;
      setError('');
      const update: Partial<LibraryNotificationSetting> & { id: string } = { id: setting.id };
      if (values.subjectTemplate !== initialValues.subjectTemplate)
        update.subjectTemplate = values.subjectTemplate;
      if (values.messageTemplate !== initialValues.messageTemplate)
        update.messageTemplate = values.messageTemplate;
      if (
        supportsOffset(setting.eventType) &&
        values.reminderOffsetDays !== initialValues.reminderOffsetDays
      )
        update.reminderOffsetDays = Number(values.reminderOffsetDays);
      if (
        supportsCadence(setting.eventType) &&
        values.repeatIntervalDays !== initialValues.repeatIntervalDays
      )
        update.repeatIntervalDays = Number(values.repeatIntervalDays);
      try {
        await save({ items: [update] }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Notification template updated.' });
        onClose();
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not save this template. Your edits are retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  return { formik, error, busy: result.isLoading || formik.isSubmitting };
}
