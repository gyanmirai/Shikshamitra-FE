import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Chip, Divider, Collapse, ButtonBase, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface IRefundMonthItem {
  month: string;
  total: number;
  paid: number;
  refundAmount: number;
  status: FeeCollectionStatusType;
}

export interface IRefundFeeHeadItem {
  feeHeadId: string | null;
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
      {formatNumber(item.total, 'INR')}
    </Typography>

    <Typography
      variant="body2"
      sx={{ width: 110, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
    >
      {' '}
      {formatNumber(item.paid, 'INR')}
    </Typography>

    <Typography
      variant="body2"
      sx={{ width: 110, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
    >
      {' '}
      {formatNumber(item.refundAmount, 'INR')}
    </Typography>

    <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
      <Label color={FeeCollectionStatusTypeColors[item.status]} variant="soft">
        {FeeCollectionStatusType[item.status] ?? item.status}
      </Label>
    </Box>
  </Box>
);

// ─── Fee Head Group ─────────────────────────────────────────────────────────────

const FeeHeadViewGroup = ({ feeHead }: { feeHead: IRefundFeeHeadItem }) => {
  const [open, setOpen] = useState(true);

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: 1.5,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        component={ButtonBase}
        aria-expanded={open}
        aria-label={`${feeHead.feeHeadName} refund details`}
        display="flex"
        alignItems="center"
        gap={1}
        px={1.5}
        py={1}
        sx={{
          cursor: 'pointer',
          userSelect: 'none',
          bgcolor: 'background.neutral',
          width: '100%',
          textAlign: 'left',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box
          sx={{
            color: 'text.secondary',
            transition: 'transform 200ms ease',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        >
          <Iconify icon="eva:chevron-down-fill" width={18} />
        </Box>

        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ flex: '1 1 160px', overflowWrap: 'anywhere' }}
        >
          {feeHead.feeHeadName}
        </Typography>

        <Chip
          size="small"
          label={`Paid : ${formatNumber(feeHead.totalPaid, 'INR')}`}
          variant="outlined"
          color="default"
          sx={{ fontSize: 11 }}
        />

        {feeHead.totalRefunded > 0 && (
          <Chip
            size="small"
            label={`Refunded : ${formatNumber(feeHead.totalRefunded, 'INR')}`}
            variant="outlined"
            color="default"
            sx={{ fontSize: 11 }}
          />
        )}
      </Box>

      {/* Rows */}
      <Collapse in={open}>
        <Divider />
        <Box
          role="region"
          aria-label={`${feeHead.feeHeadName} installments`}
          tabIndex={0}
          sx={{ overflowX: 'auto' }}
        >
          <Box sx={{ minWidth: 580 }}>
            <ColHeader />

            {feeHead.items.map((item, idx) => (
              <React.Fragment key={item.month}>
                <MonthRow item={item} />
                {idx < feeHead.items.length - 1 && <Divider sx={{ mx: 1.5, opacity: 0.4 }} />}
              </React.Fragment>
            ))}
          </Box>
        </Box>

        {/* Footer summary */}
        <Divider />
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={1}
          px={2}
          py={0.75}
          sx={{ bgcolor: 'background.neutral' }}
          flexWrap="wrap"
        >
          <Typography variant="caption" color="text.secondary">
            Total Paid :{' '}
            <strong
              style={{
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatNumber(feeHead.totalPaid, 'INR')}
            </strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Refunded :{' '}
            <strong
              style={{
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatNumber(feeHead.totalRefunded, 'INR')}
            </strong>
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

const RefundFeeHeadViewTable: React.FC<Props> = ({ data }) => {
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
        gap={1}
        mb={1.5}
        p={1.5}
        sx={{
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Fee Heads : <strong>{data.length}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Paid :{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatNumber(grandTotalPaid, 'INR')}
          </strong>
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          Total Refunded :{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatNumber(grandTotalRefunded, 'INR')}
          </strong>
        </Typography>
      </Box>

      {data.map((feeHead) => (
        <FeeHeadViewGroup key={feeHead.feeHeadId ?? feeHead.feeHeadName} feeHead={feeHead} />
      ))}
    </Box>
  );
};

export default RefundFeeHeadViewTable;
export type { Props as RefundFeeHeadViewTableProps };
