import type { ReactNode } from 'react';

import { useMemo, useContext, createContext } from 'react';

import { inheritedSources, catalogueEntries } from './permission-catalogue';

import type { PermissionStates } from './permission-draft-state';
import type { GrantProvider, PermissionCatalogue, PermissionOverrideState } from './permission-catalogue';

type UserOverrides = {
  states: PermissionStates;
  sources: Map<string, string[]>;
  setStates: (names: string[], state: PermissionOverrideState) => void;
};
const UserPermissionContext = createContext<UserOverrides | undefined>(undefined);
export const useUserPermissionOverrides = () => useContext(UserPermissionContext);

export function UserPermissionProvider({ children, catalogue, provider, states, setStates }: {
  children: ReactNode;
  catalogue: PermissionCatalogue;
  provider: GrantProvider;
  states: PermissionStates;
  setStates: UserOverrides['setStates'];
}) {
  /** Memoization Justification: keep the context stable across unrelated dialog renders;
   * all action and visibility controls subscribe to this value. */
  const value = useMemo(() => provider.providerName === 'U' ? {
    states, setStates,
    sources: new Map(catalogueEntries(catalogue).map((entry) => [entry.name,
      inheritedSources(entry, provider).map((source) => source.providerName === 'R'
        ? source.providerKey : `${source.providerName} ${source.providerKey}`),
    ])),
  } : undefined, [catalogue, provider, states, setStates]);
  return <UserPermissionContext.Provider value={value}>{children}</UserPermissionContext.Provider>;
}

export function effectiveInheritance(inherited: Map<string, string[]>, states?: PermissionStates) {
  return new Map([...inherited].map(([name, sources]) => [name, states?.[name] === 'deny' ? [] : sources]));
}
