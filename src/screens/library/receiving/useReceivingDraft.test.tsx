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

it('retains an unchanged preview revision, payload and key when an uncertain receipt is retried', async () => {
  const commands: unknown[] = [];
  let previews = 0;
  mswServer.use(
    http.post('http://library.test/api/library/receiving/preview', () => {
      previews += 1;
      return HttpResponse.json(receivingPreview);
    }),
    http.post('http://library.test/api/library/receiving', async ({ request }) => {
      commands.push(await request.json());
      return commands.length === 1
        ? HttpResponse.json({ detail: 'Connection lost after acceptance.' }, { status: 503 })
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
  expect(result.current.saved).toBeNull();
  expect(result.current.formik.values.lines[0].unitCost).toBe('9999999999999998.99');
  await act(async () => {
    await result.current.receive();
  });
  expect(commands).toHaveLength(2);
  expect(commands[1]).toEqual(commands[0]);
  expect(commands[1]).toMatchObject({ revision: 'revision-A', idempotencyKey: expect.any(String) });
  expect(previews).toBe(1);
  expect(result.current.saved).toMatchObject({ id: 'receipt-id', copyCount: 2 });
});

it('shows server row errors without losing the draft or enabling a stock save', async () => {
  let saves = 0;
  mswServer.use(
    http.post('http://library.test/api/library/receiving/preview', () =>
      HttpResponse.json({
        ...receivingPreview,
        canReceive: false,
        revision: null,
        knownTotals: [],
        lines: [],
        knownCostCopyCount: 0,
        errors: [
          { lineIndex: 0, code: 'DuplicateAccession', message: 'Accession already exists.' },
        ],
      })
    ),
    http.post('http://library.test/api/library/receiving', () => {
      saves += 1;
      return HttpResponse.json(savedReceiving);
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
  expect(result.current.previewResult).toMatchObject({
    canReceive: false,
    errors: [{ lineIndex: 0, message: 'Accession already exists.' }],
  });
  expect(result.current.formik.values).toEqual(draft);
  await act(async () => {
    await result.current.receive();
  });
  expect(saves).toBe(0);
});
