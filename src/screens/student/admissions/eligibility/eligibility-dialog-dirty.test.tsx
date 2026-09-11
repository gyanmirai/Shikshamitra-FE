import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
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

it('confirms discarding an exception reason without clearing the parent application dirty guard', async () => {
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        status: 'ineligible',
        canRequestException: true,
        latestEvaluation: eligibilityEvaluation,
      })
    )
  );
  const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
  vi.stubGlobal('confirm', confirm);
  const user = userEvent.setup();
  const store = renderEligibilityUi(
    <ApplicationEligibilityPanel applicationId="application-1" stage={eligibilityStage} />
  );
  store.dispatch(setIsChanges(true));
  await user.click(await screen.findByRole('button', { name: 'Request an exception' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByLabelText('Reason *'));
  await user.paste('Preserve my explanation until I choose to discard it.');
  await user.click(dialog.getByRole('button', { name: 'Cancel' }));
  expect(confirm).toHaveBeenCalledOnce();
  expect(dialog.getByLabelText('Reason *')).toHaveValue(
    'Preserve my explanation until I choose to discard it.'
  );
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  await user.click(dialog.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(confirm).toHaveBeenCalledTimes(2);
  expect(store.getState().confirmPopup.isChanges).toBe(true);
}, 15000);
