import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { chaptersApi } from './Chapter-management-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

describe('chaptersApi.addChapter', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });

  afterEach(() => {
    clearCachedAuthSession();
  });

  it('posts the chapter array to the collection route with class and subject query parameters', async () => {
    const requests: Array<{ method: string; url: URL; body: unknown }> = [];
    const body = [
      {
        chapterNo: 1,
        chapterName: 'Introduction',
        startDate: '2026-09-18T00:00:00+05:30',
        endDate: '2026-09-19T00:00:00+05:30',
      },
    ];

    mswServer.use(
      http.post('*/api/academic/curriculum/chapters', async ({ request }) => {
        requests.push({
          method: request.method,
          url: new URL(request.url),
          body: await request.json(),
        });
        return HttpResponse.json({});
      })
    );

    const store = createStore();
    await store
      .dispatch(
        chaptersApi.endpoints.addChapter.initiate({
          standardId: 'class-id',
          subjectId: 'subject-id',
          body,
        })
      )
      .unwrap();

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ method: 'POST', body });
    expect(requests[0].url.searchParams.get('standardId')).toBe('class-id');
    expect(requests[0].url.searchParams.get('subjectId')).toBe('subject-id');

    store.dispatch(api.util.resetApiState());
  });

  it('posts a multipart chapter payload and files to the attachment-aware route', async () => {
    const requests: Array<{
      contentType: string | null;
      payload: unknown;
      files: FormDataEntryValue[];
    }> = [];
    const file = new File(['chapter notes'], 'notes.pdf', { type: 'application/pdf' });
    const body = new FormData();
    body.append('Payload', JSON.stringify({ chapterNo: 2, documents: ['existing.pdf'] }));
    body.append('Files', file, file.name);

    mswServer.use(
      http.post('*/api/academic/curriculum/chapters/with-attachments', async ({ request }) => {
        const requestBody = await request.formData();
        requests.push({
          contentType: request.headers.get('content-type'),
          payload: JSON.parse(String(requestBody.get('Payload'))),
          files: requestBody.getAll('Files'),
        });
        return HttpResponse.json({});
      })
    );

    const store = createStore();
    await store
      .dispatch(
        chaptersApi.endpoints.addChapterWithAttachments.initiate({
          standardId: 'class-id',
          subjectId: 'subject-id',
          body,
        })
      )
      .unwrap();

    expect(requests).toHaveLength(1);
    expect(requests[0].contentType).toContain('multipart/form-data; boundary=');
    expect(requests[0].payload).toEqual({ chapterNo: 2, documents: ['existing.pdf'] });
    expect(requests[0].files).toHaveLength(1);
    expect((requests[0].files[0] as File).name).toBe('notes.pdf');

    store.dispatch(api.util.resetApiState());
  });

  it('puts multipart chapter updates to the attachment-aware route', async () => {
    const urls: string[] = [];
    const body = new FormData();
    body.append('Payload', JSON.stringify({ chapterNo: 3, documents: [] }));

    mswServer.use(
      http.put(
        '*/api/academic/curriculum/chapters/chapter-id/with-attachments',
        async ({ request }) => {
          urls.push(request.url);
          expect(request.headers.get('content-type')).toContain('multipart/form-data; boundary=');
          expect(JSON.parse(String((await request.formData()).get('Payload')))).toMatchObject({
            chapterNo: 3,
          });
          return HttpResponse.json({});
        }
      )
    );

    const store = createStore();
    await store
      .dispatch(
        chaptersApi.endpoints.updateChapterWithAttachments.initiate({
          id: 'chapter-id',
          body,
        })
      )
      .unwrap();

    expect(urls).toHaveLength(1);
    store.dispatch(api.util.resetApiState());
  });
});
