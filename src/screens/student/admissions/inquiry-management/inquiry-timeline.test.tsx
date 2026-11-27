import { it, vi, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

import { InquiryTimeline } from './inquiry-timeline';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

const { useInquiryTimeline } = vi.hoisted(() => ({ useInquiryTimeline: vi.fn() }));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useGetAdmissionInquiryTimelineQuery: useInquiryTimeline,
}));

beforeEach(() => {
  useInquiryTimeline.mockReset();
  useInquiryTimeline.mockReturnValue({
    currentData: [],
    isLoading: false,
    isError: false,
  });
});

it('explains the read-only handling timeline through the shared section information control', () => {
  renderDocumentUi(<InquiryTimeline inquiryId="inquiry-1" />);
  expect(screen.getByRole('heading', { name: 'Timeline and Communications' })).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Timeline and Communications information' })
  ).toBeVisible();
  expect(
    screen.getByText('Contact notes, follow-ups and communications will appear here.')
  ).toBeVisible();
});

it('keeps the heading and shows the timeline loading state before the inquiry has activity', () => {
  useInquiryTimeline.mockReturnValue({ isFetching: true });
  renderDocumentUi(<InquiryTimeline inquiryId="inquiry-1" />);

  expect(screen.getByRole('heading', { name: 'Timeline and Communications' })).toBeVisible();
  expect(screen.getByRole('status', { name: 'Loading inquiry timeline' })).toBeVisible();
  expect(
    screen.queryByText('Contact notes, follow-ups and communications will appear here.')
  ).toBeNull();
});

it('shows the five newest events and lets staff reveal older records', () => {
  useInquiryTimeline.mockReturnValue({
    currentData: Array.from({ length: 6 }, (_, index) => ({
      id: `event-${index}`,
      activityType: 'NoteAdded',
      description: `Contact note ${index + 1}`,
      occurredAt: `2026-10-22T09:0${index}:00Z`,
      actorName: 'Asha Sharma',
    })),
  });
  renderDocumentUi(<InquiryTimeline inquiryId="inquiry-1" />);

  expect(screen.getByText('Contact note 6')).toBeVisible();
  expect(screen.queryByText('Contact note 1')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show all 6 events' }));
  expect(screen.getByText('Contact note 1')).toBeVisible();
});
