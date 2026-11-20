import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useCardStudio } from './use-card-studio';
import { layer, layout } from './fixtures.test-utils';

import type { IdentityCardLayout } from '../types';

function useFixture(initial = layout(), disabled = false) {
  const [value, setValue] = useState(initial);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const studio = useCardStudio({ layout: value, side, onLayoutChange: setValue, disabled });
  return { ...studio, value, setValue, setSide };
}

describe('useCardStudio', () => {
  it('records multi-layer commands once and preserves local echoes for undo/redo', () => {
    const { result } = renderHook(() => useFixture());
    act(() => result.current.setSelectedIds(['a', 'b']));
    act(() => result.current.updateElements((element) => ({ ...element, y: 25 })));
    expect(result.current.value.front.elements.map((e) => e.y)).toEqual([25, 25]);
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.value.front.elements.map((e) => e.y)).toEqual([10, 10]);
    expect(result.current.canUndo).toBe(false);
    act(() => result.current.redo());
    expect(result.current.value.front.elements.map((e) => e.y)).toEqual([25, 25]);
  });

  it('retains history across sides but clears selection and resets on external replacement', () => {
    const { result } = renderHook(() => useFixture());
    act(() => result.current.setSelectedIds(['a']));
    act(() => result.current.renameElement('a', 'Student'));
    act(() => result.current.setSide('back'));
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.value.front.elements[0].label).toBeUndefined();
    act(() => result.current.setValue({ ...layout(), width: 200 }));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('copies a snapshot and pastes into the active side with new IDs', () => {
    const { result } = renderHook(() => useFixture());
    act(() => result.current.setSelectedIds(['a']));
    act(() => result.current.copySelection());
    act(() => result.current.renameElement('a', 'Changed after copying'));
    act(() => result.current.setSide('back'));
    act(() => result.current.pasteSelection());
    const copies = result.current.value.back!.elements;
    expect(copies).toHaveLength(2);
    expect(copies[1].label).toBeUndefined();
    expect(copies[1].id).not.toBe('a');
    expect(result.current.selectedIds).toEqual([copies[1].id]);
  });

  it('groups, expands group selection, duplicates and ungroups without changing originals', () => {
    const { result } = renderHook(() => useFixture());
    act(() => result.current.setSelectedIds(['a', 'b']));
    act(() => result.current.groupSelection());
    const originalGroup = result.current.value.front.elements[0].groupId;
    expect(originalGroup).toBeTruthy();
    act(() => result.current.setSelectedIds(['b']));
    expect(result.current.selectedIds).toEqual(['a', 'b']);
    act(() => result.current.duplicateSelection());
    expect(result.current.value.front.elements).toHaveLength(4);
    expect(result.current.selectedIds).toHaveLength(2);
    act(() => result.current.ungroupSelection());
    expect(result.current.value.front.elements.slice(2).map((e) => e.groupId)).toEqual([
      undefined,
      undefined,
    ]);
    expect(result.current.value.front.elements[0].groupId).toBe(originalGroup);
  });

  it('keeps locked layers unchanged except explicit unlock and excludes them from copying/deletion', () => {
    const initial = layout([layer('a'), layer('b', { locked: true })]);
    const { result } = renderHook(() => useFixture(initial));
    act(() => result.current.setSelectedIds(['a', 'b']));
    act(() => result.current.updateElements((element) => ({ ...element, x: 40 })));
    act(() => result.current.renameElement('b', 'Not allowed'));
    act(() => result.current.toggleVisibility('b'));
    expect(result.current.value.front.elements[1]).toEqual(initial.front.elements[1]);
    act(() => result.current.deleteSelection());
    expect(result.current.value.front.elements.map((e) => e.id)).toEqual(['b']);
    act(() => result.current.toggleLock('b'));
    expect(result.current.value.front.elements[0].locked).toBe(false);
  });

  it('blocks every mutation when disabled including undo, paste and direct commit', () => {
    const onLayoutChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ disabled }) =>
        useCardStudio({
          layout: layout(),
          side: 'front',
          onLayoutChange,
          disabled,
        }),
      { initialProps: { disabled: false } }
    );
    act(() => result.current.setSelectedIds(['a', 'b']));
    act(() => result.current.copySelection());
    act(() => result.current.renameElement('a', 'Name'));
    onLayoutChange.mockClear();
    rerender({ disabled: true });
    act(() => {
      result.current.commit(layout([]));
      result.current.undo();
      result.current.redo();
      result.current.pasteSelection();
      result.current.duplicateSelection();
      result.current.deleteSelection();
      result.current.groupSelection();
      result.current.ungroupSelection();
      result.current.alignSelection('left');
      result.current.distributeSelection('horizontal');
      result.current.orderSelection('front');
      result.current.toggleVisibility('a');
      result.current.toggleLock('a');
      result.current.renameElement('a', 'Blocked');
      result.current.updateElements((element) => ({ ...element, x: 42 }));
    });
    expect(onLayoutChange).not.toHaveBeenCalled();
    expect(result.current.canUndo).toBe(false);
  });

  it('uses the latest local layout for consecutive commands before a parent echo', () => {
    const initial = layout();
    const changes: IdentityCardLayout[] = [];
    const { result } = renderHook(() =>
      useCardStudio({
        layout: initial,
        side: 'front',
        onLayoutChange: (next) => changes.push(next),
      })
    );
    act(() => {
      result.current.renameElement('a', 'First');
      result.current.renameElement('b', 'Second');
    });
    expect(changes[1].front.elements.map((e) => e.label)).toEqual(['First', 'Second']);
  });

  it('does not create a back side or history for an empty command', () => {
    const initial = layout();
    delete initial.back;
    const onLayoutChange = vi.fn();
    const { result } = renderHook(() => useCardStudio({
      layout: initial, side: 'back', onLayoutChange,
    }));
    act(() => result.current.deleteSelection());
    expect(result.current.canUndo).toBe(false);
    expect(onLayoutChange).not.toHaveBeenCalled();
  });
});
