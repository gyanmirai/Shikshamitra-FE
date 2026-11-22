import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { GET } from './route';

const mock = vi.hoisted(() => ({ auth: vi.fn(), fetch: vi.fn() }));
vi.mock('src/auth', () => ({ auth: mock.auth }));

const jobId = '3a23a6b6-f55d-bc60-28c5-e3599a88f7c1';
const request = new Request(`https://school.example.test/api/academic-reports/${jobId}/download`);
const context = { params: Promise.resolve({ jobId }) };

describe('Academic report notification download', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test');
    vi.stubGlobal('fetch', mock.fetch.mockReset());
    mock.auth.mockResolvedValue({ accessToken: 'signed-in-token' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each(['050001', '050002', '050004'])('opens recovery for an authorized report state %s', async (code) => {
    mock.fetch.mockResolvedValue(new Response(JSON.stringify({ errorCode: `Academic:Reports:${code}` }), {
      status: 400, headers: { 'Content-Type': 'application/problem+json' },
    }));
    const response = await GET(request, context);
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe(`/academic/report-exports/${jobId}`);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mock.fetch).toHaveBeenCalledOnce();
    const [url, options] = mock.fetch.mock.calls[0];
    expect(url).toBe(`https://api.example.test/api/app/academic-report/exports/${jobId}/download`);
    expect(options).toMatchObject({ method: 'GET', headers: { Authorization: 'Bearer signed-in-token' } });
  });

  it('keeps an authorization failure private and does not expose a recovery location', async () => {
    mock.fetch.mockResolvedValue(Response.json({ error: { code: null, message: 'Private error' } }, { status: 403 }));
    const response = await GET(request, context);
    expect(response.status).toBe(403);
    expect(response.headers.has('Location')).toBe(false);
    expect(await response.text()).not.toContain('Private error');
  });

  it('streams the ready file with private attachment headers', async () => {
    mock.fetch.mockResolvedValue(new Response('synthetic file', {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="report.pdf"' },
    }));
    const response = await GET(request, context);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="report.pdf"');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.text()).toBe('synthetic file');
  });
});
