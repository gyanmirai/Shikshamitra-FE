import * as Yup from 'yup';

import { readStageConfiguration } from './admission-assessment-policy';
import { readAdmissionInquiryPolicy } from './admission-inquiry-policy';

import type { AdmissionInquiryPolicy } from './admission-inquiry-policy';

const criterionSchema = Yup.object({
  code: Yup.string()
    .required()
    .max(64)
    .matches(/^[A-Z][A-Z0-9_]*$/),
  name: Yup.string().trim().required().max(128),
  required: Yup.boolean().required(),
});

export function getInquiryConfigurationError(json?: string): string | undefined {
  if (json && json.length > 8000)
    return 'Shorten the stage settings to fit within 8,000 characters.';
  const configuration = readStageConfiguration(json);
  if (!configuration) return 'The stage settings are not valid JSON. Reopen the stage.';
  if (configuration.inquiry === undefined) return undefined;
  const policy = readAdmissionInquiryPolicy(json);
  if (!policy)
    return 'These Inquiry settings are unsupported or incomplete. Their saved values have been preserved.';
  if (!policy.enabled) return undefined;
  return validateManaged(policy);
}

function validateManaged(policy: AdmissionInquiryPolicy): string | undefined {
  if (policy.assignmentMode === 1 && !policy.counsellorPoolUserIds.length)
    return 'Choose at least one counsellor for round-robin assignment.';
  if (
    new Set(policy.counsellorPoolUserIds).size !== policy.counsellorPoolUserIds.length ||
    policy.counsellorPoolUserIds.length > 50
  )
    return 'Choose up to 50 unique counsellors.';
  if (!validOptionalRange(policy.firstContactDueInHours, 1, 720))
    return 'Set first contact time between 1 and 720 hours.';
  if (!validOptionalRange(policy.qualificationDueInDays, 1, 365))
    return 'Set qualification time between 1 and 365 days.';
  if (!validRange(policy.followUpDueInDays, 1, 90) || !validRange(policy.maxOpenFollowUps, 1, 20))
    return 'Use 1 to 90 days and allow 1 to 20 open follow-ups.';
  if (
    new Set(policy.allowedSources).size !== policy.allowedSources.length ||
    new Set(policy.requireSourceDetailFor).size !== policy.requireSourceDetailFor.length
  )
    return 'Choose each inquiry source once.';
  if (
    policy.allowedSources.length &&
    policy.requireSourceDetailFor.some((source) => !policy.allowedSources.includes(source))
  )
    return 'Source details can only be required for an allowed source.';
  if (
    policy.qualificationChecklist.length > 30 ||
    policy.qualificationChecklist.some((item) => !criterionSchema.isValidSync(item))
  )
    return 'Add up to 30 checklist items with unique uppercase codes and clear names.';
  if (
    new Set(policy.qualificationChecklist.map((item) => item.code.toUpperCase())).size !==
    policy.qualificationChecklist.length
  )
    return 'Use a unique code for each qualification item.';
  return undefined;
}

const validRange = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max;
const validOptionalRange = (value: number | null, min: number, max: number) =>
  value === null || validRange(value, min, max);
