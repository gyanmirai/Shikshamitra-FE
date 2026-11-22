'use client';

import type { AdmissionWorkflowStatus } from 'src/redux/student/admissions/admission-workflows-api';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useStudentSetupEmbedding } from 'src/screens/student/setup/embedding';

import { workflowCreatedRange } from './workflow-date-range';
import { workflowColumnFilters, serializeWorkflowColumnFilters } from './workflow-column-filters';

export type WorkflowFilters = {
  search: string;
  status: 'all' | AdmissionWorkflowStatus;
  version: string;
  usage: 'all' | 'used' | 'unused';
  createdFrom: string;
  createdTo: string;
  page: number;
  rowsPerPage: number;
  columnFilters?: string;
  sorting?: string;
};

export const WORKFLOW_PAGE_SIZES = [10, 25, 50, 100];

const EMPTY_FILTERS = {
  status: 'all',
  version: '',
  usage: 'all',
  createdFrom: '',
  createdTo: '',
  columnFilters: '',
} as const;

const readPageSize = (value: number) =>
  WORKFLOW_PAGE_SIZES.includes(value) ? value : WORKFLOW_PAGE_SIZES[0];

const readStatus = (value: string | null): WorkflowFilters['status'] => {
  const status = Number(value);
  return value !== null && Number.isInteger(status) && status >= 0 && status <= 7
    ? (status as AdmissionWorkflowStatus)
    : 'all';
};

const areFiltersEqual = (current: WorkflowFilters, next: WorkflowFilters) =>
  (Object.keys(next) as (keyof WorkflowFilters)[]).every((key) => current[key] === next[key]);

export function useWorkflowFilters() {
  const { embedded } = useStudentSetupEmbedding();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<WorkflowFilters>(() => {
    const createdFrom = searchParams.get('from') ?? '';
    const createdTo = searchParams.get('to') ?? '';
    const range = workflowCreatedRange(createdFrom, createdTo);
    const usage = searchParams.get('usage');
    return {
      search: searchParams.get('search') ?? '',
      status: readStatus(searchParams.get('status')),
      version: searchParams.get('version') ?? '',
      usage: usage === 'used' || usage === 'unused' ? usage : 'all',
      createdFrom: range ? createdFrom : '',
      createdTo: range ? createdTo : '',
      page: Math.max(Number(searchParams.get('page') ?? 1) - 1, 0),
      rowsPerPage: readPageSize(Number(searchParams.get('size'))),
      columnFilters: serializeWorkflowColumnFilters(
        workflowColumnFilters(searchParams.get('columns') ?? '').filter(
          (filter) => !searchParams.get('version') || filter.column !== 'version'
        )
      ),
      sorting: searchParams.get('sort') ?? '',
    };
  });

  const commit = (next: WorkflowFilters) => {
    if (areFiltersEqual(filters, next)) return;

    setFilters(next);
    if (embedded) return;
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      search: next.search,
      status: next.status === 'all' ? '' : String(next.status),
      version: next.version,
      usage: next.usage === 'all' ? '' : next.usage,
      from: next.createdFrom,
      to: next.createdTo,
      page: next.page > 0 ? String(next.page + 1) : '',
      size: next.rowsPerPage !== WORKFLOW_PAGE_SIZES[0] ? String(next.rowsPerPage) : '',
      columns: next.columnFilters ?? '',
      sort: next.sorting ?? '',
    };
    Object.entries(values).forEach(([key, value]) => value && params.set(key, value));
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };
  const update = (changes: Partial<WorkflowFilters>) => {
    const next = {
      ...filters,
      ...changes,
      ...(changes.version !== undefined &&
      changes.version !== filters.version &&
      changes.columnFilters === undefined
        ? {
            columnFilters: serializeWorkflowColumnFilters(
              workflowColumnFilters(filters.columnFilters ?? '').filter(
                (filter) => filter.column !== 'version'
              )
            ),
          }
        : {}),
      page: changes.page ?? 0,
      rowsPerPage: readPageSize(changes.rowsPerPage ?? filters.rowsPerPage),
    };
    if (workflowCreatedRange(next.createdFrom, next.createdTo)) commit(next);
  };
  const clearFilters = () => update(EMPTY_FILTERS);
  const clear = () =>
    update({
      ...EMPTY_FILTERS,
      search: '',
      sorting: '',
    });

  return {
    filters,
    update,
    clear,
    clearFilters,
  };
}
