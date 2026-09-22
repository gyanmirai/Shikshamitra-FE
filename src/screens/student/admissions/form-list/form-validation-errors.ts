const VALIDATION_MESSAGES: Record<string, string> = {
  'Admissions.FormNoSections': 'Add at least one section.',
  'Admissions.FormDuplicateSectionCode': 'Each section needs a unique code.',
  'Admissions.FormInvalidSectionCode': 'Use a valid code for every section.',
  'Admissions.FormStepperRequiresTwoSteps': 'A step-by-step form needs at least two steps.',
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

export function formatAdmissionFormValidationError(error: string) {
  const [code, owner] = error.split(':', 2);
  if (owner && FIELD_MESSAGES[code]) return `${owner} ${FIELD_MESSAGES[code]}.`;
  return VALIDATION_MESSAGES[error] ?? 'Review the form settings before publishing.';
}

export function formatAdmissionFormValidationErrors(errors: string[]) {
  const messages = errors.map(formatAdmissionFormValidationError);
  const visible = messages.slice(0, 3);
  return `${visible.join(' ')}${messages.length > visible.length ? ` ${messages.length - visible.length} more issue(s) need review.` : ''}`;
}
