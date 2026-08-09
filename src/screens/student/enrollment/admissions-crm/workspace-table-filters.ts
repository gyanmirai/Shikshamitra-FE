import type { IParams } from 'src/components/customizabaleTable/types';

const getLatestFilter = (filters: IParams['filters'], column: string) => {
  for (let index = filters.length - 1; index >= 0; index -= 1) {
    if (filters[index].column === column) return filters[index];
  }
  return undefined;
};

export const getLatestEnumFilter = (filters: IParams['filters'], column: string) => {
  const filter = getLatestFilter(filters, column);
  return filter ? Number(filter.value) : undefined;
};

export const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const filter = getLatestFilter(filters, column);
  return filter?.value ? String(filter.value) : undefined;
};

export const getDateFilterBounds = (filters: IParams['filters'], column: string) => {
  const filter = getLatestFilter(filters, column);
  if (!filter || typeof filter.value !== 'string') return {};

  const [day, month, year] = filter.value.split('-').map(Number);
  if (!day || !month || !year) return {};

  const value = new Date(Date.UTC(year, month - 1, day));
  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return {};
  }
  if (filter.type === 'after') {
    value.setUTCDate(value.getUTCDate() + 1);
    return { from: value.toISOString() };
  }
  if (filter.type === 'before') {
    value.setUTCDate(value.getUTCDate() - 1);
    return { until: value.toISOString() };
  }

  const iso = value.toISOString();
  return { from: iso, until: iso };
};
