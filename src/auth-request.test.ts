import { vi, it, expect, describe } from 'vitest';

import { runAuthRequestOnce } from './auth-request';

describe('runAuthRequestOnce', () => {
  it('shares an in-flight request with callers using the same key', async () => {
    let resolveRequest: ((value: string) => void) | undefined;
    const request = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRequest = resolve;
        })
    );

    const first = runAuthRequestOnce('same-auth-request', request);
    const second = runAuthRequestOnce('same-auth-request', request);

    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    resolveRequest?.('token');

    await expect(Promise.all([first, second])).resolves.toEqual(['token', 'token']);
  });

  it('allows a new request after the previous request settles', async () => {
    const request = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');

    await expect(runAuthRequestOnce('reusable-auth-request', request)).resolves.toBe('first');
    await expect(runAuthRequestOnce('reusable-auth-request', request)).resolves.toBe('second');

    expect(request).toHaveBeenCalledTimes(2);
  });

  it('does not combine requests with different keys', async () => {
    const firstRequest = vi.fn().mockResolvedValue('first');
    const secondRequest = vi.fn().mockResolvedValue('second');

    await expect(
      Promise.all([
        runAuthRequestOnce('first-auth-request', firstRequest),
        runAuthRequestOnce('second-auth-request', secondRequest),
      ])
    ).resolves.toEqual(['first', 'second']);

    expect(firstRequest).toHaveBeenCalledOnce();
    expect(secondRequest).toHaveBeenCalledOnce();
  });
});
