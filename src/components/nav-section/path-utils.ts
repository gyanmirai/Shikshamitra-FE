export const preservePathQueryParams = (
  path: string | undefined,
  keys: string[] | undefined,
  searchParams: Pick<URLSearchParams, 'get'>
) => {
  if (!path || !keys?.length) return path;
  const url = new URL(path, 'https://navigation.local');
  keys.forEach((key) => {
    const value = searchParams.get(key);
    if (value) url.searchParams.set(key, value);
  });
  return `${url.pathname}${url.search}${url.hash}`;
};
