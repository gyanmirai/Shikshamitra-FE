import { parseFieldConfiguration } from '../form-dialog/form-field-presets';

import type { AdmissionPrintDefinition } from './form-print-model';

type Field = AdmissionPrintDefinition['sections'][number]['fields'][number];

function sampleChoice(field: Field): string | string[] | undefined {
  try {
    const options: unknown = JSON.parse(field.optionsJson ?? 'null');
    if (!Array.isArray(options)) return undefined;
    const choices = options.flatMap((option: unknown) => {
      if (typeof option === 'string') return [option];
      if (!option || typeof option !== 'object' || !('value' in option)) return [];
      return typeof option.value === 'string' || typeof option.value === 'number'
        ? [String(option.value)]
        : [];
    });
    return field.fieldType === 7 ? choices.slice(0, 2) : choices[0];
  } catch {
    return undefined;
  }
}

function sampleAnswer(field: Field) {
  const { format } = parseFieldConfiguration(field.validationJson);
  if (format === 'photo') return undefined;
  const binding = field.bindingKey?.toLowerCase();
  if (binding === 'applicant.firstname') return 'Sample';
  if (binding === 'applicant.lastname') return 'Student';
  if (binding === 'guardian.firstname') return 'Sample Parent';
  if (field.fieldType === 3 || format === 'email') return 'parent@example.test';
  if (field.fieldType === 4 || format === 'phone') return '9000000000';
  if (field.fieldType === 5) return '2018-06-15';
  if (field.fieldType === 2) return '42';
  if (field.fieldType === 9) return true;
  if ([6, 7, 8].includes(field.fieldType)) return sampleChoice(field);
  if ([10, 12].includes(field.fieldType)) return undefined;
  if (format === 'aadhaar' || format === 'pan') return undefined;
  if (format === 'pincode') return '395001';
  if (field.fieldType === 11 || binding?.includes('address')) return '10 Example Street';
  return 'Example answer';
}

/** Builder-only examples. Never use a saved applicant or run dependent catalogue queries. */
export function getAdmissionPrintSampleAnswers(sections: AdmissionPrintDefinition['sections']) {
  const values: Record<string, string> = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      const answer = sampleAnswer(field);
      if (answer !== undefined) {
        values[field.code] = JSON.stringify(section.isRepeatable ? [answer] : answer);
      }
    });
  });
  return values;
}
