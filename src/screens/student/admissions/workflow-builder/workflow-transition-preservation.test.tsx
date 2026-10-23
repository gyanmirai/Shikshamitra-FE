import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderConditionRoute } from './transition-condition-test-fixture';

const firstRule = { field: 'application.status', operator: 'Equals', value: 'approved' };
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
    const { onSave } = renderConditionRoute(conditionRuleJson);
    expect(screen.getByText('Its rule is preserved', { exact: false })).toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Application field *' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Continue after eligibility check' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Advanced route order' }));
    const priority = screen.getByRole('spinbutton', { name: 'Route order *' });
    await user.clear(priority);
    await user.type(priority, '4');
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toEqual({
      id: 'transition-1',
      fromStageId: 'form-1',
      toStageId: 'decision-1',
      priority: 4,
      isDefault: false,
      conditionRuleJson,
    });
  });

  it('keeps grouped application conditions attached to their source stage', async () => {
    const user = userEvent.setup();
    const { onSave } = renderConditionRoute(grouped);
    expect(screen.getByRole('heading', { name: 'Application form' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'From stage *' })).not.toBeInTheDocument();
    expect(screen.getByText('Its rule is preserved', { exact: false })).toBeVisible();
    expect(screen.queryByLabelText('Default route')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Use a condition')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      fromStageId: 'form-1',
      isDefault: false,
      conditionRuleJson: grouped,
    });
  });

  it('displays the preserved condition with no editable rule or save action for a published route', () => {
    renderConditionRoute(grouped, true);
    expect(screen.getByText('This saved condition', { exact: false })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Application form' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'From stage *' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save path' })).not.toBeInTheDocument();
  });
});
