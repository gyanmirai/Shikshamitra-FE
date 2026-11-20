import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';

import { bookCategoryApi } from './bookCategoryApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('sends category edits as JSON body through the real authenticated base query', async () => {
  let submitted: unknown;
  mswServer.use(
    http.put('http://library.test/api/library/book-categories/category-id', async ({ request }) => {
      const raw = await request.text();
      submitted = raw ? JSON.parse(raw) : null;
      return HttpResponse.json({ id: 'category-id', message: 'Updated' });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const data = { categoryName: 'Reference and research' };
  await store
    .dispatch(
      bookCategoryApi.endpoints.updateBookCategory.initiate({ categoryId: 'category-id', data })
    )
    .unwrap();
  expect(submitted).toEqual(data);
});
