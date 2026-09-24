import type { Standards } from 'src/types/school';

import { useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { subjectAssignmentsApi } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

type Props = {
  open: boolean;
  allClass: Standards[];
  sourceClassId: string;
};

export function useEligibleCopyClasses({ open, allClass, sourceClassId }: Props) {
  const dispatch = useDispatch();
  const [eligibleClassIds, setEligibleClassIds] = useState<Set<string>>(new Set());
  const [isFilteringClasses, setIsFilteringClasses] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  /**
   * Memoization Justification:
   * This array drives the eligibility effect. A stable reference prevents refetching whenever
   * unrelated dialog controls change.
   */
  const candidateClasses = useMemo(
    () => (allClass || []).filter((item) => String(item.id) !== String(sourceClassId)),
    [allClass, sourceClassId]
  );

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    const filterClasses = async () => {
      if (candidateClasses.length === 0) {
        setEligibleClassIds(new Set());
        return;
      }
      setIsFilteringClasses(true);
      setFilterError(false);
      try {
        const results = await Promise.all(
          candidateClasses.map((item) =>
            dispatch(
              (subjectAssignmentsApi.endpoints as any).getSubjectAssignments.initiate(
                { standardId: item.id, page: 0, pageSize: 1, status: 'all' },
                { track: false }
              )
            )
          )
        );
        if (!active) return;
        const eligible = new Set<string>();
        (results as any[]).forEach((result, index) => {
          if ((result?.data?.data?.totalCount ?? 0) > 0) {
            eligible.add(String(candidateClasses[index].id));
          }
        });
        setEligibleClassIds(eligible);
      } catch {
        if (active) setFilterError(true);
      } finally {
        if (active) setIsFilteringClasses(false);
      }
    };

    filterClasses();
    return () => {
      active = false;
    };
  }, [candidateClasses, dispatch, open, retryToken]);

  return {
    eligibleClasses: candidateClasses.filter((item) => eligibleClassIds.has(String(item.id))),
    isFilteringClasses,
    filterError,
    retry: () => setRetryToken((value) => value + 1),
  };
}
