import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { useReceivingDraft } from './useReceivingDraft';
import {
  savedReceiving,
  receivingPreview,
  receivingWrapper,
  validReceivingDraft,
} from './receiving-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(clearCachedAuthSession);

it('starts a genuinely new receipt with a new command key even when its physical facts match a previous receipt', async () => {
  const keys: string[] = [];
  mswServer.use(
    http.post('http://library.test/api/library/receiving/preview', () =>
      HttpResponse.json(receivingPreview)
    ),
    http.post('http://library.test/api/library/receiving', async ({ request }) => {
      const command = (await request.json()) as { idempotencyKey: string };
      keys.push(command.idempotencyKey);
      return HttpResponse.json({ ...savedReceiving, id: `receipt-${keys.length}` });
    })
  );
  type Draft = ReturnType<typeof useReceivingDraft> & { startAnother: () => void };
  const hook: () => Draft = useReceivingDraft as () => Draft;
  const { result } = renderHook(hook, { wrapper: receivingWrapper() });
  await act(async () => {
    await result.current.formik.setValues(validReceivingDraft());
  });
  await act(async () => {
    await result.current.preview();
  });
  await act(async () => {
    await result.current.receive();
  });
  expect(result.current.saved?.id).toBe('receipt-1');
  expect(result.current).toHaveProperty('startAnother', expect.any(Function));
  act(() => result.current.startAnother());
  expect(result.current.saved).toBeNull();
  await act(async () => {
    await result.current.formik.setValues(validReceivingDraft());
  });
  await act(async () => {
    await result.current.preview();
  });
  await act(async () => {
    await result.current.receive();
  });
  expect(result.current.saved?.id).toBe('receipt-2');
  expect(keys).toHaveLength(2);
  expect(keys[0]).not.toBe(keys[1]);
});

it.each([409, 403, 400])(
  'retains a rejected draft and requires explicit fresh preview for a stock-change response (%s)',
  async (status) => {
    let previews = 0;
    let saves = 0;
    const revisions: string[] = [];
    mswServer.use(
      http.post('http://library.test/api/library/receiving/preview', () => {
        previews += 1;
        return HttpResponse.json({ ...receivingPreview, revision: `revision-${previews}` });
      }),
      http.post('http://library.test/api/library/receiving', async ({ request }) => {
        const command = (await request.json()) as { revision: string };
        revisions.push(command.revision);
        saves += 1;
        return saves === 1
          ? HttpResponse.json(
              status === 400
                ? {
                    type: 'https://httpstatuses.com/400',
                    title: 'Business rule violated',
                    status: 400,
                    detail: 'Stock changed.',
                    instance: '/api/library/receiving',
                    errorCode: 'Library:Receiving:010084',
                    traceId: 'saved-preview-conflict',
                  }
                : { error: { code: 'Library:Receiving:010084', message: 'Stock changed.' } },
              {
                status,
                headers:
                  status === 400 ? { 'Content-Type': 'application/problem+json' } : undefined,
              }
            )
          : HttpResponse.json(savedReceiving);
      })
    );
    const { result } = renderHook(useReceivingDraft, { wrapper: receivingWrapper() });
    const draft = validReceivingDraft();
    await act(async () => {
      await result.current.formik.setValues(draft);
    });
    await act(async () => {
      await result.current.preview();
    });
    await act(async () => {
      await result.current.receive();
    });
    expect(result.current.conflict).toBe(true);
    expect(result.current.formik.values).toEqual(draft);
    await act(async () => {
      await result.current.receive();
    });
    expect(saves).toBe(1);
    await act(async () => {
      await result.current.preview();
    });
    expect(result.current.conflict).toBe(false);
    await act(async () => {
      await result.current.receive();
    });
    expect(saves).toBe(2);
    expect(revisions).toEqual(['revision-1', 'revision-2']);
  }
);
