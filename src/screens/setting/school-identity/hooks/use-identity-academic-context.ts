import type { RootState } from 'src/redux/store';
import type { Board, Medium, AcademicYear } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardByIdQuery, useGetAcademicHierarchyQuery } from 'src/redux/board/boardApi';

export function useIdentityAcademicContext({
  canView,
  tab,
  yearId,
  boardId,
}: {
  canView: boolean;
  tab: number;
  yearId: string;
  boardId: string;
}) {
  const currentYearId = useSelector((state: RootState) => state.globalState?.currentYear?.id);
  const shellBoard: Partial<Board> = useSelector(
    (state: RootState) => state.globalState?.currentBoard ?? {}
  );
  const shellMedium: Partial<Medium> = useSelector(
    (state: RootState) => state.globalState?.currentMedium ?? {}
  );
  const yearsQuery = useGetYearQuery(undefined, { skip: !canView || tab === 0 });
  const needsBoardYear = Boolean(boardId && !yearId && tab === 1 && canView);
  const boardLookup = useGetBoardByIdQuery(boardId, { skip: !needsBoardYear });
  const linkedBoard: Board | undefined = boardLookup.currentData;
  const years: AcademicYear[] = yearsQuery.data?.items ?? [];
  const selectedYear =
    yearId ||
    (boardId
      ? (linkedBoard?.academicYearId ?? '')
      : years.find((year) => year.id === currentYearId)?.id || years[0]?.id || '');
  const hierarchy = useGetAcademicHierarchyQuery(selectedYear, {
    skip: !canView || tab === 0 || !selectedYear,
  });
  const boards: Board[] = hierarchy.currentData?.items ?? [];
  const currentBoard =
    shellBoard.id &&
    shellBoard.academicYearId &&
    years.some((year) => year.id === shellBoard.academicYearId)
      ? shellBoard
      : undefined;
  const currentMedium =
    currentBoard?.educationMediums?.find((medium) => medium.id === shellMedium.id) ??
    (currentBoard?.id && shellMedium.educationBoardId === currentBoard.id
      ? shellMedium
      : undefined);
  return {
    years,
    boards,
    selectedYear,
    yearsQuery,
    currentBoard,
    currentMedium,
    boardsQuery: {
      ...hierarchy,
      isLoading: hierarchy.isLoading || (needsBoardYear && boardLookup.isLoading),
      isFetching: hierarchy.isFetching || (needsBoardYear && boardLookup.isFetching),
      isError: hierarchy.isError || (needsBoardYear && boardLookup.isError),
      refetch: () => {
        if (needsBoardYear && (boardLookup.isError || !selectedYear)) boardLookup.refetch();
        else if (selectedYear) hierarchy.refetch();
      },
    },
  };
}
