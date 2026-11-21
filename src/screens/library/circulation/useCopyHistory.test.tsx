import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { waitFor, renderHook } from '@testing-library/react';

import { useCopyHistory } from './useCopyHistory';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
it('does not request history without the exact circulation View grant', () => {
  const { result } = renderHook(
    () => useCopyHistory('book-id', 'copy-id'),
    makeCirculationTestWrapper()
  );
  expect(result.current.canView).toBe(false);
  expect(result.current.isUninitialized).toBe(true);
});
it('does not show the previous copy’s loan rows while the next copy loads', async () => {
  mswServer.use(
    http.get(
      'http://library.test/api/library/books/book-id/copies/:copyId/history',
      async ({ params }) => {
        if (params.copyId === 'copy-2') await delay(50);
        return HttpResponse.json({
          items: [{ transactionId: params.copyId, memberId: 'member-id', role: 0, status: 1 }],
          totalCount: 1,
          currentPage: 1,
          pageSize: 20,
        });
      }
    )
  );
  const { result, rerender } = renderHook(({ copyId }) => useCopyHistory('book-id', copyId), {
    ...makeCirculationTestWrapper([{ name: 'Library.IssueReturn.View', isGranted: true }]),
    initialProps: { copyId: 'copy-1' },
  });
  await waitFor(() => expect(result.current.currentData?.items[0].id).toBe('copy-1'));
  rerender({ copyId: 'copy-2' });
  expect(result.current.currentData).toBeUndefined();
  await waitFor(() => expect(result.current.currentData?.items[0].id).toBe('copy-2'));
});
