import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FeeSummaryCard } from './StudentFeeDetail';
import FeeOverview from './ViewDetailsComponent/FeeOverviewDetails';
import type { IStudentFee } from './type';

// Icons are unrelated to the balance contract; avoid external icon fetches in happy-dom.
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('Pending fee balance meaning', () => {
  const student = {
    totalFees: 43000,
    paidFees: 13224,
    pendingFees: 29776,
    overdueFees: 3306,
  } as IStudentFee;

  it('shows the full unpaid balance and explains future installments in the student summary', () => {
    render(<FeeSummaryCard student={student} showHeader={false} />);

    expect(screen.getByText('Pending Fees').parentElement).toHaveTextContent('₹ 29,776');
    expect(screen.getByText('Includes future and overdue installments')).toBeVisible();
    expect(screen.getByText('Overdue Fees').parentElement).toHaveTextContent('₹ 3,306');
  });

  it('explains that the fee overview pending amount covers all unpaid installments', () => {
    render(
      <FeeOverview total={43000} paid={13224} pending={29776} overdue={3306} concession={0} />
    );

    expect(screen.getByText('Pending fee').parentElement).toHaveTextContent('₹ 29,776');
    expect(screen.getByText('Includes future and overdue installments')).toBeVisible();
  });

  it('uses the server balance after noncash credits rather than total minus paid', () => {
    render(<FeeSummaryCard student={{ ...student, pendingFees: 24776 }} showHeader={false} />);

    expect(screen.getByText('Pending Fees').parentElement).toHaveTextContent('₹ 24,776');
    expect(screen.queryByText('₹ 29,776')).not.toBeInTheDocument();
  });
});
