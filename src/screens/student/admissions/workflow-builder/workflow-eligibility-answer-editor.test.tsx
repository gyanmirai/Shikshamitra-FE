import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';

import {
  eligibilityForm,
  setupEligibilityEditor,
  chooseEligibilityOption,
} from './eligibility-editor-test-fixture';

describe('eligibility answer criteria', { timeout: 15000 }, () => {
  it.each([
    { comparison: 'At least', operator: 'GreaterThanOrEqual', input: '75', role: 'spinbutton' },
    { comparison: 'Is one of', operator: 'In', input: '80, 90', role: 'textbox' },
  ])(
    'saves a published numeric field using $comparison',
    async ({ comparison, operator, input, role }) => {
      const user = userEvent.setup();
      const { onSave } = await setupEligibilityEditor();
      await user.click(screen.getByRole('radio', { name: 'Check eligibility rules' }));
      await user.click(screen.getByRole('button', { name: 'Add eligibility criterion' }));
      const dialog = screen.getByRole('dialog', { name: 'Configure eligibility criterion' });
      await user.click(within(dialog).getByRole('textbox', { name: 'Criterion name *' }));
      await user.paste('Previous marks');
      await chooseEligibilityOption(
        user,
        'What should be checked?',
        'Application answers or previous marks'
      );
      await chooseEligibilityOption(
        user,
        'Published form for answer choices',
        'Application form · v1'
      );
      await waitFor(() =>
        expect(
          within(dialog).getByRole('combobox', { name: 'Applicant answer or fact' })
        ).toBeEnabled()
      );
      await user.click(within(dialog).getByRole('combobox', { name: 'Applicant answer or fact' }));
      expect(screen.queryByRole('option', { name: 'Information only' })).not.toBeInTheDocument();
      await user.click(await screen.findByRole('option', { name: 'Previous marks' }));
      await chooseEligibilityOption(user, 'Comparison', comparison);
      await user.type(within(dialog).getByRole(role, { name: 'Comparison value' }), input);
      await user.click(within(dialog).getByRole('button', { name: 'Save criterion' }));
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Configure eligibility criterion' })
        ).not.toBeInTheDocument()
      );
      await user.click(screen.getByRole('button', { name: 'Apply changes' }));
      await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
      const criterion = JSON.parse(onSave.mock.calls[0][0].configurationJson).eligibility
        .criteria[0];
      expect(criterion).toMatchObject({
        kind: 'application',
        formDefinitionId: eligibilityForm.id,
      });
      expect(JSON.parse(criterion.conditionJson)).toEqual({
        field: 'application.PERCENTAGE',
        operator,
        value: input,
      });
      expect(criterion.minAgeMonths).toBeNull();
    }
  );

  it('keeps criterion changes when discard is declined', async () => {
    const user = userEvent.setup();
    const { onSave } = await setupEligibilityEditor();
    await user.click(screen.getByRole('radio', { name: 'Check eligibility rules' }));
    await user.click(screen.getByRole('button', { name: 'Add eligibility criterion' }));
    const dialog = screen.getByRole('dialog', { name: 'Configure eligibility criterion' });
    await user.type(within(dialog).getByRole('textbox', { name: 'Criterion name *' }), 'Keep');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    const confirm = screen.getByRole('dialog', { name: 'Discard criterion changes?' });
    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Discard criterion changes?' })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByRole('textbox', { name: 'Criterion name *' })).toHaveValue('Keep');
    expect(onSave).not.toHaveBeenCalled();
  });
});
