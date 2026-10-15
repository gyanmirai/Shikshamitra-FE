import type { Board, Medium, AcademicYear } from 'src/types/school';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetUserScopeHierarchyQuery } from 'src/redux/userScope/userScopeApi';
import {
  getScopedAcademicData,
  getScopedAcademicYears,
  getGlobalAcademicSearchOptions,
} from 'src/utils/academicHierarchyUtils';

import { getStudentAcademicYears } from './student-academic-years';

import type { GlobalAcademicSearchOption } from './types';

type AcademicSession = {
  accessToken?: string;
  profile?: { sub?: string; tenantId?: string; tenantid?: string; tenant?: string };
};

export function useAcademicOptions() {
  const { data } = useSession();
  const session = data as AcademicSession | null;
  const pathname = usePathname();
  const isStudentModule = pathname === '/student' || pathname.startsWith('/student/');
  const isYearOnly = ['/dashboard', '/finance', '/library', '/calendar', '/hr', '/student'].some(
    (route) => pathname.startsWith(route)
  );
  const { data: years, isLoading: isYearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
    options: { skip: !session?.accessToken },
  }) as { data?: { items: AcademicYear[] }; isLoading: boolean };
  const { data: boardData, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
    options: { skip: !session?.accessToken },
  }) as { data?: { items: Board[] }; isLoading: boolean };
  const {
    currentData: scopeData,
    isLoading: isScopeLoading,
    isError: isScopeError,
  } = useGetUserScopeHierarchyQuery(
    {
      userId: session?.profile?.sub ?? '',
      cacheTenantId:
        session?.profile?.tenantId || session?.profile?.tenantid || session?.profile?.tenant,
    },
    {
      skip: !session?.profile?.sub || !session?.accessToken,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const accessControl =
    !isScopeError && scopeData?.userId === session?.profile?.sub ? scopeData : undefined;

  // Keep the merged hierarchy stable so selection-normalization effects only run on data changes.
  const allData = useMemo(
    () =>
      (years?.items ?? []).map((year) => ({
        ...year,
        boards: boardData?.items.filter((board) => board.academicYearId === year.id) ?? [],
      })),
    [boardData?.items, years?.items]
  );
  // Scope pruning traverses the hierarchy; cache it until the hierarchy or access changes.
  const scopedData = useMemo(
    () => getScopedAcademicData(allData, accessControl),
    [accessControl, allData]
  );
  // Stable year objects prevent normalization from repeatedly replacing the Redux selection.
  const scopedYears = useMemo(
    () =>
      isStudentModule
        ? getStudentAcademicYears(allData, accessControl)
        : getScopedAcademicYears(allData, accessControl),
    [accessControl, allData, isStudentModule]
  );
  // Options share the scoped object identities consumed by the normalization effect.
  const options = useMemo<GlobalAcademicSearchOption[]>(
    () => getGlobalAcademicSearchOptions(scopedData),
    [scopedData]
  );
  // Keep year-option identities stable for the default-selection effect.
  const yearOptions = useMemo<GlobalAcademicSearchOption[]>(
    () =>
      scopedYears.map((year) => ({
        label: year.name,
        value: year.id,
        academicYear: year,
        board: {} as Board,
        medium: {} as Medium,
      })),
    [scopedYears]
  );

  return {
    accessToken: session?.accessToken,
    years,
    boardData,
    isLoading: isYearLoading || isBoardLoading || isScopeLoading,
    isStudentModule,
    isYearOnly,
    scopedYears,
    options,
    yearOptions,
  };
}
