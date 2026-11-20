import { it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';

import {
  rosterApi,
  mountRoster,
  serveRoster,
  rosterMember,
  rosterResponse,
} from './member-roster.fixture';

it('uses actual server totals and ABP skip/max to reach the second page without an ignored year filter', async () => {
  const requests: URL[] = [];
  serveRoster(requests);
  mountRoster();
  await screen.findByText(rosterMember.memberName);
  expect(screen.getByText(/of 21/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));
  expect(await screen.findByText('Second Page Person')).toBeVisible();
  expect(screen.queryByText(rosterMember.memberName)).toBeNull();
  expect(requests.map((url) => url.searchParams.get('skipCount'))).toEqual(['0', '10']);
  expect(requests.every((url) => url.searchParams.get('maxResultCount') === '10')).toBe(true);
  expect(requests.every((url) => !url.searchParams.has('academicYearId'))).toBe(true);
});

it('searches the authorized population on the server and clears the search back to the first page', async () => {
  const requests: URL[] = [];
  serveRoster(requests);
  mountRoster();
  await screen.findByText(rosterMember.memberName);
  fireEvent.change(screen.getByRole('textbox', { name: 'Search table' }), {
    target: { value: 'Maya' },
  });
  expect(await screen.findByText('Maya José')).toBeVisible();
  expect(requests.at(-1)?.searchParams.get('search')).toBe('Maya');
  expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('0');
  expect(screen.getByText(/of 1$/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(await screen.findByText(rosterMember.memberName)).toBeVisible();
  expect(requests.at(-1)?.searchParams.get('search') || '').toBe('');
});

it('shows the actual failed read and retries its server page rather than displaying a false empty roster', async () => {
  let reads = 0;
  mswServer.use(
    http.get(rosterApi, () => {
      reads += 1;
      return reads === 1
        ? HttpResponse.json({ detail: 'Member roster could not be loaded.' }, { status: 500 })
        : HttpResponse.json(rosterResponse());
    })
  );
  mountRoster();
  expect(await screen.findByText('Member roster could not be loaded.')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText(rosterMember.memberName)).toBeVisible();
  expect(reads).toBe(2);
});

it('keeps the roster and recorded-year statistics independent of a global current-year change', async () => {
  const requests: URL[] = [];
  serveRoster(requests, [rosterMember]);
  const { store } = mountRoster();
  await screen.findByText(rosterMember.memberName);
  expect(requests[0].searchParams.has('academicYearId')).toBe(false);
  await act(async () => {
    store.dispatch({ type: 'member-test/change-year' });
  });
  await waitFor(() => expect(screen.getByText(rosterMember.memberName)).toBeVisible());
  expect(requests).toHaveLength(1);
});
