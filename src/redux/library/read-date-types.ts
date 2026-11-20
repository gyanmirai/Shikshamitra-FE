import type { LibraryOverdueClassification } from './member-statistics-types';

type DateSource = 'ConfirmedLibraryClock' | 'ExplicitSchoolDate' | 'Unavailable';
export type LibrarySchoolDateEvidence = {
  schoolAsOfDate?: string | null;
  schoolDateSource?: DateSource;
  schoolDateUnavailableReason?: string | null;
  unknownIssueDateCount?: number;
  unknownReturnDateCount?: number;
};
const nullableString = (value: unknown) =>
  typeof value === 'string' || value === null ? value : undefined;
const count = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined;
const source = (value: unknown): DateSource | undefined =>
  value === 'ConfirmedLibraryClock' || value === 'ExplicitSchoolDate' || value === 'Unavailable'
    ? value
    : undefined;

export function mapSchoolDateEvidence(dto: Record<string, unknown>): LibrarySchoolDateEvidence {
  return {
    schoolAsOfDate: nullableString(dto.schoolAsOfDate),
    schoolDateSource: source(dto.schoolDateSource),
    schoolDateUnavailableReason: nullableString(dto.schoolDateUnavailableReason),
    unknownIssueDateCount: count(dto.unknownIssueDateCount),
    unknownReturnDateCount: count(dto.unknownReturnDateCount),
  };
}
export function mapOverdueEvidence(dto: Record<string, unknown>): LibraryOverdueClassification {
  return {
    overdueClassificationAvailable:
      typeof dto.overdueClassificationAvailable === 'boolean'
        ? dto.overdueClassificationAvailable
        : undefined,
    unknownDueDateCount: count(dto.unknownDueDateCount),
    overdueAsOfDate: nullableString(dto.overdueAsOfDate),
    overdueDateSource: source(dto.overdueDateSource),
    overdueUnavailableReason: nullableString(dto.overdueUnavailableReason),
  };
}
