import { canManageGrant, hasDirectGrant, catalogueEntries } from './permission-catalogue';

import type { GrantProvider, PermissionCatalogue, PermissionOverrideState } from './permission-catalogue';

export type PermissionStates = Record<string, PermissionOverrideState>;
export type PermissionChange = { name: string; state: PermissionOverrideState };
export const catalogueStates = (catalogue: PermissionCatalogue, provider: GrantProvider): PermissionStates =>
  Object.fromEntries(catalogueEntries(catalogue).map((entry) => [entry.name,
    provider.providerName === 'U' && catalogue.overrides?.[entry.name]
      ? catalogue.overrides[entry.name]
      : hasDirectGrant(entry, provider) ? 'allow' : 'inherit',
  ]));

export function draftChanges(catalogue: PermissionCatalogue, provider: GrantProvider, states: PermissionStates): PermissionChange[] {
  const initial = catalogueStates(catalogue, provider);
  return catalogueEntries(catalogue).filter((entry) => states[entry.name] !== initial[entry.name])
    .map((entry) => ({ name: entry.name, state: states[entry.name] }));
}

export function changesConflict(original: PermissionCatalogue, fresh: PermissionCatalogue, provider: GrantProvider, changes: PermissionChange[]) {
  const before = catalogueStates(original, provider);
  const after = catalogueStates(fresh, provider);
  const entries = new Map(catalogueEntries(fresh).map((entry) => [entry.name, entry]));
  return changes.some(({ name }) => {
    const entry = entries.get(name);
    return !entry || !canManageGrant(entry, provider) || before[name] !== after[name];
  });
}

export function changesPersisted(catalogue: PermissionCatalogue, provider: GrantProvider, changes: PermissionChange[]) {
  const states = catalogueStates(catalogue, provider);
  return changes.every(({ name, state }) => states[name] === state);
}
