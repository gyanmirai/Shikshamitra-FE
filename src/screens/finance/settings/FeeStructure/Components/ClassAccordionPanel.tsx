import type { StructureRecord } from 'src/redux/finance/feeStructureWorkspace';

import { useGetStructureDetailQuery } from 'src/redux/finance/feeStructureWorkspace';
import { GlobalIcons } from 'src/utils/icons';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useResponsive } from 'src/hooks/use-responsive';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import {
  Box,
  List,
  Alert,
  Stack,
  Button,
  Drawer,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
  ListItemButton,
  InputAdornment,
} from '@mui/material';

import CopyFeeStructureDialog from './CopyFeeStructureDialog';
import FeeStructureWorkspaceCard from './FeeStructureWorkspaceCard';
import { useFetchStandardFeeStructures } from '../hooks/useClassWiseFeeStructureHooks';

import type { IClassWiseFeeStructureCard } from '../type';

interface ClassAccordionPanelProps {
  classId: string;
  classes?: { id: string; name: string }[];
  feeStructureMetaDataId: string;
  viewOnly?: boolean;
  canAdd?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  onPublished?: (name: string) => void;
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

// Load a full record only after selection; keep visited editors mounted to preserve drafts.
function ActivatedStructureEditor({
  initialData: summary,
  ...props
}: React.ComponentProps<typeof FeeStructureWorkspaceCard>) {
  const needsDetail = !!summary._id && !summary.record?.feeHeads;
  const detail = useGetStructureDetailQuery(summary._id ?? '', { skip: !needsDetail });
  if (needsDetail && detail.isError && !detail.currentData)
    return (
      <Alert severity="error" action={<Button onClick={() => detail.refetch()}>Retry</Button>}>
        The fee structure could not be loaded.
      </Alert>
    );
  if (needsDetail && !detail.currentData)
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Skeleton height={50} />
        <Skeleton height={200} />
      </Stack>
    );
  const initialData = needsDetail
    ? mapToCardModel(detail.currentData, summary.classId, summary.feeStructureMetaDataId)
    : summary;
  return <FeeStructureWorkspaceCard {...props} initialData={initialData} />;
}
export default function ClassAccordionPanel({
  classId,
  classes = [],
  feeStructureMetaDataId,
  viewOnly = false,
  canAdd = false,
  onDirtyChange,
  onBusyChange,
  onPublished,
  onRegisterAddNew,
}: ClassAccordionPanelProps) {
  type DraftCard = IClassWiseFeeStructureCard & { __draftId: string };
  const [localDrafts, setLocalDrafts] = useState<DraftCard[]>([]);
  const copyDialog = useBoolean();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedKey, setSelectedKey] = useState('');
  const visitedKeys = useRef(new Set<string>());
  const [busy, setBusy] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [names, setNames] = useState<Record<string, string>>({});
  const [actionContainers, setActionContainers] = useState<Record<string, HTMLDivElement | null>>(
    {}
  );
  const actionRefs = useRef(new Map<string, (element: HTMLDivElement | null) => void>());
  const actionRef = (key: string) => {
    if (!actionRefs.current.has(key))
      actionRefs.current.set(key, (element) => {
        setActionContainers((previous) =>
          previous[key] === element ? previous : { ...previous, [key]: element }
        );
      });
    return actionRefs.current.get(key)!;
  };
  const desktop = useResponsive('up', 'lg');
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [editorVersions, setEditorVersions] = useState<Record<string, number>>({});
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
  const persistedStructures = cards.flatMap(({ card }) =>
    card._id ? [{ id: card._id, name: card.name }] : []
  );
  const activeKey = cards.some(({ key }) => key === selectedKey) ? selectedKey : cards[0]?.key;
  if (activeKey) visitedKeys.current.add(activeKey);
  const requestNavigation = useCallback(
    (proceed: () => void) => {
      if (busy) return;
      if (activeKey && dirtyKeys.has(activeKey)) setPendingNavigation(() => proceed);
      else proceed();
    },
    [activeKey, busy, dirtyKeys]
  );
  const selectStructure = (key: string) => {
    if (key === activeKey) {
      setListOpen(false);
      return;
    }
    requestNavigation(() => {
      setSelectedKey(key);
      setListOpen(false);
    });
  };
  const discardAndNavigate = () => {
    if (busy || !pendingNavigation) return;
    if (activeKey) {
      // Unmount only this editor so reopening starts from its latest saved record.
      visitedKeys.current.delete(activeKey);
      setEditorVersions((previous) => ({
        ...previous,
        [activeKey]: (previous[activeKey] ?? 0) + 1,
      }));
      setLocalDrafts((previous) =>
        previous.filter((draft) => draft.__draftId !== activeKey || !!draft._id)
      );
      setNames((previous) => {
        const next = { ...previous };
        delete next[activeKey];
        return next;
      });
      setDirtyKeys((previous) => {
        const next = new Set(previous);
        next.delete(activeKey);
        return next;
      });
    }
    setPendingNavigation(null);
    pendingNavigation();
  };
  const openRevision = (record: StructureRecord) => {
    const existing = cards.find(({ card }) => card._id === record.id);
    const card = mapToCardModel(record, classId, feeStructureMetaDataId);
    if (!existing) {
      setLocalDrafts((previous) =>
        previous.some((draft) => draft._id === record.id)
          ? previous
          : [...previous, { ...card, __draftId: record.id }]
      );
    } else if (!existing.isLocal && !visitedKeys.current.has(existing.key)) {
      setSavedCards((previous) => ({
        ...previous,
        [existing.key]: { card, previousStamp: existing.sourceStamp },
      }));
    }
    setSelectedKey(existing?.key ?? record.id);
    setSearch('');
    setListOpen(false);
  };
  const addNew = useCallback(() => {
    requestNavigation(() => {
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
      setSearch('');
      setListOpen(false);
    });
  }, [classId, feeStructureMetaDataId, requestNavigation]);
  const openCopyDialog = () =>
    requestNavigation(() => {
      setListOpen(false);
      copyDialog.onTrue();
    });
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
  const activeCard = cards.find(({ key }) => key === activeKey)?.card;
  const activeName = (names[activeKey ?? ''] ?? activeCard?.name) || 'New fee structure';
  const initialLoading = (isLoading || (isFetching && data == null)) && !cards.length;
  const visibleCards = cards.filter(({ card, key }) =>
    ((names[key] ?? card.name) || 'New fee structure').toLowerCase().includes(search.toLowerCase())
  );
  const structureList = (
    <Stack sx={{ height: 1, minHeight: 0, minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1.5 }}
      >
        <Typography component="h2" variant="subtitle2">
          Structures{' '}
          {!initialLoading && (
            <Typography component="span" variant="caption" color="text.secondary">
              ({cards.length})
            </Typography>
          )}
        </Typography>
        {!desktop && (
          <IconButton
            size="small"
            aria-label="Close Structures"
            disabled={busy}
            onClick={() => setListOpen(false)}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        )}
      </Stack>
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          label="Search structures"
          value={search}
          disabled={busy}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={GlobalIcons.search} width={20} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {canAdd && (
        <Stack direction="row" spacing={1} sx={{ px: 1.5, pb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            aria-label="Copy Structure"
            startIcon={<Iconify icon={GlobalIcons.copy} />}
            onClick={openCopyDialog}
            disabled={busy}
          >
            Copy Structure
          </Button>
          <Button
            size="small"
            variant="contained"
            color="inherit"
            fullWidth
            aria-label="Structure"
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            onClick={addNew}
            disabled={busy}
          >
            Structure
          </Button>
        </Stack>
      )}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        {initialLoading && (
          <Stack role="status" aria-label="Loading fee structures" spacing={1} sx={{ p: 1.5 }}>
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} variant="rounded" height={56} />
            ))}
          </Stack>
        )}
        <List aria-label="Fee structures" sx={{ p: 1.5, minWidth: 0 }}>
          {visibleCards.map(({ card, key }, index) => {
            const name = (names[key] ?? card.name) || 'New fee structure';
            const selected = key === activeKey;
            const published = card.status === FeeStructureLockStatusType.Locked;
            const draft = card.status === FeeStructureLockStatusType.Unlocked;
            return (
              <Box
                component="li"
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                  mb: 1,
                  border: 1,
                  borderColor: selected ? 'text.secondary' : 'divider',
                  borderLeftWidth: 3,
                  borderLeftColor: selected ? 'primary.main' : 'transparent',
                  bgcolor: selected ? 'action.selected' : 'background.paper',
                  borderRadius: 1,
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundImage: (theme) => {
                      const hover = (theme.vars ?? theme).palette.action.hover;
                      return `linear-gradient(${hover}, ${hover})`;
                    },
                  },
                }}
              >
                <ListItemButton
                  selected={selected}
                  disabled={busy}
                  aria-label={name}
                  aria-describedby={`fee-structure-status-${classId}-${key}`}
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => selectStructure(key)}
                  sx={{
                    minHeight: 56,
                    minWidth: 0,
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '24px minmax(0, 1fr) auto',
                    columnGap: 0.5,
                    p: 1.25,
                    '&.Mui-selected, &:hover': { bgcolor: 'transparent' },
                    '&.Mui-selected:hover': {
                      bgcolor: 'transparent',
                    },
                    '&.Mui-focusVisible': {
                      outline: '2px solid',
                      outlineColor: 'text.secondary',
                      outlineOffset: -2,
                    },
                  }}
                >
                  <Box
                    component="span"
                    aria-hidden="true"
                    sx={{
                      width: 24,
                      height: 24,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      bgcolor: selected ? 'primary.main' : 'background.neutral',
                      color: selected ? 'primary.contrastText' : 'text.secondary',
                      typography: 'caption',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 0,
                      overflowWrap: 'anywhere',
                      color: 'text.primary',
                      fontWeight: selected ? 600 : 500,
                    }}
                  >
                    {name}
                  </Typography>
                  <Label
                    id={`fee-structure-status-${classId}-${key}`}
                    color={published ? 'success' : draft ? 'warning' : 'default'}
                  >
                    {published ? 'Published' : draft ? 'Draft' : 'Status unavailable'}
                  </Label>
                </ListItemButton>
                <Box
                  ref={actionRef(key)}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  onKeyUp={(event) => event.stopPropagation()}
                  sx={{ flexShrink: 0 }}
                />
              </Box>
            );
          })}
        </List>
        {search && !initialLoading && !visibleCards.length && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2">No structures match your search.</Typography>
            <Button size="small" onClick={() => setSearch('')}>
              Clear Search
            </Button>
          </Box>
        )}
      </Scrollbar>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, minWidth: 0 }}>
      {isFetching && !initialLoading && (
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
      {!desktop && (
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:format-list-bulleted" />}
            disabled={busy}
            onClick={() => setListOpen(true)}
            sx={{ maxWidth: '100%' }}
          >
            <Box
              component="span"
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Structures{activeCard ? ` · ${activeName}` : ''}
            </Box>
          </Button>
          {canAdd && (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.copy} />}
                disabled={busy}
                onClick={openCopyDialog}
              >
                Copy Structure
              </Button>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                sx={{ flexShrink: 0 }}
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                disabled={busy}
                onClick={addNew}
              >
                Structure
              </Button>
            </Stack>
          )}
        </Box>
      )}
      <Drawer
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={!desktop && listOpen}
        onClose={() => {
          if (!busy) setListOpen(false);
        }}
        slotProps={{ paper: { sx: { width: 320, maxWidth: '100%' } } }}
      >
        {structureList}
      </Drawer>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
        {desktop && (
          <Box
            component="aside"
            aria-label="Structure navigation"
            sx={{ width: 320, flexShrink: 0, borderRight: 1, borderColor: 'divider', minHeight: 0 }}
          >
            {structureList}
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 }}>
          {initialLoading && (
            <Stack spacing={2} sx={{ p: 2 }}>
              <Skeleton height={50} />
              <Skeleton height={200} />
            </Stack>
          )}
          {!initialLoading && !isError && !cards.length && (
            <EmptyContent
              filled
              title="No fee structures"
              description={
                canAdd
                  ? 'Use the Structure button to start configuring fees for this class.'
                  : 'No fee structures are configured for this class.'
              }
              sx={{ flex: 1 }}
            />
          )}
          {cards
            .filter(({ key }) => visitedKeys.current.has(key))
            .map(({ card, key, isLocal, sourceStamp }, index) => (
              <Box
                key={`${key}:${editorVersions[key] ?? 0}`}
                sx={{
                  display: key === activeKey ? 'flex' : 'none',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <ActivatedStructureEditor
                  initialData={card}
                  persistedStructures={persistedStructures}
                  isActive={key === activeKey}
                  actionsContainer={actionContainers[key]}
                  actionsInList
                  index={index}
                  viewOnly={viewOnly}
                  onNameChange={(name) =>
                    setNames((previous) =>
                      previous[key] === name ? previous : { ...previous, [key]: name }
                    )
                  }
                  onBusyChange={busyChange}
                  onPublished={onPublished}
                  onRevisionReady={openRevision}
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
                      setLocalDrafts((previous) =>
                        previous.filter((draft) => draft.__draftId !== key)
                      );
                    if (card._id) setDeletedIds((previous) => new Set([...previous, card._id!]));
                  }}
                />
              </Box>
            ))}
        </Box>
      </Box>
      {pendingNavigation && (
        <ConfirmDialog
          open
          title="Discard Unsaved Changes?"
          content={`Your unsaved changes to “${activeName}” will be lost if you continue.`}
          icon={<Iconify icon={GlobalIcons.warning} width={24} color="warning.main" />}
          cancelText="Keep editing"
          disableBackdropClick
          disableCancel={busy}
          disableEscapeKeyDown={busy}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
          onClose={() => {
            if (!busy) setPendingNavigation(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              if (!busy) setPendingNavigation(null);
            }
          }}
          action={
            <Button
              type="button"
              size="small"
              variant="contained"
              color="error"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.delete} />}
              onClick={discardAndNavigate}
            >
              Discard changes
            </Button>
          }
        />
      )}
      {canAdd && copyDialog.value && (
        <CopyFeeStructureDialog
          feeStructureMetadataId={feeStructureMetaDataId}
          standardId={classId}
          classes={classes}
          existingNames={cards.map(({ card, key }) => names[key] ?? card.name)}
          onClose={copyDialog.onFalse}
          onBusyChange={busyChange}
          onCopied={(record) => {
            setLocalDrafts((previous) => [
              ...previous,
              { ...mapToCardModel(record, classId, feeStructureMetaDataId), __draftId: record.id },
            ]);
            setSelectedKey(record.id);
            setSearch('');
            copyDialog.onFalse();
          }}
        />
      )}
    </Box>
  );
}
