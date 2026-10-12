'use client';

import type { RootState } from 'src/redux/store';
import type { Board, AcademicYear } from 'src/types/school';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { getScopedAcademicData } from 'src/utils/academicHierarchyUtils';
import { useGetUserScopeHierarchyQuery } from 'src/redux/userScope/userScopeApi';

export function useStudentAcademicScope() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const year = useSelector((state: RootState) => state.globalState.currentYear);
  const staffSession = session as {
    profile?: { sub?: string; tenantId?: string; tenantid?: string; tenant?: string };
    accessToken?: string;
  } | null;
  const profile = staffSession?.profile;
  const enabled = Boolean(profile?.sub && staffSession?.accessToken && year?.id);
  const options = {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  };
  const scope = useGetUserScopeHierarchyQuery(
    {
      userId: profile?.sub ?? '',
      academicYearId: year?.id,
      cacheTenantId: profile?.tenantId || profile?.tenantid || profile?.tenant,
    },
    options
  );
  const hierarchy = useGetBoardsQuery(undefined, options);
  // Keep placement objects stable so filter consumers do not reset drafts on unrelated renders.
  const available = useMemo<Array<AcademicYear & { boards: Board[] }>>(
    () =>
      enabled &&
      !scope.isError &&
      !hierarchy.isError &&
      scope.currentData?.userId === profile?.sub &&
      hierarchy.currentData &&
      year
        ? getScopedAcademicData(
            [
              {
                ...year,
                boards: ((hierarchy.currentData.items ?? []) as Board[]).filter(
                  (board) => board.academicYearId === year.id
                ),
              },
            ],
            scope.currentData
          )
        : [],
    [
      enabled,
      scope.isError,
      scope.currentData,
      hierarchy.isError,
      hierarchy.currentData,
      year,
      profile?.sub,
    ]
  );
  const scopedYear = available[0];
  const boards = scopedYear?.boards ?? [];
  const requestedBoard = params.get('board');
  const board = requestedBoard ? boards.find((item) => item.id === requestedBoard) : boards[0];
  const mediums = board?.educationMediums ?? [];
  const requestedMedium = params.get('medium');
  const medium = requestedMedium ? mediums.find((item) => item.id === requestedMedium) : mediums[0];
  return {
    currentYear: scopedYear,
    currentBoard: board,
    currentMedium: medium,
    boards,
    mediums,
    isLoading: scope.isLoading || hierarchy.isLoading,
    isError: scope.isError || hierarchy.isError,
    scopeRevision: scope.currentData?.generatedAt,
  };
}
