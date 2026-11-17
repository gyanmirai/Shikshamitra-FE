import { it, vi, expect, afterEach } from 'vitest';
import { _api as iconifyApi } from '@iconify/react';

afterEach(() => vi.restoreAllMocks());

it.each([
  ['api.iconify.design', 'https://api.iconify.design/test.json?icons=one,two'],
  ['api.simplesvg.com', new URL('https://api.simplesvg.com/test.json?icons=one,two')],
  ['api.unisvg.com', new Request('https://api.unisvg.com/test.json?icons=one,two')],
])('resolves missing test icons without a network request to %s', async (_host, resource) => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  const transport = iconifyApi.getFetch();
  expect(transport).toBeTypeOf('function');
  const response = await transport!(resource);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    prefix: 'test',
    icons: {},
    not_found: ['one', 'two'],
  });
  expect(fetchSpy).not.toHaveBeenCalled();
});
