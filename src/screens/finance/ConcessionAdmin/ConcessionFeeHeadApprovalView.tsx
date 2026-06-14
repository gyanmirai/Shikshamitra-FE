'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Cancel, ArrowBack, CheckCircle } from '@mui/icons-material';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import {
  calculatePerLineConcession,
  distributeConcessionAcrossDueFees,
} from 'src/utils/distributeConcession';
import {
  Box,
  Chip,
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
  useCancelConcessionRequestMutation,
  useApproveConcessionRequestMutation,
  useGetConcessionApprovalContextQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type {
  IConcessionMonthItem,
  IFeeHeadApprovalViewProps,
  IConcessionFeeHeadWiseGroup,
} from './type';

// ─── Form Types ────────────────────────────────────────────────────────────────

interface ConcessionFeeHeadFormEntry {
  feeHeadId: string;
  selectedDueFeeIds: string[];
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

/**
 * Legacy utility for calculating per-line concession for display.
 * For actual distribution with proper integer allocation, use distributeConcessionAcrossDueFees.
 * @deprecated Use calculatePerLineConcession from distributeConcession.ts
 */
const distributeMonthConcession = (totalConcession: number, selectedMonthCount: number): number =>
  calculatePerLineConcession(totalConcession, selectedMonthCount);

const mapApprovalContextToGroups = (ctx: any): IConcessionFeeHeadWiseGroup[] => {
  if (!ctx?.feeHeadGroups?.length) return [];
  return ctx.feeHeadGroups.map((g: any) => ({
    feeHeadId: g.feeHeadId,
    feeHeadName: g.feeHeadName,
    months: g.dueFeeLines?.length ?? 0,
    totalDue:
      g.dueFeeLines?.reduce((sum: number, l: any) => sum + Number(l.outstandingAmount), 0) ?? 0,
    concessionAmount: Number(g.requestedConcessionAmount),
    isConcessionApply: g.dueFeeLines?.some((l: any) => l.isSelectable) ?? false,
    items: (g.dueFeeLines ?? []).map((l: any) => ({
      dueFeeId: l.dueFeeId,
      month: l.monthLabel || String(l.month),
      year: Number(l.year),
      total: Number(l.originalAmount),
      paid: Number(l.paidAmount),
      due: Number(l.outstandingAmount),
      concessionAmount: 0,
      status: FeeCollectionStatusType.Pending,
      isSelectable: l.isSelectable,
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
      <Typography
        variant="body2"
        fontWeight={600}
        color={isSelected ? 'success.main' : 'text.disabled'}
        sx={{ width: 80, textAlign: 'right' }}
      >
        {isSelected ? `₹${formatNumber(distributedConcession)}` : '—'}
      </Typography>
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
  const perMonthConcession = distributeMonthConcession(group.concessionAmount, selectedCount);

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
          {selectedCount > 0 && (
            <Typography component="span" variant="caption" color="text.disabled" fontWeight={400}>
              {' '}
              (₹{formatNumber(Math.round(perMonthConcession * 100) / 100)}/month × {selectedCount})
            </Typography>
          )}
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
  onToggleDueFee: (dueFeeId: string) => void;
  onToggleAll: () => void;
}

const FeeHeadGroup: React.FC<FeeHeadGroupProps> = ({
  group,
  selectedDueFeeIds,
  onToggleDueFee,
  onToggleAll,
}) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const distributedConcession = distributeMonthConcession(
    group.concessionAmount,
    selectedDueFeeIds.length
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
        <ConcessionColHeader />
        {group.items.map((item, idx) => {
          const isSelected = selectedDueFeeIds.includes(item.dueFeeId);
          const isDisabled = item.isSelectable === false;
          return (
            <React.Fragment key={item.dueFeeId}>
              <ConcessionFeeRow
                item={item}
                isSelected={isSelected}
                isDisabled={isDisabled}
                distributedConcession={distributedConcession}
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
              gap={2}
              px={2}
              py={0.75}
              sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.04) }}
            >
              <Typography variant="caption" color="text.secondary">
                Selected lines: <strong>{selectedDueFeeIds.length}</strong>
              </Typography>
              <Typography variant="caption" color="success.dark" fontWeight={700}>
                Total Concession: ₹
                {formatNumber(selectedDueFeeIds.length > 0 ? group.concessionAmount : 0)}
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

// ─── Validation Schema ─────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  description: Yup.string().trim().required('Description / Reason is required'),
  feeHeads: Yup.array()
    .of(
      Yup.object({
        feeHeadId: Yup.string().required(),
        selectedDueFeeIds: Yup.array().of(Yup.string().required()).required(),
      })
    )
    .test('at-least-one-line', 'Please select at least one due fee line to proceed.', (feeHeads) =>
      (feeHeads ?? []).some((fh) => (fh.selectedDueFeeIds ?? []).length > 0)
    ),
});

// ─── Main Component ────────────────────────────────────────────────────────────

const ConcessionFeeHeadApprovalView: React.FC<IFeeHeadApprovalViewProps> = ({
  selectedItem,
  mode,
  onBack,
}) => {
  const isApprove = mode === 'Approve';

  const [approveConcession, { isLoading: isApproving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveConcessionRequestMutation,
  });

  const [cancelConcession, { isLoading: isCancelling }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelConcessionRequestMutation,
  });

  const requestId = selectedItem.studentConcessionTypeRequestId || selectedItem.id || '';

  const {
    data: approvalContext,
    isLoading: isFetchingFeeHeads,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionApprovalContextQuery,
    params: requestId,
    options: { skip: !requestId },
  }) as { data: any; isLoading: boolean; isFetching: boolean };

  const groups = useMemo(
    () => mapApprovalContextToGroups(approvalContext?.data ?? approvalContext),
    [approvalContext]
  );

  const isLoading = isFetchingFeeHeads || isFetching;

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
            const allocations = distributeConcessionAcrossDueFees(
              fh.selectedDueFeeIds,
              group.concessionAmount
            );

            return {
              feeHeadId: fh.feeHeadId,
              approvedConcessionAmount: group.concessionAmount,
              dueFeeAllocations: allocations,
            };
          });

          await approveConcession({
            studentConcessionTypeRequestId: requestId,
            body: { message: values.description, feeHeadApprovals },
          }).unwrap();
        } else {
          await cancelConcession(requestId).unwrap();
        }

        shikshaMitraToast.success({
          message: `Concession ${isApprove ? 'approved' : 'cancelled'} successfully.`,
        });
        onBack();
      } catch {
        // error handled by RTK Query middleware
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
    return sum + ((fh?.selectedDueFeeIds.length ?? 0) > 0 ? group.concessionAmount : 0);
  }, 0);

  const isSubmitting = isApproving || isCancelling;

  const handleApprovalActionClick = async () => {
    formik.setTouched({ description: true, feeHeads: true });
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      shikshaMitraToast.error({
        message: getValidationToastMessage(errors),
      });
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
            {isApprove ? 'Approve' : 'Cancel'} Concession
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {selectedItem.concessionTypeName}
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
        {/* ── Description Field ── */}
        <ShakingTextField error={!!formik.errors.description && formik.touched.description}>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label="Description / Reason*"
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
            Select due fee lines per fee head to {isApprove ? 'approve' : 'cancel'} the concession.
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
              onToggleDueFee={(dueFeeId) => toggleDueFee(group.feeHeadId, dueFeeId)}
              onToggleAll={() => toggleAllDueFees(group)}
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
            {isApprove ? 'Approve' : 'Cancel'}
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ConcessionFeeHeadApprovalView;
