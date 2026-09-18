import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { eligibilityRouteJson, renderEligibilityRoute } from './eligibility-route-test-fixture';

function setup(conditionRuleJson?: string) {
  return { user: userEvent.setup(), ...renderEligibilityRoute(conditionRuleJson) };
}

describe('eligibility route source ownership', { timeout: 15000 }, () => {
  it.each([
    [eligibilityRouteJson('ineligible')],
    [eligibilityRouteJson('needsInformation')],
    ['{"field":"application.CATEGORY","operator":"Equals","value":"transfer"}'],
    ['{"field":"eligibility.status","operator":"NotEquals","value":"eligible"}'],
  ] as const)('keeps the path attached to the stage that owns it: %s', async (condition) => {
    const { user, onSave } = setup(condition);
    expect(screen.getByRole('heading', { name: 'Eligibility check' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'From stage *' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const saved = onSave.mock.calls[0][0];
    expect(saved.fromStageId).toBe('eligibility-1');
    expect(saved.isDefault).toBe(false);
    expect(JSON.parse(saved.conditionRuleJson)).toEqual(JSON.parse(condition));
  });

  it('retains a compatible eligibility outcome preset', async () => {
    const condition = eligibilityRouteJson('exceptionApproved');
    const { user, onSave } = setup(condition);
    expect(
      screen.getByRole('combobox', { name: 'Continue after eligibility check' })
    ).toHaveTextContent('Exception approved');
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const saved = onSave.mock.calls[0][0];
    expect(saved.fromStageId).toBe('eligibility-1');
    expect(saved.isDefault).toBe(false);
    expect(JSON.parse(saved.conditionRuleJson)).toEqual(JSON.parse(condition));
  });
});
