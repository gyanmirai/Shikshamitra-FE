import type { Board } from 'src/types/school';

import { BoardEnum } from 'src/enums/board';
import { it, expect, describe } from 'vitest';

import { getCustomBoardNameError, getConfiguredBoardTypes } from './board-options-model';

const boards = [
  { id: 'cbse-2026', academicYearId: '2026', type: BoardEnum.CBSE, name: 'CBSE' },
  { id: 'gseb-2025', academicYearId: '2025', type: BoardEnum.GSEB, name: 'GSEB' },
  { id: 'custom-2026', academicYearId: '2026', type: BoardEnum.Custom, name: 'Regional Board' },
] as Board[];

describe('board choices for an academic year', () => {
  it('disables only boards already added in the selected year and always permits another custom board', () => {
    expect(getConfiguredBoardTypes(boards, '2026')).toEqual(['0']);
    expect(getConfiguredBoardTypes(boards, '2025')).toEqual(['1']);
  });
  it('retains the current board while editing and has no two-board ceiling', () => {
    expect(getConfiguredBoardTypes(boards, '2026', 'cbse-2026')).toEqual([]);
    expect(getConfiguredBoardTypes([...boards, { id: 'icse', academicYearId: '2026', type: BoardEnum.ICSE, name: 'ICSE' } as Board], '2026')).toEqual(['0', '2']);
  });
  it('validates custom board duplicates by trimmed name within the year while allowing edits', () => {
    expect(getCustomBoardNameError(' regional board ', boards, '2026')).toContain('already added');
    expect(getCustomBoardNameError('Regional Board', boards, '2025')).toBeUndefined();
    expect(getCustomBoardNameError('Regional Board', boards, '2026', 'custom-2026')).toBeUndefined();
    expect(getCustomBoardNameError('', boards, '2026')).toContain('required');
  });
});
