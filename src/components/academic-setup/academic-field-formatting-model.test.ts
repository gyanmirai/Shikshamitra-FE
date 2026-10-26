import { it, expect, describe } from 'vitest';

import {
  AcademicTextCase,
  formatAcademicName,
  ACADEMIC_CASE_OPTIONS,
  ACADEMIC_FORMAT_FIELDS,
  requiresAcademicNamePreview,
  DEFAULT_ACADEMIC_FIELD_FORMATTING,
} from './academic-field-formatting-model';

describe('academic field formatting', () => {
  it('starts every academic field with Default and keeps official board codes fixed', () => {
    expect(DEFAULT_ACADEMIC_FIELD_FORMATTING).toEqual({
      board: 0,
      medium: 0,
      stage: 0,
      standard: 0,
      division: 0,
    });
    expect(ACADEMIC_FORMAT_FIELDS.map((field) => field.key)).toEqual([
      'board',
      'medium',
      'stage',
      'standard',
      'division',
    ]);
    expect(ACADEMIC_FORMAT_FIELDS[0]).toMatchObject({ fixedDisabled: true });
    expect(ACADEMIC_CASE_OPTIONS.map((option) => option.value)).toEqual([0, 1, 2, 3, 4]);
  });

  it('keeps typed case, spaces, and acronyms exactly for Default', () => {
    expect(formatAcademicName('  mIxEd\tCBSE  ', AcademicTextCase.Default)).toBe('  mIxEd\tCBSE  ');
  });

  it('uppercases ASCII letters without changing spaces or punctuation', () => {
    expect(formatAcademicName('  secondary\tstage 2-a  ', AcademicTextCase.Uppercase)).toBe(
      '  SECONDARY\tSTAGE 2-A  '
    );
    expect(requiresAcademicNamePreview('école', AcademicTextCase.Uppercase)).toBe(true);
  });

  it.each([
    [AcademicTextCase.Capitalize, 'Secondary Stage'],
    [AcademicTextCase.CamelCase, 'secondaryStage'],
    [AcademicTextCase.PascalCase, 'SecondaryStage'],
  ])('previews mode %s with normalized words', (mode, expected) => {
    expect(formatAcademicName('  SECONDARY\tstage  ', mode)).toBe(expected);
  });

  it('supports empty and multilingual names without stripping letters or punctuation', () => {
    expect(formatAcademicName('  ', AcademicTextCase.CamelCase)).toBe('');
    expect(formatAcademicName('ÉCOLE தமிழ் 2-A', AcademicTextCase.Capitalize)).toBe(
      'École தமிழ் 2-a'
    );
  });

  it('requires authoritative previews only for non-ASCII transformed names', () => {
    expect(requiresAcademicNamePreview('secondary stage', AcademicTextCase.CamelCase)).toBe(false);
    expect(requiresAcademicNamePreview('İSTANBUL', AcademicTextCase.Default)).toBe(false);
    expect(requiresAcademicNamePreview('İSTANBUL', AcademicTextCase.CamelCase)).toBe(true);
    expect(requiresAcademicNamePreview('ΟΣ', AcademicTextCase.CamelCase)).toBe(true);
    expect(requiresAcademicNamePreview('ßeta', AcademicTextCase.PascalCase)).toBe(true);
  });
});
