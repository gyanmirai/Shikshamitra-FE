import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { DEFAULT_OFFER_POLICY } from 'src/redux/student/admissions/admission-offer-policy';

import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

['close', 'content-save-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const source: AdmissionWorkflowStage = {
  id: 'offer-1',
  code: 'OFFER',
  name: 'Admission offer',
  stageType: 8,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
  configurationJson: JSON.stringify({ offer: DEFAULT_OFFER_POLICY }),
};
const destination: AdmissionWorkflowStage = {
  ...source,
  id: 'enrollment-1',
  code: 'ENROLLMENT',
  name: 'Enrollment',
  stageType: 10,
  displayOrder: 1,
  isEntryStage: false,
  isTerminalStage: true,
  configurationJson: undefined,
};

function setup() {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionWorkflowTransitionDrawer
        open
        stages={[source, destination]}
        readOnly={false}
        transition={{
          id: 'transition-1',
          fromStageId: source.id,
          toStageId: destination.id,
          priority: 0,
          isDefault: true,
        }}
        onClose={onClose}
        onSave={onSave}
      />
    </ThemeProvider>
  );
  return { user: userEvent.setup(), onSave, onClose };
}

describe('guided workflow outcome routes', { timeout: 15000 }, () => {
  it('saves an offer decline using the controlled outcome rule', async () => {
    const { user, onSave } = setup();

    await user.click(screen.getByRole('combobox', { name: 'Continue when offer is' }));
    await user.click(screen.getByRole('option', { name: 'Offer declined' }));
    await user.click(screen.getByRole('button', { name: 'Save path' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].conditionRuleJson)).toEqual({
      operator: 'Equals',
      field: 'offer.status',
      value: 'declined',
    });
  });

  it('asks before closing a changed next step', async () => {
    const { user, onClose } = setup();

    await user.click(screen.getByRole('combobox', { name: 'Continue when offer is' }));
    await user.click(screen.getByRole('option', { name: 'Offer expired' }));
    await user.click(screen.getByRole('button', { name: 'Close next-step editor' }));

    expect(await screen.findByText('Discard next-step changes?')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
