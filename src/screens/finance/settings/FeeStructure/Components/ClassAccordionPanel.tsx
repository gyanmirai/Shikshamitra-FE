import CustomSelect from 'src/components/custom-select';
import { EmptyContent } from 'src/components/empty-content';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { Box, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';

import FeeStructureWorkspaceCard from './FeeStructureWorkspaceCard';
import { useFetchStandardFeeStructures } from '../hooks/useClassWiseFeeStructureHooks';

import type { IClassWiseFeeStructureCard } from '../type';

interface ClassAccordionPanelProps {
  classId: string;
  feeStructureMetaDataId: string;
  viewOnly?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  onRegisterAddNew?: (fn: () => void) => void;
}

const mapToCardModel = (
  raw: any,
  classId: string,
  feeStructureMetaDataId: string
): IClassWiseFeeStructureCard => ({
  record: raw,
  _id: raw._id ?? raw.id,
  name: raw.name,
  feeHeads: (raw.feeHeads ?? []).map((fh: any) => ({
    id: fh.id,
    feeHeadId: fh.feeHeadId,
    feeHeadName: fh.feeHeadName,
    feeCategoryName: fh.feeCategoryName ?? fh.categoryName,
    amount: fh.amount ?? 0,
    isOneTime: fh.isOneTime ?? false,
    isOptional: fh.isOptional ?? false,
    paybleMonth: fh.payableMonth ?? null,
    payableYear: fh.payableYear ?? null,
    paymentTermId: fh.paymentTermId ?? undefined,
    paymentTermName: fh.paymentTermName ?? undefined,
    paymentTermVersionId: fh.paymentTermVersionId ?? undefined,
    scheduleMode: fh.scheduleMode ?? (fh.paymentTermOverride ? 'Customized' : 'Inherited'),
    paymentTermOverride: fh.paymentTermOverride ?? undefined,
  })),
  status: raw.status,
  classId,
  feeStructureMetaDataId,
  collectionPolicyId: raw.collectionPolicyId ?? undefined,
  concessionPolicyId: raw.concessionPolicyId ?? undefined,
  concessionFeeHeadScope: raw.concessionFeeHeadScope ?? 'EntireFeeStructure',
  concessionApplicableFeeHeadIds: raw.concessionApplicableFeeHeadIds ?? [],
});

// Editors stay mounted while switching structures so unsaved candidates and
// customized schedules survive local navigation. Only the selected one is visible.
export default function ClassAccordionPanel({
  classId,
  feeStructureMetaDataId,
  viewOnly = false,
  onDirtyChange,
  onBusyChange,
  onRegisterAddNew,
}: ClassAccordionPanelProps) {
  type DraftCard = IClassWiseFeeStructureCard & { __draftId: string };
  const [localDrafts, setLocalDrafts] = useState<DraftCard[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedKey, setSelectedKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [savedCards, setSavedCards] = useState<
    Record<string, { card: IClassWiseFeeStructureCard; previousStamp?: string }>
  >({});
  const draftCounter = useRef(0);
  const dirtyCallback = useRef(onDirtyChange);
  dirtyCallback.current = onDirtyChange;
  const { data, isLoading, isFetching, isError, refetch } = useFetchStandardFeeStructures(classId);
  const raw: any[] = Array.isArray(data) ? data : (data?.standardFeeStructures ?? data?.data ?? []);
  const localSavedIds = new Set(localDrafts.map((card) => card._id).filter(Boolean));
  const serverCards = raw
    .map((item) => mapToCardModel(item, classId, feeStructureMetaDataId))
    .filter((card) => !deletedIds.has(card._id!) && !localSavedIds.has(card._id));
  const cards = [
    ...serverCards.map((card) => ({
      card:
        savedCards[card._id!] &&
        savedCards[card._id!].previousStamp === card.record?.concurrencyStamp
          ? savedCards[card._id!].card
          : card,
      key: card._id!,
      isLocal: false,
      sourceStamp: card.record?.concurrencyStamp,
    })),
    ...localDrafts.map((card) => ({
      card,
      key: card.__draftId,
      isLocal: true,
      sourceStamp: undefined,
    })),
  ];
  const activeKey = cards.some(({ key }) => key === selectedKey) ? selectedKey : cards[0]?.key;
  const addNew = useCallback(() => {
    draftCounter.current += 1;
    const key = `draft-${classId}-${draftCounter.current}`;
    setLocalDrafts((previous) => [
      ...previous,
      {
        __draftId: key,
        name: '',
        feeHeads: [],
        status: FeeStructureLockStatusType.Unlocked,
        classId,
        feeStructureMetaDataId,
      },
    ]);
    setSelectedKey(key);
  }, [classId, feeStructureMetaDataId]);
  useEffect(() => {
    onRegisterAddNew?.(addNew);
  }, [addNew, onRegisterAddNew]);
  useEffect(() => {
    dirtyCallback.current?.(dirtyKeys.size > 0);
  }, [dirtyKeys]);
  const dirtyChange = useCallback((key: string, dirty: boolean) => {
    setDirtyKeys((previous) => {
      if (previous.has(key) === dirty) return previous;
      const next = new Set(previous);
      if (dirty) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  const busyChange = useCallback(
    (value: boolean) => {
      setBusy(value);
      onBusyChange?.(value);
    },
    [onBusyChange]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, minWidth: 0 }}>
      {isFetching && !isLoading && (
        <LinearProgress aria-label="Refreshing fee structures" sx={{ flexShrink: 0 }} />
      )}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={refetch} disabled={busy}>
              Retry
            </Button>
          }
        >
          Fee structures could not be refreshed. Existing edits are preserved.
        </Alert>
      )}
      {isLoading && !cards.length && (
        <Stack spacing={2} sx={{ p: 2 }}>
          <Skeleton height={50} />
          <Skeleton height={200} />
        </Stack>
      )}
      {!isLoading && !isError && !cards.length && (
        <EmptyContent
          filled
          title="No fee structures"
          description={
            viewOnly
              ? 'No fee structures are configured for this class.'
              : 'Use Add Fee Structure to start configuring fees for this class.'
          }
          sx={{ flex: 1 }}
        />
      )}
      {cards.map(({ card, key, isLocal, sourceStamp }, index) => (
        <Box
          key={key}
          sx={{
            display: key === activeKey ? 'flex' : 'none',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <FeeStructureWorkspaceCard
            initialData={card}
            index={index}
            viewOnly={viewOnly}
            structureSelector={
              cards.length > 1 ? (
                <Box sx={{ maxWidth: { md: 540 } }}>
                  <CustomSelect
                    label="Fee structure"
                    value={activeKey ?? ''}
                    disabled={busy}
                    isSearch
                    options={cards.map(({ card: optionCard, key: optionKey }) => ({
                      value: optionKey,
                      label: `${optionCard.name || 'New fee structure'} · ${optionCard.status === FeeStructureLockStatusType.Locked ? 'Published' : 'Draft'} · v${optionCard.record?.revisionNumber ?? 1}${dirtyKeys.has(optionKey) ? ' · Unsaved' : ''}`,
                    }))}
                    onChange={(value) => setSelectedKey(String(value))}
                  />
                  {dirtyKeys.size > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      Switching structures keeps your unsaved edits.
                    </Typography>
                  )}
                </Box>
              ) : undefined
            }
            onBusyChange={busyChange}
            onDirtyChange={(dirty) => dirtyChange(key, dirty)}
            onSaved={(saved) => {
              dirtyChange(key, false);
              if (isLocal)
                setLocalDrafts((previous) =>
                  previous.map((draft) =>
                    draft.__draftId === key ? { ...saved, __draftId: key } : draft
                  )
                );
              else
                setSavedCards((previous) => ({
                  ...previous,
                  [key]: { card: saved, previousStamp: sourceStamp },
                }));
            }}
            onDeleted={() => {
              dirtyChange(key, false);
              if (isLocal)
                setLocalDrafts((previous) => previous.filter((draft) => draft.__draftId !== key));
              if (card._id) setDeletedIds((previous) => new Set([...previous, card._id!]));
            }}
          />
        </Box>
      ))}
    </Box>
  );
}
