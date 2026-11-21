import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { savedReceiving } from './receiving-test-fixture';
import { receivingUiWrapper } from './receiving-ui-fixture';
import ReceivingReceiptWorkspace from './ReceivingReceiptWorkspace';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
beforeEach(clearCachedAuthSession);

it('uses current labels provided by the owning receipt reader without one full catalogue detail request per line', async () => {
  let catalogueReads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/receiving/receipt-id', () =>
      HttpResponse.json({
        ...savedReceiving,
        lines: savedReceiving.lines.map((line) => ({
          ...line,
          currentBookTitle: 'Receipt reader current title',
          currentSectionName: 'Reading room',
          currentShelfName: 'Shelf A',
        })),
      })
    ),
    http.get('http://library.test/api/library/books/book-id', () => {
      catalogueReads += 1;
      return HttpResponse.json({ detail: 'Unavailable' }, { status: 500 });
    })
  );
  render(<ReceivingReceiptWorkspace id="receipt-id" />, { wrapper: receivingUiWrapper(false) });
  expect(await screen.findByText('Receipt reader current title')).toBeVisible();
  expect(screen.getByText(/Current section: Reading room/)).toBeVisible();
  expect(screen.getByText(/Current shelf: Shelf A/)).toBeVisible();
  expect(catalogueReads).toBe(0);
});

it('keeps immutable identifiers when current labels are unavailable without inventing an acquisition snapshot', async () => {
  let catalogueReads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/receiving/receipt-id', () =>
      HttpResponse.json({
        ...savedReceiving,
        lines: savedReceiving.lines.map((line) => ({
          ...line,
          currentBookTitle: null,
          currentSectionName: null,
          currentShelfName: null,
        })),
      })
    ),
    http.get('http://library.test/api/library/books/book-id', () => {
      catalogueReads += 1;
      return HttpResponse.json({ detail: 'Unavailable' }, { status: 500 });
    })
  );
  render(<ReceivingReceiptWorkspace id="receipt-id" />, { wrapper: receivingUiWrapper(false) });
  expect(await screen.findByText(/Receipt ID: receipt-id/)).toBeVisible();
  expect(screen.getByText('Current title unavailable')).toBeVisible();
  expect(screen.getByText(/Recorded section ID: section-id/)).toBeVisible();
  expect(screen.getByText(/Recorded shelf ID: shelf-id/)).toBeVisible();
  expect(catalogueReads).toBe(0);
});
