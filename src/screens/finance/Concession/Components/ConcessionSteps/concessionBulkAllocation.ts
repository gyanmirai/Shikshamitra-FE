import type { ConcessionEligibleDueFee } from 'src/redux/finance/ConcessionManagement/types';

export type ConcessionBulkMode = 'perInstallment' | 'equalTotal';

type BulkOptions = {
  lines: Pick<ConcessionEligibleDueFee, 'dueFeeId' | 'eligibleConcessionAmount'>[];
  targetIds: string[];
  entries: Record<string, number | string>;
  value: string;
  mode: ConcessionBulkMode;
  maximum: number;
  decimalPlaces: 0 | 2;
  percentage: boolean;
};

const rawUnits = (raw: string, decimalPlaces: 0 | 2): number | undefined => {
  const text = raw.trim();
  if (!(decimalPlaces === 0 ? /^\d+(?:\.0*)?$/ : /^\d+(?:\.\d{0,2})?$/).test(text))
    return undefined;
  const [whole, fraction = ''] = text.split('.');
  // A whole-valued manual draft may retain its typed decimal point/zeroes.
  const units = Number(
    decimalPlaces === 0 ? whole : `${whole}${fraction.padEnd(decimalPlaces, '0')}`
  );
  return Number.isSafeInteger(units) ? units : undefined;
};

// Slice the decimal representation instead of multiplying a binary fraction:
// 100.29 * 100 can be 10028.999999999998, which would lose a paise on floor.
const capacityUnits = (amount: number, decimalPlaces: 0 | 2): number | undefined => {
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  if (amount < 1 / 10 ** decimalPlaces) return 0;
  const [whole, fraction = ''] = String(amount).split('.');
  return rawUnits(
    `${whole}${decimalPlaces ? `.${fraction.slice(0, decimalPlaces)}` : ''}`,
    decimalPlaces
  );
};

const quantity = (units: number, decimalPlaces: 0 | 2): string => {
  if (!units) return ''; // Blank installments are omitted by the existing request validator.
  const scale = 10 ** decimalPlaces;
  const whole = String(Math.floor(units / scale));
  const fraction = String(units % scale)
    .padStart(decimalPlaces, '0')
    .replace(/0+$/, '');
  return decimalPlaces && fraction ? `${whole}.${fraction}` : whole;
};

/** One atomic draft update; no clipping or mutation of existing/manual values. */
export function allocateConcessionBulk({
  lines,
  targetIds,
  entries,
  value,
  mode,
  maximum,
  decimalPlaces,
  percentage,
}: BulkOptions): { entries?: Record<string, number | string>; error?: string } {
  const invalidValue =
    decimalPlaces === 0
      ? 'Enter a positive whole-rupee concession amount.'
      : 'Enter a positive concession value with no more than two decimal places.';
  const amount = rawUnits(value, decimalPlaces);
  if (amount === undefined || amount <= 0) return { error: invalidValue };
  if (mode !== 'perInstallment' && mode !== 'equalTotal')
    return { error: 'Choose a bulk allocation mode.' };
  const maximumValue = percentage ? Math.min(100, maximum) : maximum;
  const requestCap =
    maximumValue === Infinity ? Infinity : capacityUnits(maximumValue, decimalPlaces);
  if (requestCap === undefined)
    return { error: 'The policy allowance is invalid. Refresh the eligible fees.' };

  const eligible = lines.filter(
    (line) => Number.isFinite(line.eligibleConcessionAmount) && line.eligibleConcessionAmount > 0
  );
  const targets = eligible.filter((line) => targetIds.includes(line.dueFeeId));
  if (!targets.length) return { error: 'Select at least one eligible installment.' };
  const targetSet = new Set(targets.map((line) => line.dueFeeId));
  if (new Set(eligible.map((line) => line.dueFeeId)).size !== eligible.length)
    return { error: 'Eligible installments have changed. Refresh the eligible fees.' };

  const capacities = targets.map((line) =>
    capacityUnits(percentage ? 100 : line.eligibleConcessionAmount, decimalPlaces)
  );
  if (capacities.some((capacity) => capacity === undefined))
    return { error: 'An eligible installment amount is too large or invalid.' };
  const targetCaps = capacities as number[];
  let outsideTotal = 0;
  const invalidOutside = eligible.some((line) => {
    const raw = entries[line.dueFeeId];
    if (targetSet.has(line.dueFeeId) || raw === undefined || raw === '') return false;
    const units = rawUnits(String(raw), decimalPlaces);
    const cap = capacityUnits(percentage ? 100 : line.eligibleConcessionAmount, decimalPlaces);
    if (units === undefined || units <= 0 || cap === undefined || units > cap) return true;
    outsideTotal += units;
    return !Number.isSafeInteger(outsideTotal);
  });
  if (invalidOutside)
    return {
      error:
        'Correct the existing concession values in other installments before applying a bulk change.',
    };

  const requestedTotal = mode === 'perInstallment' ? amount * targets.length : amount;
  if (!Number.isSafeInteger(requestedTotal) || !Number.isSafeInteger(outsideTotal + requestedTotal))
    return { error: 'The requested concession amount is too large.' };
  if (outsideTotal + requestedTotal > requestCap)
    return {
      error:
        'Total concession exceeds the request allowance. Reduce the bulk value or other installments.',
    };
  if (mode === 'perInstallment' && targetCaps.some((cap) => amount > cap))
    return {
      error:
        'The value exceeds an installment’s eligible amount. Reduce the amount or change the selected installments.',
    };
  // Saturate at the requested total so large individual capacities cannot overflow their sum.
  const totalCapacity = targetCaps.reduce(
    (sum, cap) => sum + Math.min(cap, requestedTotal - sum),
    0
  );
  if (requestedTotal > totalCapacity)
    return { error: 'Total concession exceeds the selected installments’ eligible capacity.' };

  const allocations = targets.map(() => (mode === 'perInstallment' ? amount : 0));
  if (mode === 'equalTotal') {
    let remaining = requestedTotal;
    let active = targets.map((_, index) => index);
    while (active.length && remaining > 0) {
      const share = Math.floor(remaining / active.length);
      const capped = active.filter((index) => targetCaps[index] < share);
      if (capped.length) {
        for (let position = 0; position < capped.length; position += 1) {
          const index = capped[position];
          allocations[index] = targetCaps[index];
          remaining -= targetCaps[index];
        }
        active = active.filter((index) => !capped.includes(index));
      } else {
        active.forEach((index) => {
          allocations[index] = share;
        });
        remaining -= share * active.length;
        // Keep the exact requested total: put rounding on the last target with room.
        for (let position = active.length - 1; position >= 0 && remaining > 0; position -= 1) {
          const index = active[position];
          const extra = Math.min(remaining, targetCaps[index] - allocations[index]);
          allocations[index] += extra;
          remaining -= extra;
        }
        break;
      }
    }
  }
  const updated = { ...entries };
  targets.forEach((line, index) => {
    updated[line.dueFeeId] = quantity(allocations[index], decimalPlaces);
  });
  return { entries: updated };
}
