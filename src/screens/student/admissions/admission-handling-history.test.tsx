import { it, vi, expect } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

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
  const expand = screen.getByRole('button', { name: 'Show all 8 events' });
  expect(expand).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(expand);
  expect(screen.getByText('Saved action 7')).toBeInTheDocument();
  const collapse = screen.getByRole('button', { name: 'Show recent activity' });
  expect(collapse).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(collapse);
  expect(screen.queryByText('Saved action 7')).not.toBeInTheDocument();
});

it('groups events by date and shows the newest event and its timestamp first', () => {
  const olderAt = '2026-10-21T09:00:00Z';
  const newestAt = '2026-10-22T10:00:00Z';
  render(
    <AdmissionActivityTimeline
      activities={[
        {
          id: 'old',
          activityType: 'InquiryCreated',
          description: 'Older event',
          occurredAt: olderAt,
        },
        {
          id: 'new',
          activityType: 'ApplicationSubmitted',
          description: 'Application submitted',
          occurredAt: newestAt,
        },
        {
          id: 'middle',
          activityType: 'InquiryUpdated',
          description: 'Earlier event',
          occurredAt: '2026-10-22T08:00:00Z',
        },
      ]}
      emptyDescription="No activity"
    />
  );

  const list = screen.getByRole('list', { name: 'Admission activity' });
  const events = within(list).getAllByRole('listitem');
  expect(events[0]).toHaveTextContent('Application submitted');
  expect(events[0].querySelector('time')).toHaveAttribute('datetime', newestAt);
  expect(events[1]).toHaveTextContent('Earlier event');
  expect(events[2].querySelector('time')).toHaveAttribute('datetime', olderAt);
  expect(within(list).getByText('22 Oct 2026')).toBeVisible();
  expect(within(list).getByText('21 Oct 2026')).toBeVisible();
  expect(within(events[0]).getAllByText('Application submitted')).toHaveLength(1);
  const connectors = list.querySelectorAll('.MuiTimelineConnector-root');
  expect(connectors).toHaveLength(1);
  expect(connectors[0]).toHaveStyle({ width: '1px' });
});
