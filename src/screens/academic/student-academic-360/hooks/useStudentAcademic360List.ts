import { useState, useEffect, useCallback } from 'react';
import { useGetStudentAcademic360ListQuery } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import type { AcademicSmartFilter } from '../listUtils';

const smartFilterValues: Record<AcademicSmartFilter, number> = {
  all: 0,
  needsAttention: 1,
  lowAttendance: 2,
  overdueHomework: 3,
  performanceDecline: 4,
  noData: 5,
};

type ListScope = {
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  standardId?: string;
  divisionId?: string;
};

export function useStudentAcademic360List(scope: ListScope) {
  const scopeKey = [
    scope.academicYearId,
    scope.boardId,
    scope.educationMediumId,
    scope.standardId,
    scope.divisionId,
  ].join(':');
  const [pageState, setPageState] = useState({ scopeKey, page: 0 });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState('');
  const [activeFilter, setActiveFilter] = useState<AcademicSmartFilter>('all');
  const page = pageState.scopeKey === scopeKey ? pageState.page : 0;
  const isReady = Boolean(scope.academicYearId && scope.boardId && scope.educationMediumId);

  useEffect(() => {
    if (pageState.scopeKey !== scopeKey) setPageState({ scopeKey, page: 0 });
  }, [pageState.scopeKey, scopeKey]);

  const query = useGetStudentAcademic360ListQuery(
    {
      ...scope,
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
      searchTerm,
      smartFilter: smartFilterValues[activeFilter],
      sorting,
    },
    { skip: !isReady }
  );

  const changeFilter = (filter: AcademicSmartFilter) => {
    setActiveFilter(filter);
    setPageState({ scopeKey, page: 0 });
  };

  const changeSearch = (value: string) => {
    setSearchTerm(value);
    setPageState({ scopeKey, page: 0 });
  };

  const changeSort = (
    _column: string,
    sorts: Array<{ column: string; direction: 'asc' | 'desc' }>
  ) => {
    const first = sorts[0];
    setSorting(first ? `${first.column} ${first.direction}` : '');
    setPageState({ scopeKey, page: 0 });
  };

  /**
   * Memoization Justification:
   * Drawer navigation uses this handler in an effect while a neighboring page loads.
   * Keeping the reference stable avoids rerunning that effect for unrelated renders.
   */
  const changePagination = useCallback(
    (nextPage: number, nextRowsPerPage: number) => {
      setRowsPerPage(nextRowsPerPage);
      setPageState({ scopeKey, page: nextPage - 1 });
    },
    [scopeKey]
  );

  return {
    ...query,
    data: query.currentData,
    isReady,
    page,
    rowsPerPage,
    searchTerm,
    activeFilter,
    changeFilter,
    changeSearch,
    changeSort,
    changePagination,
  };
}
