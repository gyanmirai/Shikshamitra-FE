import type { FormikErrors } from 'formik';
import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';
import type {
  AcademicNotificationCacheIdentity,
  PublishedNotificationTemplateOption,
} from 'src/redux/academic-notifications/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useSaveAcademicNotificationRuleMutation } from 'src/redux/academic-notifications/api';
import { isDailyDigest, progressMilestoneEvent } from 'src/redux/academic-notifications/response-adapters';

import { ruleCommand, ruleFormValues, ruleRecipientKinds, templateCoverageError, substitutionAcknowledgementEvent } from './notification-rule-form-model';

import type { RuleFormValues } from './notification-rule-form-model';

const validationSchema = Yup.object({
  fallbackLanguage: Yup.string().trim().lowercase().max(16).matches(
    /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/, 'Enter a language code such as en or hi.'
  ).required('Fallback language is required.'),
  delayMinutes: Yup.number().integer().min(0).max(10080).required('Enter a delay from 0 to 10080 minutes.'),
  reminderSchoolDaysBefore: Yup.number().integer().min(0).max(365).required('Enter a number from 0 to 365.'),
  reminderLocalTime: Yup.string().required('Enter a time.'),
  quietStart: Yup.string().when('quietHoursEnabled', { is: true, then: (field) => field.required('Enter the quiet-hours start time.') }),
  quietEnd: Yup.string().when('quietHoursEnabled', { is: true, then: (field) => field.required('Enter the quiet-hours end time.') }),
});

export function useNotificationRuleForm({
  row, identity, options, optionsAvailable, onSaved,
}: {
  row: AcademicNotificationRuleRow;
  identity: AcademicNotificationCacheIdentity;
  options: PublishedNotificationTemplateOption[];
  optionsAvailable: boolean;
  onSaved: () => void;
}) {
  const [save, mutation] = useSaveAcademicNotificationRuleMutation();
  const defaultStaff = row.id === substitutionAcknowledgementEvent ? ['SubstituteTeacher']
    : isDailyDigest(row.id) ? ['AssignedTeacher'] : [];
  const form = useFormik<RuleFormValues>({
    initialValues: ruleFormValues(row.item.effectiveRule, defaultStaff),
    validationSchema,
    validate: (values) => {
      const errors: FormikErrors<RuleFormValues> = {};
      const kinds = ruleRecipientKinds(values, row.event);
      if (!kinds.length) errors.staffAudienceSelectors = 'Select at least one recipient.';
      if (row.id === substitutionAcknowledgementEvent && kinds.includes('ConfiguredReviewer')) {
        if (!Number.isInteger(values.reviewerEscalationMinutes) || values.reviewerEscalationMinutes < 1 || values.reviewerEscalationMinutes > 10080) {
          errors.reviewerEscalationMinutes = 'Enter a delay from 1 to 10080 minutes.';
        }
      }
      const milestone = values.progressMilestonePercentage;
      if (row.id === progressMilestoneEvent && (values.enabled || milestone !== '') &&
        (milestone === '' || !Number.isInteger(milestone) || milestone < 1 || milestone > 100)) {
        errors.progressMilestonePercentage = 'Enter a whole percentage from 1 to 100.';
      }
      if (values.enabled && !row.event.availability.isAvailable) errors.enabled = 'This event integration is unavailable.';
      if (values.quietHoursEnabled && values.quietStart === values.quietEnd) errors.quietEnd = 'Choose a different end time.';
      if (optionsAvailable || values.enabled) {
        const issue = optionsAvailable ? templateCoverageError(values, kinds, options) : 'Load the published templates before enabling this rule.';
        if (issue) errors.templateIds = issue;
      }
      return errors;
    },
    onSubmit: async (values, { setStatus }) => {
      setStatus(undefined);
      try {
        const command = ruleCommand(values, {
          eventKey: row.id,
          scope: row.item.requestedScope,
          concurrencyStamp: row.item.isInherited ? undefined : row.item.effectiveRule?.concurrencyStamp,
        });
        await save({ ...identity, command }).unwrap();
        shikshaMitraToast.success({ message: 'Notification rule saved.' });
        onSaved();
      } catch (error) {
        const status = typeof error === 'object' && error && 'status' in error ? error.status : undefined;
        setStatus(status === 409
          ? 'This rule changed in another session. Your edits are still here.'
          : parseApiProblemDetail(error).detail || 'The notification rule could not be saved.');
      }
    },
  });
  return { form, busy: form.isSubmitting || mutation.isLoading };
}
