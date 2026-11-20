import type { FormikProps } from 'formik';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Switch, TextField, FormControlLabel } from '@mui/material';

import type { RuleFormValues } from '../notification-rule-form-model';

interface Props {
  form: FormikProps<RuleFormValues>;
  schedule?: 'reminder' | 'digest' | 'weekly';
  configuresMilestone: boolean;
  allowsQuietHoursBypass: boolean;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  .map((label, value) => ({ label, value }));

export function NotificationRuleTiming({ form, schedule, configuresMilestone, allowsQuietHoursBypass }: Props) {
  const { values } = form;
  const milestoneError = form.touched.progressMilestonePercentage || form.submitCount > 0
    ? form.errors.progressMilestonePercentage
    : undefined;
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
      {schedule === 'weekly' && (
        <Box display="grid" gap={2} gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}>
          <ShakingTextField error={Boolean(form.errors.weeklySummaryDay && form.submitCount)}>
            <CustomSelect name="weeklySummaryDay" label="Day of the week" size="small" required fullWidth
              options={daysOfWeek} value={values.weeklySummaryDay}
              onChange={(value) => { if (typeof value === 'number') form.setFieldValue('weeklySummaryDay', value); }}
              error={Boolean(form.errors.weeklySummaryDay && form.submitCount)}
              helperText={form.submitCount ? form.errors.weeklySummaryDay : undefined} />
          </ShakingTextField>
          {field('reminderLocalTime', 'Weekly summary time', 'time', 'Uses the school’s time zone.')}
        </Box>
      )}
      {configuresMilestone && <ShakingTextField error={Boolean(milestoneError)}>
        <TextField {...form.getFieldProps('progressMilestonePercentage')} type="number" label="Milestone percentage"
          required={values.enabled} fullWidth size="small" error={Boolean(milestoneError)}
          helperText={milestoneError || 'Each chapter qualifies the first time saved progress reaches this percentage.'}
          slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }} />
      </ShakingTextField>}
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
