'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { readAcademicFilterIds } from 'src/utils/student-academic-filter-query';

export type AdmissionOfferingFilters = {
  admissionCycleId: string;
  campusId: string;
  boardId: string;
  mediumId: string;
  stageId: string;
  standardId: string;
  isActive: string;
  availabilityStatus: string;
  configurationStatus: string;
  search: string;
  columnFilters?: string;
  sorting: string;
  page: number;
  rowsPerPage: number;
};

const areFiltersEqual = (current: AdmissionOfferingFilters, next: AdmissionOfferingFilters) =>
  (Object.keys(next) as (keyof AdmissionOfferingFilters)[]).every(
    (key) => current[key] === next[key]
  );

export function useAdmissionOfferingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<AdmissionOfferingFilters>(() => ({
    admissionCycleId: searchParams.get('cycle') ?? '',
    campusId: searchParams.get('campus') ?? '',
    boardId: readAcademicFilterIds(searchParams.get('board'))[0] ?? '',
    mediumId: readAcademicFilterIds(searchParams.get('medium'))[0] ?? '',
    stageId: searchParams.get('stage') ?? '',
    standardId: searchParams.get('standard') ?? '',
    isActive: searchParams.get('active') ?? '',
    availabilityStatus: searchParams.get('availability') ?? '',
    configurationStatus: searchParams.get('configuration') ?? '',
    search: searchParams.get('search') ?? '',
    columnFilters: searchParams.get('filters') ?? '',
    sorting: searchParams.get('sort') ?? '',
    page: Math.max(Number(searchParams.get('page') ?? 1) - 1, 0),
    rowsPerPage: Number(searchParams.get('size') ?? 10),
  }));

  const commit = (next: AdmissionOfferingFilters) => {
    if (areFiltersEqual(filters, next)) return;

    setFilters(next);
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      cycle: next.admissionCycleId,
      campus: next.campusId,
      board: next.boardId,
      medium: next.mediumId,
      stage: next.stageId,
      standard: next.standardId,
      active: next.isActive,
      availability: next.availabilityStatus,
      configuration: next.configurationStatus,
      search: next.search,
      filters: next.columnFilters ?? '',
      sort: next.sorting,
      page: next.page > 0 ? String(next.page + 1) : '',
      size: next.rowsPerPage !== 10 ? String(next.rowsPerPage) : '',
    };
    Object.entries(values).forEach(([key, value]) => value && params.set(key, value));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const update = (changes: Partial<AdmissionOfferingFilters>) =>
    commit({ ...filters, ...changes, page: changes.page ?? 0 });

  const clearFilters = () =>
    commit({
      ...filters,
      campusId: '',
      boardId: filters.boardId,
      mediumId: filters.mediumId,
      stageId: '',
      standardId: '',
      isActive: '',
      availabilityStatus: '',
      configurationStatus: '',
      search: '',
      columnFilters: '',
      page: 0,
    });

  return { filters, update, clearFilters };
}
