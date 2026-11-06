import { it, vi, expect } from 'vitest';
import { screen } from '@testing-library/react';

import { InquiryTimeline } from './inquiry-timeline';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useGetAdmissionInquiryTimelineQuery: () => ({
    currentData: [],
    isLoading: false,
    isError: false,
  }),
}));

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
