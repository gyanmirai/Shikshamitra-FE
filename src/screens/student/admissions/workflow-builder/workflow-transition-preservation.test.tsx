import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import {
  renderEligibilityRoute,
  chooseEligibilityRouteOption,
} from './eligibility-route-test-fixture';

const firstRule = { field: 'eligibility.status', operator: 'Equals', value: 'eligible' };
const secondRule = { field: 'application.CATEGORY', operator: 'Equals', value: 'transfer' };
const grouped = JSON.stringify({ operator: 'ALL', conditions: [firstRule, secondRule] }, null, 2);

describe('saved transition condition preservation', { timeout: 15000 }, () => {
  it.each([
    ['ALL group', grouped],
    ['ANY group', JSON.stringify({ operator: 'ANY', conditions: [firstRule, secondRule] })],
    ['unknown operator', JSON.stringify({ ...firstRule, operator: 'FutureOperator' })],
    ['extra rule metadata', JSON.stringify({ ...firstRule, caseSensitive: true })],
    ['non-string comparison', JSON.stringify({ ...secondRule, value: 42 })],
    ['malformed saved JSON', '{"operator":"All",'],
  ])('preserves exact %s when editing route priority', async (_, conditionRuleJson) => {
    const user = userEvent.setup();
    const { onSave } = renderEligibilityRoute(conditionRuleJson);
    expect(screen.getByRole('alert')).toHaveTextContent('Its rule is preserved');
    expect(screen.queryByRole('textbox', { name: 'Application field *' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Continue after eligibility check' })
    ).not.toBeInTheDocument();
    const priority = screen.getByRole('spinbutton', { name: 'Priority *' });
    await user.clear(priority);
    await user.type(priority, '4');
    await user.click(screen.getByRole('button', { name: 'Save transition' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toEqual({
      id: 'transition-1',
      fromStageId: 'eligibility-1',
      toStageId: 'offer-1',
      priority: 4,
      isDefault: false,
      conditionRuleJson,
    });
  });

  it('keeps grouped eligibility conditions when changing the source without exposing a default toggle', async () => {
    const user = userEvent.setup();
    const { onSave } = renderEligibilityRoute(grouped);
    await chooseEligibilityRouteOption(user, 'From stage *', 'Staff review');
    expect(screen.getByRole('alert')).toHaveTextContent('Its rule is preserved');
    expect(screen.queryByLabelText('Default route')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Use a condition')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save transition' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      fromStageId: 'review-1',
      isDefault: false,
      conditionRuleJson: grouped,
    });
  });

  it('displays the preserved condition with no editable rule or save action for a published route', () => {
    renderEligibilityRoute(grouped, true);
    expect(screen.getByRole('alert')).toHaveTextContent('This saved condition');
    expect(screen.getByRole('combobox', { name: 'From stage *' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.queryByRole('button', { name: 'Save transition' })).not.toBeInTheDocument();
  });
});
