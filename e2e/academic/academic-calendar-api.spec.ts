/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from '@playwright/test';

import { academicApiRequest, resolveAcademicContext } from './academic-api';

const emptyGuid = '00000000-0000-0000-0000-000000000000';

function attachCases(...ids: string[]) {
  test.info().annotations.push({ type: 'case', description: ids.join(', ') });
}

async function expectJsonResponse(response: Awaited<ReturnType<typeof academicApiRequest>>) {
  expect(response.ok(), `${response.url()} ${response.status()}`).toBe(true);
  return response.json();
}

test.describe(
  'Academic Calendar API contract checks',
  { tag: ['@module-academic', '@submodule-academic-calendar', '@api', '@critical'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('AC-CAL-001..004 calendar list, dashboard, emergency closures, and audit summaries return safe contracts', async ({
      page,
    }) => {
      attachCases('AC-CAL-001', 'AC-CAL-002', 'AC-CAL-003', 'AC-CAL-004');

      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;

      const calendars = await expectJsonResponse(
        await academicApiRequest(page, `/academic/calendars?academicMediumId=${academicMediumId}`)
      );
      expect(Array.isArray(calendars.items), 'calendar list should use ABP paged shape').toBe(true);

      const dashboard = await expectJsonResponse(
        await academicApiRequest(
          page,
          `/academic/calendar/dashboard?academicMediumId=${academicMediumId}`
        )
      );
      expect(dashboard.academicMediumId).toBeTruthy();
      expect(typeof dashboard.totalWorkingDays).toBe('number');
      expect(typeof dashboard.pendingImpactLogsCount).toBe('number');
      expect(Array.isArray(dashboard.upcomingDays)).toBe(true);

      const emergencyClosures = await expectJsonResponse(
        await academicApiRequest(
          page,
          `/academic/calendar-emergency-closures?academicMediumId=${academicMediumId}&skipCount=0&maxResultCount=5`
        )
      );
      expect(Array.isArray(emergencyClosures.items)).toBe(true);

      const auditSummary = await expectJsonResponse(
        await academicApiRequest(page, '/academic/calendar-audit-logs/summary')
      );
      expect(typeof auditSummary.totalAuditEvents).toBe('number');
      expect(typeof auditSummary.criticalChanges).toBe('number');
    });

    test('AC-CAL-015 date validation rejects malformed requests without server errors', async ({
      page,
    }) => {
      attachCases('AC-CAL-015');

      const response = await academicApiRequest(
        page,
        '/academic/calendar/check-date?date=not-a-date&validationType=ExamSchedule'
      );

      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });

    test('AC-CAL-016 missing calendar id returns a controlled client or not-found response', async ({
      page,
    }) => {
      attachCases('AC-CAL-016');

      const response = await academicApiRequest(page, `/academic/calendars/${emptyGuid}`);

      expect([400, 404]).toContain(response.status());
    });
  }
);
