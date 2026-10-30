import * as Yup from 'yup';

// Unicode letters and combining marks keep names in Indian and other languages intact.
const financeNamePattern = /^[\p{L}\p{M}\p{N}\s]+$/u;

export const sanitizeFinanceName = (value: string): string =>
  value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');

// Validate the original value so saved/edit data cannot bypass input filtering.
// Required, length and uniqueness rules remain the owning form's responsibility.
export const financeNameSchema = (label: string) =>
  Yup.string().matches(financeNamePattern, {
    message: `${label} can only contain letters, numbers, and spaces`,
    excludeEmptyString: true,
  });

const paymentNameFields = new Set([
  'bankName',
  'branchName',
  'payeeName',
  'accountHolderName',
  'cardHolderName',
  'receivedBy',
]);

export const isFinancePaymentNameField = (name: string): boolean => paymentNameFields.has(name);

export const financePaymentNameSchema = (field: {
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
}) => {
  const minLength = field.name === 'receivedBy' ? 1 : 3;
  let schema = financeNameSchema(field.label)
    .max(
      field.maxLength ?? 100,
      `${field.label} cannot exceed ${field.maxLength ?? 100} characters`
    )
    .test(
      'name-length',
      `${field.label} must be at least ${minLength} characters`,
      (value) => !value || value.trim().length >= minLength
    );
  if (field.required) schema = schema.required(`${field.label} is required`);
  return schema;
};
