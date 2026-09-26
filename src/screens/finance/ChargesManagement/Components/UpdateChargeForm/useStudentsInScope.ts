'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetStudentsByScopeQuery } from 'src/redux/student';

import type { IStudentOption } from './types';

function mapStudent(item: any): IStudentOption {
  return {
    id: item.studentId,
    studentId: item.studentId,
    label: item.studentName || 'Student',
    name: item.studentName || 'Student',
    rollNumber: item.rollNo,
    grNumber: item.grNo?.toString(),
    standardName: item.standardName,
    divisionName: item.divisionName,
    standardId: item.standardId,
    divisionId: item.divisionId,
  };
}

export function useStudentsInScope(
  boardId: string,
  educationMediumId: string,
  standardIds: string[],
  divisionIds: string[]
) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [students, setStudents] = useState<IStudentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [getStudentsByScope] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetStudentsByScopeQuery,
  });

  const scopeKey = useMemo(
    () =>
      JSON.stringify({
        boardId,
        educationMediumId,
        standardIds,
        // Only include divisionIds in the key when a single class is selected
        divisionIds: standardIds.length === 1 ? divisionIds : [],
        yearId: currentYear?.id,
      }),
    [boardId, educationMediumId, standardIds, divisionIds, currentYear?.id]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!boardId || !educationMediumId || standardIds.length === 0 || !currentYear?.id) {
        setStudents([]);
        setHasFetched(true);
        return;
      }

      setIsLoading(true);
      try {
        const params: {
          academicYearId: string;
          boardId: string;
          educationMediumId: string;
          classIds: string[];
          divisionIds?: string[];
          onlyWithFeeStructureAssignment: boolean;
        } = {
          academicYearId: currentYear.id,
          boardId,
          educationMediumId,
          classIds: standardIds,
          onlyWithFeeStructureAssignment: true,
        };

        // Only send divisionIds to the API when exactly one class is selected
        if (standardIds.length === 1 && divisionIds.length > 0) {
          params.divisionIds = divisionIds;
        }

        const result: any = await getStudentsByScope(params);
        const items: any[] = Array.isArray(result?.data) ? result.data : [];

        if (!cancelled) {
          const unique = new Map<string, IStudentOption>();
          items.forEach((item) => {
            const mapped = mapStudent(item);
            if (mapped.id) unique.set(mapped.id, mapped);
          });
          setStudents(Array.from(unique.values()));
          setHasFetched(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey]);

  return { students, isLoading, hasFetched, candidateStudentIds: students.map((s) => s.id) };
}
