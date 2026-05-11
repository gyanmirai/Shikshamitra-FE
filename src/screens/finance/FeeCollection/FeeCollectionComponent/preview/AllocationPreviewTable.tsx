import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Chip, Divider, Collapse, IconButton, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { selectFeeRows, selectChargeRows, groupFeeRowsByMonth } from './paymentAllocationUtils';

import type {
  AllocatedRow,
  AllocatedFeeRow,
  AllocatedChargeRow,
  MonthAllocationGroup,
} from './paymentAllocationUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<FeeCollectionStatusType, string> = {
  [FeeCollectionStatusType.Paid]: 'Fully Paid',
  [FeeCollectionStatusType.Partial]: 'Partially Paid',
  [FeeCollectionStatusType.Pending]: 'Pending',
  [FeeCollectionStatusType.Overdue]: 'Overdue',
};

const STATUS_ICON: Record<FeeCollectionStatusType, string> = {
  [FeeCollectionStatusType.Paid]: 'solar:check-circle-bold',
  [FeeCollectionStatusType.Partial]: 'solar:clock-circle-bold',
  [FeeCollectionStatusType.Pending]: 'solar:hourglass-bold',
  [FeeCollectionStatusType.Overdue]: 'solar:danger-triangle-bold',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ColHeader = () => (
  <Box display="flex" alignItems="center" px={1.5} py={0.5} sx={{ bgcolor: 'action.hover' }}>
    {/* Fee Head label column */}
    <Typography
      variant="caption"
      color="text.disabled"
      fontWeight={700}
      textTransform="uppercase"
      flex={1}
    >
      Fee Head
    </Typography>

    {(['ORIGINAL', 'PAID', 'REMAINING'] as const).map((col) => (
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

    <Box sx={{ width: 100, textAlign: 'center' }}>
      <Typography
        variant="caption"
        color="text.disabled"
        fontWeight={700}
        textTransform="uppercase"
      >
        STATUS
      </Typography>
    </Box>
  </Box>
);

// ─── Fee Row (read-only) ──────────────────────────────────────────────────────

const FeeItemRow = ({ row }: { row: AllocatedFeeRow }) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      px={1.5}
      py={0.75}
      sx={{
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
      }}
    >
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {row.feeHeadName}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ width: 80, textAlign: 'right' }}>
        ₹{formatNumber(row.originalAmount)}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        color="success.main"
        sx={{ width: 80, textAlign: 'right' }}
      >
        ₹{formatNumber(row.paidAmount)}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={row.remainingAmount > 0 ? 600 : 400}
        color={row.remainingAmount > 0 ? 'warning.main' : 'text.disabled'}
        sx={{ width: 80, textAlign: 'right' }}
      >
        ₹{formatNumber(row.remainingAmount)}
      </Typography>

      <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
        <Label color={FeeCollectionStatusTypeColors[row.status]} variant="soft">
          {FeeCollectionStatusType[row.status]}
        </Label>
      </Box>
    </Box>
  );
};

// ─── Charge Row ───────────────────────────────────────────────────────────────

const ChargeItemRow = ({ row }: { row: AllocatedChargeRow }) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      px={1.5}
      py={0.75}
      sx={{
        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.03) },
      }}
    >
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" fontWeight={500} color="error.main" noWrap>
          {row.chargeName}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ width: 80, textAlign: 'right' }}>
        ₹{formatNumber(row.originalAmount)}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        color="success.main"
        sx={{ width: 80, textAlign: 'right' }}
      >
        ₹{formatNumber(row.paidAmount)}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={row.remainingAmount > 0 ? 600 : 400}
        color={row.remainingAmount > 0 ? 'warning.main' : 'text.disabled'}
        sx={{ width: 80, textAlign: 'right' }}
      >
        ₹{formatNumber(row.remainingAmount)}
      </Typography>

      <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
        <Label
          color={FeeCollectionStatusTypeColors[row.status]}
          variant="filled"
          sx={{
            borderRadius: '6px',
            fontWeight: 600,
          }}
        >
          {FeeCollectionStatusType[row.status]}
        </Label>
      </Box>
    </Box>
  );
};

// ─── Month Group (collapsible, no checkbox) ───────────────────────────────────

const MonthGroupBlock = ({ group }: { group: MonthAllocationGroup }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const allPaid = group.rows.every((r) => r.status === FeeCollectionStatusType.Paid);
  const anyPartial = group.rows.some((r) => r.status === FeeCollectionStatusType.Partial);

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        mb: 1,
      }}
    >
      {/* ── Month Header ── */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        px={1.5}
        py={1}
        sx={{
          bgcolor: allPaid ? alpha(theme.palette.success.main, 0.06) : 'background.neutral',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {group.period}
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
            {group.rows.length} {group.rows.length === 1 ? 'item' : 'items'}
          </Typography>
        </Box>

        <Box flex={1} />

        {/* Month-level totals */}
        <Typography variant="caption" color="success.main" fontWeight={700} sx={{ mr: 0.5 }}>
          Paid : ₹{formatNumber(group.totalPaid)}
        </Typography>
        {group.totalRemaining > 0 && (
          <Typography variant="caption" color="warning.main" fontWeight={700} sx={{ mr: 0.5 }}>
            Due : ₹{formatNumber(group.totalRemaining)}
          </Typography>
        )}
        <Label color={FeeCollectionStatusTypeColors[group.status]} variant="soft">
          {FeeCollectionStatusType[group.status]}
        </Label>

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <Iconify icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={18} />
        </IconButton>
      </Box>

      {/* ── Rows ── */}
      <Collapse in={open}>
        <Divider />
        <ColHeader />
        {group.rows.map((row, idx) => (
          <Box key={row.key}>
            <FeeItemRow row={row} />
            {idx < group.rows.length - 1 && <Divider sx={{ mx: 1.5, opacity: 0.4 }} />}
          </Box>
        ))}
      </Collapse>
    </Box>
  );
};

// ─── Charges Section ──────────────────────────────────────────────────────────

const ChargesSection = ({ rows }: { rows: AllocatedChargeRow[] }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0);
  const totalRemaining = rows.reduce((s, r) => s + r.remainingAmount, 0);

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.error.light}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        mb: 1,
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        px={1.5}
        py={1}
        sx={{
          bgcolor: alpha(theme.palette.error.main, 0.05),
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Iconify icon="solar:danger-circle-bold" width={16} sx={{ color: 'error.main' }} />
        <Typography variant="subtitle2" fontWeight={700} color="error.main">
          Additional Charges
        </Typography>
        <Box
          sx={{
            px: 0.75,
            py: 0.2,
            borderRadius: 0.5,
            bgcolor: alpha(theme.palette.error.main, 0.08),
          }}
        >
          <Typography variant="caption" color="error.main">
            {rows.length} {rows.length === 1 ? 'charge' : 'charges'}
          </Typography>
        </Box>

        <Box flex={1} />

        <Typography variant="caption" color="success.main" fontWeight={700} sx={{ mr: 0.5 }}>
          Paid: ₹{formatNumber(totalPaid)}
        </Typography>
        {totalRemaining > 0 && (
          <Typography variant="caption" color="warning.main" fontWeight={700} sx={{ mr: 0.5 }}>
            Due: ₹{formatNumber(totalRemaining)}
          </Typography>
        )}

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <Iconify icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={18} />
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Divider sx={{ borderColor: 'error.light' }} />
        <ColHeader />
        {rows.map((row, idx) => (
          <Box key={row.key}>
            <ChargeItemRow row={row} />
            {idx < rows.length - 1 && <Divider sx={{ mx: 1.5, opacity: 0.4 }} />}
          </Box>
        ))}
      </Collapse>
    </Box>
  );
};

// ─── Grand Totals Footer ──────────────────────────────────────────────────────

const GrandTotalsFooter = ({ rows }: { rows: AllocatedRow[] }) => {
  const totalOriginal = rows.reduce((s, r) => s + r.originalAmount, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0);
  const totalRemaining = rows.reduce((s, r) => s + r.remainingAmount, 0);

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        mt: 0.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 3,
        flexWrap: 'wrap',
      }}
    >
      {[
        { label: 'Total Original', value: totalOriginal, color: 'text.primary' },
        { label: 'Total Paid', value: totalPaid, color: 'success.main' },
        { label: 'Total Remaining', value: totalRemaining, color: 'warning.main' },
      ].map(({ label, value, color }) => (
        <Box key={label} textAlign="right">
          <Typography variant="body2" color={color} display="block">
            {label}
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} color={color}>
            ₹{formatNumber(value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  allocatedRows: AllocatedRow[];
}

const AllocationPreviewTable = ({ allocatedRows }: Props) => {
  if (allocatedRows.length === 0) {
    return (
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
        <Iconify icon="solar:bill-cross-bold" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No items can be covered by the entered payment amount.
        </Typography>
      </Card>
    );
  }

  const feeRows = selectFeeRows(allocatedRows);
  const chargeRows = selectChargeRows(allocatedRows);
  const monthGroups = groupFeeRowsByMonth(feeRows);

  return (
    <Box>
      {/* ── Card Header ── */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="subtitle2" fontWeight={700}>
          Payment Allocation Breakdown
        </Typography>
        <Chip
          size="small"
          label={`${allocatedRows.length} item${allocatedRows.length !== 1 ? 's' : ''}`}
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Box>

      {/* ── Month Groups ── */}
      {monthGroups.map((group) => (
        <MonthGroupBlock key={group.period} group={group} />
      ))}

      {/* ── Charges ── */}
      {chargeRows.length > 0 && <ChargesSection rows={chargeRows} />}

      {/* ── Grand Totals ── */}
      <GrandTotalsFooter rows={allocatedRows} />
    </Box>
  );
};

export default AllocationPreviewTable;
