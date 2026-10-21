import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { fetchProtectedPreview } from './fetch-protected-preview';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'synthetic-test-token' }))
  );
});

describe('Protected document preview fetch', () => {
  it('authenticates only requests to the configured API and returns the real bytes', async () => {
    mswServer.use(
      http.get(
        'http://localhost:5000/api/institute-setup/school-documents/record/files/file',
        ({ request }) => {
          expect(request.headers.get('Authorization')).toBe('Bearer synthetic-test-token');
          return new HttpResponse('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf' } });
        }
      )
    );
    const blob = await fetchProtectedPreview(
      '/api/institute-setup/school-documents/record/files/file',
      new AbortController().signal
    );
    expect(await blob.text()).toBe('%PDF-1.7');
    expect(blob.type).toBe('application/pdf');
  });

  it('rejects a foreign origin before reading or sending the authentication session', async () => {
    await expect(
      fetchProtectedPreview('https://foreign.example/document.pdf', new AbortController().signal)
    ).rejects.toThrow('outside the API');
  });

  it('discards a response when the session changes during the request', async () => {
    mswServer.use(
      http.get('http://localhost:5000/api/private-document', () => {
        clearCachedAuthSession();
        return new HttpResponse('old account bytes');
      })
    );
    await expect(
      fetchProtectedPreview('/api/private-document', new AbortController().signal)
    ).rejects.toThrow('authentication session changed');
  });
});
