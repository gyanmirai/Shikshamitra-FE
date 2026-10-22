import type { SelectedItem } from '../Components/type';

/** Selection click order cannot change the configured collection ledger's order. */
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
