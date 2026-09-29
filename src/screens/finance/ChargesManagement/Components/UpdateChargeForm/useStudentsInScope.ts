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
  const [result, setResult] = useState<{ key: string; students: IStudentOption[] } | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

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
  const hasFetched = result?.key === scopeKey;
  const students = hasFetched ? result.students : [];
  const isLoading =
    loadingKey === scopeKey ||
    (!hasFetched &&
      !!boardId &&
      !!educationMediumId &&
      standardIds.length > 0 &&
      !!currentYear?.id);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!boardId || !educationMediumId || standardIds.length === 0 || !currentYear?.id) {
        setResult({ key: scopeKey, students: [] });
        return;
      }

      setLoadingKey(scopeKey);
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

        const response: any = await getStudentsByScope(params);
        const items: any[] = Array.isArray(response?.data) ? response.data : [];

        if (!cancelled) {
          const unique = new Map<string, IStudentOption>();
          items.forEach((item) => {
            const mapped = mapStudent(item);
            if (mapped.id) unique.set(mapped.id, mapped);
          });
          setResult({ key: scopeKey, students: Array.from(unique.values()) });
        }
      } finally {
        if (!cancelled) setLoadingKey(null);
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
