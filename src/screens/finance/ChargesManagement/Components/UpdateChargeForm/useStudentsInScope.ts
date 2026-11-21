'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEligibleChargeStudentsQuery } from 'src/redux/finance/ChargeManagement/chargeApi';

import type { IStudentOption } from './types';
import type { StudentFilters } from './studentFilters';

const PAGE_SIZE = 25;

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
    gender: item.gender,
    hasFeeStructureAssignment: item.hasFeeStructureAssignment,
    hasChargeInCategory: item.hasChargeInCategory,
  };
}

export interface ChargeStudentLookupOptions {
  search?: string;
  filters?: StudentFilters;
  page?: number;
}

interface LookupResult {
  key: string;
  scopeKey: string;
  students: IStudentOption[];
  candidateStudentIds: string[];
  matchingStudentIds: string[];
  matchingStudentNames: Record<string, string>;
  totalCount: number;
}

export function useStudentsInScope(
  boardId: string,
  educationMediumId: string,
  standardIds: string[],
  divisionIds: string[],
  chargeCategoryId?: string,
  options: ChargeStudentLookupOptions = {}
) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [debouncedSearch, setDebouncedSearch] = useState(options.search?.trim() ?? '');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [getEligibleStudents] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEligibleChargeStudentsQuery,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(options.search?.trim() ?? ''), 300);
    return () => clearTimeout(timer);
  }, [options.search]);

  const scopeKey = useMemo(
    () =>
      JSON.stringify({
        boardId,
        educationMediumId,
        standardIds,
        divisionIds: standardIds.length === 1 ? divisionIds : [],
        yearId: currentYear?.id,
        chargeCategoryId,
      }),
    [boardId, educationMediumId, standardIds, divisionIds, currentYear?.id, chargeCategoryId]
  );
  const filters = options.filters;
  const queryKey = useMemo(
    () =>
      JSON.stringify({
        scopeKey,
        search: debouncedSearch,
        gender: filters?.gender,
        rollFrom: filters?.rollFrom,
        rollTo: filters?.rollTo,
        charged: filters?.charged,
        division: filters?.division,
        assigned: filters?.assigned,
        page: options.page ?? 0,
      }),
    [scopeKey, debouncedSearch, filters, options.page]
  );
  const searchPending = (options.search?.trim() ?? '') !== debouncedSearch;
  const hasFetched = result?.key === queryKey && !searchPending;
  const students = hasFetched ? result.students : [];
  const ready = !!boardId && !!educationMediumId && standardIds.length > 0 && !!currentYear?.id;
  const isLoading =
    ready && (searchPending || loadingKey === queryKey || (!hasFetched && errorKey !== queryKey));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ready) {
        setResult({
          key: queryKey,
          scopeKey,
          students: [],
          candidateStudentIds: [],
          matchingStudentIds: [],
          matchingStudentNames: {},
          totalCount: 0,
        });
        return;
      }
      setLoadingKey(queryKey);
      setErrorKey(null);
      try {
        const response: any = await getEligibleStudents({
          academicYearId: currentYear.id,
          boardId,
          educationMediumId,
          classIds: standardIds,
          divisionIds: standardIds.length === 1 ? divisionIds : [],
          chargeCategoryId: chargeCategoryId || undefined,
          search: debouncedSearch || undefined,
          gender: filters?.gender ? Number(filters.gender) : undefined,
          rollNoFrom: filters?.rollFrom ? Number(filters.rollFrom) : undefined,
          rollNoTo: filters?.rollTo ? Number(filters.rollTo) : undefined,
          charged: filters?.charged ? filters.charged === 'yes' : undefined,
          divisionFilterId: filters?.division || undefined,
          page: (options.page ?? 0) + 1,
          pageSize: PAGE_SIZE,
        });
        const data = response?.data;
        if (
          response?.error ||
          !Array.isArray(data?.items) ||
          !Array.isArray(data?.candidateStudentIds) ||
          !Array.isArray(data?.matchingStudentIds)
        ) {
          throw new Error('Failed to load students');
        }
        if (!cancelled)
          setResult({
            key: queryKey,
            scopeKey,
            students: filters?.assigned === 'no' ? [] : data.items.map(mapStudent),
            candidateStudentIds: data.candidateStudentIds,
            matchingStudentIds: filters?.assigned === 'no' ? [] : data.matchingStudentIds,
            matchingStudentNames:
              filters?.assigned === 'no' ? {} : (data.matchingStudentNames ?? {}),
            totalCount: filters?.assigned === 'no' ? 0 : (data.totalCount ?? 0),
          });
      } catch {
        if (!cancelled) setErrorKey(queryKey);
      } finally {
        if (!cancelled) setLoadingKey(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // Scope and filter values are captured in the serialized key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, retryCount]);

  return {
    students,
    isLoading,
    hasFetched,
    isError: errorKey === queryKey && !searchPending,
    retry: () => setRetryCount((count) => count + 1),
    candidateStudentIds: result?.scopeKey === scopeKey ? result.candidateStudentIds : [],
    matchingStudentIds: hasFetched ? result.matchingStudentIds : [],
    matchingStudentNames: hasFetched ? result.matchingStudentNames : {},
    totalCount: hasFetched ? result.totalCount : 0,
  };
}
