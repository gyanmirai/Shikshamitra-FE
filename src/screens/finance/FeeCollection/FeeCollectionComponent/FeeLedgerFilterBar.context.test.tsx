import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FeeLedgerFilterBar, { FEE_LEDGER_INITIAL_FILTERS } from './FeeLedgerFilterBar';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'global-year' } }) }));
vi.mock('src/redux/student/admission/admission-api', () => ({
  useGetStudentFeeStructureQuery: vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (request: any) => {
    mocks.query(request);
    return {
      data: request.options.skip
        ? undefined
        : { feeHeads: [{ isSelected: true, feeHeadId: 'tuition', feeHeadName: 'Tuition' }] },
    };
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-tabs', () => ({ CustomTabs: ({ children }: any) => children }));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    options,
    labelKey = 'label',
    valueKey = 'value',
    value,
    disabled,
    onChange,
  }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option[valueKey]} value={option[valueKey]}>
          {option[labelKey]}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ initial, animate, transition, ...props }: any, ref: any) => (
      <div ref={ref} {...props} />
    )),
  },
}));

describe('Finance ledger filter context', () => {
  beforeEach(() => vi.clearAllMocks());
  it('allows either grouping when installment data is present', () => {
    const onFilterChange = vi.fn();
    render(
      <FeeLedgerFilterBar
        filters={FEE_LEDGER_INITIAL_FILTERS}
        onFilterChange={onFilterChange}
        groupByInstallment
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const grouping = screen.getByRole('combobox', { name: 'Group by' });
    expect(grouping).toBeEnabled();
    fireEvent.change(grouping, { target: { value: 'by-month' } });
    expect(onFilterChange).toHaveBeenCalledWith({
      ...FEE_LEDGER_INITIAL_FILTERS,
      activeTab: 'by-month',
    });
    expect(screen.getByRole('option', { name: 'By installment' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'By Fee Head' })).toBeInTheDocument();
  });
  it('retains default Student lookup and uses an explicit academic year when provided', () => {
    const view = render(
      <FeeLedgerFilterBar
        filters={FEE_LEDGER_INITIAL_FILTERS}
        onFilterChange={vi.fn()}
        studentId="student-one"
      />
    );
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: { studentId: 'student-one', academicYearId: 'global-year' },
        options: { skip: false },
      })
    );
    view.rerender(
      <FeeLedgerFilterBar
        filters={FEE_LEDGER_INITIAL_FILTERS}
        onFilterChange={vi.fn()}
        studentId="student-one"
        academicYearId="application-year"
      />
    );
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: { studentId: 'student-one', academicYearId: 'application-year' },
        options: { skip: false },
      })
    );
  });
  it('uses supplied Finance ledger heads and never queries a Student for an applicant', () => {
    render(
      <FeeLedgerFilterBar
        filters={FEE_LEDGER_INITIAL_FILTERS}
        onFilterChange={vi.fn()}
        academicYearId="application-year"
        feeHeads={[{ feeHeadId: 'form-fee', feeHeadName: 'Form fee' }]}
      />
    );
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.objectContaining({ options: { skip: true } })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('option', { name: 'Form fee' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Tuition' })).not.toBeInTheDocument();
  });
});
