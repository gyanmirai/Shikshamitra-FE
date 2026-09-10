import { useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetStandardFeeStructureQuery,
  useLockClassWiseFeeStructureMutation,
  useCreateClassWiseFeeStructureMutation,
  useDeleteClassWiseFeeStructureMutation,
  useUnlockClassWiseFeeStructureMutation,
  useUpdateClassWiseFeeStructureMutation,
} from 'src/redux/finance/financeFeeStructure';

// ---------------------------------------------------------------------------
// Fetch by standardId (classId) — used when a class tab is first selected
// ---------------------------------------------------------------------------
export const useFetchStandardFeeStructures = (classId: string, skip = false) => {
  const result = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: { standardId: classId },
    options: { skip: skip || !classId },
  });
  return result as typeof result & { isLoading: boolean; isFetching: boolean; isError: boolean; refetch: () => void; data: any };
};

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
export const useCreateClassWiseFeeStructure = () => {
  const [create] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateClassWiseFeeStructureMutation,
  });

  return useCallback(
    (args: {
      feeStructureMetaDataId: string;
      standardId: string;
      name: string;
      feeHeads: any[];
      collectionPolicyId?: string;
      concessionPolicyId?: string;
		concessionFeeHeadScope?: 'EntireFeeStructure' | 'SelectedFeeHeads';
		concessionApplicableFeeHeadIds?: string[];
    }) => create(args).unwrap(),
    [create]
  );
};

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------
export const useUpdateClassWiseFeeStructure = () => {
  const [update] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateClassWiseFeeStructureMutation,
  });

  return useCallback(
    (args: {
      structureId: string;
      classId: string;
		body: { name: string; feeHeads: any[]; collectionPolicyId?: string; concessionPolicyId?: string; concessionFeeHeadScope?: 'EntireFeeStructure' | 'SelectedFeeHeads'; concessionApplicableFeeHeadIds?: string[] };
    }) => update(args).unwrap(),
    [update]
  );
};

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export const useDeleteClassWiseFeeStructure = () => {
  const [del] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteClassWiseFeeStructureMutation,
  });

  return useCallback((args: { structureId: string; classId: string }) => del(args).unwrap(), [del]);
};

// ---------------------------------------------------------------------------
// Lock
// ---------------------------------------------------------------------------
export const useLockClassWiseFeeStructure = () => {
  const [lock] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLockClassWiseFeeStructureMutation,
  });

  return useCallback(
    (args: { structureId: string; classId: string }) => lock(args).unwrap(),
    [lock]
  );
};

// ---------------------------------------------------------------------------
// Unlock
// ---------------------------------------------------------------------------
export const useUnlockClassWiseFeeStructure = () => {
  const [unlock] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUnlockClassWiseFeeStructureMutation,
  });

  return useCallback(
    (args: { structureId: string; classId: string }) => unlock(args).unwrap(),
    [unlock]
  );
};
