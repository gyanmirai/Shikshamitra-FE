import type { PropsWithChildren } from 'react';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import * as XLSX from 'xlsx';
import { createElement } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useLessonWorkspaceExport } from './use-lesson-workspace-export';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const createWrapper = () => {
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer },
    middleware: defaults => defaults().concat(api.middleware) });
  return ({ children }: PropsWithChildren) => createElement(Provider, { store, children });
};
const scope = { academicYearId: 'year-one', teacherId: 'teacher-one', view: 'reviewQueue', status: 1,
  uiCriteria: '{"selectedClass":"Ten-A"}', searchColumns: ['topic', 'teacherName'] };
const request: TableExportRequest = { format: 'excel', columns: [{ id: 'id', label: 'ID' }, { id: 'status', label: 'Review status' }],
  searchTerm: 'filtered lesson', filters: [{ column: 'subjectName', type: 'equals', value: 'Math', valueType: 'enum' }],
  sorts: [{ column: 'submittedDate', direction: 'desc' }] };
let downloads: Blob[];

beforeEach(() => {
  downloads = [];
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  vi.spyOn(URL, 'createObjectURL').mockImplementation(blob => { downloads.push(blob as Blob); return 'blob:lesson-export'; });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

it('downloads every matching review row through bounded real RTK queries', async () => {
  const requests: URL[] = [];
  mswServer.use(http.get('*/api/academic/curriculum/lesson-plans/workspace', ({ request: incoming }) => {
    const url = new URL(incoming.url);
    requests.push(url);
    const start = Number(url.searchParams.get('skipCount'));
    const length = Math.min(250, 503 - start);
    return HttpResponse.json({ totalCount: 503, diaries: [], summary: {}, items: Array.from({ length }, (_, offset) => ({
      id: `plan-${start + offset}`, status: 1, topic: 'filtered lesson', teacherName: 'Teacher', standardName: 'Ten', divisionName: 'A',
    })) });
  }));
  const { result } = renderHook(() => useLessonWorkspaceExport(scope), { wrapper: createWrapper() });
  await act(async () => result.current(request));
  expect(requests.map(url => url.searchParams.get('skipCount'))).toEqual(['0', '250', '500']);
  expect(requests.every(url => url.searchParams.get('maxResultCount') === '250')).toBe(true);
  expect(requests.every(url => url.searchParams.get('searchTerm') === request.searchTerm)).toBe(true);
  expect(requests.every(url => url.searchParams.get('filters') === JSON.stringify(request.filters))).toBe(true);
  expect(requests.every(url => url.searchParams.get('sorts') === JSON.stringify(request.sorts))).toBe(true);
  expect(requests.every(url => url.searchParams.get('uiCriteria') === scope.uiCriteria)).toBe(true);
  expect(requests.every(url => url.searchParams.get('status') === '1')).toBe(true);
  expect(requests.every(url => url.searchParams.getAll('searchColumns').join(',') === 'topic,teacherName')).toBe(true);
  expect(requests.every(url => url.searchParams.get('academicMediumId') === null)).toBe(true);
  expect(downloads).toHaveLength(1);
  const workbook = XLSX.read(await downloads[0].arrayBuffer(), { type: 'array' });
  const rows = XLSX.utils.sheet_to_json<{ ID: string; 'Review status': string }>(workbook.Sheets.Data);
  expect(rows).toHaveLength(503);
  expect(rows[0]).toEqual({ ID: 'plan-0', 'Review status': 'pending' });
  expect(rows.at(-1)).toEqual({ ID: 'plan-502', 'Review status': 'pending' });
});

it('aborts the active page request and never creates a partial download', async () => {
  let activeSignal: AbortSignal | undefined;
  let reads = 0;
  mswServer.use(http.get('*/api/academic/curriculum/lesson-plans/workspace', async ({ request: incoming }) => {
    reads += 1;
    activeSignal = incoming.signal;
    await new Promise<void>(resolve => incoming.signal.addEventListener('abort', () => resolve(), { once: true }));
    return HttpResponse.json({ totalCount: 1000, items: [], diaries: [], summary: {} });
  }));
  const controller = new AbortController();
  const { result } = renderHook(() => useLessonWorkspaceExport(scope), { wrapper: createWrapper() });
  const outcome = result.current({ ...request, signal: controller.signal }).then(() => null, error => error);
  await waitFor(() => expect(reads).toBe(1));
  act(() => controller.abort());
  expect(await outcome).toMatchObject({ name: 'AbortError' });
  expect(activeSignal?.aborted).toBe(true);
  expect(reads).toBe(1);
  expect(downloads).toEqual([]);
});

it('rejects a later page failure without downloading the successful prefix', async () => {
  const requests: number[] = [];
  mswServer.use(http.get('*/api/academic/curriculum/lesson-plans/workspace', ({ request: incoming }) => {
    const start = Number(new URL(incoming.url).searchParams.get('skipCount'));
    requests.push(start);
    return start === 0
      ? HttpResponse.json({ totalCount: 2, items: [{ id: 'plan-one', status: 1 }], diaries: [], summary: {} })
      : HttpResponse.json({ error: { message: 'Page unavailable' } }, { status: 503 });
  }));
  const { result } = renderHook(() => useLessonWorkspaceExport(scope), { wrapper: createWrapper() });
  await expect(result.current(request)).rejects.toMatchObject({ status: 503 });
  expect(requests).toEqual([0, 1]);
  expect(downloads).toEqual([]);
});
