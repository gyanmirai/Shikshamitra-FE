import type { Standards } from 'src/types/school';

import { useMemo } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';

// Subscribe to academic reference data separately from the changing student audience.
export function useChargeAcademicStructure(mediumId: string, standardIds: string[]) {
  const query = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassByMediumQuery,
    params: mediumId,
    options: { skip: !mediumId, refetchOnMountOrArgChange: false },
  });
  const classes: Standards[] = query.currentData ?? [];
  const divisions = useMemo(
    () =>
      standardIds.length === 1
        ? (classes.find((item) => item.id === standardIds[0])?.divisions ?? [])
        : [],
    [classes, standardIds]
  );
  return {
    classes,
    divisions,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
