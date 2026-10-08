import React from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import CustomSelect from './index';

it('shows option information without changing selection or closing the menu', () => {
  const change = vi.fn();
  render(
    <CustomSelect
      label="Scope"
      value="paid"
      onChange={change}
      optionDescriptionKey="caption"
      options={[
        { value: 'paid', label: 'Including paid', caption: 'The paid concession is refundable.' },
        { value: 'unpaid', label: 'Unpaid only', caption: 'Only outstanding amounts are reduced.' },
      ]}
    />
  );
  expect(screen.getByRole('button', { name: 'About Including paid' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'About Including paid' }));
  expect(change).not.toHaveBeenCalled();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Scope' }));
  fireEvent.click(screen.getByRole('button', { name: 'About Unpaid only' }));
  expect(screen.getByRole('listbox')).toBeTruthy();
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('option', { name: /Unpaid only/ }));
  expect(change).toHaveBeenCalledWith('unpaid');
});
