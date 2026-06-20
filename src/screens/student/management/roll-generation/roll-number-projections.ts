export const extractRollNumberProjectionItems = (response: unknown): any[] | null => {
  const data = (response as { data?: unknown } | null | undefined)?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    const { items } = data as { items?: unknown };
    return Array.isArray(items) ? items : null;
  }

  return null;
};
