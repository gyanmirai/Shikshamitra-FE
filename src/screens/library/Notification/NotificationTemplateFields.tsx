import type { FormikProps } from 'formik';

import { Stack, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { supportsOffset, supportsCadence } from './notification-display';

export type TemplateValues = {
  subjectTemplate: string;
  messageTemplate: string;
  reminderOffsetDays: string;
  repeatIntervalDays: string;
};
export function NotificationTemplateFields({
  formik,
  eventType,
  disabled,
}: {
  formik: FormikProps<TemplateValues>;
  eventType: string;
  disabled: boolean;
}) {
  return (
    <Stack spacing={2}>
      {(['subjectTemplate', 'messageTemplate'] as const).map((name) => (
        <TextField
          key={name}
          name={name}
          label={name === 'subjectTemplate' ? 'Subject' : 'Message'}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={disabled}
          fullWidth
          size="small"
          multiline={name === 'messageTemplate'}
          minRows={name === 'messageTemplate' ? 5 : undefined}
          error={Boolean(formik.touched[name] && formik.errors[name])}
          helperText={formik.touched[name] && formik.errors[name]}
        />
      ))}
      {(
        [
          {
            name: 'reminderOffsetDays',
            label: 'Reminder offset days',
            visible: supportsOffset(eventType),
            help: 'Days before the due or expiry date.',
          },
          {
            name: 'repeatIntervalDays',
            label: 'Repeat interval days',
            visible: supportsCadence(eventType),
            help: 'Minimum days between reminders for the same record and recipient.',
          },
        ] as const
      )
        .filter((field) => field.visible)
        .map(({ name, label, help }) => {
          const error = Boolean(formik.touched[name] && formik.errors[name]);
          return (
            <ShakingTextField key={name} error={error}>
              <NumericFormatCustom
                name={name}
                label={label}
                required
                value={formik.values[name]}
                disabled={disabled}
                decimalScale={0}
                prefix=""
                fullWidth
                size="small"
                onBlur={formik.handleBlur}
                error={error}
                helperText={error ? formik.errors[name] : help}
                roundToWholeRupees={false}
                onValueChange={(value, source) => {
                  if (source.source === 'event') formik.setFieldValue(name, value.value);
                }}
              />
            </ShakingTextField>
          );
        })}
    </Stack>
  );
}
