import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetSeatAllocationTableDataQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import { toSeatingPlanListRows } from '../utils/mappers';
import { buildSeatingPlanListUrl } from '../utils/seating-plan-navigation';

import type { SeatingPlanListRow } from '../types';

const SUMMARY_FILTER_PREDICATES: Record<string, (row: SeatingPlanListRow) => boolean> = {
  'requiring-seating': (row) => row.status !== 'published',
  'in-progress': (row) => row.status === 'in-progress',
  'ready-for-review': (row) => row.status === 'ready' || row.status === 'completed',
  'needs-attention': (row) => row.status === 'needs-attention',
  'fully-allocated': (row) => row.status === 'completed' || row.status === 'published',
  published: (row) => row.status === 'published',
};

export function useSeatingPlanList() {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.seatAllocation}.Add`
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previewRow, setPreviewRow] = useState<SeatingPlanListRow | null>(null);

  /**
   * Memoization Justification:
   * - The academic hierarchy can contain many stages and standards.
   * - This prevents flattening the hierarchy again on unrelated filter and drawer renders.
   */
  const classes = useMemo(
    () =>
      currentMedium?.educationMediumStages?.flatMap(
        (stage: Organization) => stage.standards || []
      ) || [],
    [currentMedium]
  );

  const requestedClassId = searchParams.get('standardId');
  const selectedClassId = classes.some((standard: Standards) => standard.id === requestedClassId)
    ? requestedClassId || ''
    : classes[0]?.id || '';
  const requestedStatus = searchParams.get('status');
  const activeSummaryFilter =
    requestedStatus && Object.hasOwn(SUMMARY_FILTER_PREDICATES, requestedStatus)
      ? requestedStatus
      : null;
  const setSelectedClassId = (value: string) => {
    router.replace(buildSeatingPlanListUrl(value), { scroll: false });
  };
  const setActiveSummaryFilter = (value: string | null) => {
    router.replace(buildSeatingPlanListUrl(selectedClassId, value), { scroll: false });
  };

  const {
    data: seatAllocationData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationTableDataQuery,
    params: { standardId: selectedClassId },
    options: { skip: !selectedClassId },
  });

  /**
   * Memoization Justification:
   * - Mapping normalizes the complete API result into table/card view models.
   * - The mapped rows stay stable while only local filters or the preview drawer change.
   */
  const rows: SeatingPlanListRow[] = useMemo(
    () => (seatAllocationData?.items || []).flatMap(toSeatingPlanListRows),
    [seatAllocationData]
  );

  /**
   * Memoization Justification:
   * - Summary filtering can traverse every exam row.
   * - It only needs recomputation when the normalized rows or selected status change.
   */
  const filteredRows = useMemo(() => {
    if (!activeSummaryFilter) return rows;
    const predicate = SUMMARY_FILTER_PREDICATES[activeSummaryFilter];
    return predicate ? rows.filter(predicate) : rows;
  }, [rows, activeSummaryFilter]);

  return {
    classes,
    selectedClassId,
    setSelectedClassId,
    activeSummaryFilter,
    setActiveSummaryFilter,
    previewRow,
    setPreviewRow,
    rows,
    filteredRows,
    canAdd,
    isListDataLoading: (isLoading || isFetching) && !seatAllocationData,
  };
}
