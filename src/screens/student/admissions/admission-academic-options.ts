import { parseRuntimeOptionsSource } from './application-detail/application-runtime-options';

type AcademicField = { code: string; fieldType: number; optionsJson?: string | null };

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
