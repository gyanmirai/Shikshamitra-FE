import * as Yup from 'yup';

import { readStageConfiguration } from './admission-assessment-policy';
import { readAdmissionEligibilityPolicy } from './admission-eligibility-policy';
import { getEligibilityCriterionError } from './admission-eligibility-criterion-validation';

import type { AdmissionEligibilityCriterion } from './admission-eligibility-policy';

export const eligibilityCriterionSchema = Yup.mixed<AdmissionEligibilityCriterion>()
  .required()
  .test('criterion', 'Configure this eligibility criterion', function validate(value) {
    const error = getEligibilityCriterionError(value);
    return error ? this.createError({ path: 'kind', message: error }) : true;
  });

export function getEligibilityConfigurationError(json?: string): string | undefined {
  if (json && json.length > 8000) return 'Shorten the stage settings to fit within 8,000 characters.';
  const configuration = readStageConfiguration(json);
  if (!configuration) return 'The stage settings are not valid JSON. Reopen the stage.';
  if (configuration.eligibility === undefined) return undefined;
  const policy = readAdmissionEligibilityPolicy(json);
  if (!policy)
    return 'These eligibility settings are unsupported or incomplete. Their saved values have been preserved.';
  if (!policy.enabled) return undefined;
  if (!policy.criteria.length || policy.criteria.length > 30)
    return 'Add between 1 and 30 eligibility criteria.';
  if ((policy.exceptionApprovalRole?.length ?? 0) > 256) return 'Choose a valid reviewer role.';
  const error = policy.criteria
    .map((criterion) => {
      const message = getEligibilityCriterionError(criterion);
      return message ? `${criterion.name || 'Criterion'}: ${message}` : undefined;
    })
    .find(Boolean);
  if (error) return error;
  const codes = new Set(policy.criteria.map((criterion) => criterion.code.toUpperCase()));
  if (codes.size !== policy.criteria.length)
    return 'Use a unique code for each eligibility criterion.';
  return undefined;
}
