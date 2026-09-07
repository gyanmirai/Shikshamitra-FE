import { it, expect, describe } from 'vitest';

import {
  resolveDivisionSelection,
  getDisplayedDivisionSelection,
} from './division-selection';

const allDivisionIds = ['division-a', 'division-b'];

describe('division selection', () => {
  it('shows one All choice while retaining every division for the API payload', () => {
    const storedSelection = ['all', ...allDivisionIds];

    expect(getDisplayedDivisionSelection(storedSelection)).toEqual(['all']);
    expect(storedSelection.filter((id) => id !== 'all')).toEqual(allDivisionIds);
  });

  it('selects every division when All is chosen', () => {
    expect(resolveDivisionSelection(['all'], [], allDivisionIds)).toEqual([
      'all',
      ...allDivisionIds,
    ]);
  });

  it('switches from All to the specific division the user chooses', () => {
    expect(
      resolveDivisionSelection(
        ['all', 'division-a'],
        ['all', ...allDivisionIds],
        allDivisionIds
      )
    ).toEqual(['division-a']);
  });

  it('collapses all individually selected divisions to All', () => {
    expect(resolveDivisionSelection(allDivisionIds, ['division-a'], allDivisionIds)).toEqual([
      'all',
      ...allDivisionIds,
    ]);
  });
});
