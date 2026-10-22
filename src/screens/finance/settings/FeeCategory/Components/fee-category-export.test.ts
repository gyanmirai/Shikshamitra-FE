import type { IFeeCategoryListResponse } from 'src/redux/feeCategory/feeCategoryApi';

import { vi, it, expect, describe } from 'vitest';

import { collectFeeCategoryExportRows } from './fee-category-export';

const pageResult = (ids: string[], totalCount: number) =>
  ({ items: ids.map((id) => ({ id })), totalCount }) as IFeeCategoryListResponse;

describe('Fee category export pagination', () => {
  it('exports every matching row beyond the visible page', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(pageResult(['one', 'two'], 3))
      .mockResolvedValueOnce(pageResult(['three'], 3));
    const rows = await collectFeeCategoryExportRows(fetchPage, new AbortController().signal);
    expect(rows.map(({ id }) => id)).toEqual(['one', 'two', 'three']);
    expect(fetchPage.mock.calls).toEqual([[1], [2]]);
  });

  it('stops before another request after cancellation', async () => {
    const controller = new AbortController();
    const fetchPage = vi.fn(async () => {
      controller.abort();
      return pageResult(['one'], 3);
    });
    await expect(collectFeeCategoryExportRows(fetchPage, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it('refuses a partial download when the source changes between pages', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(pageResult(['one'], 3))
      .mockResolvedValueOnce(pageResult(['two'], 2));
    await expect(
      collectFeeCategoryExportRows(fetchPage, new AbortController().signal)
    ).rejects.toThrow('Fee categories changed');
  });

  it('refuses duplicates and missing pages instead of declaring a complete export', async () => {
    const duplicate = vi
      .fn()
      .mockResolvedValueOnce(pageResult(['one'], 2))
      .mockResolvedValueOnce(pageResult(['one'], 2));
    await expect(
      collectFeeCategoryExportRows(duplicate, new AbortController().signal)
    ).rejects.toThrow('changed during export');
    const missing = vi
      .fn()
      .mockResolvedValueOnce(pageResult(['one'], 2))
      .mockResolvedValueOnce(pageResult([], 2));
    await expect(
      collectFeeCategoryExportRows(missing, new AbortController().signal)
    ).rejects.toThrow('complete fee category export');
  });
});
