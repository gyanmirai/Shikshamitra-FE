import { http, HttpResponse } from 'msw';
import { act } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import {
  revisionBook,
  revisionBookId,
  revisionResult,
  openRevisionEditor,
} from './catalogue-revision.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
beforeEach(clearCachedAuthSession);

it('conflicts an old complete copy list instead of removing another editors new unused Available copy', async () => {
  let saved = revisionBook();
  const newCopyId = '00000000-0000-0000-0000-000000000003';
  const writes: Record<string, unknown>[] = [];
  let metadataWrites = 0;
  mswServer.use(
    http.get(`http://library.test/api/library/books/${revisionBookId}`, () =>
      HttpResponse.json(saved)
    ),
    http.put(`http://library.test/api/library/books/${revisionBookId}`, () => {
      metadataWrites += 1;
      return HttpResponse.json(revisionResult(saved));
    }),
    http.put(
      `http://library.test/api/library/books/${revisionBookId}/copies`,
      async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        writes.push(body);
        if (body.expectedCopiesRevision !== saved.copiesRevision)
          return HttpResponse.json(
            { status: 409, detail: 'The saved copies changed. Reload and review.' },
            { status: 409 }
          );
        const rows = body.copies as Array<{
          copyId?: string;
          copyNumber: number;
          accessionNumber: string;
        }>;
        saved = {
          ...saved,
          copiesRevision: 'copies-2',
          copies: rows.map((row) => ({
            ...(saved.copies.find((copy) => copy.copyId === row.copyId) || saved.copies[0]),
            copyId: row.copyId || newCopyId,
            copyNumber: row.copyNumber,
            accessionNo: row.accessionNumber,
          })),
        };
        return HttpResponse.json(revisionResult(saved));
      }
    )
  );
  const stale = await openRevisionEditor();
  const fresh = await openRevisionEditor();
  expect(stale.source.copiesRevision).toBe('copies-1');
  expect(stale.source.copies).toHaveLength(2);
  await act(async () => {
    fresh.result.current.setActiveStep(1);
    const { values } = fresh.result.current.formik;
    await fresh.result.current.formik.setValues({
      ...values,
      numberOfCopies: '3',
      copies: [
        ...values.copies,
        {
          ...values.copies[0],
          id: undefined,
          copyId: undefined,
          copyNo: 3,
          accessionNo: 'SCHOOL/NEW-3',
        },
      ],
    });
  });
  await act(async () => {
    await fresh.result.current.saveCurrent(fresh.result.current.formik.values, true);
  });
  expect(fresh.result.current.error).toBe('');
  expect(saved.copies).toHaveLength(3);
  expect(saved.copies.find((copy) => copy.copyId === newCopyId)).toMatchObject({
    status: 0,
    canRemove: true,
  });
  await act(async () => {
    stale.result.current.setActiveStep(1);
    await stale.result.current.formik.setFieldValue('copies[0].copyNo', 9);
  });
  await act(async () => {
    await stale.result.current.saveCurrent(stale.result.current.formik.values, true);
  });
  expect(writes.map((body) => body.expectedCopiesRevision)).toEqual(['copies-1', 'copies-1']);
  expect(saved.copies).toHaveLength(3);
  expect(saved.copies.some((copy) => copy.copyId === newCopyId)).toBe(true);
  expect(stale.result.current.formik.values.copies[0].copyNo).toBe(9);
  expect(stale.result.current.error).toMatch(/saved copies changed/);
  expect(metadataWrites).toBe(0);
});
