import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

import ConcessionFeeHeadSelection from './ConcessionFeeHeadSelection';
import { concessionInstallmentLabel } from './concessionInstallmentLabel';
import { context } from '../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('fee-head installment selection', () => {
  it('keeps totals visible, collapses installments by default, and expands without changing selection', () => {
    const onToggle = vi.fn();
    render(
      <ConcessionFeeHeadSelection
        feeHeads={[{ feeHeadId: 'tuition', feeHeadName: 'School tuition', amount: 5000 }]}
        installments={context.eligibleDueFees.map((line, index) => ({
          ...line,
          installmentLabel: `${index ? 'Jul' : 'Jun'} 2026`,
        }))}
        selectedIds={['tuition']}
        onToggle={onToggle}
      />
    );
    expect(screen.getByRole('checkbox', { name: 'School tuition' })).toBeChecked();
    expect(screen.getAllByText(/5,000/)).toHaveLength(2);
    expect(screen.queryByText('Jun 2026')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show School tuition installments' }));
    expect(onToggle).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Hide School tuition installments' })
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(screen.getByRole('table', { name: 'School tuition installments' })).getByText(
        'Jun 2026'
      )
    ).toBeVisible();
    expect(screen.queryByText(/2026.*2026/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'School tuition' }));
    expect(onToggle).toHaveBeenCalledWith('tuition');
  });
  it.each([
    ['Jun 2026', 2026, 'Jun 2026'],
    ['Jun', 2026, 'Jun 2026'],
    ['Half-Yearly 1', 2026, 'Half-Yearly 1 2026'],
    ['Jun 2026 2026', 2026, 'Jun 2026'],
  ])('formats %s with a single year', (label, year, expected) => {
    expect(concessionInstallmentLabel(label, Number(year))).toBe(expected);
  });
});
