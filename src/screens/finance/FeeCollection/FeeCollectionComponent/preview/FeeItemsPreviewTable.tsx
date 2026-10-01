import dayjs from 'dayjs';
import { useMemo } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import {
  Box,
  Card,
  Table,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

import { roundUpToRupee } from './paymentAllocationUtils';
import type { IFeeCharge, SelectedItem } from '../../Components/type';

interface Props {
  selectedItems: SelectedItem[];
  chargesData: IFeeCharge[];
  selectedChargeIds: string[];
  feeHeadMap: Record<string, string>;
}

const cellSx = {
  py: 0.75,
  px: 1,
  borderBottom: '1px solid',
  borderColor: 'divider',
  fontSize: '0.8rem',
};

const FeeItemsPreviewTable = ({
  selectedItems,
  chargesData,
  selectedChargeIds,
  feeHeadMap,
}: Props) => {
  const itemsTotal = useMemo(
    () => selectedItems.reduce((s, i) => s + roundUpToRupee(i.dueAmount), 0),
    [selectedItems]
  );

  const selectedCharges = useMemo(
    () => chargesData.filter((c) => selectedChargeIds.includes(c.chargeId)),
    [chargesData, selectedChargeIds]
  );

  const chargesTotal = useMemo(
    () => selectedCharges.reduce((s, c) => s + c.amount, 0),
    [selectedCharges]
  );

  const finalTotal = itemsTotal + chargesTotal;

  return (
    <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
      {/* Fee Breakdown */}
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Fee Breakdown
      </Typography>
      <Divider sx={{ mb: 1 }} />

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Paid</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700, color: 'success.main' }}>
                Paying Now
              </TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700, color: 'warning.main' }}>
                Remaining
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedItems.map((item, idx) => {
              const feeHeadName = feeHeadMap[item.feeHeadId] ?? item.feeHeadId;
              const periodLabel = dayjs(`${item.period}-01`).format('MMM YYYY');
              const roundedAmount = roundUpToRupee(item.dueAmount);
              return (
                <TableRow key={`${item.feeHeadId}-${item.period}-${idx}`} hover>
                  <TableCell sx={cellSx}>
                    <Typography variant="body2" fontWeight={500}>
                      {feeHeadName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {periodLabel}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>₹{formatNumber(roundedAmount)}</TableCell>
                  <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>₹0</TableCell>
                  <TableCell sx={{ ...cellSx, color: 'success.main', fontWeight: 600 }}>
                    ₹{formatNumber(roundedAmount)}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, color: 'warning.main' }}>₹0</TableCell>
                </TableRow>
              );
            })}

            {/* Subtotal row */}
            <TableRow>
              <TableCell sx={{ ...cellSx, fontWeight: 700, bgcolor: 'grey.50' }} colSpan={3}>
                Subtotal
              </TableCell>
              <TableCell
                sx={{ ...cellSx, fontWeight: 700, color: 'primary.main', bgcolor: 'grey.50' }}
              >
                ₹{formatNumber(itemsTotal)}
              </TableCell>
              <TableCell sx={{ ...cellSx, bgcolor: 'grey.50' }} />
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Charges */}
      {selectedCharges.length > 0 && (
        <Box mt={1.5}>
          <Typography variant="subtitle2" fontWeight={700} mb={1} color="error.main">
            Additional Charges
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {selectedCharges.map((charge) => (
            <Box
              key={charge.chargeId}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={0.5}
              px={0.5}
              sx={{
                borderRadius: 1,
                bgcolor: 'error.lighter',
                mb: 0.5,
                border: '1px solid',
                borderColor: 'error.light',
              }}
            >
              <Typography variant="body2" color="error.main" fontWeight={500}>
                {charge.chargeName}
              </Typography>
              <Typography variant="body2" color="error.main" fontWeight={700}>
                ₹{formatNumber(charge.amount)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Final Total */}
      <Divider sx={{ mt: 1.5, mb: 1 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={700}>
          Total Payable
        </Typography>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          ₹{formatNumber(finalTotal)}
        </Typography>
      </Box>
    </Card>
  );
};

export default FeeItemsPreviewTable;
