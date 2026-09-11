import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import AdmissionReviewsScreen from '../admission-reviews';
import { renderReviewUi } from './review-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const path = '*/api/student/enrollment/admissions/reviews/queue';

it('does not query the queue when Review View is absent', async () => {
  const reads = vi.fn();
  mswServer.use(
    http.get(path, () => {
      reads();
      return HttpResponse.json({ items: [], totalCount: 0 });
    })
  );
  renderReviewUi(<AdmissionReviewsScreen />, []);
  expect(screen.getByText('Review access is required to view this queue.')).toBeInTheDocument();
  await waitFor(() => expect(reads).not.toHaveBeenCalled());
});

it('loads server pages, resets pagination when filters change, and links the real application workspace', async () => {
  const reads: Record<string, string>[] = [];
  mswServer.use(
    http.get(path, ({ request }) => {
      const params = Object.fromEntries(new URL(request.url).searchParams);
      reads.push(params);
      return HttpResponse.json({
        data: {
          totalCount: 42,
          items: [
            {
              applicationId: 'application-1',
              stageId: 'review-1',
              applicationNumber: `APP-${params.skipCount}`,
              applicantName: 'Test applicant',
              stageName: 'Admission review',
              status: 'submitted',
              assignedReviewerId: 'reviewer-1',
              assignedReviewerName: 'Reviewer',
              dueAt: '2026-09-11T08:00:00Z',
              isOverdue: true,
              isStale: false,
            },
          ],
        },
      });
    })
  );
  const user = userEvent.setup();
  renderReviewUi(<AdmissionReviewsScreen />, ['View']);
  expect(await screen.findByRole('link', { name: 'APP-0' })).toHaveAttribute(
    'href',
    '/student/admissions/applications/application-1'
  );
  await user.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(await screen.findByRole('link', { name: 'APP-20' })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Overdue only' }));
  await waitFor(() => expect(reads.at(-1)).toMatchObject({ skipCount: '0', overdueOnly: 'true' }));
  await user.click(screen.getByRole('checkbox', { name: 'Assigned to me' }));
  await waitFor(() =>
    expect(reads.at(-1)).toEqual({
      overdueOnly: 'true',
      assignedToMe: 'true',
      skipCount: '0',
      maxResultCount: '20',
    })
  );
}, 15000);
