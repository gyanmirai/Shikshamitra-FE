import type { Standards } from 'src/types/school';

import { useMemo, useState, useEffect } from 'react';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import type { CopySubjectItem, CopySelectionMode } from './types';

type Props = {
  open: boolean;
  copyFromClass: Standards | null;
  selectionMode: CopySelectionMode;
};

export function useCopySubjects({ open, copyFromClass, selectionMode }: Props) {
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const query = useGetSubjectAssignmentsQuery(
    { standardId: String(copyFromClass?.id ?? ''), page: 0, pageSize: 100, status: 'all' },
    { skip: selectionMode !== 'SPECIFIC' || !copyFromClass?.id || !open }
  );

  /**
   * Memoization Justification:
   * The response can contain 100 assignments with nested subjects. Flattening should only run
   * when the API response changes.
   */
  const allSubjects = useMemo<CopySubjectItem[]>(
    () =>
      (query.data?.data?.items || []).flatMap((assignment: any) =>
        (assignment.subjects || []).map((subject: any) => ({
          id: String(subject.subjectId),
          name: subject.subjectName || 'Unnamed subject',
          code: subject.subjectCode || '',
        }))
      ),
    [query.data]
  );

  /**
   * Memoization Justification:
   * The filtered list is reused by the counter, select-all state, and rendered list while users
   * search through up to 100 subjects.
   */
  const filteredSubjects = useMemo(() => {
    const search = subjectSearch.trim().toLowerCase();
    if (!search) return allSubjects;
    return allSubjects.filter(
      (item) => item.name.toLowerCase().includes(search) || item.code.toLowerCase().includes(search)
    );
  }, [allSubjects, subjectSearch]);

  const selectedSet = new Set(selectedSubjectIds);
  const selectedSubjectsList = allSubjects.filter((item) => selectedSet.has(item.id));
  const allFilteredSelected =
    filteredSubjects.length > 0 && filteredSubjects.every((item) => selectedSet.has(item.id));
  const selectedFilteredCount = filteredSubjects.filter((item) => selectedSet.has(item.id)).length;

  const resetSelection = () => {
    setSelectedSubjectIds([]);
    setSubjectSearch('');
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  const toggleAllFiltered = () => {
    setSelectedSubjectIds((previous) => {
      const next = new Set(previous);
      filteredSubjects.forEach((item) =>
        allFilteredSelected ? next.delete(item.id) : next.add(item.id)
      );
      return Array.from(next);
    });
  };

  useEffect(() => {
    if (!open) resetSelection();
  }, [open]);

  return {
    allSubjects,
    filteredSubjects,
    selectedSubjectIds,
    selectedSubjectsList,
    selectedFilteredCount,
    allFilteredSelected,
    subjectSearch,
    setSubjectSearch,
    isLoading: query.isLoading,
    isError: query.isError,
    retry: query.refetch,
    resetSelection,
    toggleSubject,
    toggleAllFiltered,
  };
}
