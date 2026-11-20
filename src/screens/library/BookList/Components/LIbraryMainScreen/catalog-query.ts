export type CatalogView = 'list' | 'cover' | 'summary';

const positiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function readCatalogQuery(params: URLSearchParams, academicYearId?: string) {
  const view = params.get('view');
  const letter = params.get('alphabet') || 'ALL';
  const pageSize = positiveInteger(params.get('pageSize'), 10);
  return {
    search: params.get('search') || '',
    alphabet: /^[A-Z]$/.test(letter) ? letter : 'ALL',
    view: (view === 'cover' || view === 'summary' ? view : 'list') as CatalogView,
    page: params.get('year') === academicYearId ? positiveInteger(params.get('page'), 1) : 1,
    pageSize: [10, 25, 50].includes(pageSize) ? pageSize : 10,
  };
}

export function changeCatalogQuery(
  params: URLSearchParams,
  academicYearId: string | undefined,
  changes: Record<string, string | number>
) {
  const next = new URLSearchParams(params);
  Object.entries(changes).forEach(([key, value]) => {
    if (value === '') next.delete(key);
    else next.set(key, String(value));
  });
  if (academicYearId) next.set('year', academicYearId);
  return next;
}
