import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import {
  eligibilityPath,
  eligibilitySummary,
  eligibilityEvaluation,
} from 'src/redux/student/admissions/eligibility-test-fixture';

import { ApplicationEligibility } from './application-eligibility';
import { ApplicationEligibilityPanel } from './application-eligibility-panel';
import { eligibilityStage, renderEligibilityUi } from './eligibility-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('loads visited eligibility and earlier evaluations only when their history is expanded', async () => {
  let reads = 0;
  let historyReads = 0;
  mswServer.use(
    http.get(eligibilityPath, () => {
      reads += 1;
      return HttpResponse.json({
        ...eligibilitySummary,
        isActive: false,
        canEvaluate: false,
        latestEvaluation: eligibilityEvaluation,
      });
    }),
    http.get(`${eligibilityPath}/history`, () => {
      historyReads += 1;
      return HttpResponse.json([
        {
          ...eligibilityEvaluation,
          id: 'evaluation-old',
          sequenceNumber: 0,
          criteria: [{ ...eligibilityEvaluation.criteria[0], name: 'Earlier age check' }],
        },
        eligibilityEvaluation,
      ]);
    })
  );
  const user = userEvent.setup();
  renderEligibilityUi(
    <ApplicationEligibility
      applicationId="application-1"
      stages={[{ ...eligibilityStage, status: 2 }]}
      canAdvance
      advancing={false}
      onComplete={vi.fn()}
    />
  );
  expect(reads).toBe(0);
  await user.click(
    screen.getByRole('button', { name: /Admission eligibility · Eligibility history/ })
  );
  expect(await screen.findByText('Minimum age')).toBeInTheDocument();
  expect(historyReads).toBe(0);
  expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Eligibility check history' }));
  expect(await screen.findByText('Earlier age check')).toBeInTheDocument();
  await waitFor(() => expect(historyReads).toBe(1));
}, 15000);

it('allows the server-approved recheck of a stale visited stage without offering workflow advancement', async () => {
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        isActive: false,
        isStale: true,
        status: 'eligible',
        canEvaluate: true,
        canComplete: false,
        latestEvaluation: { ...eligibilityEvaluation, outcome: 'eligible', isStale: true },
      })
    )
  );
  renderEligibilityUi(
    <ApplicationEligibilityPanel
      applicationId="application-1"
      stage={{ ...eligibilityStage, status: 2 }}
      historical
      canAdvance
    />
  );
  expect(await screen.findByText(/Applicant information has changed/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Check eligibility again' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
});

it('does not query or expose eligibility data without view permission', () => {
  renderEligibilityUi(
    <ApplicationEligibilityPanel applicationId="application-1" stage={eligibilityStage} />,
    ['Evaluate']
  );
  expect(screen.getByText(/Eligibility access is required/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Check eligibility/ })).not.toBeInTheDocument();
});
