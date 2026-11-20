import { http, HttpResponse } from 'msw';
import { act } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import {
  largeBookId,
  currentBookDetail,
  currentBookValues,
  renderExistingBookEditor,
  currentBookMutationResult,
} from './catalogue-large-holdings.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
beforeEach(clearCachedAuthSession);

it('still sends an intentional permitted copy change once while skipping unchanged metadata', async () => {
  const initial = currentBookValues(2, false);
  expect(initial.copies.every((copy) => copy.canRemove)).toBe(true);
  let metadataWrites = 0;
  const copyWrites: unknown[] = [];
  mswServer.use(
    http.put(`http://library.test/api/library/books/${largeBookId}`, () => {
      metadataWrites += 1;
      return HttpResponse.json(currentBookMutationResult(2, false));
    }),
    http.put(`http://library.test/api/library/books/${largeBookId}/copies`, async ({ request }) => {
      copyWrites.push(await request.json());
      return HttpResponse.json(currentBookMutationResult(1, false));
    }),
    http.get(`http://library.test/api/library/books/${largeBookId}`, () =>
      HttpResponse.json(currentBookDetail(1, false))
    )
  );
  const { result } = renderExistingBookEditor(initial);
  await act(async () => {
    result.current.setActiveStep(1);
    await result.current.formik.setValues({
      ...result.current.formik.values,
      numberOfCopies: '1',
      copies: [initial.copies[0]],
    });
  });
  let errors: Record<string, unknown> = {};
  await act(async () => {
    errors = await result.current.formik.validateForm();
  });
  expect(errors).toEqual({});
  await act(async () => {
    await result.current.saveCurrent(result.current.formik.values, true);
  });
  expect(metadataWrites).toBe(0);
  expect(copyWrites).toHaveLength(1);
  expect(copyWrites[0]).toMatchObject({ copies: [{ copyId: initial.copies[0].copyId }] });
  expect(result.current.error).toBe('');
});
