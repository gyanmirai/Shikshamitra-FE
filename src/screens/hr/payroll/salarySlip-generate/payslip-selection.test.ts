import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  buildPayslipSelection,
  isPayslipNotFoundError,
  payslipMatchesSelection,
  normalizePayslipResponseMonth,
} from './payslip-selection';

describe('payslip selection', () => {
  it('keys the query by both employee and pay period', () => {
    expect(buildPayslipSelection('employee-1', dayjs('2026-07-15'))).toEqual({
      employeeId: 'employee-1',
      monthYear: '2026-07',
      key: 'employee-1:2026-07',
    });
    expect(buildPayslipSelection('employee-2', dayjs('2026-07-15'))?.key).toBe(
      'employee-2:2026-07'
    );
    expect(buildPayslipSelection('employee-1', dayjs('2026-08-15'))?.key).toBe(
      'employee-1:2026-08'
    );
  });

  it('renders the canonical backend response only when both response keys match the filters', () => {
    const selection = buildPayslipSelection('employee-1', dayjs('2026-07-15'));

    expect(
      payslipMatchesSelection({ employeeId: 'employee-1', monthYear: '2026-07' }, selection)
    ).toBe(true);
    expect(
      payslipMatchesSelection({ employeeId: 'employee-2', monthYear: '2026-07' }, selection)
    ).toBe(false);
    expect(
      payslipMatchesSelection({ employeeId: 'employee-1', monthYear: '2026-06' }, selection)
    ).toBe(false);
  });

  it('matches the live API month-name response to the canonical selected period', () => {
    const selection = buildPayslipSelection('employee-1', dayjs('2026-07-15'));

    expect(
      payslipMatchesSelection({ employeeId: 'employee-1', monthYear: 'JULY-2026' }, selection)
    ).toBe(true);
    expect(
      payslipMatchesSelection({ employeeId: 'employee-1', monthYear: 'july-2026' }, selection)
    ).toBe(true);
    expect(
      payslipMatchesSelection({ employeeId: 'employee-1', monthYear: 'JUNE-2026' }, selection)
    ).toBe(false);
    expect(
      payslipMatchesSelection({ employeeId: 'employee-1', monthYear: 'not-a-month' }, selection)
    ).toBe(false);
  });

  it('normalizes only supported canonical and API response formats', () => {
    expect(normalizePayslipResponseMonth('2026-07')).toBe('2026-07');
    expect(normalizePayslipResponseMonth(' JULY-2026 ')).toBe('2026-07');
    expect(normalizePayslipResponseMonth('2026-13')).toBeNull();
    expect(normalizePayslipResponseMonth('JUL-2026')).toBeNull();
  });

  it('skips incomplete selections', () => {
    expect(buildPayslipSelection(null, dayjs('2026-07-15'))).toBeNull();
    expect(buildPayslipSelection('employee-1', null)).toBeNull();
  });

  it('classifies only a 404 response as a missing payslip', () => {
    expect(isPayslipNotFoundError({ status: 404 })).toBe(true);
    expect(isPayslipNotFoundError({ status: '404' })).toBe(true);
    expect(isPayslipNotFoundError({ status: 'PARSING_ERROR', originalStatus: 404 })).toBe(true);
    expect(isPayslipNotFoundError({ status: 403 })).toBe(false);
    expect(isPayslipNotFoundError({ status: 500 })).toBe(false);
    expect(isPayslipNotFoundError({ status: 'FETCH_ERROR' })).toBe(false);
  });
});
