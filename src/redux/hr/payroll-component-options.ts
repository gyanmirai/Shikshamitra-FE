import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type PayrollComponentOption = {
  id: string;
  earningComponentName?: string;
  deductionComponentName?: string;
  componentName?: string;
  selectedEarningComponentId?: string | null;
  customComponentId?: string | null;
  [field: string]: unknown;
};

export type PayrollComponentOptions = { items: PayrollComponentOption[]; totalCount: number };
export type PayrollComponentOptionsArgs = { academicYearId?: string } | void;
type ComponentPageResult = { data?: unknown; error?: FetchBaseQueryError };
type ComponentPageFetcher = (
  request: FetchArgs
) => ComponentPageResult | PromiseLike<ComponentPageResult>;

// This is a batch size, not a catalogue limit. Dependency validation needs the complete graph.
export const PAYROLL_COMPONENT_OPTIONS_PAGE_SIZE = 100;
const incomplete = (): { error: FetchBaseQueryError } => ({
  error: {
    status: 'CUSTOM_ERROR',
    error:
      'Payroll component choices could not be loaded completely. Retry to refresh the choices.',
  },
});
const cancelled = (): { error: FetchBaseQueryError } => ({
  error: { status: 'CUSTOM_ERROR', error: 'Loading payroll component choices was cancelled.' },
});

/** Follow the existing stable list order and count; never return a silently truncated graph. */
export async function loadPayrollComponentOptions(
  kind: 'earning' | 'deduction',
  args: PayrollComponentOptionsArgs,
  fetchPage: ComponentPageFetcher,
  signal: AbortSignal
): Promise<{ data: PayrollComponentOptions } | { error: FetchBaseQueryError }> {
  const items: PayrollComponentOption[] = [];
  const ids = new Set<string>();
  let expectedTotal: number | undefined;
  let page = 1;

  do {
    if (signal.aborted) return cancelled();
    let result: ComponentPageResult;
    try {
      // Check each sequential page for count changes and duplicate IDs before accepting the graph.
      // eslint-disable-next-line no-await-in-loop
      result = await fetchPage({
        url: `/payroll/${kind}-components`,
        method: 'GET',
        params: {
          page,
          pageSize: PAYROLL_COMPONENT_OPTIONS_PAGE_SIZE,
          academicYearId: args ? args.academicYearId : undefined,
        },
      });
    } catch {
      if (signal.aborted) return cancelled();
      return {
        error: { status: 'FETCH_ERROR', error: 'Unable to load payroll component choices. Retry.' },
      };
    }
    if (signal.aborted) return cancelled();
    if (result.error) return { error: result.error };
    if (!result.data || typeof result.data !== 'object') return incomplete();
    const response = result.data as { items?: unknown; totalCount?: unknown };
    const total = response.totalCount;
    if (
      typeof total !== 'number' ||
      !Number.isSafeInteger(total) ||
      total < 0 ||
      !Array.isArray(response.items) ||
      (expectedTotal !== undefined && total !== expectedTotal)
    )
      return incomplete();
    expectedTotal = total;
    const expectedPageCount = Math.min(PAYROLL_COMPONENT_OPTIONS_PAGE_SIZE, total - items.length);
    if (response.items.length !== expectedPageCount) return incomplete();
    const pageItems = response.items as PayrollComponentOption[];
    if (
      pageItems.some(
        (item) => !item || typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id)
      )
    )
      return incomplete();
    pageItems.forEach((item) => ids.add(item.id));
    // Also reject a duplicate within this page before committing it to the result.
    if (ids.size !== items.length + pageItems.length) return incomplete();
    items.push(...pageItems);
    page += 1;
  } while (items.length < expectedTotal);

  return { data: { items, totalCount: expectedTotal } };
}
