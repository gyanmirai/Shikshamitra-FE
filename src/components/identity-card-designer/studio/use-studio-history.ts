import { useRef, useState, useEffect } from 'react';

import { sameLayout, redoHistory, undoHistory, createHistory, commitHistory } from './history';

import type { StudioHistory } from './history';
import type { IdentityCardLayout } from '../types';

export type StudioHistoryOptions = {
  layout: IdentityCardLayout;
  onLayoutChange: (next: IdentityCardLayout) => void;
  disabled?: boolean;
};

export function useStudioHistory({ layout, onLayoutChange, disabled }: StudioHistoryOptions) {
  const [history, setHistory] = useState(() => createHistory(layout));
  const current = useRef(history);
  const observed = useRef(layout);
  const echoes = useRef<IdentityCardLayout[]>([]);

  useEffect(() => {
    if (observed.current === layout) return;
    observed.current = layout;
    const echo = echoes.current.findIndex((candidate) => sameLayout(candidate, layout));
    if (echo >= 0) {
      echoes.current = echoes.current.slice(echo + 1);
      return;
    }
    if (sameLayout(current.current.present, layout)) return;
    echoes.current = [];
    current.current = createHistory(layout);
    setHistory(current.current);
  }, [layout]);

  function apply(next: StudioHistory) {
    if (disabled || next === current.current) return;
    current.current = next;
    echoes.current = [...echoes.current, next.present].slice(-100);
    setHistory(next);
    onLayoutChange(next.present);
  }

  return {
    layout: history.present,
    read: () => current.current.present,
    commit: (next: IdentityCardLayout) => apply(commitHistory(current.current, next)),
    undo: () => apply(undoHistory(current.current)),
    redo: () => apply(redoHistory(current.current)),
    canUndo: !disabled && history.past.length > 0,
    canRedo: !disabled && history.future.length > 0,
  };
}
