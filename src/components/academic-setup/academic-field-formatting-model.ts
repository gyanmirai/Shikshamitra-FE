import type { AcademicFieldFormatting } from 'src/redux/InstituteSetup/academic-field-formatting-types';

import { AcademicTextCase } from 'src/redux/InstituteSetup/academic-field-formatting-types';

export { AcademicTextCase } from 'src/redux/InstituteSetup/academic-field-formatting-types';
export type { AcademicFieldFormatting } from 'src/redux/InstituteSetup/academic-field-formatting-types';

export const DEFAULT_ACADEMIC_FIELD_FORMATTING: AcademicFieldFormatting = {
  board: AcademicTextCase.Default,
  medium: AcademicTextCase.Default,
  stage: AcademicTextCase.Default,
  standard: AcademicTextCase.Default,
  division: AcademicTextCase.Default,
};

export const ACADEMIC_CASE_OPTIONS = [
  { value: AcademicTextCase.Default, label: 'Default' },
  { value: AcademicTextCase.Capitalize, label: 'Capitalize each word' },
  { value: AcademicTextCase.CamelCase, label: 'camelCase' },
  { value: AcademicTextCase.PascalCase, label: 'PascalCase' },
  { value: AcademicTextCase.Uppercase, label: 'Uppercase' },
] as const;

type AcademicFormatField = {
  key: keyof AcademicFieldFormatting;
  label: string;
  example: string;
  fixedDisabled?: boolean;
  explanation?: string;
};

export const ACADEMIC_FORMAT_FIELDS: readonly AcademicFormatField[] = [
  {
    key: 'board',
    label: 'Board name',
    example: 'CBSE',
    fixedDisabled: true,
    explanation: 'Official board codes such as CBSE and GSEB keep their standard format.',
  },
  { key: 'medium', label: 'Medium name', example: 'english medium' },
  { key: 'stage', label: 'Stage name', example: 'secondary stage' },
  { key: 'standard', label: 'Standard name', example: 'standard one' },
  { key: 'division', label: 'Division name', example: 'division a' },
];

export function formatAcademicName(value: string, mode: AcademicTextCase): string {
  if (mode === AcademicTextCase.Default) return value;
  if (mode === AcademicTextCase.Uppercase) return value.toUpperCase();
  const words = (value.match(/\S+/gu) ?? []).map((word) => word.toLowerCase());
  const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
  if (mode === AcademicTextCase.Capitalize) return words.map(capitalize).join(' ');
  if (mode === AcademicTextCase.PascalCase) return words.map(capitalize).join('');
  if (mode === AcademicTextCase.CamelCase)
    return words.map((word, index) => (index ? capitalize(word) : word)).join('');
  return value;
}

export function requiresAcademicNamePreview(value: string, mode: AcademicTextCase): boolean {
  return mode !== AcademicTextCase.Default && /\P{ASCII}/u.test(value);
}
