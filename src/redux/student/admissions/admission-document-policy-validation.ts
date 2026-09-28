import * as Yup from 'yup';

import { readStageConfiguration } from './admission-assessment-policy';
import { getAdmissionConditionError } from './admission-condition-rule';
import { DOCUMENT_FORMATS, readAdmissionDocumentPolicy } from './admission-document-policy';

// ABP sequential GUIDs do not always contain an RFC UUID version nibble.
const documentReferenceId = (message: string) =>
  Yup.string()
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, message)
    .notOneOf(['00000000-0000-0000-0000-000000000000'], message);

export const documentRequirementSchema = Yup.object({
  code: Yup.string()
    .required('Document code is required')
    .max(64, 'Use at most 64 characters for the document code')
    .matches(
      /^[A-Z][A-Z0-9_]*$/,
      'Use uppercase letters, numbers, and underscores for the document code'
    ),
  name: Yup.string()
    .trim()
    .required('Document name is required')
    .max(128, 'Use at most 128 characters for the document name'),
  description: Yup.string()
    .nullable()
    .max(1024, 'Use at most 1,024 characters for the instructions'),
  requirement: Yup.string().oneOf(['required', 'optional', 'conditional']).required(),
  collectionMode: Yup.string().oneOf(['upload', 'original', 'either', 'both']).required(),
  maxFileSizeMb: Yup.number()
    .integer('File size must be a whole number')
    .min(1, 'File size must be at least 1 MB')
    .max(20, 'File size cannot exceed 20 MB')
    .required(),
  allowedExtensions: Yup.array()
    .of(Yup.string().oneOf(DOCUMENT_FORMATS, 'Choose PDF, JPG, JPEG, or PNG'))
    .min(1, 'Choose at least one file format')
    .required(),
  documentTypeId: documentReferenceId('Choose a valid student document type').nullable(),
  standardIds: Yup.array()
    .nullable()
    .of(documentReferenceId('Choose a valid class').required())
    .min(1, 'Select at least one class, or choose all classes')
    .max(100, 'Select at most 100 classes')
    .test(
      'unique-classes',
      'Select each class only once',
      (ids) => !ids || new Set(ids.map((id) => id?.toLowerCase())).size === ids.length
    ),
  conditionJson: Yup.string()
    .nullable()
    .when('requirement', {
      is: 'conditional',
      then: (schema) =>
        schema.test('condition', function check(value) {
          const error = getAdmissionConditionError(value);
          return error ? this.createError({ message: error }) : true;
        }),
      otherwise: (schema) =>
        schema.test(
          'no-condition',
          'Remove the condition or choose a conditional requirement',
          (value) => !value?.trim()
        ),
    }),
});

export function getDocumentConfigurationError(json?: string): string | undefined {
  if (json && json.length > 8000)
    return 'Shorten the stage settings to fit within 8,000 characters.';
  const configuration = readStageConfiguration(json);
  if (!configuration)
    return 'The stage settings could not be read. Reopen the stage before saving.';
  if (configuration.documentVerification === undefined) return undefined;
  const policy = readAdmissionDocumentPolicy(json);
  if (!policy) return 'These document settings are unsupported or incomplete. Reload the workflow.';
  if (!policy.enabled) return undefined;
  if (
    policy.collectionFormStageCode != null &&
    !/^[A-Z][A-Z0-9_]{0,63}$/.test(policy.collectionFormStageCode)
  )
    return 'Choose a valid Form stage for early document collection.';
  if (!policy.requirements.length || policy.requirements.length > 30)
    return 'Add between 1 and 30 document requirements.';
  if (new Set(policy.requirements.map((item) => item.code)).size !== policy.requirements.length) {
    return 'Each document must have a unique code.';
  }
  return policy.requirements
    .map((item, index) => {
      try {
        documentRequirementSchema.validateSync(item);
        return undefined;
      } catch (error) {
        if (error instanceof Yup.ValidationError) return `Document ${index + 1}: ${error.message}`;
        throw error;
      }
    })
    .find(Boolean);
}
