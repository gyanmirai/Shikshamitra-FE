import type { RootState } from 'src/redux/store';
import type { Board, Medium, AcademicYear } from 'src/types/school';
import type {
  StudentAcademic360SmartFilter,
  StudentAcademic360ListSummary,
} from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetStudentAcademic360ListQuery } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import type { AcademicSmartFilter } from '../listUtils';

type TableSort = { column: string; direction: 'asc' | 'desc'; originalId?: string };

const ALL_OPTION_ID = 'ALL';

const smartFilterMap: Record<AcademicSmartFilter, StudentAcademic360SmartFilter> = {
  all: 'All',
  needsAttention: 'NeedsAttention',
  lowAttendance: 'LowAttendance',
  overdueHomework: 'OverdueHomework',
  performanceDecline: 'PerformanceDecline',
  noData: 'NoData',
};

const emptySummary: StudentAcademic360ListSummary = {
  totalStudents: 0,
  needsAttention: 0,
  averageAttendance: null,
  homeworkCompletion: null,
  averageExamScore: null,
};

export function useStudentAcademic360List(
  selectedClass: string,
  selectedDivision: string,
  activeFilter: AcademicSmartFilter
) {
  const globalState = useSelector((state: RootState) => state.globalState);
  const currentYear = globalState.currentYear as AcademicYear;
  const currentBoard = globalState.currentBoard as Board;
  const currentMedium = globalState.currentMedium as Medium;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorts, setSorts] = useState<TableSort[]>([]);

  const sorting = sorts[0]
    ? `${sorts[0].originalId || sorts[0].column} ${sorts[0].direction}`
    : undefined;
  const hasContext = Boolean(currentYear?.id && currentBoard?.id && currentMedium?.id);
  const query = useGetStudentAcademic360ListQuery(
    {
      academicYearId: currentYear?.id || '',
      boardId: currentBoard?.id || '',
      educationMediumId: currentMedium?.id || '',
      standardId: selectedClass === ALL_OPTION_ID ? undefined : selectedClass,
      divisionId: selectedDivision === ALL_OPTION_ID ? undefined : selectedDivision,
      searchTerm: searchTerm || undefined,
      smartFilter: smartFilterMap[activeFilter],
      sorting,
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
    },
    { skip: !hasContext }
  );

  const handlePagination = (nextPage: number, nextRowsPerPage: number) => {
    setPage(nextPage - 1);
    setRowsPerPage(nextRowsPerPage);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleSort = (_column: string, nextSorts: TableSort[]) => {
    setSorts(nextSorts.slice(0, 1));
    setPage(0);
  };

  return {
    rows: query.currentData?.items || [],
    summary: query.currentData?.summary || emptySummary,
    totalCount: query.currentData?.totalCount || 0,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    page,
    rowsPerPage,
    searchTerm,
    sorts,
    handlePagination,
    handleSearch,
    handleSort,
    resetPage: () => setPage(0),
    retry: query.refetch,
  };
}
