type EnrollmentTablePaginationOptions = {
  defaultPageSize?: number;
  minPageSize?: number;
  maxPageSize?: number;
  allowedPageSizes?: readonly number[];
};

const parsePositiveInteger = (value: string | null) => {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export function parseEnrollmentTablePagination(
  searchParams: Pick<URLSearchParams, 'get'>,
  {
    defaultPageSize = 25,
    minPageSize = 10,
    maxPageSize = 100,
    allowedPageSizes = [10, 25, 50, 100],
  }: EnrollmentTablePaginationOptions = {}
) {
  const oneBasedPage = parsePositiveInteger(searchParams.get('page')) ?? 1;
  const requestedPageSize = parsePositiveInteger(searchParams.get('pageSize')) ?? defaultPageSize;
  const boundedPageSize = Math.min(maxPageSize, Math.max(minPageSize, requestedPageSize));
  const pageSize = allowedPageSizes.includes(boundedPageSize) ? boundedPageSize : defaultPageSize;

  return {
    page: oneBasedPage - 1,
    pageSize,
  };
}
