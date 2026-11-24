import type { FormikErrors } from 'formik';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';
import type {
  AcademicNotificationEvent,
  AcademicNotificationChannel,
  AcademicNotificationCacheIdentity,
} from 'src/redux/academic-notifications/types';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useCreateAcademicNotificationTemplateMutation,
  useUpdateAcademicNotificationTemplateDraftMutation,
} from 'src/redux/academic-notifications/template-api';

import { templateMessageError, templateRecipientKinds } from './notification-template-model';

export type TemplateFormValues = {
  templateName: string;
  recipientKind: string;
  channel: AcademicNotificationChannel;
  languageCode: string;
  subject: string;
  body: string;
};

function templateFormValues(event: AcademicNotificationEvent, template?: AcademicNotificationTemplate): TemplateFormValues {
  const { supportedChannels, recipientSelectors } = event.definition;
  return {
    templateName: template?.templateName ?? '',
    recipientKind: template?.recipientKind ?? templateRecipientKinds(recipientSelectors)[0] ?? '',
    channel: template?.channel ?? supportedChannels[0],
    languageCode: template?.languageCode ?? 'en',
    subject: template?.subject ?? '',
    body: template?.body ?? '',
  };
}

const validationSchema = Yup.object({
  templateName: Yup.string().trim().max(160, 'Use 160 characters or fewer.').required('Enter a template name.'),
  languageCode: Yup.string().trim().max(16, 'Use 16 characters or fewer.')
    .matches(/^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i, 'Enter a language code such as en or hi.')
    .required('Enter a language code.'),
});

export function templateActionError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
    return 'This template changed in another session. Your edits are still here. Reopen the template to load the latest version.';
  }
  const { detail, errorCode } = parseApiProblemDetail(error);
  if (errorCode === 'WebPushSubscriptionUnavailable' || errorCode === 'WebPushTestDeviceSelectionRequired') {
    return 'This test needs an active browser subscription for your account. Enable browser notifications from the bell in the browser you want to test, then reopen the test.';
  }
  return detail || fallback;
}

export function useNotificationTemplateForm({
  event, initialTemplate, identity, academicMediumId,
}: {
  event: AcademicNotificationEvent;
  initialTemplate?: AcademicNotificationTemplate;
  identity: AcademicNotificationCacheIdentity;
  academicMediumId: string | null;
}) {
  const [template, setTemplate] = useState(initialTemplate);
  const [create] = useCreateAcademicNotificationTemplateMutation();
  const [update] = useUpdateAcademicNotificationTemplateDraftMutation();
  const form = useFormik<TemplateFormValues>({
    initialValues: templateFormValues(event, initialTemplate),
    validationSchema,
    validate: (values) => {
      const errors: FormikErrors<TemplateFormValues> = {};
      const { definition } = event;
      if (!definition.supportedChannels.includes(values.channel)) errors.channel = 'Choose a channel for this event.';
      if (!templateRecipientKinds(definition.recipientSelectors).includes(values.recipientKind)) {
        errors.recipientKind = 'Choose a recipient for this event.';
      }
      const subject = templateMessageError(values.subject, 'subject', values.channel, definition.variables);
      const body = templateMessageError(values.body, 'body', values.channel, definition.variables);
      if (subject) errors.subject = subject;
      if (body) errors.body = body;
      return errors;
    },
    onSubmit: async (values, { setStatus, resetForm }) => {
      setStatus(undefined);
      try {
        const { body, subject } = values;
        const saved = template && !template.isPublished
          ? await update({
            ...identity, templateId: template.templateId,
            command: { body, subject, revisionId: template.revisionId, concurrencyStamp: template.concurrencyStamp },
          }).unwrap()
          : await create({
            ...identity,
            command: {
              ...values, templateName: values.templateName.trim(), languageCode: values.languageCode.trim(),
              eventKey: event.definition.eventKey, academicMediumId,
              existingTemplateId: template?.templateId, headerConcurrencyStamp: template?.headerConcurrencyStamp,
            },
          }).unwrap();
        setTemplate(saved);
        resetForm({ values: templateFormValues(event, saved) });
        shikshaMitraToast.success({ message: 'Template draft saved.' });
      } catch (error) {
        setStatus(templateActionError(error, 'The template draft could not be saved.'));
      }
    },
  });

  function applySavedTemplate(saved: AcademicNotificationTemplate) {
    setTemplate(saved);
    form.resetForm({ values: templateFormValues(event, saved) });
  }

  return { form, template, applySavedTemplate };
}
