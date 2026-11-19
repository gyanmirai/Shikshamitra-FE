import type { FormikProps } from 'formik';

import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Switch, TextField, FormControlLabel } from '@mui/material';

import type { RuleFormValues } from '../notification-rule-form-model';

interface Props {
  form: FormikProps<RuleFormValues>;
  schedule?: 'reminder' | 'digest';
  allowsQuietHoursBypass: boolean;
}

export function NotificationRuleTiming({ form, schedule, allowsQuietHoursBypass }: Props) {
  const { values } = form;
  const field = (name: 'fallbackLanguage' | 'delayMinutes' | 'reminderSchoolDaysBefore' | 'reminderLocalTime' | 'quietStart' | 'quietEnd',
    label: string, type = 'text', help?: string) => {
    const error = (form.touched[name] || form.submitCount > 0) ? form.errors[name] : undefined;
    return (
      <ShakingTextField error={Boolean(error)}>
        <TextField {...form.getFieldProps(name)} type={type} label={label} required fullWidth size="small"
          error={Boolean(error)} helperText={error || help} slotProps={{ inputLabel: type === 'time' ? { shrink: true } : undefined }} />
      </ShakingTextField>
    );
  };

  return (
    <FormSectionCard title="Timing and Language" collapsible defaultExpanded={false}>
      {field('fallbackLanguage', 'Fallback language')}
      {field('delayMinutes', 'Delay in minutes', 'number')}
      {schedule === 'reminder' && <Box display="grid" gap={1} gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}>
        {field('reminderSchoolDaysBefore', 'School days before', 'number')}
        {field('reminderLocalTime', 'Reminder time', 'time')}
      </Box>}
      {schedule === 'digest' && field('reminderLocalTime', 'Daily digest time', 'time', 'Uses the school’s time zone.')}
      <FormControlLabel label="Use quiet hours" control={<Switch checked={values.quietHoursEnabled}
        onChange={(_, checked) => form.setFieldValue('quietHoursEnabled', checked)} />} />
      {values.quietHoursEnabled && <Box display="grid" gap={1} gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}>
        {field('quietStart', 'Quiet hours start', 'time')}
        {field('quietEnd', 'Quiet hours end', 'time')}
      </Box>}
      {allowsQuietHoursBypass && <FormControlLabel label="Allow this rule during quiet hours" control={
        <Switch checked={values.bypassQuietHours} onChange={(_, checked) => form.setFieldValue('bypassQuietHours', checked)} />
      } />}
    </FormSectionCard>
  );
}
