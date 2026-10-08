import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import { DEFAULT_ELIGIBILITY_POLICY } from 'src/redux/student/admissions/admission-eligibility-policy';

import { setupEligibilityEditor, chooseEligibilityOption } from './eligibility-editor-test-fixture';

describe('eligibility stage setup', { timeout: 15000 }, () => {
  it('keeps legacy completion and disables managed setup when the backend lacks support', async () => {
    const user = userEvent.setup();
    const { onSave } = await setupEligibilityEditor(undefined, false, false);
    expect(screen.getByRole('radio', { name: 'Complete manually' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Check eligibility rules' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].configurationJson).toBeUndefined();
  });

  it('requires valid age criteria and saves optional exception reviewer settings', async () => {
    const user = userEvent.setup();
    const { onSave } = await setupEligibilityEditor();
    await user.click(screen.getByRole('radio', { name: 'Check eligibility rules' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Add eligibility criterion' }));
    const dialog = screen.getByRole('dialog', { name: 'Configure eligibility criterion' });
    await user.click(within(dialog).getByRole('button', { name: 'Save criterion' }));
    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent('criterion name')
    );
    await user.click(within(dialog).getByRole('textbox', { name: 'Criterion name *' }));
    await user.paste('Age requirement');
    await user.type(within(dialog).getByRole('spinbutton', { name: 'Minimum age years' }), '5');
    fireEvent.change(within(dialog).getByRole('textbox', { name: /Age cutoff date/i }), {
      target: { value: '01-04-2027' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save criterion' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure eligibility criterion' })
      ).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('switch', { name: 'Allow authorized exception requests' }));
    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Exception approval role (optional)' })
      ).toBeEnabled()
    );
    await chooseEligibilityOption(user, 'Exception approval role (optional)', 'Admissions lead');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const policy = JSON.parse(onSave.mock.calls[0][0].configurationJson).eligibility;
    expect(policy).toMatchObject({
      enabled: true,
      allowExceptions: true,
      requireIndependentReviewer: true,
      exceptionApprovalRole: 'Admissions lead',
    });
    expect(policy.criteria[0]).toMatchObject({
      minAgeMonths: 60,
      cutoffDate: '2027-04-01',
      name: 'Age requirement',
    });
  });

  it('allows viewing a published criterion without exposing save controls', async () => {
    const policy = {
      ...DEFAULT_ELIGIBILITY_POLICY,
      criteria: [
        {
          code: 'AGE',
          name: 'Age requirement',
          kind: 'age',
          minAgeMonths: 60,
          cutoffDate: '2027-04-01',
        },
      ],
    };
    const user = userEvent.setup();
    const { onSave } = await setupEligibilityEditor(JSON.stringify({ eligibility: policy }), true);
    await user.click(screen.getByRole('button', { name: 'View Age requirement' }));
    const dialog = screen.getByRole('dialog', { name: 'Eligibility criterion' });
    expect(within(dialog).getByRole('spinbutton', { name: 'Minimum age years' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save criterion' })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
