import { useRef, useState, useEffect } from 'react';

import { useStudioHistory } from './use-studio-history';
import { alignElements, distributeElements } from './geometry-commands';
import { studioId, orderElements, updateSelected, duplicateElements } from './layer-commands';

import type { StudioHistoryOptions } from './use-studio-history';
import type { StudioAxis, StudioAlign } from './geometry-commands';
import type { StudioOrder, ElementTransform } from './layer-commands';
import type { IdentityCardLayout, IdentityCardElement } from '../types';

export type { StudioAxis, StudioAlign } from './geometry-commands';
export type { StudioOrder, ElementTransform } from './layer-commands';
export type StudioOptions = StudioHistoryOptions & { side: 'front' | 'back' };

export function useCardStudio(options: StudioOptions) {
  const { side, disabled } = options;
  const history = useStudioHistory(options);
  const [selection, setSelection] = useState<string[]>([]);
  const [hasClipboard, setHasClipboard] = useState(false);
  const clipboard = useRef<IdentityCardElement[]>([]);
  const elements = history.layout[side]?.elements ?? [];
  const selectedIds = selection.filter((id) => elements.some((element) => element.id === id));
  const selectedElements = elements.filter((element) => selectedIds.includes(element.id));

  useEffect(() => setSelection([]), [side]);

  function setSelectedIds(ids: string[]) {
    const current = history.read()[side]?.elements ?? [];
    const groups = new Set(
      current.filter((e) => ids.includes(e.id) && e.groupId).map((e) => e.groupId)
    );
    setSelection(
      current
        .filter((e) => ids.includes(e.id) || (e.groupId && groups.has(e.groupId)))
        .map((e) => e.id)
    );
  }

  function change(
    transform: (current: IdentityCardElement[], layout: IdentityCardLayout) => IdentityCardElement[]
  ) {
    if (disabled) return;
    const current = history.read();
    const next = transform(current[side]?.elements ?? [], current);
    if (!current[side] && !next.length) return;
    history.commit({ ...current, [side]: { ...current[side], elements: next } });
  }

  function updateElements(transform: ElementTransform) {
    change((current) => updateSelected(current, selectedIds, transform));
  }

  function copySelection() {
    if (disabled) return;
    clipboard.current = structuredClone(
      (history.read()[side]?.elements ?? []).filter(
        (element) => selectedIds.includes(element.id) && !element.locked
      )
    );
    setHasClipboard(clipboard.current.length > 0);
  }

  function paste(source = clipboard.current) {
    if (disabled || !source.length) return;
    change((current, layout) => {
      const next = duplicateElements(current, source, layout.width, layout.height);
      setSelection(next.slice(current.length).map((element) => element.id));
      return next;
    });
  }

  function groupSelection() {
    if (selectedElements.filter((element) => !element.locked).length < 2) return;
    const groupId = studioId();
    updateElements((element) => ({ ...element, groupId }));
  }

  function deleteSelection() {
    change((current) =>
      current.filter((element) => element.locked || !selectedIds.includes(element.id))
    );
    if (!disabled) setSelection([]);
  }

  return {
    selectedIds,
    setSelectedIds,
    selectedElements,
    commit: history.commit,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    updateElements,
    copySelection,
    canPaste: !disabled && hasClipboard,
    pasteSelection: () => paste(),
    duplicateSelection: () =>
      paste(
        (history.read()[side]?.elements ?? []).filter(
          (element) => selectedIds.includes(element.id) && !element.locked
        )
      ),
    deleteSelection,
    groupSelection,
    ungroupSelection: () => updateElements(({ groupId, ...element }) => element),
    alignSelection: (mode: StudioAlign) =>
      change((current, layout) =>
        alignElements(current, selectedIds, mode, layout.width, layout.height)
      ),
    distributeSelection: (axis: StudioAxis) =>
      change((current) => distributeElements(current, selectedIds, axis)),
    orderSelection: (mode: StudioOrder) =>
      change((current) => orderElements(current, selectedIds, mode)),
    toggleVisibility: (id: string) =>
      change((current) =>
        updateSelected(current, [id], (element) => ({ ...element, visible: !element.visible }))
      ),
    toggleLock: (id: string) =>
      change((current) =>
        current.map((element) =>
          element.id === id ? { ...element, locked: !element.locked } : element
        )
      ),
    renameElement: (id: string, label: string) =>
      change((current) => updateSelected(current, [id], (element) => ({ ...element, label }))),
  };
}

export type StudioController = ReturnType<typeof useCardStudio>;
