import { it, vi, expect, describe } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PolicyAuditTimeline from './PolicyAuditTimeline';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';

vi.mock('./VersionDiffTable', () => ({
  default: ({ selectedVersion }: { selectedVersion: PolicyVersion }) => (
    <div>Recorded changes for {selectedVersion.eventId}</div>
  ),
}));

const versions: PolicyVersion[] = [
  {
    versionNumber: 3,
    eventId: 'updated',
    actor: 'Admin DDVS',
    date: '2026-10-05T10:57:00',
    createdAt: '2026-10-05T10:57:00',
    action: 'updated',
    summary: 'Policy updated',
    changedFields: [{ field: 'status', oldValue: 'Draft', newValue: 'Active' }],
  },
  {
    versionNumber: 2,
    eventId: 'activated',
    actor: 'Admin DDVS',
    date: '2026-10-05T10:52:00',
    createdAt: '2026-10-05T10:52:00',
    action: 'activated',
    summary: 'Policy activated',
    changedFields: [],
  },
  {
    versionNumber: 1,
    eventId: 'created',
    actor: 'Admin DDVS',
    date: '2026-09-30T17:43:00',
    createdAt: '2026-09-30T17:43:00',
    action: 'created',
    summary: 'Policy created',
    changedFields: [{ field: 'name', oldValue: null, newValue: 'Merit Scholarship' }],
  },
];

describe('PolicyAuditTimeline', () => {
  it('groups events by date and keeps the audit diff available after collapsing a day', async () => {
    render(
      <PolicyAuditTimeline versions={versions} valueContext={{}} policyName="Merit Scholarship" />
    );

    const dateButton = screen.getByRole('button', { name: /05-10-2026 2 events/i });
    expect(screen.getByRole('button', { name: /30-09-2026 1 event/i })).toBeInTheDocument();
    expect(screen.getByText('10:57 AM')).toBeInTheDocument();
    expect(screen.getByText('Policy updated')).toBeInTheDocument();
    expect(screen.getByText('No changes recorded')).toBeInTheDocument();

    fireEvent.click(dateButton);
    expect(dateButton).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByText('Policy updated')).not.toBeInTheDocument());

    fireEvent.click(dateButton);
    fireEvent.click(screen.getByText('Policy updated'));
    expect(screen.getByText('Recorded changes for updated')).toBeInTheDocument();
  });
});
