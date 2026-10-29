import { useMemo, useState } from 'react';

import { missingVisibility, buildVisibilityPrerequisites } from './visibility-prerequisites';
import { canManageGrant, catalogueEntries, buildVisibilityPanels } from './permission-catalogue';

import type { PermissionWorkspaceProps } from './permission-workspace';
import type { NavigationPermission, PermissionOverrideState } from './permission-catalogue';

export function useVisibilityPrerequisite({
  catalogue,
  provider,
  states,
  setStates,
  disabled,
  visibility,
  modules,
}: PermissionWorkspaceProps & { modules: NavigationPermission[] }) {
  const [pending, setPending] = useState<{ names: string[]; provider: string }>();
  const providerIdentity = `${provider.providerName}:${provider.providerKey}`;
  /** Memoization Justification: build the navigation dependency index once for all matrix
   * cells and bulk controls instead of walking every module for each action. */
  const { index, labels } = useMemo(
    () => ({
      index: buildVisibilityPrerequisites(modules),
      labels: new Map(
        buildVisibilityPanels(modules).flatMap(
          (panel) =>
            [
              [panel.permissionName, `${panel.title} module`],
              ...panel.submodule.map((node) => [
                node.permissionName,
                `${panel.title} / ${node.title}`,
              ]),
            ] as [string, string][]
        )
      ),
    }),
    [modules]
  );
  const missing = (names: string[]) =>
    visibility ? [] : missingVisibility(names, index, catalogue, provider, states);
  const pendingNames = pending?.provider === providerIdentity ? pending.names : undefined;
  const required = pendingNames ? missing(pendingNames) : [];
  const entries = catalogueEntries(catalogue);
  const canConfirm = [...(pendingNames ?? []), ...required].every((name) => {
    const entry = entries.find((item) => item.name === name);
    return entry && canManageGrant(entry, provider);
  });
  const requestChange = (names: string[], state: PermissionOverrideState) => {
    if (disabled) return;
    if (state === 'allow' && missing(names).length) {
      setPending({ names, provider: providerIdentity });
      return;
    }
    setStates(names, state);
  };
  return {
    index,
    missing,
    requestChange,
    confirmation: {
      open: !!pendingNames,
      disabled: disabled || !canConfirm,
      unavailable: !canConfirm,
      required: required.map((name) => ({
        ...(entries.find((entry) => entry.name === name) ?? {
          name,
          isGranted: false,
          allowedProviders: [],
          grantedProviders: [],
        }),
        displayName: labels.get(name) ?? 'Navigation visibility',
      })),
      onClose: () => setPending(undefined),
      onConfirm: () => {
        if (disabled || !canConfirm || !pendingNames) return;
        setStates([...new Set([...pendingNames, ...required])], 'allow');
        setPending(undefined);
      },
    },
  };
}
