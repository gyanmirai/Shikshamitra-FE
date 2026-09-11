import React from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import CustomSelect from './index';

it('searches options without changing the selected value or calling onChange', () => {
  const change = vi.fn();
  render(
    <CustomSelect
      label="Policy"
      isSearch
      value="saved"
      onChange={change}
      options={[
        { value: 'saved', label: 'Saved policy' },
        { value: 'tuition', label: 'Tuition policy' },
        { value: 'transport', label: 'Transport policy' },
      ]}
    />
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Policy' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search Policy' }), {
    target: { value: 'TUITION' },
  });
  expect(screen.getByRole('option', { name: 'Tuition policy' })).toBeTruthy();
  expect(screen.queryByRole('option', { name: 'Transport policy' })).toBeNull();
  expect(screen.getByRole('option', { name: 'Saved policy' })).toBeTruthy();
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('option', { name: 'Tuition policy' }));
  expect(change).toHaveBeenCalledWith('tuition');
});
