import { arrayMove } from '@dnd-kit/sortable';

import type { RubricPerformanceLevelFormValue } from './types';

// The highest level is displayed first; its number always follows its position.
export const levelNumberAt = (index: number, count: number) => count - index;

export const rubricRowNumberAt = (index: number) => index + 1;

export const reorderRubricRows = <T extends { id: string }>(
  rows: T[],
  activeId: string,
  overId: string
) => {
  const from = rows.findIndex((row) => row.id === activeId);
  const to = rows.findIndex((row) => row.id === overId);
  return from < 0 || to < 0 || from === to ? rows : arrayMove(rows, from, to);
};

export const reorderPerformanceLevels = (
  levels: RubricPerformanceLevelFormValue[],
  activeId: string,
  overId: string
) => {
  return reorderRubricRows(levels, activeId, overId);
};
