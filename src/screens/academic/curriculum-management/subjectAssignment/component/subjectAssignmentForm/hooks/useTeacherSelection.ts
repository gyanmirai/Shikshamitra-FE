import { useRef, useState, useEffect, useCallback } from 'react';
import { useLazyGetEmployeeQuery, useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';

import { toTeacherOption } from '../teacherOptions';

import type { TeacherOption } from '../teacherOptions';

interface UseTeacherSelectionParams {
  teacherIds: string[];
}

interface EmployeeResult {
  id: string;
  fullName?: string | null;
  employeeIdentifier?: string | null;
}

export function useTeacherSelection({ teacherIds }: UseTeacherSelectionParams) {
  const [getTeacherOptions] = useLazyGetEmployeeQuery();
  const [getEmployeeById] = useLazyGetEmployeeByIdQuery();
  const [teacherObjs, setTeacherObjs] = useState<TeacherOption[]>([]);
  const seenTeacherIdsRef = useRef<Set<string>>(new Set());
  const teacherIdsKey = teacherIds.join(',');

  useEffect(() => {
    let isActive = true;
    const selectedTeacherIds = teacherIdsKey ? teacherIdsKey.split(',') : [];

    if (selectedTeacherIds.length === 0) {
      setTeacherObjs([]);
      return () => {
        isActive = false;
      };
    }

    Promise.all(
      selectedTeacherIds.map((id) =>
        getEmployeeById(id)
          .unwrap()
          .then((employee: EmployeeResult) => toTeacherOption(employee))
          .catch(() => null)
      )
    ).then((results) => {
      if (isActive) {
        setTeacherObjs(results.filter((teacher): teacher is TeacherOption => Boolean(teacher)));
      }
    });

    return () => {
      isActive = false;
    };
  }, [getEmployeeById, teacherIdsKey]);

  /**
   * Memoization Justification:
   * PaginatedSearchSelect treats a changed fetch callback as a new search source.
   * Keeping this reference stable prevents unrelated subject-field edits from resetting pagination.
   */
  const fetchTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      if (page === 1) seenTeacherIdsRef.current = new Set();
      const response = await getTeacherOptions({
        search: query,
        page,
        isTeaching: true,
        status: 'Active',
      }).unwrap();
      const hasMore = response.currentPage < response.totalPages;
      const data = (response?.items ?? [])
        .map((employee: EmployeeResult) => toTeacherOption(employee))
        .filter(({ id }: TeacherOption) => {
          if (seenTeacherIdsRef.current.has(id)) return false;
          seenTeacherIdsRef.current.add(id);
          return true;
        });

      return { data, hasMore };
    },
    [getTeacherOptions]
  );

  return {
    teacherObjs,
    setTeacherObjs,
    fetchTeacherOptions,
  };
}
