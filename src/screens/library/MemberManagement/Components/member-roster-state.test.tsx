import { it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import {
  rosterApi,
  rosterRows,
  mountRoster,
  serveRoster,
  rosterMember,
  rosterLocation,
  rosterResponse,
} from './member-roster.fixture';

it('removes prior-page rows while the new server page is pending and keeps its displayed range accurate', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requestedSkips: number[] = [];
  mswServer.use(
    http.get(rosterApi, async ({ request }) => {
      const skip = Number(new URL(request.url).searchParams.get('skipCount') || 0);
      requestedSkips.push(skip);
      if (skip === 10) await pending;
      return HttpResponse.json(
        rosterResponse(rosterRows.slice(skip, skip + 10), 21, Math.floor(skip / 10) + 1)
      );
    })
  );
  mountRoster();
  await screen.findByText(rosterMember.memberName);
  fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));
  try {
    await waitFor(() => expect(requestedSkips).toContain(10));
    expect(screen.queryByText(rosterMember.memberName)).toBeNull();
    expect(screen.queryByText('Second Page Person')).toBeNull();
  } finally {
    release();
  }
  expect(await screen.findByText('Second Page Person')).toBeVisible();
  expect(screen.getByText(/11[–-]20 of 21/)).toBeVisible();
});

it('restores an explicit second-page URL through the real skip/max request and displayed page', async () => {
  rosterLocation.query = 'page=2&pageSize=10';
  const requests: URL[] = [];
  serveRoster(requests);
  mountRoster();
  expect(await screen.findByText('Second Page Person')).toBeVisible();
  expect(screen.queryByText(rosterMember.memberName)).toBeNull();
  expect(requests[0].searchParams.get('skipCount')).toBe('10');
  expect(requests[0].searchParams.get('maxResultCount')).toBe('10');
  expect(screen.getByText(/11[–-]20 of 21/)).toBeVisible();
});
