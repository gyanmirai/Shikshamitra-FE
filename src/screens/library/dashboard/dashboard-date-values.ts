import type { LibrarySchoolDateEvidence } from 'src/redux/library/read-date-types';
import type { LibraryOverdueClassification } from 'src/redux/library/member-statistics-types';
import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { fNumber } from 'src/utils/format-number';

import { loanAsOfDate } from '../circulation/loan-read-query';

export const hasSchoolDay = (value?: LibrarySchoolDateEvidence) =>
  Boolean(loanAsOfDate(value?.schoolAsOfDate)) &&
  (value?.schoolDateSource === 'ConfirmedLibraryClock' ||
    value?.schoolDateSource === 'ExplicitSchoolDate');
export const hasOverdueDay = (value?: LibraryOverdueClassification) =>
  Boolean(loanAsOfDate(value?.overdueAsOfDate)) &&
  (value?.overdueDateSource === 'ConfirmedLibraryClock' ||
    value?.overdueDateSource === 'ExplicitSchoolDate');
export const completeOverdue = (value?: LibraryOverdueClassification) =>
  hasOverdueDay(value) &&
  value?.overdueClassificationAvailable === true &&
  value.unknownDueDateCount === 0;

export function overdueValue(count: number, evidence?: LibraryOverdueClassification) {
  if (completeOverdue(evidence)) return fNumber(count);
  return hasOverdueDay(evidence) && evidence?.overdueClassificationAvailable === false
    ? `${fNumber(count)} confirmed`
    : 'Not classified';
}
export function movementValue(
  overview: LibraryDashboardOverview | undefined,
  period: 'today' | 'week'
) {
  if (!hasSchoolDay(overview)) return 'Not classified';
  const value =
    period === 'today'
      ? (overview?.circulation.issuesToday || 0) + (overview?.circulation.returnsToday || 0)
      : (overview?.circulation.issuesThisWeek || 0) + (overview?.circulation.returnsThisWeek || 0);
  const complete = overview?.unknownIssueDateCount === 0 && overview?.unknownReturnDateCount === 0;
  return `${fNumber(value)}${complete ? '' : ' confirmed'}`;
}
