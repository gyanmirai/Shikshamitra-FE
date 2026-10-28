// @vitest-environment jsdom

import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { vi, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { act, waitFor, renderHook } from '@testing-library/react';
import { exportTable } from 'src/components/customizabaleTable/table-export';

import { useRubricTemplateList } from './useRubricTemplateList';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4198'));
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: vi.fn().mockResolvedValue(undefined) }));

it('loads a summary page without downloading linked rubrics or criteria', async () => {
  let legacyReads = 0;
  const requests: URL[] = [];
  const row = (index: number) => ({
    id: `template-${index}`, title: `Rubric ${index}`, isTemplate: true,
    status: 1, scoringModel: 0, totalMarks: 10, criteriaCount: 50, usageCount: 35,
    version: 1, visibility: 3,
  });
  mswServer.use(
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get('http://localhost:4198/api/academic/rubrics', () => {
      legacyReads += 1;
      return HttpResponse.json(Array.from({ length: 70 }, (_, index) => ({ ...row(index), criteria: [] })));
    }),
    http.get('http://localhost:4198/api/academic/rubrics/templates/paged', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json({
        items: [row(0), row(1)], totalCount: 70, page: 1, pageSize: 10,
        summary: { total: 70, published: 60, draft: 8, archived: 2, linked: 350 },
      });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, globalState: () => ({ currentMedium: { id: 'medium' } }) },
    middleware: getDefault => getDefault().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(useRubricTemplateList, { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.tableData).toHaveLength(2);
  expect(legacyReads).toBe(0);
  expect(requests).toHaveLength(1);
  expect(requests[0].searchParams.get('academicMediumId')).toBe('medium');
  expect(requests[0].searchParams.get('pageSize')).toBe('10');
  expect(result.current.tableData[0].usageCount).toBe(35);
  expect(result.current.counts.total).toBe(70);
  expect(result.current.counts.linked).toBe(350);
  act(() => result.current.tableProps.onServerPagination?.(3, 10));
  await waitFor(() => expect(requests.at(-1)?.searchParams.get('page')).toBe('3'));
  act(() => result.current.tableProps.onServerSearch?.('older rubric'));
  await waitFor(() => expect(requests.at(-1)?.searchParams.get('search')).toBe('older rubric'));
  expect(requests.at(-1)?.searchParams.get('page')).toBe('1');
});

it('exports every filtered summary page through real RTK requests', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get('http://localhost:4198/api/academic/rubrics/templates/paged', ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('search') === 'published') requests.push(url);
      const index = Number(url.searchParams.get('page')) - 1;
      const items = (index === 0 ? ['one', 'two'] : ['three']).map(id => ({
        id, title: id, criteriaCount: 30, usageCount: 2, status: 1, scoringModel: 0, visibility: 3, totalMarks: 10, version: 1,
      }));
      return HttpResponse.json({ items, totalCount: 3, page: index + 1, pageSize: 100,
        summary: { total: 3, published: 3, draft: 0, archived: 0, linked: 6 } });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, globalState: () => ({ currentMedium: { id: 'medium' } }) },
    middleware: getDefault => getDefault().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(useRubricTemplateList, { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  const filters = [{ column: 'status', type: 'equals', value: 1, valueType: 'enum' }];
  await act(async () => result.current.tableProps.onExport?.({ format: 'excel', columns: [{ id: 'title', label: 'Rubric' }],
    searchTerm: 'published', filters, sorts: [{ column: 'title', direction: 'desc' }] }));
  expect(requests).toHaveLength(2);
  expect(requests.every(url => url.searchParams.get('filters') === JSON.stringify(filters))).toBe(true);
  expect(requests.every(url => url.searchParams.get('sorts') === '[{"column":"title","direction":"desc"}]')).toBe(true);
  expect(vi.mocked(exportTable).mock.calls.at(-1)?.[0].rows.map(row => row.id)).toEqual(['one', 'two', 'three']);
  expect(vi.mocked(exportTable).mock.calls.at(-1)?.[0].rows.every(row => row.criteriaCount === 30)).toBe(true);
});
