import type { FormikProps } from 'formik';
import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';
import type {
  AcademicNotificationChannel,
  AcademicNotificationCatalogue,
  PublishedNotificationTemplateOption,
} from 'src/redux/academic-notifications/types';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { Box, Alert, Button, Switch, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

import {
  staffRuleSelectors,
  ruleRecipientKinds,
  missingTemplateCoverage,
  substitutionAcknowledgementEvent,
} from '../notification-rule-form-model';

import type { RuleFormValues } from '../notification-rule-form-model';

interface Props {
  row: AcademicNotificationRuleRow;
  form: FormikProps<RuleFormValues>;
  templates: PublishedNotificationTemplateOption[];
  channelConfiguration: AcademicNotificationCatalogue['channels'];
  optionsAvailable: boolean;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  onOpenTemplates: () => void;
}

const guardians = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Other guardian' },
];

export function NotificationRuleFields({
  row, form, templates, channelConfiguration, optionsAvailable, isLoading, isError, retry, onOpenTemplates,
}: Props) {
  const { definition, availability, availabilityDetail } = row.event;
  const staff = staffRuleSelectors(row.event);
  const current = form.values;
  const isSubstitutionReminder = row.id === substitutionAcknowledgementEvent;
  const hasReviewerEscalation = current.staffAudienceSelectors.includes('ConfiguredReviewer');
  const showErrors = form.submitCount > 0;
  const templateError = showErrors && typeof form.errors.templateIds === 'string' ? form.errors.templateIds : undefined;
  const staffError = showErrors && typeof form.errors.staffAudienceSelectors === 'string' ? form.errors.staffAudienceSelectors : undefined;
  const reviewerDelayError = (showErrors || form.touched.reviewerEscalationMinutes) ? form.errors.reviewerEscalationMinutes : undefined;
  const templateOptions = templates.map((template) => ({
    value: template.templateId,
    label: `${template.templateName} · ${notificationLabel(template.recipientKind)} · ${notificationChannelLabels[template.channel]} · ${template.languageCode}`,
  }));
  const missingSelected = current.templateIds.filter((id) => !templateOptions.some((option) => option.value === id));
  templateOptions.push(...missingSelected.map((value, index) => ({ value, label: `Unavailable template ${index + 1}` })));
  const fallback = current.fallbackLanguage.trim().toLowerCase();
  const missingCoverage = availability.isAvailable && current.enabled && optionsAvailable && !isError && fallback
    ? missingTemplateCoverage(current, ruleRecipientKinds(current, row.event), templates)
    : [];
  const channelOptions = definition.supportedChannels
    .filter((channel) => channel !== CommunicationChannelType.InApp)
    .map((channel) => {
      const configured = channelConfiguration.find((entry) => entry.channel === channel)?.isConfigured;
      return {
        value: channel,
        label: notificationChannelLabels[channel],
        setup: configured === undefined ? 'Setup status unavailable' : configured ? 'Configured' : 'Setup required',
        configured,
      };
    });
  const selectedChannels = channelOptions.filter(({ value }) => current.channels.includes(value));
  const needsSetup = selectedChannels.filter(({ configured }) => configured === false).map(({ label }) => label);
  const unknownSetup = selectedChannels.filter(({ configured }) => configured === undefined).map(({ label }) => label);

  return (
    <>
      <FormSectionCard title="Rule Status">
        {row.item.isInherited && <Typography variant="body2">Submitting creates a rule for the selected scope.</Typography>}
        <FormControlLabel label="Enabled" control={
          <Switch checked={current.enabled} onChange={(_, enabled) => form.setFieldValue('enabled', enabled)}
            disabled={!availability.isAvailable && !current.enabled} />
        } />
        {!availability.isAvailable && (
          <Alert severity="info">{availabilityDetail ?? 'This event integration is unavailable.'}</Alert>
        )}
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
        {isSubstitutionReminder && <Typography variant="body2">The assigned substitute receives the reminder.</Typography>}
        {isSubstitutionReminder && staff.includes('ConfiguredReviewer') && <>
          <FormControlLabel label="Notify the configured reviewer" control={
            <Checkbox checked={hasReviewerEscalation} onChange={(_, enabled) => form.setFieldValue(
              'staffAudienceSelectors', enabled ? ['SubstituteTeacher', 'ConfiguredReviewer'] : ['SubstituteTeacher']
            )} />
          } />
          {hasReviewerEscalation && <ShakingTextField error={Boolean(reviewerDelayError)}>
            <TextField {...form.getFieldProps('reviewerEscalationMinutes')} type="number" label="Escalate after (minutes)"
              required fullWidth size="small" error={Boolean(reviewerDelayError)} helperText={reviewerDelayError ||
                'Starts when the substitute reminder is sent. Stops when the substitute responds or the duty ends.'}
              slotProps={{ htmlInput: { min: 1, max: 10080, step: 1 } }} />
          </ShakingTextField>}
        </>}
        {!isSubstitutionReminder && !!staff.length && <ShakingTextField error={Boolean(staffError)}>
          <CustomSelect multiple label="Other recipients" size="small" value={current.staffAudienceSelectors}
            options={staff.map((value) => ({ value, label: notificationLabel(value) }))}
            error={Boolean(staffError)} helperText={staffError} onChange={(values) => form.setFieldValue('staffAudienceSelectors', values)} />
        </ShakingTextField>}
      </FormSectionCard>
      <FormSectionCard title="Channels and Templates" action={availability.isAvailable && (
        <Button type="button" size="small" variant="text" onClick={onOpenTemplates}>Open templates</Button>
      )}>
        <Typography variant="body2">In-app is included with every rule.</Typography>
        <CustomSelect multiple label="Additional channels" size="small"
          options={channelOptions} optionEndLabelKey="setup"
          value={current.channels.filter((channel) => channel !== CommunicationChannelType.InApp)}
          onChange={(channels) => form.setFieldValue('channels', [CommunicationChannelType.InApp, ...channels as AcademicNotificationChannel[]])} />
        {(needsSetup.length > 0 || unknownSetup.length > 0) && (
          <Alert severity="warning" role="status">
            {needsSetup.length > 0 && <div>School setup required for {needsSetup.join(', ')}.</div>}
            {unknownSetup.length > 0 && <div>Setup status is unavailable for {unknownSetup.join(', ')}.</div>}
          </Alert>
        )}
        {current.channels.includes(CommunicationChannelType.WhatsApp) && (
          <Typography variant="body2" color="text.secondary">
            WhatsApp delivery requires provider approval for the selected template version and language.
          </Typography>
        )}
        {isError && <Alert severity="error" action={<Button size="small" onClick={retry}>Retry</Button>}>
          Published templates could not be loaded.
        </Alert>}
        <ShakingTextField error={Boolean(templateError)}>
          <CustomSelect multiple isSearch isLoading={isLoading} label="Published templates" size="small" required={current.enabled}
            options={templateOptions} value={current.templateIds} error={Boolean(templateError)} helperText={templateError}
            onChange={(ids) => form.setFieldValue('templateIds', ids)} noOptionsMessage="No published templates for this event" />
        </ShakingTextField>
        {missingCoverage.length > 0 && (
          <Alert severity="info" role="status">
            Select a published template in {fallback} for each recipient and channel listed below.
            <Box component="ul" aria-label="Missing published templates" sx={{ m: 0, mt: 0.5, pl: 2 }}>
              {missingCoverage.map(({ recipientKind, channels }) => (
                <li key={recipientKind}>
                  {notificationLabel(recipientKind)} · {channels.map((channel) => notificationChannelLabels[channel]).join(', ')}
                </li>
              ))}
            </Box>
          </Alert>
        )}
      </FormSectionCard>
    </>
  );
}
