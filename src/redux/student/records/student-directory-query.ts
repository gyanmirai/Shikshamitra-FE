import type { StudentDirectoryInput } from './student-records-types';

export function studentDirectoryQueryParams(input: StudentDirectoryInput): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (key === 'columnFilters' && Array.isArray(value)) {
      value.forEach((filter, index) =>
        Object.entries(filter).forEach(([field, criterion]) => {
          if (criterion !== undefined)
            params.set(`columnFilters[${index}].${field}`, String(criterion));
        })
      );
    } else if (Array.isArray(value)) value.forEach((item) => params.append(key, String(item)));
    else if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  return params;
}
