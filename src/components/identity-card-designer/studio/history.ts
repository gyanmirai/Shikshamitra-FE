import type { IdentityCardLayout } from '../types';

export type StudioHistory = {
  past: IdentityCardLayout[];
  present: IdentityCardLayout;
  future: IdentityCardLayout[];
};

export const sameLayout = (a: IdentityCardLayout, b: IdentityCardLayout) =>
  a === b || JSON.stringify(a) === JSON.stringify(b);

export const createHistory = (present: IdentityCardLayout): StudioHistory => ({
  past: [],
  present,
  future: [],
});

export function commitHistory(history: StudioHistory, next: IdentityCardLayout): StudioHistory {
  if (sameLayout(history.present, next)) return history;
  return { past: [...history.past, history.present].slice(-50), present: next, future: [] };
}

export function undoHistory(history: StudioHistory): StudioHistory {
  if (!history.past.length) return history;
  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future],
  };
}

export function redoHistory(history: StudioHistory): StudioHistory {
  if (!history.future.length) return history;
  return {
    past: [...history.past, history.present].slice(-50),
    present: history.future[0],
    future: history.future.slice(1),
  };
}
