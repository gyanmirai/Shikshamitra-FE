import type { AssignmentLine, AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

import { formatNumber } from 'src/utils/formate_number';

const prorationRuleLabels: Record<string, string> = {
  FullCharge: 'Full charge',
  Daily: 'Daily proration',
  MonthlyCutoff: 'Monthly cutoff',
  FullMonthCharge: 'Full month charge',
};
const percent = new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 6 });

export function prorationRuleLabel(rule: string) {
  return prorationRuleLabels[rule] ?? rule;
}

export function formatProrationFactor(factor: number) {
  return percent.format(factor);
}

export function formatInstallmentProration(
  line: Pick<AssignmentLine, 'scheduledAmount' | 'proratedAmount' | 'factor'>,
  currency: string
) {
  const scheduled = formatNumber(line.scheduledAmount, currency);
  const assigned = formatNumber(line.proratedAmount, currency);
  return line.factor == null
    ? `${scheduled} → ${assigned}`
    : `${scheduled} × ${formatProrationFactor(line.factor)} → ${assigned}`;
}

export type FeeHeadProration = {
  scheduled: number;
  reduction: number;
  rules: Set<string>;
  lines: AssignmentLine[];
};

export function groupFeeHeadProration(lines: AssignmentLine[]) {
  const heads = new Map<string, FeeHeadProration>();
  lines.forEach((line) => {
    const head = heads.get(line.feeHeadId) ?? {
      scheduled: 0,
      reduction: 0,
      rules: new Set<string>(),
      lines: [],
    };
    head.scheduled += line.scheduledAmount;
    head.reduction += line.reductionAmount ?? line.scheduledAmount - line.proratedAmount;
    if (line.ruleType) head.rules.add(prorationRuleLabel(line.ruleType));
    head.lines.push(line);
    heads.set(line.feeHeadId, head);
  });
  return heads;
}

export function formatSavedProrationExplanation(explanation: string) {
  return explanation
    .replace(/\b(?:FullCharge|Daily|MonthlyCutoff|FullMonthCharge)\b/g, (rule) =>
      prorationRuleLabels[rule].toLowerCase()
    )
    .replace(/; factor \d+(?:\.\d+)?(?=; rounding applied once\.)/, '');
}

// Group recorded evidence only. Pricing, proration and rounding remain server-owned.
export function groupAssignmentInstallments(lines: AssignmentLine[]) {
  const groups = new Map<
    string,
    {
      id: string;
      label: string;
      demandDate?: string;
      dueDate: string;
      lines: AssignmentLine[];
      obligation: number;
      paid: number;
      outstanding: number;
    }
  >();
  lines.forEach((line) => {
    const id = JSON.stringify([
      line.installmentLabel,
      line.sequence,
      line.demandDate ?? null,
      line.dueDate,
      line.optionalServicePeriodId ?? null,
    ]);
    const group = groups.get(id) ?? {
      id,
      label: line.installmentLabel,
      demandDate: line.demandDate,
      dueDate: line.dueDate,
      lines: [],
      obligation: 0,
      paid: 0,
      outstanding: 0,
    };
    group.lines.push(line);
    group.obligation += line.proratedAmount;
    group.paid += line.paidAmount;
    group.outstanding += line.outstandingAmount;
    groups.set(id, group);
  });
  return [...groups.values()];
}

export function assignmentCurrencyTotals(
  items: Pick<AssignmentPreview, 'currency' | 'proratedTotal'>[]
) {
  const totals = new Map<string, number>();
  items.forEach((item) =>
    totals.set(item.currency, (totals.get(item.currency) ?? 0) + item.proratedTotal)
  );
  return [...totals].map(([currency, total]) => ({ currency, total }));
}
