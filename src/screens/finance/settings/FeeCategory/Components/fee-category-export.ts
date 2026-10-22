import type {
  IFeeCategoryResponse,
  IFeeCategoryListResponse,
} from 'src/redux/feeCategory/feeCategoryApi';

/** Read every page of the same filtered query; never download a silently incomplete export. */
export async function collectFeeCategoryExportRows(
  fetchPage: (page: number) => Promise<IFeeCategoryListResponse>,
  signal: AbortSignal
): Promise<IFeeCategoryResponse[]> {
  const rows: IFeeCategoryResponse[] = [];
  const ids = new Set<string>();
  let expectedCount: number | undefined;

  for (let page = 1; ; page += 1) {
    signal.throwIfAborted();
    // Fetch sequentially so each page can verify the total and cancellation before continuing.
    // eslint-disable-next-line no-await-in-loop
    const result = await fetchPage(page);
    signal.throwIfAborted();
    expectedCount ??= result.totalCount;
    if (result.totalCount !== expectedCount || expectedCount > 500000) {
      throw new Error(
        'Fee categories changed or the export is too large. Refresh or narrow the filters and try again.'
      );
    }
    result.items.forEach((row) => {
      if (ids.has(row.id)) {
        throw new Error('Fee categories changed during export. Refresh and try again.');
      }
      ids.add(row.id);
      rows.push(row);
    });
    if (rows.length === expectedCount) return rows;
    if (rows.length > expectedCount || result.items.length === 0) {
      throw new Error('The complete fee category export could not be loaded. Please try again.');
    }
  }
}
