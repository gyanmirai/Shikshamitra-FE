'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useLazyGetFilterStudentsQuery,
  useLazyGetStudentsByDivisionQuery,
} from 'src/redux/student';

import type { IStudentOption } from './types';

function mapStudent(item: any): IStudentOption {
  const name = [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' ').trim();
  return {
    id: item.id ?? item.studentId,
    studentId: item.id ?? item.studentId,
    label: name || item.name || 'Student',
    name: name || item.name || 'Student',
    rollNumber: item.rollNo ?? item.rollNumber,
    grNumber: item.grNo?.toString() ?? item.grNumber?.toString(),
    standardName: item.standardName,
    divisionName: item.divisionName,
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

  const [getFilterStudents] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [getStudentsByDivision] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  });

  const scopeKey = useMemo(
    () =>
      JSON.stringify({
        boardId,
        educationMediumId,
        standardIds,
        divisionIds,
        yearId: currentYear?.id,
      }),
    [boardId, educationMediumId, standardIds, divisionIds, currentYear?.id]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!boardId || !educationMediumId || standardIds.length === 0 || !currentYear?.id) {
        setStudents([]);
        return;
      }

      setIsLoading(true);
      try {
        const collected: IStudentOption[] = [];

        if (standardIds.length === 1 && divisionIds.length > 0) {
          const divisionResults = await Promise.all(
            divisionIds.map((divisionId) => getStudentsByDivision(divisionId))
          );
          divisionResults.forEach((result: any) => {
            const items = Array.isArray(result?.data) ? result.data : (result?.data?.items ?? []);
            items.forEach((item: any) => collected.push(mapStudent(item)));
          });
        } else {
          const standardResults = await Promise.all(
            standardIds.map((standardId) =>
              getFilterStudents({
                academicYearId: currentYear.id,
                academicMediumId: educationMediumId,
                standardId,
              })
            )
          );
          standardResults.forEach((result: any) => {
            const items = result?.data?.items ?? [];
            items.forEach((item: any) => collected.push(mapStudent(item)));
          });
        }

        if (!cancelled) {
          const unique = new Map<string, IStudentOption>();
          collected.forEach((s) => {
            if (s.id) unique.set(s.id, s);
          });
          setStudents(Array.from(unique.values()));
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

  return { students, isLoading, candidateStudentIds: students.map((s) => s.id) };
}
