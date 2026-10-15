type IdentitySearch = {
  get: (name: string) => string | null;
  has: (name: string) => boolean;
  toString: () => string;
};

export function identityTab(search: IdentitySearch): number {
  const scope = search.get('scope');
  return scope === 'defaults' ? 0 : scope === 'overrides' || search.has('boardId') ? 1 : 0;
}

export function identityHref(
  pathname: string,
  search: IdentitySearch,
  changes: Record<string, string>
): string {
  const next = new URLSearchParams(search.toString());
  Object.entries(changes).forEach(([name, value]) => {
    if (value) next.set(name, value);
    else next.delete(name);
  });
  const query = next.toString();
  return `${pathname}${query ? `?${query}` : ''}`;
}
