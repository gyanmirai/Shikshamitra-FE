import { it, expect, describe } from 'vitest';

import { layout } from './fixtures.test-utils';
import { redoHistory, undoHistory, commitHistory, createHistory } from './history';

describe('studio layout history', () => {
  it('undoes and redoes the whole layout and drops redo after a new command', () => {
    const initial = layout();
    const changed = { ...initial, back: { elements: [] } };
    const committed = commitHistory(createHistory(initial), changed);
    const undone = undoHistory(committed);
    expect(undone.present).toEqual(initial);
    expect(redoHistory(undone).present).toEqual(changed);
    expect(commitHistory(undone, { ...initial, themeColor: 'red' }).future).toEqual([]);
  });

  it('caps undo at fifty transactions and ignores identical commits', () => {
    let state = createHistory(layout());
    expect(commitHistory(state, layout())).toBe(state);
    for (let index = 0; index < 55; index += 1) {
      state = commitHistory(state, { ...state.present, themeColor: String(index) });
    }
    expect(state.past).toHaveLength(50);
    for (let index = 0; index < 55; index += 1) state = undoHistory(state);
    expect(state.present.themeColor).toBe('4');
    expect(state.future).toHaveLength(50);
  });
});
