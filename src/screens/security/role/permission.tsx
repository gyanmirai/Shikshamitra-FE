'use client';

import PermissionWorkspace from './permission-workspace';
import { useUserPermissionOverrides } from './user-permission-context';

import type { GrantProvider, PermissionCatalogue } from './permission-catalogue';

export default function Permission({
  catalogue,
  provider,
  grants,
  setGrants,
  disabled = false,
  subjectName,
}: {
  catalogue: PermissionCatalogue;
  provider: GrantProvider;
  grants: Record<string, boolean>;
  setGrants: (names: string[], value: boolean) => void;
  disabled?: boolean;
  subjectName?: string;
}) {
  const overrides = useUserPermissionOverrides();
  return (
    <PermissionWorkspace
      catalogue={catalogue}
      provider={provider}
      disabled={disabled}
      subjectName={subjectName}
      states={
        overrides?.states ??
        Object.fromEntries(
          Object.entries(grants).map(([name, allowed]) => [name, allowed ? 'allow' : 'inherit'])
        )
      }
      setStates={overrides?.setStates ?? ((names, state) => setGrants(names, state === 'allow'))}
    />
  );
}
