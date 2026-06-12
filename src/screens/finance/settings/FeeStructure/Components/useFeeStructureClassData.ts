import { useRef, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeStructureClassStatusType } from 'src/enums/fee-structure-statusType';
import { useGetStandardFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';

import { standardFeeStructureInitialValues } from './FeeStructureInitialValues';

// ---------------------------------------------------------------------------
// Pure utility — kept at module level so it is never recreated.
// Serializes only the API-relevant fields to enable snapshot-based dirty detection.
// ---------------------------------------------------------------------------
const toComparableString = (structures: any[]): string =>
  JSON.stringify(
    structures.map((s) => ({
      name: s.name,
      feeHeads: (s.feeHeads || []).map((fh: any) => ({
        feeHeadId: fh.feeHeadId,
        amount: fh.amount,
        isOneTime: fh.isOneTime,
        isOptional: fh.isOptional,
      })),
    }))
  );

interface UseFeeStructureClassDataReturn {
  isFetching: boolean;
  isLoading: boolean;
  /** Returns true if the active class has unsaved changes relative to last API load */
  currentClassHasUnsavedChanges: () => boolean;
  /**
   * Delete the snapshot for `classId` so the next render re-fetches and
   * re-initializes formik for that class.
   * Call this before switching to a new class.
   */
  resetClassSnapshot: (classId: string) => void;
}

/**
 * Manages RTK Query fetching, formik population, and dirty-state tracking
 * for the currently selected fee structure class.
 *
 * Single ref design:
 *   `classSnapshotRef[classId]` being set means the class was already loaded
 *   from the API this session. It doubles as the "initialized" guard (replacing
 *   the old separate `initializedClassesRef`) and as the dirty-check baseline.
 */
export const useFeeStructureClassData = (
  formik: any,
  selectedClassId: string
): UseFeeStructureClassDataReturn => {
  const classSnapshotRef = useRef<Record<string, string>>({});

  const {
    data: standardFeeStructure,
    isFetching,
    isLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: { standardId: selectedClassId },
    options: { skip: !selectedClassId },
  });

  useEffect(() => {
    if (!standardFeeStructure || !selectedClassId || isFetching) return;

    // Stale-response guard: RTK cache may resolve with a previous class's data
    if (standardFeeStructure.standardId !== selectedClassId) return;

    // Initialization guard: snapshot presence means API data was already loaded
    // this session. Prevents background RTK refetches from overwriting user edits.
    if (classSnapshotRef.current[selectedClassId]) return;

    const { feeStructureClasses } = standardFeeStructureInitialValues(standardFeeStructure);

    const mappedStructures = feeStructureClasses.map((fs: any, idx: number) => ({
      ...fs,
      status:
        idx === 0
          ? FeeStructureClassStatusType.Current
          : fs.feeHeads.length > 0
            ? FeeStructureClassStatusType.Completed
            : FeeStructureClassStatusType.Remaining,
    }));

    formik.setFieldValue('feeStructureClasses', {
      ...formik.values.feeStructureClasses,
      [selectedClassId]: mappedStructures,
    });

    // Setting the snapshot also marks this class as "initialized" for the guard above.
    classSnapshotRef.current[selectedClassId] = toComparableString(mappedStructures);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standardFeeStructure, selectedClassId, isFetching]);

  const currentClassHasUnsavedChanges = (): boolean => {
    if (!selectedClassId) return false;
    const structures: any[] = formik.values.feeStructureClasses[selectedClassId] || [];
    if (!structures.length) return false;
    const snapshot = classSnapshotRef.current[selectedClassId];
    // No snapshot yet → user added data before the API load completed
    if (!snapshot) return true;
    return toComparableString(structures) !== snapshot;
  };

  const resetClassSnapshot = (classId: string): void => {
    delete classSnapshotRef.current[classId];
  };

  return { isFetching, isLoading, currentClassHasUnsavedChanges, resetClassSnapshot };
};
