import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderConditionRoute } from './transition-condition-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

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
    expect(screen.queryByRole('textbox', { name: 'Application Field *' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Continue After Eligibility Check' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Advanced Route Order' }));
    const priority = screen.getByRole('spinbutton', { name: 'Route Order *' });
    await user.clear(priority);
    await user.type(priority, '4');
    await user.click(screen.getByRole('button', { name: 'Save Path' }));
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
    expect(screen.getByRole('button', { name: 'About What Happens Next?' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'From Stage *' })).not.toBeInTheDocument();
    expect(screen.getByText('Its rule is preserved', { exact: false })).toBeVisible();
    expect(screen.queryByLabelText('Default Route')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Use a condition')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save Path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      fromStageId: 'form-1',
      isDefault: false,
      conditionRuleJson: grouped,
    });
  });

  it('shows a named read-only published route with saved facts, help and one clean Close action', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = renderConditionRoute(grouped, true);
    expect(screen.getByRole('dialog', { name: 'Next-step Details' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Next-step Details', level: 2 })).toBeVisible();
    expect(screen.getByRole('button', { name: 'About Next-step Details' })).toBeVisible();
    expect(screen.getByText('Application form')).toBeVisible();
    expect(screen.getByText('Decision')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Route Details information' })).toBeVisible();
    expect(
      screen.getByRole('dialog', { name: 'Next-step Details' }).querySelector('pre')?.textContent
    ).toBe(grouped);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Path' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
