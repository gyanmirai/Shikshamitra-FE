import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Divider, Collapse, IconButton, Typography } from '@mui/material';
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

// ─── Column Header ────────────────────────────────────────────────────────────

const ColHeader = ({ firstColumnLabel = 'Fee Head' }: { firstColumnLabel?: string }) => (
  <Box
    display="flex"
    alignItems="center"
    px={2}
    py={0.75}
    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Typography
      variant="caption"
      color="text.disabled"
      fontWeight={700}
      textTransform="uppercase"
      sx={{ letterSpacing: '0.7px', fontSize: '10px', flex: 1 }}
    >
      {firstColumnLabel}
    </Typography>

    {(['ORIGINAL', 'PAID', 'REMAINING'] as const).map((col) => (
      <Typography
        key={col}
        variant="caption"
        color="text.disabled"
        fontWeight={700}
        textTransform="uppercase"
        sx={{ letterSpacing: '0.7px', fontSize: '10px', width: 86, textAlign: 'right' }}
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
        sx={{ letterSpacing: '0.7px', fontSize: '10px' }}
      >
        STATUS
      </Typography>
    </Box>
  </Box>
);

// ─── Fee Row ──────────────────────────────────────────────────────────────────

const FeeItemRow = ({ row }: { row: AllocatedFeeRow }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.25,
        transition: 'background-color 150ms ease',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
      }}
    >
      {/* Fee head name */}
      <Box flex={1} minWidth={0} pr={1}>
        <Typography variant="body2">{row.feeHeadName}</Typography>
      </Box>

      {/* ORIGINAL */}
      <Typography
        variant="body2"
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        ₹{formatNumber(row.originalAmount)}
      </Typography>

      {/* PAID */}
      <Typography
        variant="body2"
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        ₹{formatNumber(row.paidAmount)}
      </Typography>

      {/* REMAINING */}
      <Typography
        variant="body2"
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        ₹{formatNumber(row.remainingAmount)}
      </Typography>

      {/* STATUS */}
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
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.25,
        minHeight: 56,
        transition: 'background-color 150ms ease',
        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.04) },
      }}
    >
      <Box flex={1} minWidth={0} pr={1}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify
            icon="solar:danger-circle-bold"
            width={13}
            sx={{ color: 'error.main', flexShrink: 0 }}
          />
          <Typography variant="body2" fontWeight={600} noWrap color="error.main">
            {row.chargeName}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          color="text.disabled"
          fontWeight={500}
          sx={{ mt: 0.25, display: 'block' }}
        >
          Additional charge
        </Typography>
      </Box>

      <Typography
        variant="body2"
        fontWeight={500}
        color="text.secondary"
        sx={{ width: 86, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
      >
        ₹{formatNumber(row.originalAmount)}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{ width: 86, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
      >
        ₹{formatNumber(row.paidAmount)}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{ width: 86, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
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

// ─── Month Group ──────────────────────────────────────────────────────────────

const MonthGroupBlock = ({ group }: { group: MonthAllocationGroup }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 1.5,
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.06)}`,
        },
      }}
    >
      {/* ── Accordion Header ── */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        px={2}
        py={1.25}
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 150ms ease',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.07) },
        }}
        onClick={() => setOpen((o) => !o)}
      >
        {/* Left: period + count */}
        <Box flex={1} minWidth={0}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {group.period}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {group.rows.length} {group.rows.length === 1 ? 'fee head' : 'fee heads'}
          </Typography>
        </Box>

        {/* Right: totals */}
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box textAlign="right">
            <Typography variant="caption" color="text.disabled">
              PAID
            </Typography>
            <Typography
              variant="body2"
              sx={{
                width: 110,
                textAlign: 'right',
                flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {' '}
              ₹{formatNumber(group.totalPaid)}
            </Typography>
          </Box>

          {group.totalRemaining > 0 && (
            <Box textAlign="right">
              <Typography variant="caption" color="text.disabled">
                DUE
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  width: 110,
                  textAlign: 'right',
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {' '}
                ₹{formatNumber(group.totalRemaining)}
              </Typography>
            </Box>
          )}

          <IconButton
            size="small"
            sx={{
              color: 'text.secondary',
              transition: 'transform 200ms ease',
              transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
          >
            <Iconify icon="eva:chevron-down-fill" width={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* ── Collapsible Rows ── */}
      <Collapse in={open}>
        <ColHeader />
        {group.rows.map((row, idx) => (
          <Box key={row.key}>
            <FeeItemRow row={row} />
            {idx < group.rows.length - 1 && <Divider sx={{ mx: 2, opacity: 0.4 }} />}
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
        border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 1.5,
        transition: 'box-shadow 200ms ease',
        '&:hover': {
          boxShadow: `0 2px 12px ${alpha(theme.palette.error.main, 0.08)}`,
        },
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        px={2}
        py={1.25}
        sx={{
          bgcolor: alpha(theme.palette.error.main, 0.05),
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 150ms ease',
          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="solar:danger-circle-bold" width={16} sx={{ color: 'error.main' }} />
            <Typography variant="subtitle2" fontWeight={700} color="error.main">
              Additional Charges
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {rows.length} {rows.length === 1 ? 'charge' : 'charges'}
          </Typography>
        </Box>
      </Box>

      <Collapse in={open}>
        <ColHeader firstColumnLabel="Charge Name" />
        {rows.map((row, idx) => (
          <Box key={row.key}>
            <ChargeItemRow row={row} />
            {idx < rows.length - 1 && <Divider sx={{ mx: 2, opacity: 0.4 }} />}
          </Box>
        ))}
      </Collapse>
    </Box>
  );
};

// ─── Grand Totals ─────────────────────────────────────────────────────────────

const GrandTotalsFooter = ({ rows }: { rows: AllocatedRow[] }) => {
  const totalOriginal = rows.reduce((s, r) => s + r.originalAmount, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0);
  const totalRemaining = rows.reduce((s, r) => s + r.remainingAmount, 0);

  const stats: Array<{ label: string; value: number; icon: string }> = [
    { label: 'Total Original', value: totalOriginal, icon: 'solar:bill-list-bold' },
    { label: 'Total Paid', value: totalPaid, icon: 'solar:check-circle-bold' },
    { label: 'Total Remaining', value: totalRemaining, icon: 'solar:clock-circle-bold' },
  ];

  return (
    <Box
      sx={{
        mt: 1,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        border: '1px solid',
        borderColor: 'divider',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
      }}
    >
      {stats.map(({ label, value, icon }, idx) => (
        <Box
          key={label}
          sx={{
            textAlign: 'center',
            px: 1,
            py: 1,
            borderRight: idx < stats.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} mb={0.5}>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '10px' }}
            >
              {label}
            </Typography>
          </Stack>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="text.primary"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              fontSize: '1.1rem',
            }}
          >
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
  const theme = useTheme();

  if (allocatedRows.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.text.disabled, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          <Iconify icon="solar:bill-cross-bold" width={28} sx={{ color: 'text.disabled' }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={0.5}>
          No allocation available
        </Typography>
        <Typography variant="body2" color="text.disabled">
          No items can be covered by the entered payment amount.
        </Typography>
      </Box>
    );
  }

  const feeRows = selectFeeRows(allocatedRows);
  const chargeRows = selectChargeRows(allocatedRows);
  const monthGroups = groupFeeRowsByMonth(feeRows);

  return (
    <Box>
      {/* ── Header ── */}
      <Typography variant="subtitle1" fontWeight={700} pb={1}>
        Payment Allocation Breakdown
      </Typography>
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
