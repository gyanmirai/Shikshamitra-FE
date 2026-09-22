import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import {
  eligibilityPath,
  eligibilitySummary,
  eligibilityEvaluation,
} from 'src/redux/student/admissions/eligibility-test-fixture';

import { ApplicationEligibilityPanel } from './application-eligibility-panel';
import { eligibilityStage, renderEligibilityUi } from './eligibility-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('checks saved information explicitly, shows the evidence, and waits for staff to continue', async () => {
  let evaluated = false;
  let historyReads = 0;
  let submitted: unknown;
  const passed = {
    ...eligibilityEvaluation,
    outcome: 'eligible',
    criteria: [{ ...eligibilityEvaluation.criteria[0], outcome: 'passed', actual: '65 months' }],
  };
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        status: evaluated ? 'eligible' : 'notChecked',
        latestEvaluation: evaluated ? passed : null,
        canComplete: evaluated,
        blockers: evaluated ? [] : eligibilitySummary.blockers,
      })
    ),
    http.get(`${eligibilityPath}/history`, () => {
      historyReads += 1;
      return HttpResponse.json([]);
    }),
    http.post(`${eligibilityPath}/evaluate`, async ({ request }) => {
      submitted = await request.json();
      evaluated = true;
      return HttpResponse.json({ ...eligibilitySummary, latestEvaluation: passed });
    })
  );
  const onComplete = vi.fn();
  const user = userEvent.setup();
  renderEligibilityUi(
    <ApplicationEligibilityPanel
      applicationId="application-1"
      stage={eligibilityStage}
      canAdvance
      onComplete={onComplete}
    />
  );
  expect(await screen.findByText('Not checked')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue admission' })).toBeDisabled();
  expect(evaluated).toBe(false);
  expect(historyReads).toBe(0);
  await user.click(screen.getByRole('button', { name: 'Check eligibility' }));
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Check eligibility' })
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(submitted).toEqual({ concurrencyStamp: 'application-stamp' });
  expect(await screen.findByText('Recorded value: 65 months')).toBeInTheDocument();
  expect(screen.getByText(/Expected: At least 60 months/)).toBeInTheDocument();
  expect(screen.getByText('Source: Applicant date of birth')).toBeInTheDocument();
  expect(onComplete).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Continue admission' }));
  expect(onComplete).toHaveBeenCalledWith();
}, 15000);

it('shows missing-information blockers and respects server action availability', async () => {
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        status: 'needsInformation',
        canEvaluate: false,
        canRequestException: false,
        blockers: ['Add the applicant date of birth before checking again.'],
        latestEvaluation: {
          ...eligibilityEvaluation,
          outcome: 'needsInformation',
          criteria: [
            {
              ...eligibilityEvaluation.criteria[0],
              outcome: 'unknown',
              actual: '',
              message: 'Date of birth is missing.',
            },
          ],
        },
      })
    )
  );
  renderEligibilityUi(
    <ApplicationEligibilityPanel
      applicationId="application-1"
      stage={eligibilityStage}
      canAdvance
    />
  );
  expect(await screen.findByText('Date of birth is missing.')).toBeInTheDocument();
  expect(screen.getByText('Recorded value: Not provided')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Check eligibility/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Request an exception' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue admission' })).toBeDisabled();
});

it('allows an explicit server-approved review route for an ineligible result without making an admission decision', async () => {
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        status: 'ineligible',
        canComplete: true,
        blockers: [],
        latestEvaluation: eligibilityEvaluation,
      })
    )
  );
  const onComplete = vi.fn();
  const user = userEvent.setup();
  renderEligibilityUi(
    <ApplicationEligibilityPanel
      applicationId="application-1"
      stage={eligibilityStage}
      canAdvance
      onComplete={onComplete}
    />
  );
  expect(await screen.findByText(/configured review route/)).toBeInTheDocument();
  expect(onComplete).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Continue admission' }));
  expect(onComplete).toHaveBeenCalledWith();
});
