import type { AdmissionOfferStage } from 'src/redux/student/admissions/admission-offer-types';

import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { OfferActionDialog } from './offer-action-dialog';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

const state = {
  applicationId: 'application-1',
  admissionOfferingId: 'offering-1',
  stageId: 'offer-stage-1',
  assignedCounsellorId: null,
  assignedCounsellorName: null,
  policy: { validityDays: 14, allowExpiryOverride: true },
} as AdmissionOfferStage;

it('issues an offer without changing the journey counsellor', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  renderDocumentUi(
    <OfferActionDialog
      action="issue"
      state={{
        ...state,
        assignedCounsellorId: 'existing-counsellor',
        assignedCounsellorName: 'Existing Counsellor',
      }}
      busy={false}
      onClose={vi.fn()}
      onSubmit={onSubmit}
    />
  );

  expect(screen.queryByRole('combobox', { name: /Admission counsellor/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Issue offer' }));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      expect.not.objectContaining({ counsellorId: expect.anything() })
    )
  );
});
