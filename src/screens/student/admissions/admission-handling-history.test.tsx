import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionActivityTimeline } from './admission-activity-timeline';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

it('shows the real staff name for each action without displaying an assignment or a user ID', () => {
  render(
    <AdmissionActivityTimeline
      activities={[
        {
          id: '1',
          activityType: 'InquiryCreated',
          description: 'Inquiry created',
          occurredAt: '2026-10-22T09:00:00Z',
          creatorId: 'private-user-id',
          actorName: 'Asha Sharma',
        },
        {
          id: '2',
          activityType: 'InquiryFollowUpCompleted',
          description: 'Parent contacted',
          occurredAt: '2026-10-22T10:00:00Z',
          creatorId: 'second-user-id',
          actorName: 'Ravi Patel',
        },
      ]}
      emptyDescription="No activity"
    />
  );
  expect(screen.getByText(/Handled by: Asha Sharma/)).toBeInTheDocument();
  expect(screen.getByText(/Handled by: Ravi Patel/)).toBeInTheDocument();
  expect(screen.queryByText(/private-user-id|second-user-id/)).not.toBeInTheDocument();
});

it('keeps unavailable historical actors explicit and does not invent a staff name for public actions', () => {
  render(
    <AdmissionActivityTimeline
      activities={[
        {
          id: '1',
          activityType: 'InquiryCreated',
          description: 'Public inquiry',
          occurredAt: '2026-10-22T09:00:00Z',
        },
        {
          id: '2',
          activityType: 'InquiryUpdated',
          description: 'Historical change',
          occurredAt: '2026-10-22T10:00:00Z',
          creatorId: 'removed-user',
        },
      ]}
      emptyDescription="No activity"
    />
  );
  expect(screen.getByText(/No staff recorded/)).toBeInTheDocument();
  expect(screen.getByText(/Staff name unavailable/)).toBeInTheDocument();
});

it('keeps all supplied history accessible after expanding recent activity', () => {
  render(
    <AdmissionActivityTimeline
      activities={Array.from({ length: 8 }, (_, i) => ({
        id: String(i),
        activityType: 'InquiryUpdated',
        description: `Saved action ${i}`,
        occurredAt: '2026-10-22T10:00:00Z',
        actorName: `Staff ${i}`,
      }))}
      emptyDescription="No activity"
    />
  );
  expect(screen.queryByText('Saved action 7')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show all 8 events' }));
  expect(screen.getByText('Saved action 7')).toBeInTheDocument();
});
