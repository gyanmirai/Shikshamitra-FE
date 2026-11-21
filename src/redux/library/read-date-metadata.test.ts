import { it, expect } from 'vitest';

import {
  mapLibraryReportPreviewDto,
  mapLibraryDashboardOverviewDto,
  buildLibraryReportRequestPayload,
} from './library-adapters';

it('retains dashboard school-day and incomplete overdue evidence without replacing real zeros', () => {
  const dto = {
    schoolAsOfDate: '2026-11-18',
    schoolDateSource: 'ConfirmedLibraryClock',
    unknownIssueDateCount: 1,
    unknownReturnDateCount: 2,
    circulation: {
      issuesToday: 0,
      overdueIssues: 1,
      overdueClassificationAvailable: false,
      unknownDueDateCount: 1,
      overdueAsOfDate: '2026-11-18',
      overdueDateSource: 'ConfirmedLibraryClock',
      overdueUnavailableReason: 'One due date needs review.',
    },
  };
  expect(mapLibraryDashboardOverviewDto(dto)).toMatchObject(dto);
});

it('retains report as-of source, unknown counts, and unavailable reasons', () => {
  const dto = {
    schoolAsOfDate: null,
    schoolDateSource: 'Unavailable',
    schoolDateUnavailableReason: 'Confirm the Library timezone.',
    unknownIssueDateCount: 1,
    unknownReturnDateCount: 0,
    overdueClassificationAvailable: false,
    unknownDueDateCount: 2,
    overdueAsOfDate: null,
    overdueDateSource: 'Unavailable',
    overdueUnavailableReason: 'Two due dates need review.',
  };
  expect(mapLibraryReportPreviewDto(dto)).toMatchObject(dto);
});

it('does not turn an older response without date evidence into complete classification', () => {
  expect(mapLibraryDashboardOverviewDto({}).circulation).not.toMatchObject({
    overdueClassificationAvailable: true,
  });
  expect(mapLibraryReportPreviewDto({})).not.toMatchObject({
    overdueClassificationAvailable: true,
  });
});

it('preserves an explicit civil as-of date in report requests', () => {
  const payload = buildLibraryReportRequestPayload({
    reportType: 'Overdue Books Report',
    academicYearId: 'year-id',
    asOfDate: '2026-11-18',
  });
  expect(payload.filters).toMatchObject({ asOfDate: '2026-11-18' });
});
