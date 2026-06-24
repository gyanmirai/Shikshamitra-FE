type EmployeeSearchPageResponse = {
  currentPage?: unknown;
  pageSize?: unknown;
  totalCount?: unknown;
  totalPages?: unknown;
};

const toFiniteNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const hasMoreEmployeeSearchPages = (response: EmployeeSearchPageResponse) => {
  const currentPage = toFiniteNumber(response.currentPage);
  const totalPages = toFiniteNumber(response.totalPages);

  if (currentPage !== null && totalPages !== null) {
    return currentPage < totalPages;
  }

  const pageSize = toFiniteNumber(response.pageSize);
  const totalCount = toFiniteNumber(response.totalCount);

  if (currentPage === null || pageSize === null || totalCount === null) {
    return false;
  }

  return currentPage * pageSize < totalCount;
};
