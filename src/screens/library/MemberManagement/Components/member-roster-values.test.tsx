import { it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { fDate } from 'src/utils/format-time';
import { mswServer } from 'src/test/mswServer';
import { screen, within, fireEvent } from '@testing-library/react';

import {
  rosterApi,
  mountRoster,
  serveRoster,
  rosterMember,
  rosterResponse,
} from './member-roster.fixture';

it('displays the actual printed member identifier and whole class label while passing canonical identity to View', async () => {
  serveRoster([], [rosterMember]);
  const { onView } = mountRoster();
  const row = await screen.findByRole('row', { name: new RegExp(rosterMember.memberName) });
  expect(within(row).getByText(rosterMember.memberIdentifier)).toBeVisible();
  expect(within(row).queryByText(rosterMember.id)).toBeNull();
  expect(within(row).getByText(rosterMember.classDivision)).toBeVisible();
  fireEvent.click(within(row).getByRole('button', { name: /View/i }));
  expect(onView).toHaveBeenCalledOnce();
  expect(onView.mock.calls[0][0]).toMatchObject({ id: rosterMember.id, memberId: rosterMember.id });
});

it('does not turn unavailable overdue evidence into a known zero in the actual roster cell', async () => {
  mswServer.use(
    http.get(rosterApi, () =>
      HttpResponse.json(
        rosterResponse([
          {
            ...rosterMember,
            statistics: { currentIssue: 2, overdueReturnBooks: 0, reservedBooks: 1 },
          },
        ])
      )
    )
  );
  mountRoster();
  const row = await screen.findByRole('row', { name: new RegExp(rosterMember.memberName) });
  expect(within(row).getByText('Not classified')).toBeVisible();
  expect(within(row).queryByRole('cell', { name: '0' })).toBeNull();
});

it('retains the confirmed overdue subset and explicit school-date/unknown-date evidence', async () => {
  serveRoster(
    [],
    [
      {
        ...rosterMember,
        statistics: {
          ...rosterMember.statistics,
          overdueReturnBooks: 1,
          overdueClassificationAvailable: false,
          unknownDueDateCount: 1,
        },
      },
    ]
  );
  mountRoster();
  const row = await screen.findByRole('row', { name: new RegExp(rosterMember.memberName) });
  expect(within(row).getByText('1 confirmed overdue')).toBeVisible();
  expect(within(row).getByText('1 due date needs review')).toBeVisible();
  expect(within(row).getByText(new RegExp(fDate('2026-11-18')!))).toBeVisible();
});

it('retains Columns without offering a loaded-page export or unsupported global column controls', async () => {
  serveRoster([], [rosterMember]);
  mountRoster();
  await screen.findByText(rosterMember.memberName);
  expect(screen.getByRole('button', { name: /Columns/i })).toBeEnabled();
  expect(screen.queryByRole('button', { name: /Export/i })).toBeNull();
  expect(screen.queryByRole('button', { name: /^Filter /i })).toBeNull();
});
