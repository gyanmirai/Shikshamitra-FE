import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen } from '@testing-library/react';

import { CirculationDialogs } from './CirculationDialogs';
import { canonicalReturn } from './canonical-test-fixtures';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it.each([
  { loanId: 'previous-loan-id', copyId: canonicalReturn.copy.copyId },
  { loanId: canonicalReturn.loan.id, copyId: 'previous-copy-id' },
])(
  'blocks returning a different active record from selected loan $loanId and copy $copyId',
  async (target) => {
    mswServer.use(
      http.get('http://library.test/api/library/circulation/lookups/return', () =>
        HttpResponse.json(canonicalReturn)
      )
    );
    const selected = { kind: 'return' as const, accessionNo: 'scan', target };
    render(
      <CirculationDialogs
        dialog={selected}
        busy={false}
        onBusyChange={vi.fn()}
        onClose={vi.fn()}
      />,
      reservationWrapper(['Library.IssueReturn.View', 'Library.IssueReturn.Return'])
    );
    await screen.findByText(canonicalReturn.loan.id);
    expect(screen.getByRole('button', { name: 'Return' })).toBeDisabled();
  }
);
