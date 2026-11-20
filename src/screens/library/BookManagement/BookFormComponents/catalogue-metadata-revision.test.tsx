import { http, HttpResponse } from 'msw';
import { act } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import {
  revisionBook,
  revisionBookId,
  revisionResult,
  unreviewedCopies,
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
const changed = () =>
  HttpResponse.json(
    { status: 409, detail: 'The catalogue changed. Reload and review.' },
    { status: 409 }
  );

it('keeps two independent metadata drafts bound to their actual opened revision', async () => {
  let saved = revisionBook();
  const attempts: Record<string, unknown>[] = [];
  mswServer.use(
    http.get(`http://library.test/api/library/books/${revisionBookId}`, () =>
      HttpResponse.json(saved)
    ),
    http.put(`http://library.test/api/library/books/${revisionBookId}`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      attempts.push(body);
      if (body.expectedMetadataRevision !== saved.metadataRevision) return changed();
      saved = { ...saved, publisher: String(body.publisher), metadataRevision: 'metadata-2' };
      return HttpResponse.json(revisionResult(saved));
    })
  );
  const first = await openRevisionEditor();
  const second = await openRevisionEditor();
  expect(first.source.metadataRevision).toBe('metadata-1');
  expect(second.source.metadataRevision).toBe('metadata-1');
  await act(async () => {
    await first.result.current.formik.setFieldValue('publisher', 'First librarian');
  });
  await act(async () => {
    await first.result.current.saveCurrent(first.result.current.formik.values, false);
  });
  expect(first.result.current.error).toBe('');
  await act(async () => {
    await second.result.current.formik.setFieldValue('publisher', 'Second librarian');
  });
  await act(async () => {
    await second.result.current.saveCurrent(second.result.current.formik.values, false);
  });
  expect(attempts.map((body) => body.expectedMetadataRevision)).toEqual([
    'metadata-1',
    'metadata-1',
  ]);
  expect(saved.publisher).toBe('First librarian');
  expect(second.result.current.error).toMatch(/catalogue changed/);
  expect(second.result.current.formik.values.publisher).toBe('Second librarian');
  expect(second.result.current.formik.dirty).toBe(true);
});

it('advances only its own accepted response revision while retaining pending copies and their independent token', async () => {
  let saved = revisionBook();
  let reads = 0;
  const metadata: Record<string, unknown>[] = [];
  const copies: Record<string, unknown>[] = [];
  mswServer.use(
    http.get(`http://library.test/api/library/books/${revisionBookId}`, () => {
      reads += 1;
      return HttpResponse.json(saved);
    }),
    http.put(`http://library.test/api/library/books/${revisionBookId}`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      metadata.push(body);
      if (body.expectedMetadataRevision !== saved.metadataRevision) return changed();
      saved = {
        ...saved,
        publisher: String(body.publisher),
        metadataRevision: `metadata-${metadata.length + 1}`,
      };
      return HttpResponse.json(revisionResult(saved));
    }),
    http.put(
      `http://library.test/api/library/books/${revisionBookId}/copies`,
      async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        copies.push(body);
        if (body.expectedCopiesRevision !== saved.copiesRevision) return changed();
        return HttpResponse.json(revisionResult(saved));
      }
    )
  );
  const editor = await openRevisionEditor();
  saved = unreviewedCopies(saved);
  expect(saved.copies).toHaveLength(3);
  await act(async () => {
    await editor.result.current.formik.setValues({
      ...editor.result.current.formik.values,
      publisher: 'First accepted publisher',
      copies: editor.result.current.formik.values.copies.map((copy, index) => ({
        ...copy,
        copyNo: index === 0 ? 9 : copy.copyNo,
      })),
    });
  });
  await act(async () => {
    await editor.result.current.saveCurrent(editor.result.current.formik.values, false);
  });
  expect(editor.result.current.error).toBe('');
  expect(reads).toBe(1);
  expect(editor.result.current.formik.values.copies[0].copyNo).toBe(9);
  expect(editor.result.current.formik.dirty).toBe(true);
  await act(async () => {
    await editor.result.current.formik.setFieldValue('publisher', 'Second accepted publisher');
  });
  await act(async () => {
    await editor.result.current.saveCurrent(editor.result.current.formik.values, false);
  });
  expect(metadata.map((body) => body.expectedMetadataRevision)).toEqual([
    'metadata-1',
    'metadata-2',
  ]);
  expect(reads).toBe(1);
  await act(async () => {
    editor.result.current.setActiveStep(1);
  });
  await act(async () => {
    await editor.result.current.saveCurrent(editor.result.current.formik.values, true);
  });
  expect(editor.result.current.error).toMatch(/catalogue changed/);
  expect(metadata).toHaveLength(2);
  expect(copies).toHaveLength(1);
  expect(copies[0].expectedCopiesRevision).toBe('copies-1');
  expect(saved.copies).toHaveLength(3);
  expect(editor.result.current.formik.values.copies).toHaveLength(2);
  expect(saved.publisher).toBe('Second accepted publisher');
});
