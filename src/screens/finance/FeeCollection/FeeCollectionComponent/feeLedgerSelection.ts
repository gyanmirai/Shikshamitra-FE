import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import { normalizeLedgerStatus } from './feeLedgerStatus';

import type { SelectedItem } from '../Components/type';
import type { FeeLedgerSelectionFilters } from './FeeLedgerFilterBar';

export type SelectionFilterKey = keyof FeeLedgerSelectionFilters;
export type LedgerSelection = { items: SelectedItem[]; charges: string[] };
type SelectionOwner = { items: Set<string>; charges: Set<string> };
export type SelectionOwnership = Record<SelectionFilterKey | 'manual', SelectionOwner>;
export type AcademicLedgerMonth = { month: number; year: number };

// Academic boundaries are calendar dates. Keep their written month/year instead
// of converting an offset timestamp to the browser's local time zone.
export const academicYearMonthsFromDates = (year: {
  startDate?: string | null;
  endDate?: string | null;
}): AcademicLedgerMonth[] | undefined => {
  const readDate = (value?: string | null) => {
    if (!value) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
    if (!match || Number.isNaN(Date.parse(value))) return undefined;
    const [, yearPart, monthPart, dayPart] = match;
    const dateYear = Number(yearPart);
    const month = Number(monthPart);
    const day = Number(dayPart);
    const leap = dateYear % 4 === 0 && (dateYear % 100 !== 0 || dateYear % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    if (dateYear < 1 || !days || day < 1 || day > days) return undefined;
    return { year: dateYear, month: month - 1, day };
  };
  const start = readDate(year.startDate);
  const end = readDate(year.endDate);
  if (!start || !end) return undefined;
  const startDate = start.year * 10000 + (start.month + 1) * 100 + start.day;
  const endDate = end.year * 10000 + (end.month + 1) * 100 + end.day;
  if (startDate > endDate) return undefined;
  const months: AcademicLedgerMonth[] = [];
  const finalMonth = end.year * 12 + end.month;
  for (let cursor = start.year * 12 + start.month; cursor <= finalMonth; cursor += 1) {
    months.push({ month: cursor % 12, year: Math.floor(cursor / 12) });
  }
  return months;
};

export const selectionItemKey = (item: Pick<SelectedItem, 'dueFeeId' | 'feeHeadId' | 'period'>) =>
  item.dueFeeId ? `due:${item.dueFeeId}` : `period:${item.feeHeadId}|${item.period}`;

export const isLedgerItemCollectible = (item: {
  due: number;
  lateFeeAmount?: number;
  status?: number | string;
}) =>
  normalizeLedgerStatus(item.status, 0, item.due + (item.lateFeeAmount ?? 0)) !==
    FeeCollectionStatusType.Paid &&
  (item.due > 0 || (item.lateFeeAmount ?? 0) > 0);

export const createSelectionOwnership = (): SelectionOwnership => ({
  manual: { items: new Set(), charges: new Set() },
  allPending: { items: new Set(), charges: new Set() },
  allCharges: { items: new Set(), charges: new Set() },
  firstSixMonths: { items: new Set(), charges: new Set() },
  lastSixMonths: { items: new Set(), charges: new Set() },
});

// Manual removals override every contributor; additions belong to the collector.
// Unchanged rows keep their provenance, so merely editing a group does not turn
// every selected filter row into a manual selection.
export const recordManualSelection = (
  ownership: SelectionOwnership,
  previous: LedgerSelection,
  next: LedgerSelection
) => {
  const update = (field: 'items' | 'charges', before: string[], after: string[]) => {
    const beforeSet = new Set(before);
    const afterSet = new Set(after);
    beforeSet.forEach((key) => {
      if (!afterSet.has(key)) Object.values(ownership).forEach((owner) => owner[field].delete(key));
    });
    afterSet.forEach((key) => {
      if (!beforeSet.has(key)) ownership.manual[field].add(key);
    });
  };
  update('items', previous.items.map(selectionItemKey), next.items.map(selectionItemKey));
  update('charges', previous.charges, next.charges);
};

// Each preset owns its whole matching set, including overlap with other presets
// and manual selections. Removing one owner leaves every other owner intact.
export const applySelectionFilter = (
  ownership: SelectionOwnership,
  current: LedgerSelection,
  key: SelectionFilterKey,
  checked: boolean,
  matches: LedgerSelection
): LedgerSelection => {
  ownership[key] = {
    items: new Set(checked ? matches.items.map(selectionItemKey) : []),
    charges: new Set(checked ? matches.charges : []),
  };
  const itemKeys = new Set(Object.values(ownership).flatMap((owner) => [...owner.items]));
  const chargeKeys = new Set(Object.values(ownership).flatMap((owner) => [...owner.charges]));
  const uniqueItems = new Map(
    [...current.items, ...(checked ? matches.items : [])]
      .filter((item) => itemKeys.has(selectionItemKey(item)))
      .map((item) => [selectionItemKey(item), item])
  );
  return {
    items: [...uniqueItems.values()],
    charges: [...new Set([...current.charges, ...(checked ? matches.charges : [])])].filter((id) =>
      chargeKeys.has(id)
    ),
  };
};

export const selectionFilterState = (matches: LedgerSelection, selected: LedgerSelection) => {
  const selectedKeys = new Set(selected.items.map(selectionItemKey));
  const count =
    matches.items.filter((item) => selectedKeys.has(selectionItemKey(item))).length +
    matches.charges.filter((id) => selected.charges.includes(id)).length;
  const total = matches.items.length + matches.charges.length;
  return { checked: total > 0 && count === total, indeterminate: count > 0 && count < total };
};
