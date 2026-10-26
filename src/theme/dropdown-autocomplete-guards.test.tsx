import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '@testing-library/react';

import { DropdownFixture } from './dropdown-autocomplete-keyboard-test-fixture';

describe('autocomplete activation guards', () => {
  it('does not select on Enter during composition even without legacy key code 229', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture />);
    const input = screen.getByRole('combobox', { name: 'Tree' });
    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('No selection');
  });

  it('does not toggle a multi-select option again on repeated Enter keydown', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture multiple />);
    const input = screen.getByRole('combobox', { name: 'Tree' });
    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    fireEvent.keyDown(input, { key: 'Enter', repeat: true });
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('Maple');
  });
});
