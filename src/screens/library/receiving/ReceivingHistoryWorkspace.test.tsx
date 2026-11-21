import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { receivingUiWrapper } from './receiving-ui-fixture';
import ReceivingHistoryWorkspace from './ReceivingHistoryWorkspace';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
beforeEach(clearCachedAuthSession);
const receipt = {
  id: 'receipt-id',
  receivedOn: '2026-11-18',
  source: 1,
  sourceName: 'Community donor',
  reference: 'Donation/18',
  recordedBy: 'actor-id',
  recordedAt: '2026-11-18T04:30:00Z',
  lineCount: 2,
  copyCount: 20,
};

it('shows saved receipt headers and a real detail link to a reader without Add or settings permissions', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/receiving', () =>
      HttpResponse.json({
        items: [receipt],
        totalCount: 1,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      })
    )
  );
  render(<ReceivingHistoryWorkspace />, { wrapper: receivingUiWrapper(false) });
  expect(await screen.findByText('Community donor')).toBeVisible();
  expect(screen.getByRole('link', { name: /View receiving receipt/ })).toHaveAttribute(
    'href',
    '/library/receiving/receipt-id'
  );
  expect(screen.queryByRole('link', { name: 'Receive copies' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Stock imports' })).toHaveAttribute(
    'href',
    '/library/receiving/imports'
  );
  expect(screen.queryByRole('columnheader', { name: /cost|amount/i })).not.toBeInTheDocument();
});

it('retains an exact CopyId filter and retries a failed register read without showing a false empty state', async () => {
  let reads = 0;
  const copies: (string | null)[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/receiving', ({ request }) => {
      reads += 1;
      copies.push(new URL(request.url).searchParams.get('copyId'));
      return reads === 1
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })
        : HttpResponse.json({
            items: [receipt],
            totalCount: 1,
            currentPage: 1,
            pageSize: 20,
            totalPages: 1,
          });
    })
  );
  render(<ReceivingHistoryWorkspace copyId="copy-id" />, { wrapper: receivingUiWrapper(false) });
  expect(await screen.findByText('Could not load receiving history.')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Community donor')).toBeVisible();
  expect(copies).toEqual(['copy-id', 'copy-id']);
});
