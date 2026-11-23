import type { FormikProps } from 'formik';
import type { Editor as TiptapEditor } from '@tiptap/react';
import type { AcademicNotificationEvent, AcademicNotificationChannel } from 'src/redux/academic-notifications/types';

import { useRef } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Stack, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

import { templateRecipientKinds } from '../notification-template-model';
import { NotificationTemplateTextField } from './notification-template-text-field';
import { NotificationTemplateEmailField } from './notification-template-email-field';

import type { TemplateFormValues } from '../use-notification-template-form';

export function NotificationTemplateFields({ event, form, locked, disabled, readOnly, scopeLabel }: {
  event: AcademicNotificationEvent;
  form: FormikProps<TemplateFormValues>;
  locked: boolean;
  disabled: boolean;
  readOnly: boolean;
  scopeLabel: string;
}) {
  const editorRef = useRef<TiptapEditor | null>(null);
  const { values, errors, touched } = form;
  const { variables } = event.definition;
  const email = values.channel === CommunicationChannelType.Email;
  const subjectError = touched.subject ? errors.subject : undefined;
  const bodyError = touched.body ? errors.body : undefined;

  return (
    <Stack gap={2}>
      <Typography variant="body2" color="text.secondary">{scopeLabel}</Typography>
      <ShakingTextField error={Boolean(touched.templateName && errors.templateName)}>
        <TextField label="Template name" size="small" required fullWidth
          {...form.getFieldProps('templateName')} disabled={disabled || locked}
          error={Boolean(touched.templateName && errors.templateName)}
          helperText={touched.templateName && errors.templateName} />
      </ShakingTextField>
      <Stack gap={1.5} direction={{ xs: 'column', sm: 'row' }}>
        <CustomSelect label="Recipient" name="recipientKind" size="small" value={values.recipientKind} disabled={disabled || locked}
          options={templateRecipientKinds(event.definition.recipientSelectors).map((kind) => ({ label: notificationLabel(kind), value: kind }))}
          sx={{ flex: 1 }}
          onChange={(value) => form.setFieldValue('recipientKind', String(value))}
          error={Boolean(touched.recipientKind && errors.recipientKind)}
          helperText={touched.recipientKind ? errors.recipientKind : undefined} />
        <CustomSelect label="Delivery channel" name="channel" size="small" value={values.channel} disabled={disabled || locked}
          options={event.definition.supportedChannels.map((channel) => ({
            value: channel, label: notificationChannelLabels[channel],
          }))}
          sx={{ flex: 1 }}
          onChange={(value) => {
            const channel = Number(value) as AcademicNotificationChannel;
            let {body} = values;
            if (email && channel !== CommunicationChannelType.Email) {
              body = editorRef.current?.getText({ blockSeparator: '\n' }) ?? body;
            } else if (channel === CommunicationChannelType.Email && !email && body) {
              const escaped = body.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
              body = `<p>${escaped.replaceAll('\n', '<br>')}</p>`;
            }
            form.setValues({ ...values, channel, body });
          }}
          error={Boolean(touched.channel && errors.channel)}
          helperText={touched.channel ? errors.channel : undefined} />
        <ShakingTextField error={Boolean(touched.languageCode && errors.languageCode)} sx={{ flex: 1 }}>
          <TextField label="Language code" size="small" required fullWidth
            {...form.getFieldProps('languageCode')} disabled={disabled || locked}
            error={Boolean(touched.languageCode && errors.languageCode)}
            helperText={(touched.languageCode && errors.languageCode) || 'For example, en or hi.'} />
        </ShakingTextField>
      </Stack>
      {values.channel === CommunicationChannelType.WebPush && (
        <Typography variant="body2" color="text.secondary">
          Browser push shows a generic school alert on the device. Use the in-app template for the message recipients read in the website inbox.
        </Typography>
      )}
      <NotificationTemplateTextField input={form.getFieldProps('subject')} error={subjectError}
        readOnly={readOnly} disabled={disabled} variables={variables}
        onValue={(value) => { form.setFieldValue('subject', value); }} />
      {email ? (
        <NotificationTemplateEmailField editorRef={editorRef} value={values.body} error={bodyError}
          disabled={disabled} readOnly={readOnly} variables={variables}
          onValue={(value) => { form.setFieldValue('body', value); }}
          onBlur={() => { form.setFieldTouched('body'); }} />
      ) : (
        <NotificationTemplateTextField input={form.getFieldProps('body')} error={bodyError}
          readOnly={readOnly} disabled={disabled} variables={variables}
          onValue={(value) => { form.setFieldValue('body', value); }} />
      )}
    </Stack>
  );
}
