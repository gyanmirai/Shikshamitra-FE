import React from 'react';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { CopyEventsDialog } from './CopyEventsDialog';
import { movedEvent } from './copy-events-test-fixture';
import { copyIdentity } from '../copy-command-test-fixtures';
import { makeStatusTestWrapper } from '../copy-status-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('shows immutable newest-first evidence and requests the next actual server page under View alone', async () => {
  const requested: number[] = [];
  mswServer.use(
    http.get(
      'http://library.test/api/library/books/book-id/copies/copy-id/events',
      ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'));
        requested.push(page);
        return HttpResponse.json({
          items: [
            page === 1
              ? movedEvent
              : {
                  ...movedEvent,
                  id: 'event-2',
                  sequence: 1,
                  eventType: 'WrittenOff',
                  nextStatus: 6,
                  reason: 'Approved retirement',
                },
          ],
          totalCount: 21,
          currentPage: page,
          pageSize: 20,
          totalPages: 2,
        });
      }
    )
  );
  render(<CopyEventsDialog {...copyIdentity} onClose={vi.fn()} />, makeStatusTestWrapper(['View']));
  expect(await screen.findByText('Moved to reference room')).toBeInTheDocument();
  expect(screen.getByText(/Actor account ID: actor-1/)).toBeInTheDocument();
  expect(screen.getByText(/Times shown in/)).toHaveTextContent(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  fireEvent.click(screen.getByRole('button', { name: 'View changes' }));
  const diff = screen.getByRole('table', { name: /Recorded changes/ });
  expect(within(diff).getByText('section-a')).toBeInTheDocument();
  expect(within(diff).getByText('section-b')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Delete|Edit event/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(await screen.findByText('Approved retirement')).toBeInTheDocument();
  expect(requested).toEqual([1, 2]);
});
