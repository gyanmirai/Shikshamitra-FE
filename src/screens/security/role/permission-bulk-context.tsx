import type { ReactNode } from 'react';

import { useMemo, useContext, createContext } from 'react';

import { canManageGrant, catalogueEntries } from './permission-catalogue';

import type { PermissionGrant } from './permission-grants';
import type { PermissionWorkspaceProps } from './permission-workspace';

type BulkContext = Pick<PermissionWorkspaceProps, 'states' | 'setStates' | 'disabled'> & {
  user: boolean;
  grants: PermissionGrant[];
  manageable: Set<string>;
};
const Context = createContext<BulkContext | null>(null);
export const usePermissionBulk = () => useContext(Context);

export default function PermissionBulkProvider({
  catalogue,
  provider,
  states,
  setStates,
  disabled,
  visibility,
  children,
}: PermissionWorkspaceProps & { children: ReactNode }) {
  /** Memoization Justification: every feature's bulk controls share the same catalogue
   * and eligibility index instead of rebuilding it for each row and draft edit. */
  const index = useMemo(() => {
    const entries = catalogueEntries(catalogue);
    return {
      grants: entries.map((entry) => ({ name: entry.name, isGranted: false })),
      manageable: new Set(
        entries.filter((entry) => canManageGrant(entry, provider)).map((entry) => entry.name)
      ),
    };
  }, [catalogue, provider]);
  /** Memoization Justification: all row controls consume this context; preserve its
   * identity when the catalogue, draft and editing callbacks have not changed. */
  const value = useMemo(
    () =>
      visibility
        ? null
        : {
            ...index,
            states,
            setStates,
            disabled,
            user: provider.providerName === 'U',
          },
    [visibility, index, states, setStates, disabled, provider.providerName]
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
