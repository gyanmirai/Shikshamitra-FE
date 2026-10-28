import { useState } from 'react';
import { useGetStudentAcademic360TabQuery } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import { getStudentId } from '../types';

import type { Academic360Response } from '../types';

export type Academic360DetailFilters = {
  taskStatus: string;
  taskSubject: string;
  examStatus: 'all' | 'upcoming' | 'completed';
  examSearch: string;
};

const initialFilters: Academic360DetailFilters = {
  taskStatus: 'ALL', taskSubject: 'ALL', examStatus: 'all', examSearch: '',
};

export function useStudentAcademic360Detail(studentId: string, tab: string, open: boolean) {
  const key = `${studentId}:${tab}`;
  const [state, setState] = useState({ key, page: 0, filters: initialFilters });
  const current = state.key === key ? state : { key, page: 0, filters: initialFilters };
  const pageSize = tab === 'learning' ? 20 : 10;
  const query = useGetStudentAcademic360TabQuery({
    studentId, tab,
    taskSkipCount: tab === 'learning' ? current.page * pageSize : 0,
    taskMaxResultCount: tab === 'overview' ? 10 : 20,
    examSkipCount: tab === 'exams' ? current.page * pageSize : 0,
    examMaxResultCount: tab === 'overview' ? 5 : 10,
    taskStatusFilter: current.filters.taskStatus,
    taskSubjectName: current.filters.taskSubject,
    examStatusFilter: current.filters.examStatus,
    examSearchTerm: current.filters.examSearch,
    detailPaging: tab === 'exams',
  }, { skip: !open || !studentId });
  const previousData = query.data?.detailTab === tab && getStudentId(query.data.student ?? {}) === studentId
    ? query.data : undefined;
  const data: Academic360Response | undefined = query.currentData ?? previousData;
  return {
    ...query,
    data,
    page: current.page,
    pageSize,
    totalCount: tab === 'learning'
      ? data?.learningTasks?.filteredTotalCount ?? data?.learningTasks?.totalAssigned ?? 0
      : data?.examTotalCount ?? 0,
    filters: current.filters,
    changePage: (page: number) => setState({ ...current, page }),
    changeFilters: (filters: Partial<Academic360DetailFilters>) =>
      setState({ key, page: 0, filters: { ...current.filters, ...filters } }),
  };
}
