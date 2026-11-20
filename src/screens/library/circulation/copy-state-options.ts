import type { LibraryCopyState } from 'src/redux/library/copy-lifecycle-types';

const names: Record<number, string> = {
  0: 'Available',
  1: 'Issued',
  2: 'Reserved',
  3: 'Lost',
  4: 'Damaged',
  5: 'Under repair',
  6: 'Discarded',
};
export function copyStateOptions(state: LibraryCopyState) {
  const statuses = [
    state.status,
    ...(state.canChangeCondition ? state.allowedConditionStatuses : []),
  ];
  return Array.from(new Set(statuses)).map((id) => ({ id, name: names[id] || `Status ${id}` }));
}
