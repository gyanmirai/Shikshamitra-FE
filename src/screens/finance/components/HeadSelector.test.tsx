import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import HeadSelector from './HeadSelector';

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock('src/hooks/useAccountHeadOptions', () => ({ useAccountHeadOptions: lookup }));
vi.mock('src/components/custom-select', () => ({
  default: ({ options, value, onChange, disabled, label, helperText }: any) => (
    <>
      <select aria-label={label} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>
        {options.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <span>{helperText}</span>
    </>
  ),
}));

beforeEach(() => {
  lookup.mockReturnValue({
    options: [{ id: 'income-head', name: 'Tuition Revenue', headType: 'Income' }],
    isLoading: false, disabled: false, needsAcademicYear: false,
  });
});

describe('HeadSelector with simplified account heads', () => {
  it('shows and selects a head without code or posting flags', () => {
    const onChange = vi.fn();
    render(<HeadSelector label="Default Income Account Head" headType="Income" categoryType="Income" value="" onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: 'Default Income Account Head' });
    expect(select).not.toBeDisabled();
    expect(screen.getByRole('option', { name: 'Tuition Revenue' })).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'income-head' } });
    expect(onChange).toHaveBeenCalledWith('income-head');
    expect(lookup).toHaveBeenCalledWith('Income', 'Income');
  });

  it('shows why an existing mapping is locked', () => {
    render(<HeadSelector value="income-head" onChange={vi.fn()} disabled helperText="This category is already used." />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByText('This category is already used.')).toBeInTheDocument();
  });
});
