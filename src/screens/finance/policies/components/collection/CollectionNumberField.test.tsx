import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { acceptsNumericDraft, validCollectionNumber } from '../../collectionNumericLimits';
import CollectionNumberField from './CollectionNumberField';
import { computeSlabIssues } from './CollectionCommon';

describe('collection numeric input bounds', () => {
  it('rejects exponents, signs, excessive digits and precision before storage', () => {
    for (const value of [
      '1e2',
      '1e+2799999',
      '-1',
      '+1',
      '9999999',
      '88888888',
      '1.234',
      '000000000',
    ]) {
      expect(acceptsNumericDraft(value, 'amount')).toBe(false);
    }
    expect(acceptsNumericDraft('999999', 'amount')).toBe(true);
    expect(acceptsNumericDraft('999998.99', 'amount')).toBe(true);
    expect(acceptsNumericDraft('365', 'days')).toBe(true);
    expect(acceptsNumericDraft('366', 'days')).toBe(false);
    expect(acceptsNumericDraft('1.2', 'days')).toBe(false);
    expect(acceptsNumericDraft('100.01', 'percentage')).toBe(false);
    expect(validCollectionNumber(Infinity, 'amount')).toBe(false);
    expect(validCollectionNumber(0.001, 'percentage', 0.01)).toBe(false);
  });

  it('preserves decimal drafts, blocks typing/paste attempts, and permits replacement', () => {
    function Field() {
      const [value, setValue] = useState<number | null>(null);
      return (
        <CollectionNumberField
          label="Amount"
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value === '' ? null : Number(e.target.value))}
        />
      );
    }
    render(<Field />);
    const input = screen.getByLabelText('Amount');
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '1e+2799999' } });
    fireEvent(input, paste);
    expect(paste.defaultPrevented).toBe(true);
    for (const value of ['12', '12.', '12.3', '12.34']) {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(value);
    }
    for (const value of ['12.345', '3333333333333333333333', '1e27', '1000000']) {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue('12.34');
    }
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: '999998.99' } });
    expect(input).toHaveValue('999998.99');
  });
});

describe('collection slab coverage', () => {
  const slab = (startDay: number, endDay: number | null, value = 10) => ({
    startDay,
    endDay,
    value,
    calculationType: 'Flat' as const,
  });
  it('requires day 1, valid bounded values, contiguous ranges and coverage through cutoff', () => {
    for (const rules of [
      [],
      [slab(2, 10)],
      [slab(1, 366)],
      [slab(1, 10, 9999999)],
      [slab(1, 10), slab(10, 20)],
      [slab(1, 10), slab(12, 20)],
    ]) {
      expect(computeSlabIssues(rules).hasIssues).toBe(true);
    }
    expect(computeSlabIssues([slab(1, 10)], 20).hasIssues).toBe(true);
    expect(computeSlabIssues([slab(1, 30)], 20).hasIssues).toBe(true);
    expect(computeSlabIssues([slab(1, 10), slab(11, 20)], 20).hasIssues).toBe(false);
    expect(computeSlabIssues([slab(1, 10), slab(11, null)], 20).hasIssues).toBe(false);
    expect(computeSlabIssues([slab(1, null), slab(11, 20)], 20).hasIssues).toBe(true);
  });
});
