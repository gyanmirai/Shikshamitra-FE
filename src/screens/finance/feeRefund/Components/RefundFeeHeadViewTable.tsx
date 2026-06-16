import type { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { FeeCollectionStatusTypeColors } from 'src/enums/fee-collection-type';
import { Box, Chip, Divider, Collapse, IconButton, Typography } from '@mui/material';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface IRefundMonthItem {
  month: string;
  total: number;
  paid: number;
  refundAmount: number;
  status: FeeCollectionStatusType;
}

export interface IRefundFeeHeadItem {
  feeHeadId: string;
  feeHeadName: string;
  totalPaid: number;
  totalRefunded: number;
  items: IRefundMonthItem[];
}

interface Props {
  data: IRefundFeeHeadItem[];
}

// ─── Column Header ─────────────────────────────────────────────────────────────

const ColHeader = () => (
  <Box
    display="flex"
    alignItems="center"
    px={2}
    py={1}
    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Typography
      variant="caption"
      color="text.disabled"
      fontWeight={700}
      textTransform="uppercase"
      sx={{ letterSpacing: '0.7px', fontSize: '10px', flex: 1 }}
    >
      Month
    </Typography>

    {(['TOTAL', 'PAID', 'REFUND AMOUNT'] as const).map((col) => (
      <Typography
        key={col}
        variant="caption"
        color="text.disabled"
        fontWeight={700}
        textTransform="uppercase"
        sx={{
          letterSpacing: '0.7px',
          fontSize: '10px',
          width: 110,
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
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

// ─── Month Row ─────────────────────────────────────────────────────────────────

const MonthRow = ({ item }: { item: IRefundMonthItem }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      px: 2,
      py: 1,
    }}
  >
    <Typography variant="body2" fontWeight={500} flex={1} noWrap>
      {item.month}
    </Typography>

    <Typography
      variant="body2"
      sx={{ width: 110, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
    >
      {' '}
      {formatCurrency(item.total)}
    </Typography>

    <Typography
      variant="body2"
      sx={{ width: 110, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
    >
      {' '}
      {formatCurrency(item.paid)}
    </Typography>

    <Typography
      variant="body2"
      sx={{ width: 110, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
    >
      {' '}
      {formatCurrency(item.refundAmount)}
    </Typography>

    <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
      <Label color={FeeCollectionStatusTypeColors[item.status]} variant="soft">
        {item.status === 2
          ? 'Paid'
          : item.status === 1
            ? 'Partial'
            : item.status === 0
              ? 'Pending'
              : 'Overdue'}
      </Label>
    </Box>
  </Box>
);

// ─── Fee Head Group ─────────────────────────────────────────────────────────────

const FeeHeadViewGroup = ({ feeHead }: { feeHead: IRefundFeeHeadItem }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: 1.5,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
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
          cursor: 'pointer',
          userSelect: 'none',
          bgcolor: 'background.neutral',
        }}
        onClick={() => setOpen((o) => !o)}
      >
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

        <Typography variant="subtitle2" fontWeight={700} flex={1}>
          {feeHead.feeHeadName}
        </Typography>

        <Chip
          size="small"
          label={`Paid : ${formatCurrency(feeHead.totalPaid)}`}
          variant="outlined"
          color="default"
          sx={{ fontSize: 11 }}
        />

        {feeHead.totalRefunded > 0 && (
          <Chip
            size="small"
            label={`Refunded : ${formatCurrency(feeHead.totalRefunded)}`}
            variant="filled"
            color="primary"
            sx={{ fontSize: 11 }}
          />
        )}
      </Box>

      {/* Rows */}
      <Collapse in={open}>
        <Divider />
        <ColHeader />

        {feeHead.items.map((item, idx) => (
          <React.Fragment key={item.month}>
            <MonthRow item={item} />
            {idx < feeHead.items.length - 1 && <Divider sx={{ mx: 1.5, opacity: 0.4 }} />}
          </React.Fragment>
        ))}

        {/* Footer summary */}
        <Divider />
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={3}
          px={2}
          py={0.75}
          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
        >
          <Typography variant="caption" color="text.secondary">
            Total Paid :{' '}
            <strong
              style={{
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(feeHead.totalPaid)}
            </strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Refunded :{' '}
            <strong
              style={{
                color:
                  feeHead.totalRefunded > 0
                    ? theme.palette.primary.main
                    : theme.palette.text.disabled,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(feeHead.totalRefunded)}
            </strong>
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

const RefundFeeHeadViewTable: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const grandTotalPaid = data.reduce((s, fh) => s + fh.totalPaid, 0);
  const grandTotalRefunded = data.reduce((s, fh) => s + fh.totalRefunded, 0);

  if (!data || data.length === 0) {
    return (
      <Box py={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No fee head refund data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Overall summary */}
      <Box
        display="flex"
        gap={2}
        mb={1.5}
        p={1.5}
        sx={{
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Fee Heads : <strong>{data.length}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Paid :{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(grandTotalPaid)}
          </strong>
        </Typography>
        <Typography variant="body2" color="primary.main" fontWeight={700}>
          Total Refunded :{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(grandTotalRefunded)}
          </strong>
        </Typography>
      </Box>

      {data.map((feeHead) => (
        <FeeHeadViewGroup key={feeHead.feeHeadId} feeHead={feeHead} />
      ))}
    </Box>
  );
};

export default RefundFeeHeadViewTable;
export type { Props as RefundFeeHeadViewTableProps };
