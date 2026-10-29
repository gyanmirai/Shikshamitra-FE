import { it, vi, expect, describe } from 'vitest';

import {
  loadPayrollComponentOptions,
  PAYROLL_COMPONENT_OPTIONS_PAGE_SIZE,
} from './payroll-component-options';

const controller = () => new AbortController();
const records = (kind: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${kind}-${index + 1}`,
    [`${kind}ComponentName`]: `${kind} ${index + 1}`,
    selectedEarningComponentId: index === 0 ? `${kind}-${count}` : null,
  }));
const paged = (rows: ReturnType<typeof records>) =>
  vi.fn(async (request: any) => ({
    data: {
      items: rows.slice(
        (request.params.page - 1) * request.params.pageSize,
        request.params.page * request.params.pageSize
      ),
      totalCount: rows.length,
    },
  }));

describe('complete payroll component dependency metadata', () => {
  it.each(['earning', 'deduction'] as const)(
    'loads every %s page and preserves dependency graph metadata',
    async (kind) => {
      const rows = records(kind, 205);
      const fetchPage = paged(rows);
      const result = await loadPayrollComponentOptions(
        kind,
        { academicYearId: 'year' },
        fetchPage,
        controller().signal
      );
      expect(result).toEqual({ data: { items: rows, totalCount: 205 } });
      expect(fetchPage).toHaveBeenCalledTimes(3);
      expect(fetchPage.mock.calls.map(([request]) => request.params)).toEqual([
        { page: 1, pageSize: PAYROLL_COMPONENT_OPTIONS_PAGE_SIZE, academicYearId: 'year' },
        { page: 2, pageSize: PAYROLL_COMPONENT_OPTIONS_PAGE_SIZE, academicYearId: 'year' },
        { page: 3, pageSize: PAYROLL_COMPONENT_OPTIONS_PAGE_SIZE, academicYearId: 'year' },
      ]);
      expect(
        fetchPage.mock.calls.every(([request]) => request.url === `/payroll/${kind}-components`)
      ).toBe(true);
    }
  );

  it('loads an empty catalogue once without fabricating options', async () => {
    const fetchPage = paged([]);
    expect(
      await loadPayrollComponentOptions('earning', undefined, fetchPage, controller().signal)
    ).toEqual({ data: { items: [], totalCount: 0 } });
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it('preserves a later page authorization error and never returns partial choices', async () => {
    const denied = { status: 403 as const, data: { detail: 'Access required' } };
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: { items: records('earning', 100), totalCount: 101 } })
      .mockResolvedValueOnce({ error: denied });
    expect(
      await loadPayrollComponentOptions('earning', undefined, fetchPage, controller().signal)
    ).toEqual({ error: denied });
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('rejects a repeated page instead of looping or silently deduplicating a partial graph', async () => {
    const rows = records('earning', 100);
    const fetchPage = vi.fn().mockResolvedValue({ data: { items: rows, totalCount: 200 } });
    expect(
      await loadPayrollComponentOptions('earning', undefined, fetchPage, controller().signal)
    ).toMatchObject({ error: { status: 'CUSTOM_ERROR' } });
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it.each([
    { items: [], totalCount: 5 },
    { items: records('earning', 1), totalCount: 2 },
    { items: records('earning', 1), totalCount: 0 },
    { items: [], totalCount: -1 },
    { items: [], totalCount: 1.5 },
    { items: [], totalCount: Number.NaN },
    { items: [] },
    { items: [{ id: '' }], totalCount: 1 },
    { items: [{ id: 'same' }, { id: 'same' }], totalCount: 2 },
  ])('rejects incomplete or malformed page %#', async (data) => {
    const fetchPage = vi.fn().mockResolvedValue({ data });
    const result = await loadPayrollComponentOptions(
      'earning',
      undefined,
      fetchPage,
      controller().signal
    );
    expect(result).toMatchObject({ error: { status: 'CUSTOM_ERROR' } });
    expect(result).not.toHaveProperty('data');
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it('rejects a changing total count across pages', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: { items: records('earning', 100), totalCount: 101 } })
      .mockResolvedValueOnce({ data: { items: [{ id: 'earning-101' }], totalCount: 102 } });
    expect(
      await loadPayrollComponentOptions('earning', undefined, fetchPage, controller().signal)
    ).toMatchObject({ error: { status: 'CUSTOM_ERROR' } });
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('makes no request after an abort', async () => {
    const abort = controller();
    abort.abort();
    const fetchPage = paged(records('earning', 100));
    expect(
      await loadPayrollComponentOptions('earning', undefined, fetchPage, abort.signal)
    ).toMatchObject({ error: { status: 'CUSTOM_ERROR' } });
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it('stops between pages when the requesting query is aborted', async () => {
    const abort = controller();
    const fetchPage = vi.fn(async () => {
      abort.abort();
      return { data: { items: records('earning', 100), totalCount: 101 } };
    });
    expect(
      await loadPayrollComponentOptions('earning', undefined, fetchPage, abort.signal)
    ).toMatchObject({ error: { status: 'CUSTOM_ERROR' } });
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it('returns a safe request error if the fetcher rejects', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error('Internal network detail'));
    const result = await loadPayrollComponentOptions(
      'earning',
      undefined,
      fetchPage,
      controller().signal
    );
    expect(result).toMatchObject({ error: { status: 'FETCH_ERROR' } });
    expect(JSON.stringify(result)).not.toContain('Internal network detail');
  });
});
