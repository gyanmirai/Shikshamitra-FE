import type { FormikProps } from 'formik';
import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';
import type { AcademicNotificationChannel, PublishedNotificationTemplateOption } from 'src/redux/academic-notifications/types';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { Alert, Button, Switch, Checkbox, Typography, FormControlLabel } from '@mui/material';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

import { staffRuleSelectors } from '../notification-rule-form-model';

import type { RuleFormValues } from '../notification-rule-form-model';

interface Props {
  row: AcademicNotificationRuleRow;
  form: FormikProps<RuleFormValues>;
  templates: PublishedNotificationTemplateOption[];
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

const guardians = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Other guardian' },
];

export function NotificationRuleFields({ row, form, templates, isLoading, isError, retry }: Props) {
  const { definition, availability } = row.event;
  const staff = staffRuleSelectors(row.event);
  const current = form.values;
  const showErrors = form.submitCount > 0;
  const templateError = showErrors && typeof form.errors.templateIds === 'string' ? form.errors.templateIds : undefined;
  const staffError = showErrors && typeof form.errors.staffAudienceSelectors === 'string' ? form.errors.staffAudienceSelectors : undefined;
  const templateOptions = templates.map((template) => ({
    value: template.templateId,
    label: `${template.templateName} · ${notificationLabel(template.recipientKind)} · ${notificationChannelLabels[template.channel]} · ${template.languageCode}`,
  }));
  const missingSelected = current.templateIds.filter((id) => !templateOptions.some((option) => option.value === id));
  templateOptions.push(...missingSelected.map((value, index) => ({ value, label: `Unavailable template ${index + 1}` })));

  return (
    <>
      <FormSectionCard title="Rule Status">
        {row.item.isInherited && <Typography variant="body2">Submitting creates a rule for the selected scope.</Typography>}
        <FormControlLabel label="Enabled" control={
          <Switch checked={current.enabled} onChange={(_, enabled) => form.setFieldValue('enabled', enabled)}
            disabled={!availability.isAvailable && !current.enabled} />
        } />
        {!availability.isAvailable && <Alert severity="info">This event integration is unavailable.</Alert>}
        {showErrors && form.errors.enabled && <Alert severity="warning">{form.errors.enabled}</Alert>}
      </FormSectionCard>
      <FormSectionCard title="Recipients">
        {definition.recipientSelectors.includes('PrimaryGuardian') && <Typography variant="body2">Primary guardian is included.</Typography>}
        {definition.recipientSelectors.includes('AdditionalGuardians') && (
          <CustomSelect multiple label="Additional guardians" size="small" options={guardians}
            value={current.additionalGuardianRelationships} onChange={(values) => form.setFieldValue('additionalGuardianRelationships', values)} />
        )}
        {definition.recipientSelectors.includes('StudentAccount') && <FormControlLabel label="Include student account" control={
          <Checkbox checked={current.includeStudentAccount} onChange={(_, checked) => form.setFieldValue('includeStudentAccount', checked)} />
        } />}
        {!!staff.length && <ShakingTextField error={Boolean(staffError)}>
          <CustomSelect multiple label="Other recipients" size="small" value={current.staffAudienceSelectors}
            options={staff.map((value) => ({ value, label: notificationLabel(value) }))}
            error={Boolean(staffError)} helperText={staffError} onChange={(values) => form.setFieldValue('staffAudienceSelectors', values)} />
        </ShakingTextField>}
      </FormSectionCard>
      <FormSectionCard title="Channels and Templates">
        <Typography variant="body2">In-app is included with every rule.</Typography>
        <CustomSelect multiple label="Additional channels" size="small"
          options={definition.supportedChannels.filter((channel) => channel !== CommunicationChannelType.InApp)
            .map((channel) => ({ value: channel, label: notificationChannelLabels[channel] }))}
          value={current.channels.filter((channel) => channel !== CommunicationChannelType.InApp)}
          onChange={(channels) => form.setFieldValue('channels', [CommunicationChannelType.InApp, ...channels as AcademicNotificationChannel[]])} />
        {isError && <Alert severity="error" action={<Button size="small" onClick={retry}>Retry</Button>}>
          Published templates could not be loaded.
        </Alert>}
        <ShakingTextField error={Boolean(templateError)}>
          <CustomSelect multiple isSearch isLoading={isLoading} label="Published templates" size="small" required={current.enabled}
            options={templateOptions} value={current.templateIds} error={Boolean(templateError)} helperText={templateError}
            onChange={(ids) => form.setFieldValue('templateIds', ids)} noOptionsMessage="No published templates for this event" />
        </ShakingTextField>
      </FormSectionCard>
    </>
  );
}
