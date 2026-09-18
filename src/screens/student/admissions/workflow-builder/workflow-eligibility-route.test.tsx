import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import {
  eligibilityRouteJson,
  renderEligibilityRoute,
  chooseEligibilityRouteOption,
} from './eligibility-route-test-fixture';

function setup(conditionRuleJson?: string) {
  return { user: userEvent.setup(), ...renderEligibilityRoute(conditionRuleJson) };
}

describe('eligibility route presets', { timeout: 15000 }, () => {
  it.each([
    ['Meets all configured criteria', 'eligible'],
    ['Exception approved', 'exceptionApproved'],
    ['Does not meet the criteria — send for review', 'ineligible'],
    ['More information needed — send for correction', 'needsInformation'],
  ])('serializes %s as an explicit authoritative outcome condition', async (label, outcome) => {
    const { user, onSave } = setup();
    await chooseEligibilityRouteOption(user, 'Continue after eligibility check', label);
    expect(screen.queryByRole('textbox', { name: 'Application field *' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toEqual({
      id: 'transition-1',
      fromStageId: 'eligibility-1',
      toStageId: 'offer-1',
      priority: 0,
      isDefault: false,
      conditionRuleJson: JSON.stringify({
        operator: 'Equals',
        field: 'eligibility.status',
        value: outcome,
      }),
    });
  });

  it('reopens an ineligible route and restores a default route explicitly labelled for eligible or approved outcomes', async () => {
    const { user, onSave } = setup(eligibilityRouteJson('ineligible'));
    expect(
      screen.getByRole('combobox', { name: 'Continue after eligibility check' })
    ).toHaveTextContent('Does not meet the criteria');
    await chooseEligibilityRouteOption(
      user,
      'Continue after eligibility check',
      'Eligible or approved exception (default route)'
    );
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      isDefault: true,
      conditionRuleJson: undefined,
    });
  });

  it('reopens and preserves a custom application condition', async () => {
    const condition = { operator: 'Equals', field: 'application.CATEGORY', value: 'transfer' };
    const { user, onSave } = setup(JSON.stringify(condition));
    expect(
      screen.getByRole('combobox', { name: 'Continue after eligibility check' })
    ).toHaveTextContent('Another condition');
    expect(screen.getByRole('textbox', { name: 'Application field *' })).toHaveValue(
      'application.CATEGORY'
    );
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].conditionRuleJson)).toEqual(condition);
  });

  it('keeps the outcome selector disabled for published read-only transitions', () => {
    renderEligibilityRoute(eligibilityRouteJson('exceptionApproved'), true);
    expect(
      screen.getByRole('combobox', { name: 'Continue after eligibility check' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('button', { name: 'Save path' })).not.toBeInTheDocument();
  });
});
