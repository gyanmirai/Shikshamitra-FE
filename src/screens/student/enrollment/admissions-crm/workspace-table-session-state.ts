'use client';

import type { SetStateAction } from 'react';
import type { IParams } from 'src/components/customizabaleTable/types';

import { useMemo, useState, useEffect, useCallback } from 'react';

type ColumnFilter = IParams['filters'][number];

export type WorkspaceTableSessionState = {
  search: string;
  filters: IParams['filters'];
};

type StoredWorkspaceTableSessionState = WorkspaceTableSessionState & {
  version: 1;
};

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

const legacyStoragePrefix = 'student-enrollment:table-state:v1:';
const storagePrefix = 'student-enrollment:table-state:v2:';
const maximumSearchLength = 2_000;
const maximumFilterCount = 50;
const maximumTokenLength = 200;
const emptyState: WorkspaceTableSessionState = { search: '', filters: [] };

const removeLegacyState = (storage: SessionStorageLike) => {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (key?.startsWith(legacyStoragePrefix)) storage.removeItem(key);
  }
};

const getSessionStorage = (): SessionStorageLike | undefined => {
  try {
    if (typeof window === 'undefined') return undefined;
    removeLegacyState(window.sessionStorage);
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

const getStorageKey = (scope: string) => `${storagePrefix}${scope}`;

const isFilterValue = (value: unknown): value is ColumnFilter['value'] =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  (Array.isArray(value) &&
    value.every(
      (item) =>
        item === null ||
        typeof item === 'string' ||
        typeof item === 'number' ||
        typeof item === 'boolean'
    ));

const optionalDisplayValue = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? value : undefined;

const sanitizeFilter = (value: unknown): ColumnFilter | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.column !== 'string' ||
    !candidate.column ||
    candidate.column.length > maximumTokenLength ||
    typeof candidate.type !== 'string' ||
    !candidate.type ||
    candidate.type.length > maximumTokenLength ||
    typeof candidate.valueType !== 'string' ||
    !candidate.valueType ||
    candidate.valueType.length > maximumTokenLength ||
    !isFilterValue(candidate.value)
  ) {
    return undefined;
  }

  const label = optionalDisplayValue(candidate.label);
  const displayValue = optionalDisplayValue(candidate.displayValue);
  return {
    column: candidate.column,
    type: candidate.type,
    value: candidate.value,
    valueType: candidate.valueType,
    ...(label === undefined ? {} : { label }),
    ...(displayValue === undefined ? {} : { displayValue }),
  };
};

const sanitizeState = (value: unknown): WorkspaceTableSessionState => {
  if (!value || typeof value !== 'object') return emptyState;

  const candidate = value as Partial<StoredWorkspaceTableSessionState>;
  if (candidate.version !== 1) return emptyState;

  const search =
    typeof candidate.search === 'string' ? candidate.search.slice(0, maximumSearchLength) : '';
  const filters = Array.isArray(candidate.filters)
    ? candidate.filters
        .slice(0, maximumFilterCount)
        .map(sanitizeFilter)
        .filter((filter): filter is ColumnFilter => Boolean(filter))
    : [];

  return { search, filters };
};

export const readWorkspaceTableSessionState = (
  scope: string,
  storage: SessionStorageLike | undefined = getSessionStorage()
): WorkspaceTableSessionState => {
  if (!storage) return emptyState;

  try {
    const serialized = storage.getItem(getStorageKey(scope));
    return serialized ? sanitizeState(JSON.parse(serialized)) : emptyState;
  } catch {
    return emptyState;
  }
};

export const writeWorkspaceTableSessionState = (
  scope: string,
  state: WorkspaceTableSessionState,
  storage: SessionStorageLike | undefined = getSessionStorage()
) => {
  if (!storage) return;

  try {
    const sanitized = sanitizeState({ version: 1, ...state });
    storage.setItem(
      getStorageKey(scope),
      JSON.stringify({ version: 1, ...sanitized } satisfies StoredWorkspaceTableSessionState)
    );
  } catch {
    // Browsing remains functional when session storage is unavailable or full.
  }
};

const resolveStateAction = <T>(action: SetStateAction<T>, current: T) =>
  typeof action === 'function' ? (action as (value: T) => T)(current) : action;

export function useWorkspaceTableSessionState(scope: string) {
  const [snapshot, setSnapshot] = useState(() => ({
    scope,
    state: readWorkspaceTableSessionState(scope),
  }));
  const currentState = useMemo(
    () => (snapshot.scope === scope ? snapshot.state : readWorkspaceTableSessionState(scope)),
    [scope, snapshot]
  );

  useEffect(() => {
    if (snapshot.scope === scope) return;
    setSnapshot({ scope, state: readWorkspaceTableSessionState(scope) });
  }, [scope, snapshot.scope]);

  useEffect(() => {
    if (snapshot.scope !== scope) return;
    writeWorkspaceTableSessionState(scope, snapshot.state);
  }, [scope, snapshot]);

  const setSearch = useCallback(
    (action: SetStateAction<string>) =>
      setSnapshot((current) => {
        const state =
          current.scope === scope ? current.state : readWorkspaceTableSessionState(scope);
        const nextState = { ...state, search: resolveStateAction(action, state.search) };
        writeWorkspaceTableSessionState(scope, nextState);
        return {
          scope,
          state: nextState,
        };
      }),
    [scope]
  );

  const setFilters = useCallback(
    (action: SetStateAction<IParams['filters']>) =>
      setSnapshot((current) => {
        const state =
          current.scope === scope ? current.state : readWorkspaceTableSessionState(scope);
        const nextState = { ...state, filters: resolveStateAction(action, state.filters) };
        writeWorkspaceTableSessionState(scope, nextState);
        return {
          scope,
          state: nextState,
        };
      }),
    [scope]
  );

  return {
    search: currentState.search,
    setSearch,
    filters: currentState.filters,
    setFilters,
  };
}
