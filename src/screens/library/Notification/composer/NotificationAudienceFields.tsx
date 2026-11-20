import type { FormikProps } from 'formik';
import type { LibraryNotificationSettings } from 'src/redux/library/library-adapters';

import { Stack, Alert } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { NotificationRecipientPicker } from './NotificationRecipientPicker';

import type { ComposeValues } from './compose-model';

export function NotificationAudienceFields({
  formik,
  settings,
  disabled,
}: {
  formik: FormikProps<ComposeValues>;
  settings?: LibraryNotificationSettings;
  disabled: boolean;
}) {
  const events =
    settings?.events.filter((event) => event.recipientRole === 'Member' && !event.isComingSoon) ||
    [];
  const channels =
    settings?.channels.filter(
      (channel) =>
        channel.isAvailable &&
        settings.items.some(
          (item) =>
            item.eventType === formik.values.eventType &&
            item.channel === channel.channel &&
            item.recipientRole === 'Member' &&
            item.isActive &&
            item.isChannelAvailable &&
            !item.isComingSoon
        )
    ) || [];
  return (
    <Stack spacing={2}>
      <ShakingTextField error={Boolean(formik.touched.eventType && formik.errors.eventType)}>
        <CustomSelect
          label="Event"
          required
          fullWidth
          size="small"
          disabled={disabled}
          value={formik.values.eventType}
          options={events.map((event) => ({ value: event.eventType, label: event.eventName }))}
          onChange={(value) => {
            formik.setFieldValue('eventType', String(value));
            formik.setFieldValue('channel', '');
          }}
          error={Boolean(formik.touched.eventType && formik.errors.eventType)}
          helperText={formik.touched.eventType ? formik.errors.eventType : undefined}
        />
      </ShakingTextField>
      <ShakingTextField error={Boolean(formik.touched.channel && formik.errors.channel)}>
        <CustomSelect
          label="Channel"
          required
          fullWidth
          size="small"
          disabled={disabled || !formik.values.eventType}
          value={formik.values.channel}
          options={channels.map((channel) => ({ value: channel.channel, label: channel.label }))}
          onChange={(value) => formik.setFieldValue('channel', String(value))}
          error={Boolean(formik.touched.channel && formik.errors.channel)}
          helperText={
            formik.touched.channel
              ? formik.errors.channel
              : 'Only enabled channels for this event are available.'
          }
        />
      </ShakingTextField>
      {formik.values.eventType && channels.length === 0 && (
        <Alert severity="info">
          No enabled delivery channel is available for this event. An authorized operator can review
          notification settings.
        </Alert>
      )}
      <NotificationRecipientPicker
        value={formik.values.recipients}
        disabled={disabled}
        error={
          formik.touched.recipients && typeof formik.errors.recipients === 'string'
            ? formik.errors.recipients
            : undefined
        }
        onBlur={() => formik.setFieldTouched('recipients', true)}
        onChange={(members) => formik.setFieldValue('recipients', members)}
      />
    </Stack>
  );
}
