import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ApplicationDecisionCard } from './application-decision-card';

const mocks = vi.hoisted(() => ({ review: vi.fn(), decisions: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('./application-admission-review', () => ({
  ApplicationAdmissionReview: (props: unknown) => {
    mocks.review(props);
    return <div>Single admission review</div>;
  },
}));
vi.mock('./use-admission-application-decisions', async (original) => ({
  ...(await original<typeof import('./use-admission-application-decisions')>()),
  useAdmissionApplicationDecisions: mocks.decisions,
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useLazyGetAdmissionApplicationQuery: () => [vi.fn()],
}));
vi.mock('./application-finalized-summary', () => ({
  ApplicationFinalizedSummary: () => <div>Saved admission summary</div>,
}));

const application = { id: 'qa-app', status: 1 } as AdmissionApplication;
it('routes compact workspaces to the single review without mounting the old decision request chain', () => {
  render(<ApplicationDecisionCard compact application={application} journeyCompleted={false} />);
  expect(screen.getByText('Single admission review')).toBeVisible();
  expect(mocks.decisions).not.toHaveBeenCalled();
  expect(mocks.review).toHaveBeenCalledWith(expect.objectContaining({ application }));
});
it('keeps the legacy read-only summary available for noncompact consumers', () => {
  mocks.decisions.mockReturnValue({
    historyQuery: {},
    finalizationPreviewQuery: {},
    isBusy: false,
  });
  render(<ApplicationDecisionCard application={{ ...application, status: 11 }} journeyCompleted />);
  expect(screen.getByText('Saved admission summary')).toBeVisible();
});
