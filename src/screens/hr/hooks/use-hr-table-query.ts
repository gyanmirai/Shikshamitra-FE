import type { IParams, ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { useHrOperationalTableQuery } from 'src/redux/hr/hrOperationalTableApi';

import fields from './hr-table-fields.json';

type FieldType = NonNullable<ICustomizableTableProps['serverColumnTypes']>[string];
const money = new Set([
  'fullGrossSalary',
  'grossSalary',
  'additionalEarnings',
  'totalEarnings',
  'totalDeduction',
  'netSalary',
  'previousMonthNetPay',
  'netPayDelta',
  'statutoryWages',
  'employeeContribution',
  'employerContribution',
  'wageCeiling',
  'fromSalary',
  'toSalary',
  'taxAmount',
]);
const numbers = new Set([
  'rowNumber',
  'employeePercentage',
  'employerPercentage',
  'present',
  'payableDays',
  'holidayCount',
  'version',
  'versionNumber',
  'ruleCount',
  'totalDays',
  'rowCount',
  'assignedCount',
  'finalizedCount',
  'weight',
  'priority',
  'documentSize',
  'totalRows',
  'validRows',
  'invalidRows',
  'amount',
]);
const dates = new Set([
  'dob',
  'doi',
  'startDate',
  'endDate',
  'attendanceDate',
  'periodStart',
  'periodEnd',
  'effectiveFrom',
]);
const timestamps = new Set([
  'submittedAt',
  'tokenExpiresAt',
  'updatedAt',
  'appliedOn',
  'creationTime',
  'capturedAt',
  'importedAt',
  'appliedDate',
]);
export function operationalColumnTypes(table: string): Record<string, FieldType> {
  return Object.fromEntries(
    ((fields as Record<string, string[]>)[table] ?? []).map((id) => [
      id,
      money.has(id)
        ? 'money'
        : numbers.has(id)
          ? 'number'
          : dates.has(id)
            ? 'date'
            : timestamps.has(id)
              ? 'datetime'
              : 'string',
    ])
  );
}

type Options = {
  table: string;
  query: Record<string, unknown>;
  /** Final response paging is always zero-based; source-specific page numbers stay in query. */
  page: number;
  size: number;
  resetPage: () => void;
  skip?: boolean;
  locked?: boolean;
  columnTypes?: Record<string, FieldType>;
  genericSearch?: boolean;
};

/** Keep existing screen mappers and mutation workflows. Active criteria read the complete,
 * authorized server population, never sort/filter the owning reader's loaded page. */
export function useHrTableQuery<T extends object>(options: Options, original: T) {
  const [filters, setFilters] = useState<IParams['filters']>([]);
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const [search, setSearch] = useState('');
  const active = filters.length > 0 || sorts.length > 0 || Boolean(search);
  const criteria = {
    search,
    filters: filters.map(({ column, type, value }) => ({ column, type, value })),
    sorts: sorts.map(({ column, direction }) => ({ column, direction })),
  };
  const filtered = useHrOperationalTableQuery(
    {
      table: options.table,
      query: options.query,
      criteria,
      offset: options.page * options.size,
      size: options.size,
    },
    { skip: !active || options.skip, refetchOnMountOrArgChange: true }
  );
  const tableProps: Pick<
    ICustomizableTableProps,
    | 'isFilter'
    | 'serverSideSort'
    | 'serverSideSortMode'
    | 'serverSideFilter'
    | 'onServerSort'
    | 'onServerFilter'
    | 'filters'
    | 'sorts'
    | 'serverColumnTypes'
    | 'isSearch'
    | 'serverSideSearch'
    | 'onServerSearch'
    | 'searchTerm'
  > = {
    isFilter: true,
    serverSideSort: true,
    serverSideSortMode: 'multiple',
    serverSideFilter: true,
    serverColumnTypes: options.locked
      ? {}
      : (options.columnTypes ?? operationalColumnTypes(options.table)),
    filters,
    sorts,
    ...(options.genericSearch
      ? {
          isSearch: true,
          serverSideSearch: true,
          searchTerm: search,
          onServerSearch: (value: string) => {
            if (options.locked) return;
            setSearch(value);
            options.resetPage();
          },
        }
      : {}),
    onServerSort: (_, selected) => {
      if (options.locked) return;
      setSorts(selected);
      options.resetPage();
    },
    onServerFilter: (selected) => {
      if (options.locked) return;
      setFilters(selected);
      options.resetPage();
    },
  };
  return {
    ...original,
    ...(active
      ? {
          data: filtered.currentData,
          currentData: filtered.currentData,
          isLoading: filtered.isFetching,
          isFetching: filtered.isFetching,
          isError: filtered.isError,
          error: filtered.error,
          refetch: filtered.refetch,
        }
      : {}),
    tableProps,
  } as T & { tableProps: typeof tableProps };
}
