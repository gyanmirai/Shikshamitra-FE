/**
 * Determines whether a salary component is "fixed" using a unified rule:
 *
 * 1. If the payroll setting uses percentage calculation → **false**
 * 2. If the payroll setting uses amount calculation → **true**
 * 3. If only earning/deduction type exists, use the existing fixed/variable mapping
 * 4. If neither type field exists, fall back to the existing `isFixed` boolean
 *
 * This single helper replaces the duplicated inline checks in:
 *   - Salary structure modal submit mapping  (employee.tsx)
 *   - Employee payroll form submit mapping   (employee-form.tsx)
 *   - Payroll component renderer             (PayrollFields.tsx)
 */
export function isSalaryComponentFixed(item: Record<string, any>): boolean {
  if (item?.calculationType === 1) {
    return false;
  }

  if (item?.calculationType === 0) {
    return true;
  }

  if (item?.earningType === 'FIXED' || item?.deductionType === 'FIXED') {
    return true;
  }

  // Neither type field is present — the item came from the backend with only `isFixed`
  if (item?.earningType === undefined && item?.deductionType === undefined) {
    return !!item?.isFixed;
  }

  return false;
}

export function isPercentageSalaryComponent(item: Record<string, any>): boolean {
  return item?.calculationType === 1;
}

export function getSalaryComponentPayloadAmount(item: Record<string, any>): number | null {
  if (isPercentageSalaryComponent(item)) {
    return null;
  }

  return Number(item?.amount ?? 0);
}
