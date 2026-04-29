import { PAYROLL_CYCLE_STEPS } from './payroll-cycle.constants';

import type { PayrollProcessIssueKind } from './payroll-cycle.types';

type PreviewItem = {
  isLocked?: boolean;
  totalWorkingDays?: number;
  payableDays?: number;
  netPay?: number;
};

const clampStepIndex = (index: number) =>
  Math.max(0, Math.min(PAYROLL_CYCLE_STEPS.length - 1, index));

export function inferIssuesFromRunPayrollItems(items: PreviewItem[] | undefined) {
  if (!items?.length) {
    return {
      issueCounts: {
        attendance_gap: 0,
        salary_structure: 0,
        statutory_tax: 0,
        negative_net: 0,
        other: 0,
      } as Record<PayrollProcessIssueKind, number>,
      hasBlockers: false,
    };
  }

  const issueCounts: Record<PayrollProcessIssueKind, number> = {
    attendance_gap: 0,
    salary_structure: 0,
    statutory_tax: 0,
    negative_net: 0,
    other: 0,
  };

  items.forEach((row) => {
    const tw = Number(row.totalWorkingDays ?? 0);
    const pd = Number(row.payableDays ?? 0);
    if (tw > 0 && pd < tw) {
      issueCounts.attendance_gap += 1;
    }
    if (Number(row.netPay ?? 0) < 0) {
      issueCounts.negative_net += 1;
    }
  });

  const hasBlockers = issueCounts.attendance_gap + issueCounts.negative_net > 0;
  return { issueCounts, hasBlockers };
}

/**
 * Suggests the next operational step in the UI when the backend does not yet expose
 * a dedicated payroll-cycle state. Uses a simple, explainable heuristic.
 */
export function getSuggestedActiveStepIndex(
  items: PreviewItem[] | undefined,
  isLoading: boolean
): { activeIndex: number; nextLabel: string; nextPath: string } {
  if (isLoading) {
    return {
      activeIndex: 0,
      nextLabel: 'Loading current cycle',
      nextPath: PAYROLL_CYCLE_STEPS[0]!.path,
    };
  }

  if (!items?.length) {
    return {
      activeIndex: 0,
      nextLabel: 'Run payroll',
      nextPath: PAYROLL_CYCLE_STEPS[0]!.path,
    };
  }

  const locked = items.filter((i) => i.isLocked).length;
  const total = items.length;
  const pending = total - locked;
  const { hasBlockers, issueCounts } = inferIssuesFromRunPayrollItems(items);

  if (hasBlockers) {
    return {
      activeIndex: clampStepIndex(0),
      nextLabel: 'Open payroll workbench',
      nextPath: PAYROLL_CYCLE_STEPS[0]!.path,
    };
  }

  if (pending > 0) {
    return {
      activeIndex: clampStepIndex(0),
      nextLabel: 'Review and lock payroll',
      nextPath: PAYROLL_CYCLE_STEPS[0]!.path,
    };
  }

  if (locked === total) {
    return {
      activeIndex: clampStepIndex(1),
      nextLabel: PAYROLL_CYCLE_STEPS[1]!.label,
      nextPath: PAYROLL_CYCLE_STEPS[1]!.path,
    };
  }

  if (issueCounts.statutory_tax + issueCounts.salary_structure > 0) {
    return {
      activeIndex: clampStepIndex(0),
      nextLabel: 'Open payroll workbench',
      nextPath: PAYROLL_CYCLE_STEPS[0]!.path,
    };
  }

  return {
    activeIndex: clampStepIndex(0),
    nextLabel: 'Review and lock payroll',
    nextPath: PAYROLL_CYCLE_STEPS[0]!.path,
  };
}
