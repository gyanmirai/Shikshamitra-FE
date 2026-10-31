import type { AdmissionFormOption } from 'src/redux/student/admissions/admission-forms-api';

import { parseRuntimeOptionsSource } from './application-detail/application-runtime-options';

type AcademicField = { code: string; fieldType: number; optionsJson?: string | null };

export function hasBoardClassOptions(field: AcademicField) {
  if (field.fieldType !== 6) return false;
  const source = parseRuntimeOptionsSource(academicOptionsJson(field));
  if (source) return source.source === 'Standards';
  return readBoardClassOptions(field.optionsJson).length > 0;
}

export function readBoardClassOptions(optionsJson?: string | null): AdmissionFormOption[] {
  try {
    const options: unknown = JSON.parse(optionsJson || '[]');
    return Array.isArray(options) && options.some((option) => typeof option?.boardId === 'string')
      ? options
          .filter(
            (option) => typeof option?.value === 'string' && typeof option?.label === 'string'
          )
          .map((option, index) => ({
            ...option,
            displayOrder: option.displayOrder ?? index,
            isActive: option.isActive !== false,
          }))
      : [];
  } catch {
    return [];
  }
}

/** Saved template definitions remain immutable; current choices use Institute Setup. */
export function academicOptionsJson(field: AcademicField): string | null | undefined {
  if (![6, 7, 8].includes(field.fieldType) || parseRuntimeOptionsSource(field.optionsJson))
    return field.optionsJson;
  switch (field.code.toUpperCase()) {
    case 'CLASS_INTERESTED':
    case 'CLASS_APPLYING_FOR':
      return JSON.stringify({ source: 'Standards' });
    case 'CLASS':
      return JSON.stringify({ source: 'StandardsByMedium', parentField: 'MEDIUM' });
    case 'DIVISION':
      return JSON.stringify({ source: 'DivisionsByStandard', parentField: 'CLASS' });
    default:
      return field.optionsJson;
  }
}

export function isInstituteAcademicSource(optionsJson?: string | null) {
  const source = parseRuntimeOptionsSource(optionsJson)?.source;
  return [
    'Standards',
    'StandardsByMedium',
    'StandardsByMediumStage',
    'DivisionsByStandard',
  ].includes(source ?? '');
}
