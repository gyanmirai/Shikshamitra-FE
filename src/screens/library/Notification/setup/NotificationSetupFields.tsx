import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';
import { Alert, Stack, TextField, Typography, FormHelperText } from '@mui/material';

import { StudentInboxRoutingField } from './StudentInboxRoutingField';
import { OperationalRecipientPicker } from './OperationalRecipientPicker';

import type { SetupValues, NotificationSetup } from './setup-model';

export function NotificationSetupFields({
  setup,
  formik,
  disabled,
}: {
  setup: NotificationSetup;
  formik: FormikProps<SetupValues>;
  disabled: boolean;
}) {
  return (
    <Stack spacing={2}>
      <FormSectionCard
        title="Automatic Reminders"
        icon={GlobalIcons.clock}
        descriptionTooltip="Automatic reminders run using the confirmed Library timezone and saved local send time."
      >
        <Typography variant="body2">
          Library timezone: {setup.timeZoneId || 'Not configured'}
        </Typography>
        {setup.needsConfiguration && (
          <Alert severity="warning">{setup.configurationIssues.join(' ')}</Alert>
        )}
        <TextField
          name="automaticReminderTimeLocal"
          label="Local reminder time"
          type="time"
          size="small"
          fullWidth
          value={formik.values.automaticReminderTimeLocal}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 60 } }}
          error={Boolean(
            formik.touched.automaticReminderTimeLocal && formik.errors.automaticReminderTimeLocal
          )}
          helperText={
            (formik.touched.automaticReminderTimeLocal &&
              formik.errors.automaticReminderTimeLocal) ||
            'School local time, HH:mm. Clearing this pauses automatic scheduling.'
          }
        />
      </FormSectionCard>
      <StudentInboxRoutingField formik={formik} disabled={disabled} />
      <FormSectionCard
        title="Operational Recipients"
        icon={GlobalIcons.bell}
        descriptionTooltip="Choose real eligible school accounts for operational Library alerts such as low stock."
      >
        <OperationalRecipientPicker
          ids={formik.values.operationalRecipientUserIds}
          saved={setup.configuredOperationalRecipients}
          disabled={disabled}
          onChange={(ids) => formik.setFieldValue('operationalRecipientUserIds', ids)}
        />
        {formik.touched.operationalRecipientUserIds &&
          formik.errors.operationalRecipientUserIds && (
            <FormHelperText error>{formik.errors.operationalRecipientUserIds}</FormHelperText>
          )}
      </FormSectionCard>
    </Stack>
  );
}
