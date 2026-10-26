import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '@testing-library/react';

import { DropdownFixture } from './dropdown-autocomplete-keyboard-test-fixture';

describe('themed autocomplete keyboard selection', () => {
  it('continues arrow navigation when the arrow key is held', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture />);
    const input = screen.getByRole('combobox', { name: 'Tree' });
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    fireEvent.keyDown(input, { key: 'ArrowDown', repeat: true });
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('Maple');
  });

  it.each([' ', '{Tab}'])(
    'selects with %s when typing is disabled on a selectable input',
    async (key) => {
      const user = userEvent.setup();
      render(<DropdownFixture readOnlyInput />);
      await user.click(screen.getByRole('combobox', { name: 'Tree' }));
      await user.keyboard('{ArrowDown}{ArrowDown}');
      await user.keyboard(key);
      expect(screen.getByLabelText('Selected tree')).toHaveTextContent('Maple');
    }
  );

  it('keeps a selected multi-select option when leaving with Tab', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture multiple />);
    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard('{ArrowDown}{ArrowDown} ');
    await user.keyboard('{Tab}');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('Maple');
    expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
  });

  it.each([
    ['Spacebar', ' '],
    ['Enter', '{Enter}'],
    ['Tab', '{Tab}'],
  ])('selects the highlighted option with %s without submitting', async (_label, key) => {
    const user = userEvent.setup();
    render(<DropdownFixture />);
    const input = screen.getByRole('combobox', { name: 'Tree' });

    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.keyboard(key);

    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('Maple');
    expect(screen.getByLabelText('Submitted')).toHaveTextContent('no');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    if (key === '{Tab}') {
      expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
    }
  });

  it('selects a checkbox option with Spacebar while retaining the multi-select popup', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture multiple />);

    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard('{ArrowDown}{ArrowDown} ');

    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('Maple');
    expect(screen.getByRole('option', { name: 'Maple' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('listbox')).toBeVisible();
  });

  it('allows spaces in a search query even when the first result is auto-highlighted', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture autoHighlight />);
    const input = screen.getByRole('combobox', { name: 'Tree' });

    await user.type(input, 'Red O');

    expect(input).toHaveValue('Red O');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('No selection');
    expect(screen.getByRole('option', { name: 'Red Oak' })).toBeVisible();
  });

  it('does not select a highlighted disabled option', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture disabledFirst />);

    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard('{ArrowDown} ');

    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('No selection');
    expect(screen.getByLabelText('Submitted')).toHaveTextContent('no');
  });

  it('moves backward with Shift+Tab without committing the highlighted option', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture />);

    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard('{ArrowDown}{ArrowDown}{Shift>}{Tab}{/Shift}');

    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('No selection');
    expect(screen.getByRole('button', { name: 'Previous field' })).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes with Escape without committing the highlighted option', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture />);
    const input = screen.getByRole('combobox', { name: 'Tree' });

    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}{Escape}');

    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('No selection');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('does not commit while an IME composition is active', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture />);
    const input = screen.getByRole('combobox', { name: 'Tree' });

    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    fireEvent.keyDown(input, { key: ' ', isComposing: true, keyCode: 229 });

    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('No selection');
    expect(screen.getByRole('listbox')).toBeVisible();
  });
});
