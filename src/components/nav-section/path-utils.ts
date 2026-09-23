export const preservePathQueryParams = (
  path: string | undefined,
  keys: string[] | undefined,
  searchParams: Pick<URLSearchParams, 'get'>
) => {
  if (!path || !keys?.length) return path;
  const url = new URL(path, 'https://navigation.local');
  keys.forEach((key) => {
    const value = searchParams.get(key);
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  });
  return `${url.pathname}${url.search}${url.hash}`;
};

type NavigationClick = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

export const isPlainPrimaryNavigationClick = (event: NavigationClick) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const normalizeNavigationPath = (path?: string) => {
  if (!path) return '';

  const pathname = path.split(/[?#]/, 1)[0];

  if (!pathname || pathname.startsWith('http')) return '';

  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
};

export const isNavigationPathActive = (
  pathname: string,
  itemPath?: string,
  includeDescendants = false
) => {
  const currentPath = normalizeNavigationPath(pathname);
  const targetPath = normalizeNavigationPath(itemPath);

  if (!currentPath || !targetPath) return false;
  if (currentPath === targetPath) return true;

  return includeDescendants && targetPath !== '/' && currentPath.startsWith(`${targetPath}/`);
};
