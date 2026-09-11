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

describe('eligibility route source changes', { timeout: 15000 }, () => {
  it.each([
    [eligibilityRouteJson('ineligible'), true],
    [eligibilityRouteJson('needsInformation'), true],
    ['{"field":"application.CATEGORY","operator":"Equals","value":"transfer"}', false],
    ['{"field":"eligibility.status","operator":"NotEquals","value":"eligible"}', false],
  ] as const)(
    'clears known presets but preserves custom conditions: %s',
    async (condition, cleared) => {
      const { user, onSave } = setup(condition);
      await chooseEligibilityRouteOption(user, 'From stage *', 'Staff review');
      expect(
        screen.queryByRole('combobox', { name: 'Continue after eligibility check' })
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Save transition' }));
      await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
      const saved = onSave.mock.calls[0][0];
      expect(saved.fromStageId).toBe('review-1');
      expect(saved.isDefault).toBe(cleared);
      if (cleared) expect(saved.conditionRuleJson).toBeUndefined();
      else expect(JSON.parse(saved.conditionRuleJson)).toEqual(JSON.parse(condition));
    }
  );

  it('retains a compatible outcome preset when moving to another managed eligibility stage', async () => {
    const { user, onSave } = setup(eligibilityRouteJson('exceptionApproved'));
    await chooseEligibilityRouteOption(user, 'From stage *', 'Second eligibility check');
    expect(
      screen.getByRole('combobox', { name: 'Continue after eligibility check' })
    ).toHaveTextContent('Exception approved');
    await user.click(screen.getByRole('button', { name: 'Save transition' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const saved = onSave.mock.calls[0][0];
    expect(saved.fromStageId).toBe('eligibility-2');
    expect(saved.isDefault).toBe(false);
    expect(JSON.parse(saved.conditionRuleJson)).toEqual(
      JSON.parse(eligibilityRouteJson('exceptionApproved'))
    );
  });
});
