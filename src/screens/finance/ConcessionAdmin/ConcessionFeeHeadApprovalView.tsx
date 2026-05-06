'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Cancel, ArrowBack, CheckCircle } from '@mui/icons-material';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';
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
  useGetConcessionRequestFeeHeadsQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type {
  IConcessionMonthItem,
  IFeeHeadApprovalViewProps,
  IConcessionFeeHeadWiseGroup,
} from './type';

// ─── Form Types ────────────────────────────────────────────────────────────────

interface ConcessionFeeHeadFormEntry {
  feeHeadId: string;
  months: string[];
}

interface ConcessionApprovalFormValues {
  feeHeads: ConcessionFeeHeadFormEntry[];
  description: string;
}

// ─── Distribution Utility ─────────────────────────────────────────────────────

/**
 * Distributes a fee head's total concession amount equally across the currently
 * selected months. When a month is deselected its share is automatically spread
 * over the remaining selected months.
 *
 * @param totalConcession  - Total concession amount for the fee head
 * @param selectedMonthCount - Number of currently selected months
 * @returns Per-month concession amount (0 when no months are selected)
 */
const distributeMonthConcession = (totalConcession: number, selectedMonthCount: number): number => {
  if (selectedMonthCount === 0) return 0;
  return totalConcession / selectedMonthCount;
};

// ─── Dummy / fallback data ─────────────────────────────────────────────────────

const DUMMY_FEE_HEAD_WISE: IConcessionFeeHeadWiseGroup[] = [
  {
    feeHeadId: 'fh-1',
    feeHeadName: 'Tuition Fee',
    months: 3,
    totalDue: 9000,
    concessionAmount: 1500,
    isConcessionApply: true,
    items: [
      {
        month: 'April',
        total: 3000,
        paid: 0,
        due: 3000,
        concessionAmount: 0,
        status: FeeCollectionStatusType.Pending,
      },
      {
        month: 'May',
        total: 3000,
        paid: 0,
        due: 3000,
        concessionAmount: 0,
        status: FeeCollectionStatusType.Pending,
      },
      {
        month: 'June',
        total: 3000,
        paid: 1000,
        due: 2000,
        concessionAmount: 0,
        status: FeeCollectionStatusType.Partial,
      },
    ],
  },
  {
    feeHeadId: 'fh-2',
    feeHeadName: 'Hostel Fee',
    months: 2,
    totalDue: 6000,
    concessionAmount: 1500,
    isConcessionApply: true,
    items: [
      {
        month: 'April',
        total: 3000,
        paid: 0,
        due: 3000,
        concessionAmount: 0,
        status: FeeCollectionStatusType.Pending,
      },
      {
        month: 'May',
        total: 3000,
        paid: 0,
        due: 3000,
        concessionAmount: 0,
        status: FeeCollectionStatusType.Pending,
      },
    ],
  },
];

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
          {item.month}
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
  selectedMonths: string[];
  isOpen: boolean;
  onCheckboxToggle: () => void;
  onExpandToggle: () => void;
}

const FeeHeadGroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  selectedMonths,
  isOpen,
  onCheckboxToggle,
  onExpandToggle,
}) => {
  const theme = useTheme();
  const selectableItems = group.isConcessionApply ? group.items : [];
  const selectedCount = selectableItems.filter((i) => selectedMonths.includes(i.month)).length;
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
  selectedMonths: string[];
  onToggleMonth: (month: string) => void;
  onToggleAll: () => void;
}

const FeeHeadGroup: React.FC<FeeHeadGroupProps> = ({
  group,
  selectedMonths,
  onToggleMonth,
  onToggleAll,
}) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const distributedConcession = distributeMonthConcession(
    group.concessionAmount,
    selectedMonths.length
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
        selectedMonths={selectedMonths}
        isOpen={open}
        onCheckboxToggle={onToggleAll}
        onExpandToggle={() => setOpen((o) => !o)}
      />

      <Collapse in={open}>
        <Divider />
        <ConcessionColHeader />
        {group.items.map((item, idx) => {
          const isSelected = selectedMonths.includes(item.month);
          const isDisabled = !group.isConcessionApply;
          return (
            <React.Fragment key={item.month}>
              <ConcessionFeeRow
                item={item}
                isSelected={isSelected}
                isDisabled={isDisabled}
                distributedConcession={distributedConcession}
                onToggle={() => onToggleMonth(item.month)}
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
                Selected months: <strong>{selectedMonths.length}</strong>
              </Typography>
              <Typography variant="caption" color="success.dark" fontWeight={700}>
                Total Concession: ₹
                {formatNumber(selectedMonths.length > 0 ? group.concessionAmount : 0)}
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
  description: Yup.string().trim().required('Description / reason is required'),
  feeHeads: Yup.array()
    .of(
      Yup.object({
        feeHeadId: Yup.string().required(),
        months: Yup.array().of(Yup.string().required()).required(),
      })
    )
    .test('at-least-one-month', 'Please select at least one month to proceed.', (feeHeads) =>
      (feeHeads ?? []).some((fh) => (fh.months ?? []).length > 0)
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

  const {
    data: feeHeadData,
    isLoading: isFetchingFeeHeads,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestFeeHeadsQuery,
    params: selectedItem.studentConcessionTypeRequestId,
    options: { skip: !selectedItem.studentConcessionTypeRequestId },
  }) as { data: any; isLoading: boolean; isFetching: boolean };

  const groups: IConcessionFeeHeadWiseGroup[] = feeHeadData?.feeHeadWise?.length
    ? feeHeadData.feeHeadWise
    : DUMMY_FEE_HEAD_WISE;

  const isLoading = isFetchingFeeHeads || isFetching;

  // ── Formik ────────────────────────────────────────────────────────────────────

  const formik = useFormik<ConcessionApprovalFormValues>({
    initialValues: {
      feeHeads: [],
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const selectedFeeHeads = values.feeHeads.filter((fh) => fh.months.length > 0);

      try {
        await Promise.all(
          selectedFeeHeads.map((fh) => {
            const group = groups.find((g) => g.feeHeadId === fh.feeHeadId)!;
            const concessionAmountPerMonth = distributeMonthConcession(
              group.concessionAmount,
              fh.months.length
            );
            const body = {
              message: values.description,
              months: fh.months,
              feeHeadId: fh.feeHeadId,
              concessionAmountPerMonth,
              totalConcessionAmount: group.concessionAmount,
            };

            return isApprove
              ? approveConcession({
                  studentConcessionTypeRequestId: selectedItem.studentConcessionTypeRequestId,
                  body,
                }).unwrap()
              : cancelConcession({
                  studentConcessionTypeRequestId: selectedItem.studentConcessionTypeRequestId,
                  body,
                }).unwrap();
          })
        );

        shikshaMitraToast.success({
          message: `Concession ${isApprove ? 'approved' : 'cancelled'} successfully for ${selectedFeeHeads.length} fee head(s).`,
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
        months: group.isConcessionApply ? group.items.map((i) => i.month) : [],
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeHeadData]);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getSelectedMonths = (feeHeadId: string): string[] =>
    formik.values.feeHeads.find((fh) => fh.feeHeadId === feeHeadId)?.months ?? [];

  const toggleMonth = (feeHeadId: string, month: string) => {
    const idx = formik.values.feeHeads.findIndex((fh) => fh.feeHeadId === feeHeadId);
    if (idx === -1) return;
    const curr = formik.values.feeHeads[idx].months;
    const next = curr.includes(month) ? curr.filter((m) => m !== month) : [...curr, month];
    formik.setFieldValue(`feeHeads[${idx}].months`, next);
  };

  const toggleAllMonths = (group: IConcessionFeeHeadWiseGroup) => {
    const idx = formik.values.feeHeads.findIndex((fh) => fh.feeHeadId === group.feeHeadId);
    if (idx === -1) return;
    const curr = formik.values.feeHeads[idx].months;
    const allMonths = group.items.map((i) => i.month);
    const isAllSelected = allMonths.every((m) => curr.includes(m));
    formik.setFieldValue(`feeHeads[${idx}].months`, isAllSelected ? [] : allMonths);
  };

  // ── Derived totals ────────────────────────────────────────────────────────────

  const totalSelectedMonths = formik.values.feeHeads.reduce((sum, fh) => sum + fh.months.length, 0);

  const totalSelectedConcession = groups.reduce((sum, group) => {
    const fh = formik.values.feeHeads.find((f) => f.feeHeadId === group.feeHeadId);
    return sum + ((fh?.months.length ?? 0) > 0 ? group.concessionAmount : 0);
  }, 0);

  const isSubmitting = isApproving || isCancelling;

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
        {totalSelectedMonths > 0 && (
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
              {totalSelectedMonths} month{totalSelectedMonths !== 1 ? 's' : ''} · ₹
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
            label={`${isApprove ? 'Approval' : 'Cancellation'} Reason / Description *`}
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
            Select months per fee head to {isApprove ? 'approve' : 'cancel'} the concession. Fee
            heads marked <strong>Not Applicable</strong> cannot be selected.
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
              selectedMonths={getSelectedMonths(group.feeHeadId)}
              onToggleMonth={(month) => toggleMonth(group.feeHeadId, month)}
              onToggleAll={() => toggleAllMonths(group)}
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
              ₹{formatNumber(totalSelectedConcession)} concession selected
            </Typography>
          )}
          <LoadingButton
            loading={isSubmitting}
            variant="contained"
            size="small"
            color={isApprove ? 'success' : 'warning'}
            startIcon={isApprove ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
            onClick={() => formik.handleSubmit()}
          >
            {isApprove ? 'Approve' : 'Cancel'}
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ConcessionFeeHeadApprovalView;
