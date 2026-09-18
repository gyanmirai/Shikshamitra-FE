import type {
  AdmissionForm,
  AdmissionFormField,
} from 'src/redux/student/admissions/admission-forms-api';

export const FORM_SIMULATOR_PERSONAS = [
  { value: 'blank', label: 'Blank applicant' },
  { value: 'valid', label: 'Valid applicant' },
  { value: 'underage', label: 'Underage applicant' },
  { value: 'missing-guardian', label: 'Missing guardian contact' },
  { value: 'transfer', label: 'Transfer applicant' },
  { value: 'sibling', label: 'Sibling applicant' },
] as const;

export type FormSimulatorPersona = (typeof FORM_SIMULATOR_PERSONAS)[number]['value'];

function firstOption(field: AdmissionFormField) {
  try {
    const parsed = JSON.parse(field.optionsJson ?? '') as unknown;
    if (!Array.isArray(parsed) || !parsed.length) return '';
    const option = parsed[0];
    return typeof option === 'string'
      ? option
      : String((option as { value?: unknown }).value ?? '');
  } catch {
    return '';
  }
}

function sampleDate(yearsAgo: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return date.toISOString();
}

function sampleValue(field: AdmissionFormField) {
  const identity = `${field.code} ${field.bindingKey ?? ''}`.toLowerCase();
  if (identity.includes('first') && identity.includes('name')) return 'Aarav';
  if (identity.includes('middle') && identity.includes('name')) return 'Raj';
  if (identity.includes('last') && identity.includes('name')) return 'Patel';
  if (identity.includes('full') && identity.includes('name')) return 'Aarav Raj Patel';
  if (identity.includes('email')) return 'parent@example.com';
  if (identity.includes('phone') || identity.includes('mobile')) return '+919876543210';
  if (identity.includes('gender')) return firstOption(field) || 'Male';
  if (identity.includes('birth') || identity.includes('dob')) return sampleDate(10);
  if (identity.includes('guardian') || identity.includes('father') || identity.includes('mother'))
    return 'Raj Patel';
  if (identity.includes('previous') && identity.includes('school')) return 'Sunrise School';
  if (identity.includes('sibling')) return 'Diya Patel';
  if (identity.includes('nationality')) return firstOption(field) || 'Indian';
  if (identity.includes('category')) return firstOption(field) || 'General';
  if (identity.includes('language')) return firstOption(field) || 'English';

  switch (field.fieldType) {
    case 1:
      return 'Sample applicant information';
    case 2:
      return '1';
    case 3:
      return 'parent@example.com';
    case 4:
      return '+919876543210';
    case 5:
      return sampleDate(10);
    case 6:
    case 8:
      return firstOption(field);
    case 7: {
      const value = firstOption(field);
      return value ? JSON.stringify([value]) : '';
    }
    case 9:
      return 'true';
    case 11:
      return JSON.stringify({
        addressLine1: '12 School Road',
        addressLine2: '',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        postalCode: '380001',
      });
    case 12:
      return field.defaultValue ?? '';
    default:
      return field.defaultValue ?? 'Sample answer';
  }
}

export function buildAdmissionFormPersonaValues(
  form: AdmissionForm,
  persona: FormSimulatorPersona
) {
  const fields = form.sections.flatMap((section) => section.fields);
  if (persona === 'blank')
    return Object.fromEntries(fields.map((field) => [field.code, field.defaultValue ?? '']));

  const values = Object.fromEntries(fields.map((field) => [field.code, sampleValue(field)]));
  fields.forEach((field) => {
    const identity = `${field.code} ${field.bindingKey ?? ''}`.toLowerCase();
    if (persona === 'underage' && (identity.includes('birth') || identity.includes('dob')))
      values[field.code] = sampleDate(3);
    if (
      persona === 'missing-guardian' &&
      (identity.includes('guardian') ||
        identity.includes('father') ||
        identity.includes('mother') ||
        identity.includes('parent'))
    )
      values[field.code] = '';
    if (persona === 'transfer' && (identity.includes('transfer') || identity.includes('previous')))
      values[field.code] = field.fieldType === 9 ? 'true' : sampleValue(field);
    if (persona === 'sibling' && identity.includes('sibling'))
      values[field.code] = sampleValue(field);
  });
  return values;
}
