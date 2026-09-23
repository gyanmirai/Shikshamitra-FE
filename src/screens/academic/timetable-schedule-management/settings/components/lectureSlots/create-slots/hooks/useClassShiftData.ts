import type { Medium, Standards, Organization } from 'src/types/school';

import { useMemo } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';

export const useClassShiftData = (medium?: Medium) => {
  const {
    data: classesByMedium,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassByMediumQuery,
    params: medium?.id,
    options: { skip: !medium?.id },
  });

  /**
   * Memoization Justification:
   * - The fallback flattens every stage on each form render.
   * - A stable array also prevents downstream form controls from receiving a new options reference.
   */
  const allClass = useMemo<Standards[]>(() => {
    const latestClasses = Array.isArray(classesByMedium) ? classesByMedium : [];
    const fallbackClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    return latestClasses.length > 0 ? latestClasses : fallbackClasses;
  }, [classesByMedium, medium]);

  return {
    allClass,
    isClassTimingLoading: Boolean(medium?.id) && Boolean(isLoading || isFetching),
  };
};
