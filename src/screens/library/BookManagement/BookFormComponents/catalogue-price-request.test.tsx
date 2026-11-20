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

it.each([
  { price: '', priceText: null },
  { price: '9999999999999999.99', priceText: '9999999999999999.99' },
])('writes exact catalogue price $priceText through the real metadata request', async (entry) => {
  const writes: unknown[] = [];
  let copyWrites = 0;
  mswServer.use(
    http.put(`http://library.test/api/library/books/${largeBookId}`, async ({ request }) => {
      writes.push(await request.json());
      return HttpResponse.json(currentBookMutationResult(1));
    }),
    http.put(`http://library.test/api/library/books/${largeBookId}/copies`, () => {
      copyWrites += 1;
      return HttpResponse.json(currentBookMutationResult(1));
    }),
    http.get(`http://library.test/api/library/books/${largeBookId}`, () =>
      HttpResponse.json(currentBookDetail(1))
    )
  );
  const { result } = renderExistingBookEditor(currentBookValues(1));
  await act(async () => {
    await result.current.formik.setFieldValue('price', entry.price);
  });
  let errors: Record<string, unknown> = {};
  await act(async () => {
    errors = await result.current.formik.validateForm();
  });
  expect(errors).toEqual({});
  await act(async () => {
    await result.current.saveCurrent(result.current.formik.values, false);
  });
  expect(writes).toHaveLength(1);
  expect(writes[0]).toMatchObject({ price: null, priceText: entry.priceText });
  expect(writes[0]).not.toHaveProperty('copies');
  expect(writes[0]).not.toHaveProperty('unitCost');
  expect(writes[0]).not.toHaveProperty('currency');
  expect(copyWrites).toBe(0);
  expect(result.current.error).toBe('');
});
