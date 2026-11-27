import {
  parseApiProblemDetail,
  isApiProblemCodeMessage,
  isGenericApiProblemMessage,
} from 'src/utils/api-problem-details';

import { inquiryFormConfigurationMessages } from '../admission-inquiry-field-bindings';
import {
  addressOrderMessage,
  addressMissingMessage,
  addressDependencyErrorCodes,
} from '../form-dialog/form-address-dependencies';

const VERSION_UNCHANGED = 'Admissions.FormVersionUnchanged';
export const FORM_RESTORE_INVALID_DEFINITION = 'Admissions.FormRestoreInvalidDefinition';
const VERSION_UNCHANGED_MESSAGE =
  'This draft matches the latest published version. Make a change before publishing, or keep using the published version.';

export class UnchangedAdmissionFormError extends Error {}

export function getUnchangedVersionMessage(errors: string[]) {
  const error = errors.find((issue) => issue.startsWith(`${VERSION_UNCHANGED}:`));
  if (!error) return null;
  const version = error.slice(VERSION_UNCHANGED.length + 1);
  return /^[1-9]\d*$/.test(version)
    ? `This draft matches published v${version}. Make a change before publishing, or keep using v${version}.`
    : VERSION_UNCHANGED_MESSAGE;
}

export function getUnchangedVersionPublishError(error: unknown) {
  if (error instanceof UnchangedAdmissionFormError) return error;
  const problem = parseApiProblemDetail(error);
  return problem.errorCode === VERSION_UNCHANGED
    ? new UnchangedAdmissionFormError(
        problem.detail.startsWith('This draft matches') ? problem.detail : VERSION_UNCHANGED_MESSAGE
      )
    : null;
}

const VALIDATION_MESSAGES: Record<string, string> = {
  'Admissions.FormNoSections': 'Add at least one section.',
  'Admissions.FormDuplicateSectionCode': 'Each section needs a unique code.',
  'Admissions.FormInvalidSectionCode': 'Use a valid code for every section.',
  'Admissions.FormStepperRequiresTwoSteps':
    'Add a second step or change the form layout to Single page before publishing.',
  'Admissions.FormInvalidStepCode': 'Use a valid code for every step.',
  'Admissions.FormDuplicateStepCode': 'Each step needs a unique code.',
  'Admissions.FormNoFields': 'Add at least one field.',
  'Admissions.FormDuplicateFieldCode': 'Each field needs a unique code.',
  'Admissions.FormInvalidFieldCode': 'Use a valid code for every field.',
  'Admissions.FormDependencyCycle':
    'Conditional field rules cannot depend on each other in a loop.',
};

const FIELD_MESSAGES: Record<string, string> = {
  UnsupportedRuntimeField: 'is not available for applicant use yet',
  'Admissions.FormInvalidFieldType': 'uses an unsupported field type',
  'Admissions.FormInvalidSystemBinding': 'has an invalid student-field connection',
  'Admissions.FormInvalidRuleReference': 'refers to a field that does not exist',
  'Admissions.FormInvalidOptions': 'needs valid choices',
  'Admissions.FormInvalidBinding': 'needs a valid data connection',
  'Admissions.FormDuplicateSystemBinding': 'duplicates a student field already in the form',
  'Admissions.FormInvalidValidationRule': 'has an invalid validation rule',
};

export function formatAdmissionFormValidationError(error: string, ownerLabel?: string) {
  const unchangedVersionMessage = getUnchangedVersionMessage([error]);
  if (unchangedVersionMessage) return unchangedVersionMessage;
  if (Object.values(inquiryFormConfigurationMessages).some((message) => message === error))
    return error;
  const [code, owner] = error.split(':', 2);
  if (code === addressDependencyErrorCodes.state) return addressMissingMessage('state', ownerLabel || 'State');
  if (code === addressDependencyErrorCodes.city) return addressMissingMessage('city', ownerLabel || 'City');
  if (code === addressDependencyErrorCodes.order) return ownerLabel
    ? `${addressOrderMessage} Check the position of ${ownerLabel}.`
    : addressOrderMessage;
  if (owner && FIELD_MESSAGES[code]) return `${ownerLabel || owner} ${FIELD_MESSAGES[code]}.`;
  return VALIDATION_MESSAGES[error] ?? 'Review the form settings before publishing.';
}

export function formatAdmissionFormValidationErrors(errors: string[]) {
  return summarizeAdmissionFormIssues(errors.map((error) => formatAdmissionFormValidationError(error)));
}

export function summarizeAdmissionFormIssues(issues: string[]) {
  const messages = [...new Set(issues)];
  const visible = messages.slice(0, 3);
  return `${visible.join(' ')}${messages.length > visible.length ? ` ${messages.length - visible.length} more issue(s) need review.` : ''}`;
}

type RestoreErrorData = { Errors?: unknown };
type ProblemBody = { data?: RestoreErrorData; error?: { data?: RestoreErrorData } };

export function admissionFormActionErrorMessage(
  failure: unknown,
  fallback: string,
  problem = parseApiProblemDetail(failure)
) {
  if (problem.errorCode === FORM_RESTORE_INVALID_DEFINITION) {
    const response = failure as (ProblemBody & {
      data?: ProblemBody & RestoreErrorData;
      response?: { data?: ProblemBody };
    }) | null;
    const body = response?.response?.data ?? response?.data ?? response;
    const errors = body?.data?.Errors ?? body?.error?.data?.Errors ?? response?.data?.Errors;
    const issues = (typeof errors === 'string' ? errors.split(';') : [])
      .map((issue) => issue.trim())
      .filter(Boolean)
      .map((issue) =>
        formatAdmissionFormValidationError(
          issue,
          issue.endsWith(':APPLICANT_GENDER') ? 'Student gender' : undefined
        )
      );
    return [
      'This form cannot be restored.',
      summarizeAdmissionFormIssues(issues),
      'Create a new form with these issues corrected, then publish it.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return !problem.detail ||
    problem.detail === problem.errorCode ||
    isGenericApiProblemMessage(problem.detail) ||
    isApiProblemCodeMessage(problem.detail) ||
    /^(?:bad request|validation failed|request failed|conflict|resource not found)\.?$/i.test(problem.detail)
    ? fallback
    : problem.detail;
}
