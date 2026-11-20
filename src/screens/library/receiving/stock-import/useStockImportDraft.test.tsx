import type { StockImportCommand } from 'src/redux/library/stock-import-api';

import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useStockImportDraft } from './useStockImportDraft';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  commit: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ globalState: { currentYear: { id: 'recorded-year' } } }),
}));
vi.mock('../useReceivingAccess', () => ({
  useReceivingAccess: () => ({ canRead: true, canReceive: true }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn() },
}));
vi.mock('src/redux/library/stock-import-api', () => ({
  useGetStockImportOptionsQuery: () => ({ isFetching: false }),
  usePreviewStockImportMutation: () => [mocks.preview],
  useCommitStockImportMutation: () => [mocks.commit],
}));

beforeEach(() => {
  mocks.preview.mockReset();
  mocks.commit.mockReset();
});

it('preserves CSV identifiers and retries the exact same batch after an uncertain response', async () => {
  const csv = 'SourceRowId,BookId,Accession\n00001,book-id,000002\n';
  const file = {
    name: 'stock.csv',
    size: csv.length,
    arrayBuffer: async () => new TextEncoder().encode(csv).buffer,
  } as File;
  mocks.preview.mockReturnValue({
    unwrap: async () => ({ revision: 'revision-1', errors: [], rows: [], newTitleCount: 0 }),
  });
  mocks.commit
    .mockReturnValueOnce({
      unwrap: async () => {
        throw Object.assign(new Error('The connection closed'), { status: 'FETCH_ERROR' });
      },
    })
    .mockReturnValueOnce({
      unwrap: async () => ({ id: 'accepted-id', batch: { rowCount: 1 }, rows: [] }),
    });

  const { result } = renderHook(useStockImportDraft);
  await act(async () => {
    await result.current.formik.setValues({
      ...result.current.formik.values,
      sectionId: 'section',
      shelfId: 'shelf',
      receivedOn: '2025-10-02',
      source: 1,
    });
    await result.current.selectFile(file);
  });
  await act(async () => {
    await result.current.preview();
  });
  expect(mocks.preview).toHaveBeenCalledWith(
    expect.objectContaining({ csv, academicYearId: 'recorded-year' })
  );
  await act(async () => {
    await result.current.commit();
  });
  expect(result.current.uncertain).toBe(true);
  const first: StockImportCommand = mocks.commit.mock.calls[0][0];
  await act(async () => {
    await result.current.commit();
  });
  expect(mocks.commit).toHaveBeenLastCalledWith(first);
  expect(result.current.saved?.id).toBe('accepted-id');
});

it('requires another preview after the librarian changes the destination', async () => {
  const csv = 'SourceRowId,BookId\n00001,book-id\n';
  const file = {
    name: 'stock.csv',
    size: csv.length,
    arrayBuffer: async () => new TextEncoder().encode(csv).buffer,
  } as File;
  mocks.preview.mockReturnValue({
    unwrap: async () => ({ revision: 'revision-1', errors: [], rows: [], newTitleCount: 0 }),
  });
  const { result } = renderHook(useStockImportDraft);
  await act(async () => {
    await result.current.formik.setValues({
      ...result.current.formik.values,
      sectionId: 'section',
      shelfId: 'shelf',
      receivedOn: '2025-10-02',
      source: 1,
    });
    await result.current.selectFile(file);
  });
  await act(async () => {
    await result.current.preview();
  });
  expect(result.current.canCommit).toBe(true);
  await act(async () => {
    await result.current.formik.setFieldValue('shelfId', 'another-shelf');
  });
  expect(result.current.reviewed).toBeUndefined();
  expect(result.current.canCommit).toBe(false);
  await act(async () => {
    await result.current.commit();
  });
  expect(mocks.commit).not.toHaveBeenCalled();
});
