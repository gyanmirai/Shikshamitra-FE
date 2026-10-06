'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Cancel, ArrowBack, CheckCircle } from '@mui/icons-material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Tooltip,
  Checkbox,
  Collapse,
  Skeleton,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import {
  useApproveConcessionRequestMutation,
  useReverseConcessionRequestMutation,
  usePreviewConcessionApprovalMutation,
  usePreviewConcessionReversalMutation,
  useGetConcessionApprovalContextQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type {
  IConcessionMonthItem,
  IFeeHeadApprovalViewProps,
  IConcessionFeeHeadWiseGroup,
} from './type';
import ReadOnlyConcessionApprovalView from './ReadOnlyConcessionApprovalView';

// ─── Form Types ────────────────────────────────────────────────────────────────

interface ConcessionFeeHeadFormEntry {
  feeHeadId: string;
  selectedDueFeeIds: string[];
  approvedAmount: number;
}

interface ConcessionApprovalFormValues {
  feeHeads: ConcessionFeeHeadFormEntry[];
  description: string;
}

const getValidationToastMessage = (errors: unknown): string => {
  if (!errors) return 'Please fill all required fields.';
  if (typeof errors === 'string') return errors;
  if (Array.isArray(errors)) {
    return (
      errors.map((err) => getValidationToastMessage(err)).find((message) => Boolean(message)) ??
      'Please fill all required fields.'
    );
  }
  if (typeof errors === 'object') {
    return (
      Object.values(errors as Record<string, unknown>)
        .map((value) => getValidationToastMessage(value))
        .find((message) => Boolean(message)) ?? 'Please fill all required fields.'
    );
  }
  return 'Please fill all required fields.';
};

// ─── Distribution Utility ─────────────────────────────────────────────────────

const distributeWithinOutstanding = (
  selectedDueFeeIds: string[],
  approvedAmount: number,
  items: IConcessionMonthItem[]
) => {
  const selectedItems = items.filter((item) => selectedDueFeeIds.includes(item.dueFeeId));
  const capacities = selectedItems.map((item) => ({
    item,
    cents: Math.max(0, Math.round(item.due * 100)),
  }));
  const totalOutstandingInCents = capacities.reduce((sum, entry) => sum + entry.cents, 0);
  const targetInCents = Math.min(
    Math.max(Math.round(approvedAmount * 100), 0),
    totalOutstandingInCents
  );
  const serverSuggestedTotal = selectedItems.reduce(
    (sum, item) => sum + Math.round(item.suggestedConcessionAmount * 100),
    0
  );
  if (serverSuggestedTotal === targetInCents) {
    return selectedItems.map((item) => ({
      dueFeeId: item.dueFeeId,
      concessionAmount: Math.round(item.suggestedConcessionAmount * 100) / 100,
    }));
  }

  const candidates = capacities.map(({ item, cents }) => {
    const exact =
      totalOutstandingInCents > 0 ? (targetInCents * cents) / totalOutstandingInCents : 0;
    const allocated = Math.min(cents, Math.floor(exact));
    return { item, capacity: cents, allocated, remainder: exact - allocated };
  });
  let remaining = targetInCents - candidates.reduce((sum, entry) => sum + entry.allocated, 0);
  const eligible = [...candidates].sort(
    (left, right) =>
      right.remainder - left.remainder || left.item.dueFeeId.localeCompare(right.item.dueFeeId)
  );
  while (remaining > 0) {
    let allocatedThisPass = false;
    let index = 0;
    while (index < eligible.length && remaining > 0) {
      const entry = eligible[index];
      if (remaining > 0 && entry.allocated < entry.capacity) {
        entry.allocated += 1;
        remaining -= 1;
        allocatedThisPass = true;
      }
      index += 1;
    }
    if (!allocatedThisPass) break;
  }
  return candidates.map((entry) => ({
    dueFeeId: entry.item.dueFeeId,
    concessionAmount: entry.allocated / 100,
  }));
};

const mapApprovalContextToGroups = (
  ctx: any,
  isReverse: boolean
): IConcessionFeeHeadWiseGroup[] => {
  if (!ctx?.feeHeadGroups?.length) return [];
  return ctx.feeHeadGroups.map((g: any) => ({
    feeHeadId: g.feeHeadId,
    feeHeadName: g.feeHeadName,
    months: g.dueFeeLines?.length ?? 0,
    totalDue:
      g.dueFeeLines?.reduce((sum: number, l: any) => sum + Number(l.outstandingAmount), 0) ?? 0,
    concessionAmount: isReverse
      ? (g.dueFeeLines ?? []).reduce(
          (sum: number, line: any) => sum + Number(line.reversibleConcessionAmount ?? 0),
          0
        )
      : Number(g.suggestedConcessionAmount),
    requestedConcessionAmount: Number(g.requestedConcessionAmount),
    liveMaximumConcessionAmount: Number(g.liveMaximumConcessionAmount),
    hasChangedSinceSubmission: Boolean(g.hasChangedSinceSubmission),
    isConcessionApply: g.dueFeeLines?.some((l: any) => l.isSelectable) ?? false,
    items: (g.dueFeeLines ?? []).map((l: any) => ({
      dueFeeId: l.dueFeeId,
      concessionDueFeeAllocationId: l.concessionDueFeeAllocationId,
      month: l.monthLabel || String(l.month),
      year: Number(l.year),
      total: Number(l.originalAmount),
      paid: Number(l.paidAmount),
      due: Number(l.outstandingAmount),
      concessionAmount: Number(l.suggestedConcessionAmount ?? 0),
      suggestedConcessionAmount: Number(l.suggestedConcessionAmount ?? 0),
      appliedConcessionAmount: Number(l.appliedConcessionAmount ?? 0),
      reversedConcessionAmount: Number(l.reversedConcessionAmount ?? 0),
      reversibleConcessionAmount: Number(l.reversibleConcessionAmount ?? 0),
      status: l.status,
      isSelectable: l.isSelectable,
      concurrencyStamp: l.concurrencyStamp,
    })),
  }));
};

// ─── Column Header ─────────────────────────────────────────────────────────────

const ConcessionColHeader = () => (
  <Box
    display="flex"
    alignItems="center"
    pl={1}
    gap={1}
    pr={1.5}
    py={0.5}
    sx={{ bgcolor: 'action.hover' }}
  >
    <Box sx={{ width: 32 }} />
    <Typography
      variant="caption"
      color="text.disabled"
      fontWeight={700}
      textTransform="uppercase"
      flex={1}
    >
      Month
    </Typography>
    {(['TOTAL', 'PAYABLE', 'CONCESSION', 'FINAL AMOUNT'] as const).map((col) => (
      <Typography
        key={col}
        variant="caption"
        color="text.disabled"
        fontWeight={700}
        textTransform="uppercase"
        sx={{ width: 80, textAlign: 'right' }}
      >
        {col}
      </Typography>
    ))}
  </Box>
);

// ─── Concession Month Row ──────────────────────────────────────────────────────

interface ConcessionFeeRowProps {
  item: IConcessionMonthItem;
  isSelected: boolean;
  isDisabled: boolean;
  distributedConcession: number;
  onToggle: () => void;
}

const ConcessionFeeRow: React.FC<ConcessionFeeRowProps> = ({
  item,
  isSelected,
  isDisabled,
  distributedConcession,
  onToggle,
}) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      pl={4}
      pr={1.5}
      py={0.75}
      sx={{
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'background-color 0.15s',
        '&:hover': !isDisabled ? { bgcolor: alpha(theme.palette.primary.main, 0.04) } : {},
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
      }}
      onClick={!isDisabled ? onToggle : undefined}
    >
      <Checkbox
        size="small"
        checked={isSelected}
        disabled={isDisabled}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        sx={{ p: 0.5 }}
      />
      <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
        <Typography variant="body2" noWrap fontWeight={500}>
          {item.month}-{item.year}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ width: 80, textAlign: 'right' }}>
        ₹{formatNumber(item.total)}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={item.due > 0 ? 600 : 400}
        color={item.due > 0 ? 'error.main' : 'text.secondary'}
        sx={{ width: 80, textAlign: 'right' }}
      >
        ₹{formatNumber(item.due)}
      </Typography>
      <Tooltip
        title={
          isSelected && distributedConcession > item.due ? 'Concession exceeds payable amount' : ''
        }
        placement="top"
      >
        <Typography
          variant="body2"
          fontWeight={600}
          color={
            isSelected && distributedConcession > item.due
              ? 'error.main'
              : isSelected
                ? 'success.main'
                : 'text.disabled'
          }
          sx={{ width: 80, textAlign: 'right' }}
        >
          {isSelected ? `₹${formatNumber(distributedConcession)}` : '—'}
        </Typography>
      </Tooltip>
      <Typography
        variant="body2"
        fontWeight={600}
        color={isSelected ? 'primary.main' : 'text.secondary'}
        sx={{ width: 80, textAlign: 'right' }}
      >
        ₹{formatNumber(isSelected ? Math.max(0, item.due - distributedConcession) : item.due)}
      </Typography>
    </Box>
  );
};

// ─── Group Header ──────────────────────────────────────────────────────────────

interface GroupHeaderProps {
  group: IConcessionFeeHeadWiseGroup;
  selectedDueFeeIds: string[];
  isOpen: boolean;
  onCheckboxToggle: () => void;
  onExpandToggle: () => void;
}

const FeeHeadGroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  selectedDueFeeIds,
  isOpen,
  onCheckboxToggle,
  onExpandToggle,
}) => {
  const theme = useTheme();
  const selectableItems = group.items.filter((i) => i.isSelectable !== false);
  const selectedCount = selectableItems.filter((i) =>
    selectedDueFeeIds.includes(i.dueFeeId)
  ).length;
  const isAllSelected = selectableItems.length > 0 && selectedCount === selectableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={1}
      py={1}
      sx={{
        bgcolor: isAllSelected ? alpha(theme.palette.primary.main, 0.06) : 'background.neutral',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onExpandToggle}
    >
      <Tooltip
        title={group.isConcessionApply ? '' : 'Concession not applicable for this fee head'}
        placement="top"
      >
        <span>
          <Checkbox
            size="small"
            checked={isAllSelected}
            indeterminate={isPartialSelected}
            disabled={!group.isConcessionApply}
            onChange={onCheckboxToggle}
            onClick={(e) => e.stopPropagation()}
            sx={{ p: 0.5 }}
          />
        </span>
      </Tooltip>

      <Typography variant="subtitle2" fontWeight={700}>
        {group.feeHeadName}
      </Typography>

      <Box
        sx={{
          px: 0.75,
          py: 0.2,
          borderRadius: 0.5,
          bgcolor: alpha(theme.palette.text.secondary, 0.08),
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {group.months} {group.months === 1 ? 'month' : 'months'}
        </Typography>
      </Box>

      {!group.isConcessionApply && (
        <Chip label="Not Applicable" size="small" sx={{ height: 20, fontSize: '10px' }} />
      )}

      <Box flex={1} />

      {group.isConcessionApply && group.concessionAmount > 0 && (
        <Typography variant="caption" fontWeight={700} color="success.main" sx={{ mr: 0.5 }}>
          Total: ₹{formatNumber(group.concessionAmount)}
        </Typography>
      )}

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onExpandToggle();
        }}
      >
        <Iconify icon={isOpen ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={18} />
      </IconButton>
    </Box>
  );
};

// ─── Fee Head Group ────────────────────────────────────────────────────────────

interface FeeHeadGroupProps {
  group: IConcessionFeeHeadWiseGroup;
  selectedDueFeeIds: string[];
  approvedAmount: number;
  onApprovedAmountChange: (amount: number) => void;
  onToggleDueFee: (dueFeeId: string) => void;
  onToggleAll: () => void;
  isReverse: boolean;
}

const FeeHeadGroup: React.FC<FeeHeadGroupProps> = ({
  group,
  selectedDueFeeIds,
  approvedAmount,
  onApprovedAmountChange,
  onToggleDueFee,
  onToggleAll,
  isReverse,
}) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const allocations = useMemo(
    () =>
      isReverse
        ? group.items
            .filter((item) => selectedDueFeeIds.includes(item.dueFeeId))
            .map((item) => ({
              dueFeeId: item.dueFeeId,
              concessionAmount: item.reversibleConcessionAmount ?? 0,
            }))
        : distributeWithinOutstanding(selectedDueFeeIds, approvedAmount, group.items),
    [approvedAmount, group.items, isReverse, selectedDueFeeIds]
  );

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        mb: 1.5,
        opacity: group.isConcessionApply ? 1 : 0.65,
      }}
    >
      <FeeHeadGroupHeader
        group={group}
        selectedDueFeeIds={selectedDueFeeIds}
        isOpen={open}
        onCheckboxToggle={onToggleAll}
        onExpandToggle={() => setOpen((o) => !o)}
      />

      <Collapse in={open}>
        <Divider />
        {!isReverse && (
          <Box px={1.5} py={1} sx={{ bgcolor: 'background.default' }}>
            <TextField
              size="small"
              type="number"
              label="Approved Amount"
              value={approvedAmount}
              onChange={(event) => onApprovedAmountChange(Math.max(0, Number(event.target.value)))}
              inputProps={{ min: 1, max: group.liveMaximumConcessionAmount, step: 1 }}
              helperText={`Requested: ₹${formatNumber(group.requestedConcessionAmount)} · Current maximum: ₹${formatNumber(group.liveMaximumConcessionAmount)}. You may approve a lower amount.`}
              sx={{ width: { xs: '100%', sm: 320 } }}
            />
          </Box>
        )}
        <ConcessionColHeader />
        {group.items.map((item, idx) => {
          const isSelected = selectedDueFeeIds.includes(item.dueFeeId);
          const isDisabled = item.isSelectable === false;
          const allocation = allocations.find((a) => a.dueFeeId === item.dueFeeId);
          const currentConcession = isSelected && allocation ? allocation.concessionAmount : 0;
          return (
            <React.Fragment key={item.dueFeeId}>
              <ConcessionFeeRow
                item={item}
                isSelected={isSelected}
                isDisabled={isDisabled}
                distributedConcession={currentConcession}
                onToggle={() => onToggleDueFee(item.dueFeeId)}
              />
              {idx < group.items.length - 1 && <Divider sx={{ mx: 1.5, opacity: 0.4 }} />}
            </React.Fragment>
          );
        })}

        {/* Group-level concession summary */}
        {group.isConcessionApply && (
          <>
            <Divider />
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={1}
              px={2}
              py={0.75}
              sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.04) }}
            >
              <Typography variant="caption" color="text.secondary">
                Selected lines: <strong>{selectedDueFeeIds.length}</strong>
              </Typography>
              <Typography variant="caption" color="success.dark" fontWeight={700}>
                Total Concession: ₹{formatNumber(selectedDueFeeIds.length > 0 ? approvedAmount : 0)}
              </Typography>
            </Box>
          </>
        )}
      </Collapse>
    </Box>
  );
};

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

const ApprovalSkeleton = () => (
  <Stack spacing={1.5}>
    {[...Array(2)].map((_outer, i) => (
      <Box key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 0.5 }} />
          <Skeleton variant="text" width={140} height={20} />
          <Skeleton variant="rectangular" width={60} height={18} sx={{ borderRadius: 0.5 }} />
          <Box flex={1} />
          <Skeleton variant="text" width={100} height={16} />
        </Box>
        {[...Array(3)].map((_inner, j) => (
          <Box key={j} display="flex" alignItems="center" gap={1} px={1} py={0.5}>
            <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 0.5 }} />
            <Skeleton variant="text" width={1} height={16} />
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    ))}
  </Stack>
);

// (Validation Schema is defined inside the component using useMemo to access groups/isApprove)
// ─── Main Component ────────────────────────────────────────────────────────────

const ConcessionFeeHeadApprovalLegacyView: React.FC<IFeeHeadApprovalViewProps> = ({
  selectedItem,
  mode,
  onBack,
}) => {
  const isApprove = mode === 'Approve';
  const commandKeys = useRef<Record<string, string>>({});
  const getCommandKey = (action: string) => {
    commandKeys.current[action] ||= window.crypto.randomUUID();
    return commandKeys.current[action];
  };

  const [approveConcession, { isLoading: isApproving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveConcessionRequestMutation,
    popupConfig: { error: false },
  });

  const [reverseConcession, { isLoading: isReversing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useReverseConcessionRequestMutation,
  });
  const [previewApproval, { isLoading: isPreviewingApproval }] =
    usePreviewConcessionApprovalMutation();
  const [previewReversal, { isLoading: isPreviewingReversal }] =
    usePreviewConcessionReversalMutation();
  const [confirmedPreviewKey, setConfirmedPreviewKey] = useState('');
  const [serverPreviewTotal, setServerPreviewTotal] = useState<number | null>(null);

  const requestId = selectedItem.studentConcessionTypeRequestId || selectedItem.id || '';

  const {
    data: approvalContext,
    isLoading: isFetchingFeeHeads,
    isFetching,
    refetch: refetchApprovalContext,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionApprovalContextQuery,
    params: requestId,
    options: { skip: !requestId },
  }) as { data: any; isLoading: boolean; isFetching: boolean; refetch: () => Promise<unknown> };

  const resolvedApprovalContext = approvalContext?.data ?? approvalContext;

  const groups = useMemo(
    () => mapApprovalContextToGroups(resolvedApprovalContext, !isApprove),
    [resolvedApprovalContext, isApprove]
  );

  const isLoading = isFetchingFeeHeads || isFetching;

  // ── Validation Schema ─────────────────────────────────────────────────────────

  const validationSchema = useMemo(
    () =>
      Yup.object({
        description: Yup.string()
          .trim()
          .max(
            isApprove ? 1000 : 2000,
            `Reason cannot exceed ${isApprove ? 1000 : 2000} characters`
          )
          .test(
            'reversal-reason-length',
            'Reversal reason must be at least 10 characters',
            (value) => isApprove || (value?.length ?? 0) >= 10
          ),
        feeHeads: Yup.array()
          .of(
            Yup.object({
              feeHeadId: Yup.string().required(),
              selectedDueFeeIds: Yup.array().of(Yup.string().required()).required(),
              approvedAmount: Yup.number().required().min(0),
            })
          )
          .test(
            'at-least-one-line',
            'Please select at least one due fee line to proceed.',
            (feeHeads) => (feeHeads ?? []).some((fh) => (fh.selectedDueFeeIds ?? []).length > 0)
          )
          .test(
            'concession-limit',
            'Concession amount cannot exceed payable amount',
            function (feeHeads) {
              if (!isApprove) return true;
              if (!feeHeads) return true;

              // eslint-disable-next-line no-restricted-syntax
              for (const fh of feeHeads) {
                // eslint-disable-next-line no-continue
                if (!fh.selectedDueFeeIds || fh.selectedDueFeeIds.length === 0) continue;
                const group = groups.find((g) => g.feeHeadId === fh.feeHeadId);
                // eslint-disable-next-line no-continue
                if (!group) continue;

                const selectedOutstanding = group.items
                  .filter((item) => fh.selectedDueFeeIds.includes(item.dueFeeId))
                  .reduce((sum, item) => sum + item.due, 0);
                const approvedAmount = Number(fh.approvedAmount ?? 0);

                if (approvedAmount <= 0 || approvedAmount > group.liveMaximumConcessionAmount) {
                  // eslint-disable-next-line react/no-this-in-sfc
                  return this.createError({
                    message: `For ${group.feeHeadName}, approved amount must be greater than zero and cannot exceed the current permitted maximum (₹${formatNumber(group.liveMaximumConcessionAmount)}).`,
                    path: 'feeHeads',
                  });
                }

                if (approvedAmount > selectedOutstanding) {
                  // eslint-disable-next-line react/no-this-in-sfc
                  return this.createError({
                    message: `For ${group.feeHeadName}, approved amount cannot exceed the selected outstanding amount (₹${formatNumber(selectedOutstanding)}).`,
                    path: 'feeHeads',
                  });
                }

                const allocations = distributeWithinOutstanding(
                  fh.selectedDueFeeIds,
                  approvedAmount,
                  group.items
                );

                // eslint-disable-next-line no-restricted-syntax
                for (const alloc of allocations) {
                  const item = group.items.find((i) => i.dueFeeId === alloc.dueFeeId);
                  if (item && alloc.concessionAmount > item.due) {
                    // eslint-disable-next-line react/no-this-in-sfc
                    return this.createError({
                      message: `For ${group.feeHeadName}, concession amount (₹${formatNumber(
                        alloc.concessionAmount
                      )}) allocated to ${item.month}-${item.year} cannot exceed the payable amount (₹${formatNumber(
                        item.due
                      )}).`,
                      path: 'feeHeads',
                    });
                  }
                }
              }
              return true;
            }
          ),
      }),
    [groups, isApprove]
  );

  // ── Formik ────────────────────────────────────────────────────────────────────

  const formik = useFormik<ConcessionApprovalFormValues>({
    initialValues: {
      feeHeads: [],
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const selectedFeeHeads = values.feeHeads.filter((fh) => fh.selectedDueFeeIds.length > 0);
      try {
        if (isApprove) {
          const feeHeadApprovals = selectedFeeHeads.map((fh) => {
            const group = groups.find((g) => g.feeHeadId === fh.feeHeadId)!;

            // Distribute the approved concession amount across selected due fees
            // ensuring the sum equals exactly the approvedConcessionAmount with no decimals
            const allocations = distributeWithinOutstanding(
              fh.selectedDueFeeIds,
              fh.approvedAmount,
              group.items
            ).map((allocation) => ({
              ...allocation,
              concurrencyStamp:
                group.items.find((item) => item.dueFeeId === allocation.dueFeeId)
                  ?.concurrencyStamp ?? '',
            }));

            return {
              feeHeadId: fh.feeHeadId,
              approvedConcessionAmount: fh.approvedAmount,
              dueFeeAllocations: allocations,
            };
          });

          const approvalPreview = await previewApproval({
            concessionRequestId: requestId,
            body: {
              requestConcurrencyStamp: resolvedApprovalContext?.requestConcurrencyStamp ?? '',
              previewFingerprint: resolvedApprovalContext?.previewFingerprint ?? '',
              feeHeadApprovals,
            },
          }).unwrap();
          await approveConcession({
            studentConcessionTypeRequestId: requestId,
            body: {
              message: values.description,
              requestConcurrencyStamp: approvalPreview.requestConcurrencyStamp,
              previewFingerprint: approvalPreview.previewFingerprint,
              idempotencyKey: getCommandKey('approve'),
              feeHeadApprovals,
            },
          }).unwrap();
        } else {
          const lines = selectedFeeHeads.flatMap((feeHead) => {
            const group = groups.find((candidate) => candidate.feeHeadId === feeHead.feeHeadId);
            return (group?.items ?? [])
              .filter(
                (item) =>
                  feeHead.selectedDueFeeIds.includes(item.dueFeeId) &&
                  item.concessionDueFeeAllocationId &&
                  (item.reversibleConcessionAmount ?? 0) > 0
              )
              .map((item) => ({
                concessionDueFeeAllocationId: item.concessionDueFeeAllocationId!,
                amount: item.reversibleConcessionAmount ?? 0,
                concurrencyStamp: item.concurrencyStamp,
              }));
          });
          const reversalPreview = await previewReversal({
            concessionRequestId: requestId,
            body: {
              requestConcurrencyStamp: resolvedApprovalContext?.requestConcurrencyStamp ?? '',
              lines,
            },
          }).unwrap();
          await reverseConcession({
            concessionRequestId: requestId,
            body: {
              reason: values.description,
              requestConcurrencyStamp: reversalPreview.requestConcurrencyStamp,
              idempotencyKey: getCommandKey('reverse'),
              lines,
            },
          }).unwrap();
        }

        shikshaMitraToast.success({
          message: `Concession ${isApprove ? 'approved' : 'reversed'} successfully.`,
        });
        onBack();
      } catch (error) {
        const parsed = parseApiProblemDetail(error);
        const isConcurrencyConflict =
          parsed.errorCode === 'Finance:Concession:030003' ||
          parsed.detail.includes('Finance:Concession:030003');
        shikshaMitraToast.error({
          message: isConcurrencyConflict
            ? 'The request or fee balances changed while you were reviewing them. The latest values have been reloaded; please review again.'
            : parsed.detail,
        });
        if (isConcurrencyConflict) await refetchApprovalContext();
      }
    },
  });

  // ── Default-select all applicable months once groups are available
  useEffect(() => {
    if (groups.length === 0) return;
    formik.setFieldValue(
      'feeHeads',
      groups.map((group) => ({
        feeHeadId: group.feeHeadId,
        approvedAmount: group.concessionAmount,
        selectedDueFeeIds: group.items
          .filter((i) => i.isSelectable !== false)
          .map((i) => i.dueFeeId),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalContext]);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getSelectedDueFeeIds = (feeHeadId: string): string[] =>
    formik.values.feeHeads.find((fh) => fh.feeHeadId === feeHeadId)?.selectedDueFeeIds ?? [];

  const getApprovedAmount = (feeHeadId: string): number =>
    formik.values.feeHeads.find((fh) => fh.feeHeadId === feeHeadId)?.approvedAmount ?? 0;

  const setApprovedAmount = (feeHeadId: string, amount: number) => {
    const idx = formik.values.feeHeads.findIndex((fh) => fh.feeHeadId === feeHeadId);
    if (idx === -1) return;
    formik.setFieldValue(`feeHeads[${idx}].approvedAmount`, amount);
  };

  const toggleDueFee = (feeHeadId: string, dueFeeId: string) => {
    const idx = formik.values.feeHeads.findIndex((fh) => fh.feeHeadId === feeHeadId);
    if (idx === -1) return;
    const curr = formik.values.feeHeads[idx].selectedDueFeeIds;
    const next = curr.includes(dueFeeId)
      ? curr.filter((id) => id !== dueFeeId)
      : [...curr, dueFeeId];
    formik.setFieldValue(`feeHeads[${idx}].selectedDueFeeIds`, next);
  };

  const toggleAllDueFees = (group: IConcessionFeeHeadWiseGroup) => {
    const idx = formik.values.feeHeads.findIndex((fh) => fh.feeHeadId === group.feeHeadId);
    if (idx === -1) return;
    const curr = formik.values.feeHeads[idx].selectedDueFeeIds;
    const selectableIds = group.items
      .filter((i) => i.isSelectable !== false)
      .map((i) => i.dueFeeId);
    const isAllSelected = selectableIds.every((id) => curr.includes(id));
    formik.setFieldValue(`feeHeads[${idx}].selectedDueFeeIds`, isAllSelected ? [] : selectableIds);
  };

  // ── Derived totals ────────────────────────────────────────────────────────────

  const totalSelectedLines = formik.values.feeHeads.reduce(
    (sum, fh) => sum + fh.selectedDueFeeIds.length,
    0
  );

  const totalSelectedConcession = groups.reduce((sum, group) => {
    const fh = formik.values.feeHeads.find((f) => f.feeHeadId === group.feeHeadId);
    if (isApprove)
      return sum + ((fh?.selectedDueFeeIds.length ?? 0) > 0 ? (fh?.approvedAmount ?? 0) : 0);
    return (
      sum +
      group.items
        .filter((item) => fh?.selectedDueFeeIds.includes(item.dueFeeId))
        .reduce((lineSum, item) => lineSum + (item.reversibleConcessionAmount ?? 0), 0)
    );
  }, 0);

  const reviewKey = JSON.stringify({
    mode,
    requestStamp: resolvedApprovalContext?.requestConcurrencyStamp,
    previewFingerprint: resolvedApprovalContext?.previewFingerprint,
    feeHeads: formik.values.feeHeads,
  });

  useEffect(() => {
    setConfirmedPreviewKey('');
    setServerPreviewTotal(null);
  }, [reviewKey]);

  const isSubmitting = isApproving || isReversing || isPreviewingApproval || isPreviewingReversal;

  const handleApprovalActionClick = async () => {
    if (
      isApprove &&
      totalSelectedConcession <
        Number(resolvedApprovalContext?.totalRequestedConcessionAmount ?? 0) &&
      formik.values.description.trim().length < 10
    ) {
      formik.setFieldTouched('description', true);
      formik.setFieldError(
        'description',
        'Give a reason of at least 10 characters for a reduced approval.'
      );
      shikshaMitraToast.error({
        message: 'Give a reason of at least 10 characters for a reduced approval.',
      });
      return;
    }
    formik.setTouched({
      description: true,
      feeHeads: formik.values.feeHeads.map(() => ({
        selectedDueFeeIds: true,
        approvedAmount: true,
      })),
    });
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      shikshaMitraToast.error({
        message: getValidationToastMessage(errors),
      });
      return;
    }
    if (confirmedPreviewKey !== reviewKey) {
      const selectedFeeHeads = formik.values.feeHeads.filter(
        (feeHead) => feeHead.selectedDueFeeIds.length > 0
      );
      try {
        if (isApprove) {
          const feeHeadApprovals = selectedFeeHeads.map((feeHead) => {
            const group = groups.find((candidate) => candidate.feeHeadId === feeHead.feeHeadId)!;
            return {
              feeHeadId: feeHead.feeHeadId,
              approvedConcessionAmount: feeHead.approvedAmount,
              dueFeeAllocations: distributeWithinOutstanding(
                feeHead.selectedDueFeeIds,
                feeHead.approvedAmount,
                group.items
              ).map((allocation) => ({
                ...allocation,
                concurrencyStamp:
                  group.items.find((item) => item.dueFeeId === allocation.dueFeeId)
                    ?.concurrencyStamp ?? '',
              })),
            };
          });
          const result = await previewApproval({
            concessionRequestId: requestId,
            body: {
              requestConcurrencyStamp: resolvedApprovalContext?.requestConcurrencyStamp ?? '',
              previewFingerprint: resolvedApprovalContext?.previewFingerprint ?? '',
              feeHeadApprovals,
            },
          }).unwrap();
          setServerPreviewTotal(result.totalApprovedAmount);
        } else {
          const lines = selectedFeeHeads.flatMap((feeHead) => {
            const group = groups.find((candidate) => candidate.feeHeadId === feeHead.feeHeadId);
            return (group?.items ?? [])
              .filter(
                (item) =>
                  feeHead.selectedDueFeeIds.includes(item.dueFeeId) &&
                  item.concessionDueFeeAllocationId &&
                  (item.reversibleConcessionAmount ?? 0) > 0
              )
              .map((item) => ({
                concessionDueFeeAllocationId: item.concessionDueFeeAllocationId!,
                amount: item.reversibleConcessionAmount ?? 0,
                concurrencyStamp: item.concurrencyStamp,
              }));
          });
          const result = await previewReversal({
            concessionRequestId: requestId,
            body: {
              requestConcurrencyStamp: resolvedApprovalContext?.requestConcurrencyStamp ?? '',
              lines,
            },
          }).unwrap();
          setServerPreviewTotal(result.totalReversalAmount);
        }
        setConfirmedPreviewKey(reviewKey);
      } catch (error) {
        const parsed = parseApiProblemDetail(error);
        shikshaMitraToast.error({ message: parsed.detail });
      }
      return;
    }
    formik.handleSubmit();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1.25}
        sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}
      >
        <IconButton size="small" onClick={onBack} sx={{ mr: 0.5 }}>
          <ArrowBack fontSize="small" />
        </IconButton>

        <Box flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {isApprove ? 'Approve' : 'Reverse'} Concession
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {resolvedApprovalContext?.concessionPolicyName ?? selectedItem.concessionTypeName}
            {resolvedApprovalContext?.concessionPolicyVersion
              ? ` · Version ${resolvedApprovalContext.concessionPolicyVersion}`
              : ''}
          </Typography>
        </Box>
        {totalSelectedLines > 0 && (
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: (t) => `${t.palette.success.main}14`,
              border: (t) => `1px solid ${t.palette.success.light}`,
            }}
          >
            <Typography variant="caption" color="success.dark" fontWeight={700}>
              {totalSelectedLines} line{totalSelectedLines !== 1 ? 's' : ''} · ₹
              {formatNumber(totalSelectedConcession)} concession
            </Typography>
          </Box>
        )}
      </Box>

      <Scrollbar sx={{ flex: 1, p: 1.5 }}>
        {resolvedApprovalContext?.hasChangedSinceSubmission && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            Fee balances changed after submission. The values below use the current eligible
            balance; review the updated proposal before continuing.
          </Alert>
        )}
        {confirmedPreviewKey === reviewKey && serverPreviewTotal !== null && (
          <Alert severity="success" sx={{ mb: 1.5 }}>
            The server validated a total of {formatNumber(serverPreviewTotal, 'INR')}. Confirm to
            {isApprove
              ? ' apply this concession to the selected dues.'
              : ' reopen this obligation.'}
          </Alert>
        )}
        {/* ── Description Field ── */}
        <ShakingTextField error={!!formik.errors.description && formik.touched.description}>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label={
              isApprove &&
              totalSelectedConcession >=
                Number(resolvedApprovalContext?.totalRequestedConcessionAmount ?? 0)
                ? 'Approval message (optional)'
                : 'Reason *'
            }
            value={formik.values.description}
            onChange={(e) => formik.setFieldValue('description', e.target.value)}
            onBlur={formik.handleBlur}
            name="description"
            error={!!formik.errors.description && formik.touched.description}
            helperText={formik.touched.description && formik.errors.description}
            sx={{ mb: 2 }}
          />
        </ShakingTextField>

        {/* ── Info Banner ── */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          px={1.5}
          py={1}
          mb={1.5}
          sx={{
            borderRadius: 1,
            bgcolor: (t) =>
              isApprove ? `${t.palette.info.main}0f` : `${t.palette.warning.main}0f`,
            border: (t) =>
              `1px solid ${isApprove ? t.palette.info.light : t.palette.warning.light}`,
          }}
        >
          <Iconify
            icon="solar:info-circle-bold"
            width={16}
            sx={{ color: isApprove ? 'info.main' : 'warning.main', flexShrink: 0 }}
          />
          <Typography variant="caption" color="text.secondary">
            Select due fee lines per fee head to {isApprove ? 'approve' : 'reverse'} the concession.
            Lines with no outstanding balance cannot be selected.
          </Typography>
        </Box>

        {/* ── Fee Head Groups ── */}
        {isLoading ? (
          <ApprovalSkeleton />
        ) : groups.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
            gap={1}
          >
            <Iconify
              icon="solar:inbox-line-bold-duotone"
              width={40}
              sx={{ color: 'text.disabled' }}
            />
            <Typography variant="body2" color="text.disabled">
              No fee head data available
            </Typography>
          </Box>
        ) : (
          groups.map((group) => (
            <FeeHeadGroup
              key={group.feeHeadId}
              group={group}
              selectedDueFeeIds={getSelectedDueFeeIds(group.feeHeadId)}
              approvedAmount={getApprovedAmount(group.feeHeadId)}
              onApprovedAmountChange={(amount) => setApprovedAmount(group.feeHeadId, amount)}
              onToggleDueFee={(dueFeeId) => toggleDueFee(group.feeHeadId, dueFeeId)}
              onToggleAll={() => toggleAllDueFees(group)}
              isReverse={!isApprove}
            />
          ))
        )}
      </Scrollbar>

      {/* ── Footer ── */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadows-10)',
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          startIcon={<ArrowBack fontSize="small" />}
          onClick={onBack}
        >
          Back
        </Button>

        <Box display="flex" alignItems="center" gap={1}>
          {totalSelectedConcession > 0 && (
            <Typography variant="caption" color="success.main" fontWeight={700}>
              {formatNumber(totalSelectedConcession, 'INR')} concession selected
            </Typography>
          )}
          <LoadingButton
            loading={isSubmitting}
            variant="soft"
            size="small"
            color={isApprove ? 'success' : 'warning'}
            startIcon={isApprove ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
            onClick={handleApprovalActionClick}
          >
            {confirmedPreviewKey === reviewKey ? 'Confirm and apply' : 'Review impact'}
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};

export default function ConcessionFeeHeadApprovalView(props: IFeeHeadApprovalViewProps) {
  return props.mode === 'Approve'
    ? <ReadOnlyConcessionApprovalView {...props} />
    : <ConcessionFeeHeadApprovalLegacyView {...props} />;
}
