import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import FinanceRoutingFields from './FinanceRoutingFields';

const routing = vi.hoisted(() => ({
  expenseCategories: [
    { id: 'expense', label: 'AAA expense' },
    { id: 'none', label: 'None' },
  ],
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => ({
    data: { expenseCategories: routing.expenseCategories, incomeCategories: [], bankAccounts: [] },
    isFetching: false,
    isError: false,
  }),
}));

const renderRefundFields = () => {
  const formik = {
    values: { expenseCategoryId: 'unavailable' },
    touched: {},
    errors: {},
    setFieldValue: vi.fn(),
    setFieldTouched: vi.fn(),
    handleBlur: vi.fn(),
  };
  render(
    <FinanceRoutingFields
      formik={formik as never}
      academicYearId="year"
      operation="refund-policy"
      categoryField="expenseCategoryId"
      categoryLabel="Expense Category"
    />
  );
  return formik;
};

describe('Refund policy category options', () => {
  beforeEach(() => {
    routing.expenseCategories = [
      { id: 'expense', label: 'AAA expense' },
      { id: 'none', label: 'None' },
    ];
  });

  it('pins None first from an unsorted lookup with an unavailable saved category', async () => {
    const formik = renderRefundFields();
    const category = screen.getByRole('combobox', { name: 'Expense Category' });
    expect(category).toHaveTextContent('Saved selection (unavailable)');
    fireEvent.mouseDown(category);
    const choices = await screen.findAllByRole('option');
    expect(choices[0]).toHaveTextContent('None');
    expect(screen.getByRole('option', { name: /Saved selection/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(choices[0]);
    expect(formik.setFieldValue).toHaveBeenCalledWith('expenseCategoryId', 'none');
  });

  it('does not invent None when the API has no available categories', async () => {
    routing.expenseCategories = [];
    renderRefundFields();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Expense Category' }));
    expect(await screen.findAllByRole('option')).toHaveLength(1);
    expect(screen.queryByRole('option', { name: 'None', exact: true })).toBeNull();
  });
});
