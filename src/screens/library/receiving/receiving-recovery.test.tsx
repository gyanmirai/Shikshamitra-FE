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

it('clears uncertainty only after the unchanged retry returns a real saved receipt', async () => {
  let saves = 0;
  mswServer.use(
    http.post('http://library.test/api/library/receiving/preview', () =>
      HttpResponse.json(receivingPreview)
    ),
    http.post('http://library.test/api/library/receiving', () => {
      saves += 1;
      return saves === 1
        ? HttpResponse.json({ detail: 'Response lost.' }, { status: 503 })
        : HttpResponse.json(savedReceiving);
    })
  );
  const { result } = renderHook(useReceivingDraft, { wrapper: receivingWrapper() });
  await act(async () => {
    await result.current.formik.setValues(validReceivingDraft());
  });
  await act(async () => {
    await result.current.preview();
  });
  await act(async () => {
    await result.current.receive();
  });
  expect(result.current.uncertain).toBe(true);
  await act(async () => {
    await result.current.receive();
  });
  expect(result.current.saved?.id).toBe('receipt-id');
  expect(result.current.uncertain).toBe(false);
});
