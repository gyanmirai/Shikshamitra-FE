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
   */
  const fetchPrimaryTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      const res = await getPrimaryTeacherOptions({ search: query, page }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      return {
        data: (res?.items ?? []).map((item: { id: string; fullName: string }) => ({
          id: item.id,
          label: item.fullName,
        })),
        hasMore,
      };
    },
    [getPrimaryTeacherOptions]
  );

  /**
   * Memoization Justification:
   * Passed to PaginatedSearchSelect component which debounces and re-fetches.
   * Stable reference prevents unnecessary search resets.
   */
  const fetchSecondaryTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      const res = await getSecondaryTeacherOptions({ search: query, page }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      return {
        data: (res?.items ?? []).map((item: { id: string; fullName: string }) => ({
          id: item.id,
          label: item.fullName,
        })),
        hasMore,
      };
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
