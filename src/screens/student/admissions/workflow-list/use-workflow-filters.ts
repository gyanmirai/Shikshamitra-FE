'use client';

import type { AdmissionWorkflowStatus } from 'src/redux/student/admissions/admission-workflows-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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

const readStatus = (value: string | null): WorkflowFilters['status'] => {
  const status = Number(value);
  return value !== null && Number.isInteger(status) && status >= 0 && status <= 7
    ? (status as AdmissionWorkflowStatus)
    : 'all';
};

const areFiltersEqual = (current: WorkflowFilters, next: WorkflowFilters) =>
  (Object.keys(next) as (keyof WorkflowFilters)[]).every((key) => current[key] === next[key]);

export function useWorkflowFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<WorkflowFilters>(() => ({
    search: searchParams.get('search') ?? '',
    status: readStatus(searchParams.get('status')),
    version: searchParams.get('version') ?? '',
    usage:
      searchParams.get('usage') === 'used' || searchParams.get('usage') === 'unused'
        ? (searchParams.get('usage') as 'used' | 'unused')
        : 'all',
    createdFrom: searchParams.get('from') ?? '',
    createdTo: searchParams.get('to') ?? '',
    page: Math.max(Number(searchParams.get('page') ?? 1) - 1, 0),
    rowsPerPage: Number(searchParams.get('size') ?? 10),
    columnFilters: serializeWorkflowColumnFilters(
      workflowColumnFilters(searchParams.get('columns') ?? '').filter(
        (filter) => !searchParams.get('version') || filter.column !== 'version'
      )
    ),
    sorting: searchParams.get('sort') ?? '',
  }));

  const commit = (next: WorkflowFilters) => {
    if (areFiltersEqual(filters, next)) return;

    setFilters(next);
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      search: next.search,
      status: next.status === 'all' ? '' : String(next.status),
      version: next.version,
      usage: next.usage === 'all' ? '' : next.usage,
      from: next.createdFrom,
      to: next.createdTo,
      page: next.page > 0 ? String(next.page + 1) : '',
      size: next.rowsPerPage !== 10 ? String(next.rowsPerPage) : '',
      columns: next.columnFilters ?? '',
      sort: next.sorting ?? '',
    };
    Object.entries(values).forEach(([key, value]) => value && params.set(key, value));
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };
  const update = (changes: Partial<WorkflowFilters>) =>
    commit({
      ...filters,
      ...changes,
      ...(changes.version !== undefined && changes.columnFilters === undefined
        ? {
            columnFilters: serializeWorkflowColumnFilters(
              workflowColumnFilters(filters.columnFilters ?? '').filter(
                (filter) => filter.column !== 'version'
              )
            ),
          }
        : {}),
      page: changes.page ?? 0,
    });
  const clear = () =>
    commit({
      search: '',
      status: 'all',
      version: '',
      usage: 'all',
      createdFrom: '',
      createdTo: '',
      page: 0,
      rowsPerPage: filters.rowsPerPage,
      columnFilters: '',
      sorting: '',
    });

  return {
    filters,
    update,
    clear,
    createdFrom: filters.createdFrom ? dayjs(filters.createdFrom) : null,
    createdTo: filters.createdTo ? dayjs(filters.createdTo) : null,
  };
}
