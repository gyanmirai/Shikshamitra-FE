import { Iconify } from 'src/components/iconify';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyContent } from 'src/components/empty-content';
import React, { useRef, useState, useCallback } from 'react';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { Box, Stack, Button, Skeleton, Typography, CircularProgress } from '@mui/material';

import IndependentFeeStructureCard from './IndependentFeeStructureCard';
import { useFetchStandardFeeStructures } from '../hooks/useClassWiseFeeStructureHooks';

import type { IClassWiseFeeStructureCard } from '../type';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ClassAccordionPanelProps {
  classId: string;
  feeStructureMetaDataId: string;
  /** Called whenever unsaved-changes state changes for any card in this panel */
  onDirtyChange?: (dirty: boolean) => void;
}

// ---------------------------------------------------------------------------
// Map API response â†’ card model
// ---------------------------------------------------------------------------
const mapToCardModel = (
  raw: any,
  classId: string,
  feeStructureMetaDataId: string
): IClassWiseFeeStructureCard => ({
  _id: raw._id ?? raw.id,
  name: raw.name,
  feeHeads: (raw.feeHeads ?? []).map((fh: any) => ({
    id: fh.id,
    feeHeadId: fh.feeHeadId,
    feeHeadName: fh.feeHeadName,
    amount: fh.amount ?? 0,
    isOneTime: fh.isOneTime ?? false,
    isOptional: fh.isOptional ?? false,
    isRefundable: fh.isRefundable ?? false,
    // paymentTermId: fh.paymentTermId ?? '',
    // paybleMonth: fh.paybleMonth ?? [],
  })),
  lockStatus:
    raw.lockStatus === FeeStructureLockStatusType.Locked ||
    raw.lockStatus === 'LOCKED' ||
    raw.isLocked === true
      ? FeeStructureLockStatusType.Locked
      : FeeStructureLockStatusType.Unlocked,
  classId,
  feeStructureMetaDataId,
});

// ---------------------------------------------------------------------------
// Component â€” renders fee structures for the currently selected class.
// No outer class accordion; the class strip is handled by FeeStructureEditForm.
// Each individual fee structure is an accordion (inside IndependentFeeStructureCard).
// ---------------------------------------------------------------------------
const ClassAccordionPanel: React.FC<ClassAccordionPanelProps> = ({
  classId,
  feeStructureMetaDataId,
  onDirtyChange,
}) => {
  const [localDrafts, setLocalDrafts] = useState<IClassWiseFeeStructureCard[]>([]);
  const dirtySet = useRef<Set<string>>(new Set());

  const handleCardDirtyChange = useCallback(
    (cardKey: string, dirty: boolean) => {
      if (dirty) {
        dirtySet.current.add(cardKey);
      } else {
        dirtySet.current.delete(cardKey);
      }
      onDirtyChange?.(dirtySet.current.size > 0);
    },
    [onDirtyChange]
  );

  const { data: rawStructures, isLoading, isFetching } = useFetchStandardFeeStructures(classId);

  const serverCards: IClassWiseFeeStructureCard[] = (
    Array.isArray(rawStructures)
      ? rawStructures
      : (rawStructures?.standardFeeStructures ?? rawStructures?.data ?? [])
  ).map((raw: any) => mapToCardModel(raw, classId, feeStructureMetaDataId));

  const allCards = [...serverCards, ...localDrafts];

  const handleAddNew = () => {
    setLocalDrafts((prev) => [
      ...prev,
      {
        _id: undefined,
        name: '',
        feeHeads: [],
        lockStatus: FeeStructureLockStatusType.Unlocked,
        classId,
        feeStructureMetaDataId,
      },
    ]);
  };

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {/* Accordion summary skeleton */}
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
              sx={{ px: 2, py: 1.25, bgcolor: 'action.hover' }}
            >
              <Skeleton variant="rounded" width={28} height={28} />
              <Skeleton variant="text" width={160} height={22} />
              <Skeleton variant="rounded" width={100} height={22} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 1 }} />
              <Box flex={1} />
              <Skeleton variant="rounded" width={32} height={28} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={32} height={28} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: '50%' }} />
              <Skeleton variant="rounded" width={20} height={20} />
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      {/* Add Fee Structure CTA */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="lucide:plus" />}
          onClick={handleAddNew}
        >
          Add Fee Structure
        </Button>
      </Box>
      {allCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <EmptyContent
            filled
            title="No Fee Structures"
            description="Click 'Add Fee Structure' below to create one for this class."
            sx={{ py: 8 }}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {allCards.map((card, idx) => (
          <IndependentFeeStructureCard
            key={card._id ?? `draft-${classId}-${idx}`}
            initialData={card}
            index={idx}
            onSaved={() => {
              setLocalDrafts((prev) => prev.filter((d) => d !== card));
            }}
            onDeleted={() => {
              if (!card._id) {
                setLocalDrafts((prev) => prev.filter((d) => d !== card));
              }
            }}
            onDirtyChange={(dirty) =>
              handleCardDirtyChange(card._id ?? `draft-${classId}-${idx}`, dirty)
            }
          />
        ))}
      </AnimatePresence>

      {/* Refetching indicator */}
      {isFetching && !isLoading && (
        <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end" mb={0.5}>
          <CircularProgress size={12} />
          <Typography variant="caption" color="text.secondary">
            Refreshing...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ClassAccordionPanel;
