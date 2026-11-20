import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MemberProfile } from './MemberProfile';

import type { IMember } from './type';

vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

const member: IMember = {
  id: 'member-id',
  name: 'Real Member',
  memberIdentifier: 'LIB-009',
  role: 'Staff',
  currentIssue: 0,
  overdueReturn: 0,
  overdueClassificationAvailable: true,
  overdueDateSource: 'ConfirmedLibraryClock',
  overdueAsOfDate: '2026-11-18',
  reservedBooks: 0,
  memberStatus: 'Active',
};

describe('member profile facts', () => {
  it('preserves genuine zero counts and omits irrelevant student identity for staff', () => {
    render(<MemberProfile member={member} />);
    expect(screen.getByText('LIB-009')).toBeInTheDocument();
    expect(screen.getByText('Overdue books').parentElement).toHaveTextContent('Overdue books0');
    expect(screen.getByText('Reserved books').parentElement).toHaveTextContent('Reserved books0');
    expect(screen.queryByText('Class/division')).not.toBeInTheDocument();
    expect(screen.queryByText('GR43')).not.toBeInTheDocument();
  });

  it('shows a missing value instead of a fictional roll number or contact', () => {
    render(<MemberProfile member={{ ...member, role: 'Student' }} />);
    expect(screen.getByText('Roll number').parentElement).toHaveTextContent('Roll number—');
    expect(screen.getByText('Contact number').parentElement).toHaveTextContent('Contact number—');
  });
});
