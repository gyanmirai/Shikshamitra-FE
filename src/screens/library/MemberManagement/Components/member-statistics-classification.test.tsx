import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fDate } from 'src/utils/format-time';
import { mapLibraryMemberDto } from 'src/redux/library/library-adapters';

import { MemberProfile } from './MemberProfile';
import { IssueMemberDetails } from '../../circulation/IssueMemberDetails';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
const member = {
  id: 'member-id',
  memberName: 'Real Member',
  role: 'Staff',
  statistics: { currentIssue: 0, overdueReturnBooks: 0, reservedBooks: 0 },
};

it('does not present an older response without classification evidence as a known overdue zero', () => {
  render(<MemberProfile member={mapLibraryMemberDto(member)} />);
  expect(screen.getByText('Overdue books').parentElement).toHaveTextContent('Not classified');
});

it('preserves the confirmed overdue subset while exposing due dates that still need review', () => {
  render(
    <MemberProfile
      member={mapLibraryMemberDto({
        ...member,
        statistics: {
          ...member.statistics,
          currentIssue: 2,
          overdueReturnBooks: 1,
          overdueClassificationAvailable: false,
          unknownDueDateCount: 1,
          overdueAsOfDate: '2026-11-18',
          overdueDateSource: 'ConfirmedLibraryClock',
          overdueUnavailableReason: 'Some open loans have unconfirmed due dates.',
        },
      })}
    />
  );
  expect(screen.getByText('Overdue books').parentElement).toHaveTextContent('1 confirmed overdue');
  expect(screen.getByText('Overdue books').parentElement).toHaveTextContent(/1.*review/);
});

it('shows unavailable classification in the owning issue borrower view without inventing a zero', () => {
  render(<IssueMemberDetails member={{ ...member, role: 1, isEligibleForIssue: true }} />);
  expect(screen.getByText('Overdue books').parentElement).toHaveTextContent('Not classified');
});

it('identifies the school as-of date of a complete count instead of presenting an undated current total', () => {
  render(
    <MemberProfile
      member={mapLibraryMemberDto({
        ...member,
        statistics: {
          ...member.statistics,
          overdueClassificationAvailable: true,
          unknownDueDateCount: 0,
          overdueAsOfDate: '2026-11-18',
          overdueDateSource: 'ConfirmedLibraryClock',
        },
      })}
    />
  );
  expect(screen.getByText('Overdue books').parentElement).toHaveTextContent(fDate('2026-11-18')!);
});
