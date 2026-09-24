'use client';

import type {
  AdmissionCycleStatus,
  AdmissionCycleWindowStatus,
} from 'src/redux/student/admissions/admission-cycles-api';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export type AdmissionCycleFilters = {
  academicYearId: string;
  status: AdmissionCycleStatus | '';
  windowStatus: AdmissionCycleWindowStatus | '';
  search: string;
  page: number;
  rowsPerPage: number;
};

const readNumberFilter = <T extends number>(
  value: string | null,
  minimum: number,
  maximum: number
): T | '' => {
  const parsed = Number(value);
  return value !== null &&
    value !== '' &&
    Number.isInteger(parsed) &&
    parsed >= minimum &&
    parsed <= maximum
    ? (parsed as T)
    : '';
};

const readPage = (value: string | null) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed - 1 : 0;
};

const readRowsPerPage = (value: string | null) => {
  const parsed = Number(value);
  return [10, 25, 100].includes(parsed) ? parsed : 10;
};

const areFiltersEqual = (current: AdmissionCycleFilters, next: AdmissionCycleFilters) =>
  (Object.keys(next) as (keyof AdmissionCycleFilters)[]).every((key) => current[key] === next[key]);

export function useAdmissionCycleFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<AdmissionCycleFilters>(() => ({
    academicYearId: searchParams.get('year') ?? '',
    status: readNumberFilter<AdmissionCycleStatus>(searchParams.get('status'), 0, 3),
    windowStatus: readNumberFilter<AdmissionCycleWindowStatus>(searchParams.get('window'), 0, 4),
    search: searchParams.get('search') ?? '',
    page: readPage(searchParams.get('page')),
    rowsPerPage: readRowsPerPage(searchParams.get('size')),
  }));

  const commit = (next: AdmissionCycleFilters) => {
    if (areFiltersEqual(filters, next)) return;

    setFilters(next);
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      year: next.academicYearId,
      status: next.status === '' ? '' : String(next.status),
      window: next.windowStatus === '' ? '' : String(next.windowStatus),
      search: next.search,
      page: next.page > 0 ? String(next.page + 1) : '',
      size: next.rowsPerPage !== 10 ? String(next.rowsPerPage) : '',
    };
    Object.entries(values).forEach(([key, value]) => value && params.set(key, value));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const update = (changes: Partial<AdmissionCycleFilters>) =>
    commit({ ...filters, ...changes, page: changes.page ?? 0 });

  const clear = () =>
    commit({
      academicYearId: '',
      status: '',
      windowStatus: '',
      search: '',
      page: 0,
      rowsPerPage: filters.rowsPerPage,
    });

  return { filters, update, clear };
}
