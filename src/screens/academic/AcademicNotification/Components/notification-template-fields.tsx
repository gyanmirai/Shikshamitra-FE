import type { FormikProps } from 'formik';
import type { Editor as TiptapEditor } from '@tiptap/react';
import type { AcademicNotificationEvent, AcademicNotificationChannel } from 'src/redux/academic-notifications/types';

import { useId, useRef } from 'react';
import { Editor } from 'src/components/editor';
import CustomSelect from 'src/components/custom-select';
import { Stack, TextField, Typography } from '@mui/material';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

import { NotificationVariablePicker } from './notification-variable-picker';
import { templateVariableToken, insertTemplateVariable, templateRecipientKinds } from '../notification-template-model';

import type { TemplateTextField } from '../notification-template-model';
import type { TemplateFormValues } from '../use-notification-template-form';

export function NotificationTemplateFields({ event, form, locked, disabled, readOnly, scopeLabel }: {
  event: AcademicNotificationEvent;
  form: FormikProps<TemplateFormValues>;
  locked: boolean;
  disabled: boolean;
  readOnly: boolean;
  scopeLabel: string;
}) {
  const messageId = useId();
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<TiptapEditor | null>(null);
  const { values, errors, touched } = form;
  const email = values.channel === CommunicationChannelType.Email;
  const contentDisabled = disabled || readOnly;
  const subjectError = touched.subject ? errors.subject : undefined;
  const bodyError = touched.body ? errors.body : undefined;

  function insert(field: TemplateTextField, key: string) {
    if (field === 'body' && email) {
      editorRef.current?.chain().focus().insertContent(templateVariableToken(key)).run();
      return;
    }
    const input = field === 'body' ? bodyRef.current : subjectRef.current;
    const position = values[field].length;
    const next = insertTemplateVariable(values[field], input?.selectionStart ?? position, input?.selectionEnd ?? position, key);
    form.setFieldValue(field, next.value);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(next.caret, next.caret);
    });
  }

  return (
    <Stack gap={2}>
      <Typography variant="body2" color="text.secondary">{scopeLabel}</Typography>
      <TextField label="Template name" size="small" required
        {...form.getFieldProps('templateName')} disabled={disabled || locked}
        error={Boolean(touched.templateName && errors.templateName)}
        helperText={touched.templateName && errors.templateName} />
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
        <TextField label="Language code" size="small" required
          {...form.getFieldProps('languageCode')} disabled={disabled || locked}
          error={Boolean(touched.languageCode && errors.languageCode)}
          helperText={(touched.languageCode && errors.languageCode) || 'For example, en or hi.'}
          sx={{ flex: 1 }} />
      </Stack>
      <TextField label="Subject" size="small" inputRef={subjectRef}
        {...form.getFieldProps('subject')} disabled={contentDisabled} error={Boolean(subjectError)} helperText={subjectError} />
      {!readOnly && <NotificationVariablePicker variables={event.definition.variables}
        field="subject" disabled={disabled} onInsert={(key) => insert('subject', key)} />}
      {email ? (
        <Stack gap={0.5}>
          <Typography component="label" id={messageId} variant="subtitle2">Message</Typography>
          <Editor value={values.body} editable={!contentDisabled} isToolbarShow={!readOnly}
            sx={disabled ? { pointerEvents: 'none' } : undefined}
            onCreate={({ editor }) => { editorRef.current = editor; }}
            onChange={(value) => { form.setFieldValue('body', value); }}
            onBlur={() => { form.setFieldTouched('body'); }}
            placeholder="Write the email message"
            editorProps={{ attributes: {
              role: 'textbox', name: 'body', 'aria-multiline': 'true', 'aria-labelledby': messageId,
              'aria-invalid': String(Boolean(bodyError)),
            } }}
            error={Boolean(bodyError)} helperText={bodyError} />
        </Stack>
      ) : (
        <TextField label="Message" size="small" required multiline minRows={4} inputRef={bodyRef}
          {...form.getFieldProps('body')} disabled={contentDisabled} error={Boolean(bodyError)} helperText={bodyError} />
      )}
      {!readOnly && <NotificationVariablePicker variables={event.definition.variables}
        field="message" disabled={disabled} onInsert={(key) => insert('body', key)} />}
    </Stack>
  );
}
