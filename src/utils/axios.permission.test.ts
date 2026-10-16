import { it, vi, expect, afterEach } from 'vitest';

import client from './axios';
import { parseApiProblemDetail } from './api-problem-details';

vi.mock('src/config-global', () => ({ CONFIG: { site: { serverUrl: 'http://localhost:5000' } } }));
afterEach(() => vi.unstubAllGlobals());

it('gives legacy fetch callers usable guidance after a generic403', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    error: { message: "You don't have permission to access this resource." },
  }), { status: 403 })));
  const error = await client.get('/synthetic').catch((failure: unknown) => failure);
  expect(parseApiProblemDetail(error).detail).toBe(
    'Your account cannot complete this action. Ask your administrator to review your permissions and assigned data access, then try again.'
  );
});

it.each([403, 409])('keeps a specific legacy response intact for status %s', async (status) => {
  const data = { errorCode: 'Specific:Reason', detail: 'This record cannot be changed in its current state.' };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { status })));
  await expect(client.put('/synthetic', {})).rejects.toEqual(data);
});
