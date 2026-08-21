'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
  sorting: string;
  page: number;
  rowsPerPage: number;
};

export function useAdmissionOfferingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<AdmissionOfferingFilters>(() => ({
    admissionCycleId: searchParams.get('cycle') ?? '',
    campusId: searchParams.get('campus') ?? '',
    boardId: searchParams.get('board') ?? '',
    mediumId: searchParams.get('medium') ?? '',
    stageId: searchParams.get('stage') ?? '',
    standardId: searchParams.get('standard') ?? '',
    isActive: searchParams.get('active') ?? '',
    availabilityStatus: searchParams.get('availability') ?? '',
    configurationStatus: searchParams.get('configuration') ?? '',
    search: searchParams.get('search') ?? '',
    sorting: searchParams.get('sort') ?? '',
    page: Math.max(Number(searchParams.get('page') ?? 1) - 1, 0),
    rowsPerPage: Number(searchParams.get('size') ?? 10),
  }));

  const commit = (next: AdmissionOfferingFilters) => {
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

  return { filters, update };
}
