import { useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetStudentModuleDashboardFiltersQuery } from 'src/redux/student/dashboard/student-module-dashboard-api';

import {
  dashboardApiScope,
  validDashboardFilters,
  dashboardFiltersFromUrl,
} from '../admin-dashboard-scope';

import type { DirectoryFilters } from '../../records/student-directory-filter-fields';

export function useAdminDashboardScope(
  identityKey: string,
  academicYearId: string,
  enabled: boolean
) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentQuery = params.toString();
  const filters = dashboardFiltersFromUrl(params, academicYearId);
  const query = useGetStudentModuleDashboardFiltersQuery(
    { identityKey, academicYearId },
    {
      skip: !enabled || !academicYearId,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const options = !query.isError ? query.currentData : undefined;
  const valid = Boolean(options && validDashboardFilters(filters, options));
  const update = useCallback(
    (changes: Partial<DirectoryFilters>) => {
      const next = new URLSearchParams(currentQuery);
      const values = { ...dashboardFiltersFromUrl(next, academicYearId), ...changes };
      Object.entries(values).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      next.set('year', academicYearId);
      const search = next.toString();
      if (search !== currentQuery) router.replace(`${pathname}?${search}`, { scroll: false });
    },
    [academicYearId, currentQuery, pathname, router]
  );
  // A year change must not carry class IDs from the previous year's hierarchy.
  useEffect(() => {
    if (academicYearId && params.get('year') && params.get('year') !== academicYearId) {
      update({ board: '', medium: '', class: '', division: '' });
    }
  }, [academicYearId, params, update]);
  return { filters, scope: dashboardApiScope(filters), options, valid, query, update };
}
