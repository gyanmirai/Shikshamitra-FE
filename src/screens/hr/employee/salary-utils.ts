/**
 * Determines whether a salary component is "fixed" using a unified rule:
 *
 * 1. If `earningType` or `deductionType` is `'FIXED'` → **true**
 * 2. If neither type field exists, fall back to the existing `isFixed` boolean
 * 3. Otherwise (e.g. type is `'VARIABLE'`) → **false**
 *
 * This single helper replaces the duplicated inline checks in:
 *   - Salary structure modal submit mapping  (employee.tsx)
 *   - Employee payroll form submit mapping   (employee-form.tsx)
 *   - Payroll component renderer             (PayrollFields.tsx)
 */
export function isSalaryComponentFixed(item: Record<string, any>): boolean {
  if (item?.earningType === 'FIXED' || item?.deductionType === 'FIXED') {
    return true;
  }

  // Neither type field is present — the item came from the backend with only `isFixed`
  if (item?.earningType === undefined && item?.deductionType === undefined) {
    return !!item?.isFixed;
  }

  return false;
}
