import type { SelectedItem } from '../Components/type';

/** Selection click order and ledger display cannot change the policy's priority. */
export function orderSelectedCollectionItems(
  items: SelectedItem[],
  dueFeeOrder: string[]
): SelectedItem[] {
  const rank = new Map(dueFeeOrder.map((id, index) => [id, index]));
  return [...items].sort(
    (a, b) =>
      (rank.get(a.dueFeeId ?? '') ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(b.dueFeeId ?? '') ?? Number.MAX_SAFE_INTEGER)
  );
}

/** With no explicit selection, allocate across eligible fees from the full ledger. */
export function resolveCollectionItems(
  selectedItems: SelectedItem[],
  chargeIds: string[],
  eligibleItems: SelectedItem[],
  automatic: boolean,
  dueFeeOrder: string[]
): SelectedItem[] {
  if (!automatic) return selectedItems;
  const items = selectedItems.length || chargeIds.length ? selectedItems : eligibleItems;
  return orderSelectedCollectionItems(items, dueFeeOrder);
}
