export enum AcademicTextCase {
  Default = 0,
  Capitalize = 1,
  CamelCase = 2,
  PascalCase = 3,
  Uppercase = 4,
}

export type AcademicFieldFormatting = {
  board: AcademicTextCase;
  medium: AcademicTextCase;
  stage: AcademicTextCase;
  standard: AcademicTextCase;
  division: AcademicTextCase;
};

export type AcademicNamePreviewInput = { value: string; textCase: AcademicTextCase };
export type AcademicNamePreview = { value: string };
