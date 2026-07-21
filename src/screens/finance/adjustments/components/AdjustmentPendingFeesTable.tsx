import { Iconify } from 'src/components/iconify';
import { formatCurrency } from 'src/utils/cureencyFormater';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Card,
  Table,
  TableRow,
  Checkbox,
  TableBody,
  TableHead,
  TableCell,
  Typography,
} from '@mui/material';

import type { AdjustmentApplyItem } from '../types/adjustmentApply.types';

interface AdjustmentPendingFeesTableProps {
  items: AdjustmentApplyItem[];
  onSelectRow: (installmentId: string, checked: boolean) => void;
  onChangeAmount: (installmentId: string, amount: number) => void;
}

const HeadCell = ({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) => (
  <TableCell
    align={align}
    sx={{
      py: 1,
      px: 1.5,
      fontWeight: 700,
      fontSize: '0.65rem',
      letterSpacing: '0.7px',
      textTransform: 'uppercase',
      color: 'text.disabled',
      bgcolor: 'background.neutral',
      borderBottom: '1px solid',
      borderColor: 'divider',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </TableCell>
);

const AdjustmentPendingFeesTable = ({
  items,
  onSelectRow,
  onChangeAmount,
}: AdjustmentPendingFeesTableProps) => (
  <Card
    sx={{ mb: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
  >
    <Table size="small">
      <TableHead>
        <TableRow>
          <HeadCell align="center">Select</HeadCell>
          <HeadCell>Installment / Month</HeadCell>
          <HeadCell>Fee Head</HeadCell>
          <HeadCell align="right">Total Fees</HeadCell>
          <HeadCell align="right">Paid Amount</HeadCell>
          <HeadCell align="right">Pending Fees</HeadCell>
          <HeadCell align="right">Adjustable Amount</HeadCell>
          <HeadCell align="right">Apply Adjustment</HeadCell>
          <HeadCell align="right">Final Pending</HeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.installmentId}
            sx={{
              '&:last-child td': { borderBottom: 0 },
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <TableCell align="center" sx={{ px: 1.5, py: 1 }}>
              <Checkbox
                size="small"
                checked={item.isSelected}
                onChange={(e) => onSelectRow(item.installmentId, e.target.checked)}
              />
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
              <Typography variant="body2" fontWeight={600}>
                {item.installmentLabel}
              </Typography>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify
                  icon="mdi:book-education-outline"
                  width={16}
                  sx={{ color: 'primary.main', flexShrink: 0 }}
                />
                <Typography variant="body2">{item.feeHeadName}</Typography>
              </Box>
            </TableCell>

            <TableCell align="right" sx={{ px: 1.5, py: 1.25 }}>
              <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(item.totalFees)}
              </Typography>
            </TableCell>

            <TableCell align="right" sx={{ px: 1.5, py: 1.25 }}>
              <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(item.paidAmount)}
              </Typography>
            </TableCell>

            <TableCell align="right" sx={{ px: 1.5, py: 1.25 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(item.pendingAmount)}
              </Typography>
            </TableCell>

            <TableCell align="right" sx={{ px: 1.5, py: 1.25 }}>
              <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(item.adjustableAmount)}
              </Typography>
            </TableCell>

            <TableCell align="right" sx={{ px: 1.5, py: 1.25, minWidth: 170 }}>
              <NumericFormatCustom
                size="small"
                value={item.appliedAmount || ''}
                placeholder="0"
                disabled={!item.isSelected}
                onChange={(e) => {
                  let val = e.target.value;
                  val = val.replace(/[₹,\s]/g, '');
                  if (!/^\d*$/.test(val)) return;

                  onChangeAmount(item.installmentId, Number(val || 0));
                }}
                sx={{ width: 130 }}
              />
            </TableCell>

            <TableCell align="right" sx={{ px: 1.5, py: 1.25 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(item.finalPendingAmount)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

export default AdjustmentPendingFeesTable;
