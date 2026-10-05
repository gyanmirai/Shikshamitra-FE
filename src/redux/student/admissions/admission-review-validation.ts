import * as Yup from 'yup';

import { readAdmissionReviewPolicy } from './admission-review-policy';
import { readStageConfiguration } from './admission-assessment-policy';

export const reviewChecklistItemSchema = Yup.object({
  code: Yup.string()
    .required('Enter a checklist code')
    .max(64)
    .matches(/^[A-Z][A-Z0-9_]*$/, 'Use uppercase letters, numbers, and underscores'),
  name: Yup.string().trim().required('Enter a checklist item name').max(128),
  required: Yup.boolean().required(),
});

export function getReviewConfigurationError(json?: string): string | undefined {
  if (json && json.length > 8000)
    return 'Shorten the stage settings to fit within 8,000 characters.';
  const configuration = readStageConfiguration(json);
  if (!configuration) return 'The stage settings are not valid JSON. Reopen the stage.';
  if (configuration.review === undefined) return undefined;
  const policy = readAdmissionReviewPolicy(json);
  if (!policy)
    return 'These review settings are unsupported or incomplete. Their saved values have been preserved.';
  if (!policy.enabled) return undefined;
  if (
    [policy.reviewerRole, policy.approverRole].some(
      (role) => role != null && (!role.trim() || role.length > 256)
    )
  )
    return 'Choose a valid reviewer or approver role.';
  if (
    policy.assignedReviewerId != null &&
    (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      policy.assignedReviewerId
    ) ||
      policy.assignedReviewerId === '00000000-0000-0000-0000-000000000000')
  )
    return 'Choose a valid assigned reviewer.';
  if (
    policy.dueInDays != null &&
    (!Number.isInteger(policy.dueInDays) || policy.dueInDays < 1 || policy.dueInDays > 365)
  )
    return 'Set the review due date between 1 and 365 days after entering the stage.';
  if (policy.prerequisites.length > 20) return 'Choose at most 20 evidence prerequisites.';
  if (policy.prerequisites.some((item) => !/^[A-Z][A-Z0-9_-]{0,63}$/.test(item.sourceStageCode)))
    return 'Choose a valid earlier stage for each evidence prerequisite.';
  if (
    new Set(policy.prerequisites.map((item) => item.sourceStageCode)).size !==
    policy.prerequisites.length
  )
    return 'Choose each evidence prerequisite only once.';
  if (policy.checklist.length > 30) return 'Add at most 30 review checklist items.';
  if (policy.checklist.some((item) => !reviewChecklistItemSchema.isValidSync(item)))
    return 'Give every checklist item a valid code and a name of at most 128 characters.';
  if (new Set(policy.checklist.map((item) => item.code)).size !== policy.checklist.length)
    return 'Use a unique code for each checklist item.';
  return undefined;
}
