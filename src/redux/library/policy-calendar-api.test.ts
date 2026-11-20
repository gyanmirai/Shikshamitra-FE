import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { libraryPoliciesApi } from './policies-api';
import { libraryCalendarApi } from './calendar-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

describe('policy and calendar authenticated wire contracts', () => {
  it('requests scope options through the policy permission and selected academic year', async () => {
    expect(libraryPoliciesApi.endpoints).toHaveProperty('getLibraryPolicyOptions');
    mswServer.use(
      http.get('http://library.test/api/library/policies/options', ({ request }) => {
        expect(new URL(request.url).searchParams.get('academicYearId')).toBe('year-id');
        return HttpResponse.json({
          canManageGlobalPolicies: false,
          standards: [
            {
              id: 'class-id',
              name: 'Class 8',
              parentId: 'stage-id',
              parentName: 'Middle / English / CBSE',
            },
          ],
        });
      })
    );
    const result = await makeStore()
      .dispatch(
        libraryPoliciesApi.endpoints.getLibraryPolicyOptions.initiate({ academicYearId: 'year-id' })
      )
      .unwrap();
    expect(result.canManageGlobalPolicies).toBe(false);
    expect(result.standards[0].parentName).toBe('Middle / English / CBSE');
  });

  it('preserves server calendar readiness rather than treating an HR fallback as confirmed', async () => {
    expect(libraryCalendarApi.endpoints).toHaveProperty('getLibraryCalendarSettings');
    mswServer.use(
      http.get('http://library.test/api/library/calendar/settings', ({ request }) => {
        expect(new URL(request.url).searchParams.get('academicYearId')).toBe('year-id');
        return HttpResponse.json({
          timeZoneId: 'Asia/Kolkata',
          source: 'LegacyHr',
          needsConfiguration: true,
          hasValidOpenWeekday: true,
          canPublishAutomatedPolicy: false,
          canManageCalendar: false,
          configurationIssues: ['Confirm the Library timezone.'],
        });
      })
    );
    const result = await makeStore()
      .dispatch(
        libraryCalendarApi.endpoints.getLibraryCalendarSettings.initiate({
          academicYearId: 'year-id',
        })
      )
      .unwrap();
    expect(result.source).toBe('LegacyHr');
    expect(result.canPublishAutomatedPolicy).toBe(false);
    expect(result.canManageCalendar).toBe(false);
  });
});
