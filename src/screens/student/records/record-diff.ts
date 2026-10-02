import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

import { GenderType } from 'src/enums/gender';
import { fDate } from 'src/utils/format-time';
import { Category } from 'src/enums/studnet-category';

export const recordFieldLabel = (field: string) =>
  ({
    standardId: 'Class',
    divisionId: 'Division',
    academicYearId: 'Academic year',
    academicMediumId: 'Medium',
    rollNumber: 'Roll number',
    siblingStudentIds: 'Linked siblings',
    photoDraftId: 'Student photo',
  })[field] ?? field.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());

export function recordDiffValue(
  field: string,
  value: unknown,
  options?: StudentDirectoryOptions,
  siblingNames: Record<string, string> = {}
): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (field === 'photoDraftId') return 'Uploaded student photo';
  if (field === 'siblingStudentIds' && Array.isArray(value))
    return value.length
      ? value.map((id) => siblingNames[String(id)] || 'Linked sibling').join(', ')
      : 'No linked siblings';
  if (Array.isArray(value))
    return value.length
      ? value.map((item) => recordDiffValue(field, item, options, siblingNames)).join(', ')
      : 'None';
  if (typeof value === 'object')
    return (
      Object.entries(value)
        .filter(([, nested]) => nested != null && nested !== '')
        .map(
          ([key, nested]) =>
            `${recordFieldLabel(key)}: ${recordDiffValue(key, nested, options, siblingNames)}`
        )
        .join('; ') || '—'
    );
  if (field === 'gender' && typeof value === 'number') return GenderType[value] ?? 'Unspecified';
  if (field === 'category' && typeof value === 'number') return Category[value] ?? 'Unspecified';
  if (field === 'status' && typeof value === 'number')
    return { 6: 'Active', 7: 'Inactive', 8: 'Left' }[value] ?? 'Unspecified';
  if (/dateOfBirth|Date$/.test(field) && typeof value === 'string') return fDate(value) ?? '—';
  const choices =
    field === 'standardId'
      ? options?.standards
      : field === 'divisionId'
        ? options?.divisions
        : field === 'academicYearId'
          ? options?.academicYears
          : field === 'academicMediumId'
            ? options?.mediums
            : undefined;
  if (['standardId', 'divisionId', 'academicYearId', 'academicMediumId'].includes(field))
    return (
      choices?.find((item) => item.id === value)?.name ??
      `${recordFieldLabel(field)} details unavailable`
    );
  if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value))
    return 'Saved record reference';
  return String(value);
}
