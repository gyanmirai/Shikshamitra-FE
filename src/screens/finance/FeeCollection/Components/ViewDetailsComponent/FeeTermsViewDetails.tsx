import type { FeeHeadSummary, FeeChargeDetail } from 'src/redux/feeCollection/feeCollection';

import { motion } from 'framer-motion';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Label, type LabelColor } from 'src/components/label';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
  feeInstallmentStatusLabel,
  chargeCollectionStatusLabel,
} from 'src/enums/fee-collection-type';
import {
  Box,
  Card,
  Paper,
  Table,
  Stack,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  TableContainer,
} from '@mui/material';

interface ConsolidatedFeeDetailsProps {
  feeHeads?: FeeHeadSummary[];
  charges?: FeeChargeDetail[];
}

export const ConsolidatedFeeDetails = ({
  feeHeads = [],
  charges = [],
}: ConsolidatedFeeDetailsProps) => {
  const theme = useTheme();

  const feeHeadList = (feeHeads ?? []).map((h) => ({
    name: h.feeHeadName,
    total: h.amount,
    paid: h.paidAmount,
    pending: h.pendingAmount ?? h.amount - h.paidAmount,
    status: h.status,
  }));

  const chargeList = (charges ?? []).map((c) => ({
    name: c.name,
    total: c.amount,
    paid: c.paidAmount,
    pending: c.pendingAmount,
    status: c.status,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          p: 0,
          borderRadius: 1.5,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.grey[500], 0.02),
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Fee Breakdown
          </Typography>
        </Box>

        <Scrollbar
          sx={{
            flexGrow: 1,
            maxHeight: 350,
            p: 2,
          }}
        >
          <Stack spacing={3}>
            {/* FEE HEADS TABLE */}
            <Box>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Fee Head
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Total
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Paid
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Pending
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {feeHeadList.map((head, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {head.name}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {formatNumber(head.total, 'INR')}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {formatNumber(head.paid, 'INR')}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {formatNumber(head.pending, 'INR')}
                        </TableCell>
                        <TableCell align="center">
                          <Label
                            variant="soft"
                            color={FeeCollectionStatusTypeColors[head.status] as LabelColor}
                            sx={{ fontSize: 10, height: 18 }}
                          >
                             {feeInstallmentStatusLabel(head.status)}
                          </Label>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ADDITIONAL CHARGES TABLE */}
            {chargeList.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary' }}
                >
                  Additional Charges
                </Typography>

                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Charge Name
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Total
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Paid
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Pending
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {chargeList.map((charge, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {charge.name}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {formatNumber(charge.total, 'INR')}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: 'text.secondary', fontWeight: 600 }}
                          >
                            {formatNumber(charge.paid, 'INR')}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>
                            {formatNumber(charge.pending, 'INR')}
                          </TableCell>
                          <TableCell align="center">
                            <Label
                              variant="soft"
                              color={FeeCollectionStatusTypeColors[charge?.status] as LabelColor}
                              sx={{ fontSize: 10, height: 18 }}
                            >
                               {chargeCollectionStatusLabel(charge.status)}
                            </Label>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Stack>
        </Scrollbar>
      </Card>
    </motion.div>
  );
};
