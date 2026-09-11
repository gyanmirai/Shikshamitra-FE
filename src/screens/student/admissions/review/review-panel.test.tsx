import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import {
  reviewPath,
  reviewRecord,
  reviewSummary,
} from 'src/redux/student/admissions/review-test-fixture';

import { ApplicationReviews } from './application-reviews';
import { ApplicationReviewPanel } from './application-review-panel';
import { reviewStage, renderReviewUi } from './review-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('shows stale evidence, overdue ownership and server blockers without permitting completion', async () => {
  mswServer.use(
    http.get(reviewPath, () =>
      HttpResponse.json({
        ...reviewSummary,
        isOverdue: true,
        status: 'stale',
        isStale: true,
        canSaveDraft: false,
        canSubmit: false,
        canAssign: false,
        blockers: ['Recheck the changed eligibility result.'],
        prerequisites: [{ ...reviewSummary.prerequisites[0], isStale: true }],
      })
    )
  );
  renderReviewUi(
    <ApplicationReviewPanel applicationId="application-1" stage={reviewStage} canAdvance />
  );
  expect(await screen.findByText('Overdue')).toBeInTheDocument();
  expect(screen.getByText('Reviewer: Admissions Reviewer')).toBeInTheDocument();
  expect(screen.getByText('Recheck the changed eligibility result.')).toBeInTheDocument();
  expect(screen.getByText('Changed · recheck needed')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Review and recommend' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue admission' })).toBeDisabled();
});

it('requires view permission before querying review evidence', async () => {
  const reads = vi.fn();
  mswServer.use(
    http.get(reviewPath, () => {
      reads();
      return HttpResponse.json(reviewSummary);
    })
  );
  renderReviewUi(<ApplicationReviewPanel applicationId="application-1" stage={reviewStage} />, []);
  expect(screen.getByText(/Review access is required/)).toBeInTheDocument();
  await waitFor(() => expect(reads).not.toHaveBeenCalled());
});

it('queries completed Review only when expanded, supports authorized stale re-review and loads immutable history separately', async () => {
  const reads = vi.fn();
  const historyReads = vi.fn();
  mswServer.use(
    http.get(reviewPath, () => {
      reads();
      return HttpResponse.json({
        ...reviewSummary,
        isActive: false,
        isStale: true,
        status: 'stale',
        latestRecord: reviewRecord,
      });
    }),
    http.get(`${reviewPath}/history`, () => {
      historyReads();
      return HttpResponse.json([reviewRecord]);
    })
  );
  const user = userEvent.setup();
  renderReviewUi(
    <ApplicationReviews
      applicationId="application-1"
      stages={[{ ...reviewStage, status: 2 }]}
      canAdvance
      advancing={false}
      onComplete={vi.fn()}
    />
  );
  expect(reads).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Admission review · Review records' }));
  expect(await screen.findByRole('button', { name: 'Review and recommend' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
  expect(historyReads).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Review history' }));
  await waitFor(() => expect(historyReads).toHaveBeenCalledOnce());
});

it('offers retry for a failed read and renders the current server response', async () => {
  let failed = true;
  mswServer.use(
    http.get(reviewPath, () =>
      failed ? HttpResponse.json({}, { status: 503 }) : HttpResponse.json({ data: reviewSummary })
    )
  );
  const user = userEvent.setup();
  renderReviewUi(<ApplicationReviewPanel applicationId="application-1" stage={reviewStage} />);
  const retry = await screen.findByRole('button', { name: 'Retry' });
  failed = false;
  await user.click(retry);
  expect(await screen.findByText('All eligibility criteria passed.')).toBeInTheDocument();
});
