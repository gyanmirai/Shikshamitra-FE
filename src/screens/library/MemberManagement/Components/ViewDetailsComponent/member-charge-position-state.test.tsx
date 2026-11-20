import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';

import { recordMember } from './member-record-test-fixture';
import { chargeRecord } from './member-charge-position.data';
import { chargePage, chargeRoute, mountMemberCharges } from './member-charge-position.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => null,
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('skips missing/revoked owners, retries the current failure and never retains another member money', async () => {
  const requested: string[] = [];
  let fail = true;
  let releaseOther: () => void = () => {};
  const otherResponse = new Promise<void>((resolve) => {
    releaseOther = resolve;
  });
  mswServer.use(
    http.get(chargeRoute, async ({ params }) => {
      const id = String(params.memberId);
      requested.push(id);
      if (id === 'other-member') {
        await otherResponse;
        return chargePage([
          {
            ...chargeRecord,
            id: 'other-charge',
            bookTitle: 'Other member assessment',
          },
        ]);
      }
      if (fail)
        return HttpResponse.json(
          { detail: 'Member charge history could not be read.' },
          { status: 500 }
        );
      return chargePage([{ ...chargeRecord, bookTitle: 'Original member assessment' }]);
    })
  );
  const fixture = mountMemberCharges(null);
  try {
    expect(await screen.findByText(/Select a saved member/i)).toBeVisible();
    expect(requested).toEqual([]);
    fixture.rerender(fixture.changeMember(recordMember));
    expect(await screen.findByText('Member charge history could not be read.')).toBeVisible();
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('row', { name: /Original member assessment/ });
    fixture.rerender(fixture.changeMember({ ...recordMember, id: 'other-member' }));
    await waitFor(() => expect(requested).toContain('other-member'));
    expect(screen.queryByRole('row', { name: /Original member assessment/ })).toBeNull();
    releaseOther();
    await screen.findByRole('row', { name: /Other member assessment/ });
    fixture.actions.splice(0);
    await act(async () => {
      fixture.store.dispatch({
        type: 'member-charge-test/permissions-refreshed',
      });
    });
    expect(screen.getByText(/do not have permission/i)).toBeVisible();
    expect(screen.queryByRole('row', { name: /Other member assessment/ })).toBeNull();
    expect(requested).toEqual(['canonical-member', 'canonical-member', 'other-member']);
    expect(fixture.forbidden).toEqual([]);
  } finally {
    releaseOther();
  }
});
