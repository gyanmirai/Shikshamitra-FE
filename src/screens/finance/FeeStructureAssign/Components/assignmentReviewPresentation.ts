import type { AssignmentLine, AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

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
