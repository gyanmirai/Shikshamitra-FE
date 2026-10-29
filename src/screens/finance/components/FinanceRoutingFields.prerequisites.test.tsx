import React from 'react';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FinanceRoutingFields from './FinanceRoutingFields';

const mocks = vi.hoisted(() => ({ fetching: false, error: false, refetch: vi.fn() }));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => ({
    currentData: { incomeCategories: [], expenseCategories: [], bankAccounts: [] },
    isFetching: mocks.fetching,
    isError: mocks.error,
    refetch: mocks.refetch,
  }),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: [] } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label }: any) => (
    <label htmlFor={label}>
      {label}
      <select id={label} aria-label={label} />
    </label>
  ),
}));
const form = (status = 'Draft') =>
  ({
    values: { status, expenseCategoryId: '', defaultPayingBankAccountId: '' },
    touched: {},
    errors: {},
    setFieldValue: vi.fn(),
    setFieldTouched: vi.fn(),
    handleBlur: vi.fn(),
  }) as any;
beforeEach(() => {
  mocks.fetching = false;
  mocks.error = false;
});

describe('routing prerequisites', () => {
  it('preserves an incomplete draft and explains missing routing only on activation', () => {
    const view = render(
      <FinanceRoutingFields
        formik={form()}
        academicYearId="year"
        operation="refund-policy"
        categoryField="expenseCategoryId"
      />
    );
    expect(
      screen.queryByRole('heading', { name: 'Add an expense category first' })
    ).not.toBeInTheDocument();
    view.rerender(
      <FinanceRoutingFields
        formik={form('Active')}
        academicYearId="year"
        operation="refund-policy"
        categoryField="expenseCategoryId"
      />
    );
    expect(screen.getByRole('heading', { name: 'Add an expense category first' })).toBeVisible();
  });
  it('does not turn a loading or failed request into missing setup', () => {
    mocks.error = true;
    render(
      <FinanceRoutingFields
        formik={form('Active')}
        academicYearId="year"
        operation="refund-policy"
        categoryField="expenseCategoryId"
      />
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeVisible();
  });
});
