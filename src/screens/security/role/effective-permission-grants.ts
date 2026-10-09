import type { PermissionGrant } from './permission-grants';

export type InheritedGrants = Map<string, string[]>;

/** User denies are removed from the inherited map before resolving effective access. */
export function groupGrantState(
  names: string[],
  direct: PermissionGrant[],
  inherited: InheritedGrants
) {
  const directNames = new Set(direct.filter((grant) => grant.isGranted).map((grant) => grant.name));
  const effective = (name: string) => directNames.has(name) || !!inherited.get(name)?.length;
  return {
    checked: names.length > 0 && names.every(effective),
    hasDirect: names.some((name) => directNames.has(name)),
    inheritedOnly:
      names.length > 0 &&
      names.every((name) => !!inherited.get(name)?.length) &&
      !names.some((name) => directNames.has(name)),
    sources: [...new Set(names.flatMap((name) => inherited.get(name) ?? []))],
  };
}

export const effectivePermissionGrants = (direct: PermissionGrant[], inherited: InheritedGrants) =>
  direct.map((grant) => ({
    ...grant,
    isGranted: grant.isGranted || !!inherited.get(grant.name)?.length,
  }));
