import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import {
  financePosition,
  dashboardFinancePayload,
} from 'src/screens/library/dashboard/dashboard-finance-data.fixture';

import { libraryDashboardApi } from './dashboard-api';
import { mapLibraryDashboardOverviewDto } from './library-adapters';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('keeps owning overview transport and exact Finance strings under the explicitly selected year', async () => {
  const years: (string | null)[] = [];
  const unrelated: string[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/dashboard/overview', ({ request }) => {
      years.push(new URL(request.url).searchParams.get('academicYearId'));
      return HttpResponse.json(dashboardFinancePayload);
    }),
    http.all('http://library.test/api/finance/*', ({ request }) => {
      unrelated.push(request.url);
      return HttpResponse.json(
        { detail: 'Finance grants are deliberately absent.' },
        { status: 403 }
      );
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const read = store.dispatch(
    libraryDashboardApi.endpoints.getLibraryDashboardOverview.initiate({
      academicYearId: 'recorded-year',
    })
  );
  try {
    const result = await read.unwrap();
    expect((result as Record<string, unknown>).financePosition).toEqual(financePosition);
    expect(years).toEqual(['recorded-year']);
    expect(unrelated).toEqual([]);
  } finally {
    read.unsubscribe();
  }
});

it('marks a missing additive summary unavailable while preserving local declaration compatibility', () => {
  const { financePosition: omitted, ...legacy } = dashboardFinancePayload;
  const mapped = mapLibraryDashboardOverviewDto(legacy) as Record<string, unknown>;
  expect(mapped.financePosition).toBeNull();
  expect(mapped.charges).toMatchObject({ paidCount: 3, paidAmount: 999 });
});
