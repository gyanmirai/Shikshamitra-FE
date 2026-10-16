import { canManageGrant, inheritedSources, catalogueEntries } from './permission-catalogue';

import type { MatrixModel, MatrixAction } from './permission-matrix-model';

export function matrixAction(
  names: string[],
  label: string,
  model: MatrixModel,
  visibility = false
): MatrixAction {
  const { provider, states } = model;
  const byName =
    model.entries ?? new Map(catalogueEntries(model.catalogue).map((entry) => [entry.name, entry]));
  const entries = names.flatMap((name) => (byName.get(name) ? [byName.get(name)!] : []));
  const sources = [
    ...new Set(
      entries.flatMap((entry) =>
        inheritedSources(entry, provider).map((source) => source.providerKey)
      )
    ),
  ];
  const rules = names.map((name) => states[name] ?? 'inherit');
  const rule = rules.every((value) => value === rules[0]) ? (rules[0] ?? 'inherit') : 'mixed';
  const roleAllowed = entries.filter(
    (entry) => inheritedSources(entry, provider).length > 0
  ).length;
  const allowed = entries.filter(
    (entry) =>
      states[entry.name] === 'allow' ||
      (states[entry.name] !== 'deny' && inheritedSources(entry, provider).length > 0)
  ).length;
  const result = !names.length || entries.length !== names.length
    ? 'Unavailable'
    : allowed === names.length
      ? visibility
        ? 'Visible'
        : 'Allowed'
      : allowed
        ? 'Mixed access'
        : visibility
          ? 'Hidden'
          : 'Denied';
  const hasDirect = rules.includes('allow');
  return {
    names,
    action: label,
    label: label === 'ChangeStatus' ? 'Change Status' : label,
    rule,
    result,
    roleResult:
      roleAllowed === names.length && names.length
        ? 'Allowed'
        : roleAllowed
          ? 'Mixed access'
          : 'Denied',
    sources,
    editable:
      names.length > 0 &&
      entries.length === names.length &&
      entries.every((entry) => canManageGrant(entry, provider)) &&
      (provider.providerName === 'U' || hasDirect || roleAllowed !== names.length),
    overridden: provider.providerName === 'U' && rules.some((value) => value !== 'inherit'),
    hasDirect,
  };
}
