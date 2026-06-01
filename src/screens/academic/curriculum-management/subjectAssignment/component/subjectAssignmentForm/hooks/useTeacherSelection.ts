import { useRef, useState, useEffect, useCallback } from 'react';
import { useLazyGetEmployeeQuery, useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';

type EmployeeOption = { id: string; label: string };

interface UseTeacherSelectionParams {
  primaryTeacherId: string;
  secondaryTeacherIds: string[];
}

export function useTeacherSelection({
  primaryTeacherId,
  secondaryTeacherIds,
}: UseTeacherSelectionParams) {
  const [getPrimaryTeacherOptions] = useLazyGetEmployeeQuery();
  const [getSecondaryTeacherOptions] = useLazyGetEmployeeQuery();
  const [getEmployeeById] = useLazyGetEmployeeByIdQuery();

  const [primaryTeacherObj, setPrimaryTeacherObj] = useState<EmployeeOption | null>(null);
  const [secondaryTeacherObjs, setSecondaryTeacherObjs] = useState<EmployeeOption[]>([]);

  const initializedRef = useRef(false);

  /**
   * Per-query seen-ID sets used to deduplicate teacher options across paginated
   * fetches. Reset on every new search (page === 1) so stale IDs from a
   * previous query never bleed into a fresh search.
   */
  const seenPrimaryIdsRef = useRef<Set<string>>(new Set());
  const seenSecondaryIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (primaryTeacherId) {
      getEmployeeById(primaryTeacherId)
        .unwrap()
        .then((data: { id: string; fullName: string }) =>
          setPrimaryTeacherObj({ id: data.id, label: data.fullName })
        )
        .catch(() => {});
    }

    if (secondaryTeacherIds?.length) {
      Promise.all(
        secondaryTeacherIds.map((id: string) =>
          getEmployeeById(id)
            .unwrap()
            .then((data: { id: string; fullName: string }) => ({
              id: data.id,
              label: data.fullName,
            }))
            .catch(() => null)
        )
      ).then((results) => {
        setSecondaryTeacherObjs(results.filter(Boolean) as EmployeeOption[]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Memoization Justification:
   * Passed to PaginatedSearchSelect component which debounces and re-fetches.
   * Stable reference prevents unnecessary search resets.
   *
   * Deduplication: seenPrimaryIdsRef tracks every id returned so far for the
   * current query. It resets on page 1 (new search) so a fresh query starts
   * clean. This prevents the same teacher from appearing multiple times when
   * the server paginates or when usePaginatedSearch appends a stale page.
   */
  const fetchPrimaryTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      if (page === 1) seenPrimaryIdsRef.current = new Set();
      const res = await getPrimaryTeacherOptions({
        search: query,
        page,
        isTeaching: true,
      }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      const data = (res?.items ?? [])
        .map((item: { id: string; fullName: string }) => ({ id: item.id, label: item.fullName }))
        .filter(({ id }: { id: string }) => {
          if (seenPrimaryIdsRef.current.has(id)) return false;
          seenPrimaryIdsRef.current.add(id);
          return true;
        });
      return { data, hasMore };
    },
    [getPrimaryTeacherOptions]
  );

  /**
   * Memoization Justification:
   * Passed to PaginatedSearchSelect component which debounces and re-fetches.
   * Stable reference prevents unnecessary search resets.
   *
   * Deduplication: seenSecondaryIdsRef tracks every id returned so far for
   * the current query. Reset on page 1 for the same reason as primary above.
   */
  const fetchSecondaryTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      if (page === 1) seenSecondaryIdsRef.current = new Set();
      const res = await getSecondaryTeacherOptions({
        search: query,
        page,
        isTeaching: true,
      }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      const data = (res?.items ?? [])
        .map((item: { id: string; fullName: string }) => ({ id: item.id, label: item.fullName }))
        .filter(({ id }: { id: string }) => {
          if (seenSecondaryIdsRef.current.has(id)) return false;
          seenSecondaryIdsRef.current.add(id);
          return true;
        });
      return { data, hasMore };
    },
    [getSecondaryTeacherOptions]
  );

  return {
    primaryTeacherObj,
    setPrimaryTeacherObj,
    secondaryTeacherObjs,
    setSecondaryTeacherObjs,
    fetchPrimaryTeacherOptions,
    fetchSecondaryTeacherOptions,
  };
}
