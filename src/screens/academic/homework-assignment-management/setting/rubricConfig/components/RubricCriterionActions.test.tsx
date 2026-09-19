import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';

import { RubricCriterionActions } from './RubricCriterionActions';

describe('RubricCriterionActions', () => {
  it('keeps the required toggle and delete action together for the criterion', async () => {
    const user = userEvent.setup();
    const onRequiredChange = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <RubricCriterionActions
        criterionNumber={2}
        isRequired
        canDelete
        onRequiredChange={onRequiredChange}
        onDelete={onDelete}
      />
    );

    const actions = screen.getByRole('group', { name: 'Criterion 2 actions' });
    const required = within(actions).getByRole('switch', { name: 'Criterion 2 required' });
    const deleteButton = within(actions).getByRole('button', { name: 'Delete criterion 2' });

    await user.click(required);
    await user.click(deleteButton);

    expect(onRequiredChange).toHaveBeenCalledWith(false);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('prevents deleting the only criterion', () => {
    renderWithProviders(
      <RubricCriterionActions
        criterionNumber={1}
        isRequired
        canDelete={false}
        onRequiredChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Delete criterion 1' })).toBeDisabled();
  });
});
