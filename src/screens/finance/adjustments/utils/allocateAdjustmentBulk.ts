export type AdjustmentBulkMode = 'perInstallment' | 'equalTotal';
export type AdjustmentLineCapacity = { dueFeeId: string; capacity: number; kind?: number };

const toPaise = (raw: string): number | null => {
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
  const [rupees, fraction = ''] = raw.split('.');
  const paise = Number(`${rupees}${fraction.padEnd(2, '0')}`);
  return Number.isSafeInteger(paise) ? paise : null;
};

const capacityPaise = (amount: number): number | null => {
  if (!Number.isFinite(amount) || amount < 0) return null;
  const [rupees, fraction = ''] = String(amount).split('.');
  return toPaise(`${rupees}.${fraction.slice(0, 2).padEnd(2, '0')}`);
};

const formatPaise = (amount: number): string => {
  const rupees = Math.floor(amount / 100);
  const fraction = String(amount % 100).padStart(2, '0').replace(/0+$/, '');
  return fraction ? `${rupees}.${fraction}` : String(rupees);
};

/** Applies a per-line amount to checked rows or distributes a total across one source kind. */
export function allocateAdjustmentBulk(
  lines: AdjustmentLineCapacity[],
  selectedIds: string[],
  existing: Record<string, string>,
  rawAmount: string,
  mode: AdjustmentBulkMode
): { amounts?: Record<string, string>; error?: string } {
  const requested = toPaise(rawAmount);
  if (requested === null || requested <= 0)
    return { error: 'Enter a positive amount with no more than two decimal places.' };
  const ids = new Set(selectedIds);
  if (ids.size !== selectedIds.length || new Set(lines.map((line) => line.dueFeeId)).size !== lines.length)
    return { error: 'Select eligible installments before applying an amount.' };
  const checked = lines.filter((line) => ids.has(line.dueFeeId));
  if (checked.length !== ids.size)
    return { error: 'Selected installments have changed. Refresh the fees.' };
  if (mode === 'perInstallment' && !ids.size)
    return { error: 'Select eligible installments before applying an amount.' };
  const kinds = new Set((ids.size ? checked : lines).map((line) => line.kind ?? 0));
  if (mode === 'equalTotal' && kinds.size !== 1)
    return { error: 'Select one pending/overdue or paid-credit installment before auto-distributing.' };
  const eligible = lines.filter((line) => (line.kind ?? 0) === [...kinds][0]);
  const unpaidTransfer = mode === 'equalTotal' && [...kinds][0] === 1;
  if (unpaidTransfer && eligible.length < 2)
    return { error: 'At least two pending or overdue installments are needed to move an unpaid amount.' };
  const destination = unpaidTransfer
    ? [...eligible].reverse().find((line) => !ids.has(line.dueFeeId)) ?? eligible[eligible.length - 1]
    : undefined;
  const selected = mode === 'equalTotal'
    ? eligible.filter((line) => line.dueFeeId !== destination?.dueFeeId)
    : checked;
  if (!selected.length)
    return { error: 'No eligible installments are available.' };
  const parsed = selected.map((line) => capacityPaise(line.capacity));
  if (parsed.some((capacity) => capacity === null || capacity === 0))
    return { error: 'A selected installment has no available balance.' };
  const capacities = parsed as number[];
  const total = mode === 'perInstallment' ? requested * selected.length : requested;
  if (!Number.isSafeInteger(total)) return { error: 'The amount is too large.' };
  if (mode === 'perInstallment' && capacities.some((capacity) => requested > capacity))
    return { error: 'Amount exceeds an installment’s available balance.' };
  if (total > capacities.reduce((sum, capacity) => sum + capacity, 0))
    return { error: 'Total exceeds the eligible available balances.' };

  const allocated = selected.map(() => (mode === 'perInstallment' ? requested : 0));
  if (mode === 'equalTotal') {
    let remaining = total;
    let active = selected.map((_, index) => index);
    while (remaining > 0 && active.length) {
      const share = Math.floor(remaining / active.length);
      const capped = active.filter((index) => capacities[index] < share);
      if (capped.length) {
        capped.forEach((index) => {
          allocated[index] = capacities[index];
          remaining -= capacities[index];
        });
        active = active.filter((index) => !capped.includes(index));
      } else {
        active.forEach((index) => { allocated[index] = share; });
        remaining -= share * active.length;
        for (let position = active.length - 1; position >= 0 && remaining > 0; position -= 1) {
          const index = active[position];
          const extra = Math.min(remaining, capacities[index] - allocated[index]);
          allocated[index] += extra;
          remaining -= extra;
        }
      }
    }
  }
  const amounts = mode === 'equalTotal' ? {} as Record<string, string> : { ...existing };
  selected.forEach((line, index) => {
    if (allocated[index] > 0) amounts[line.dueFeeId] = formatPaise(allocated[index]);
  });
  return { amounts };
}
