'use client';

import type { CollectFeeOutput } from 'src/redux/feeCollection/feeCollection';

import NextLink from 'next/link';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import {
  Box,
  Chip,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

type FeeCollectionOutcomePanelProps = {
  collectResponse: CollectFeeOutput;
  onClose?: () => void;
};

export default function FeeCollectionOutcomePanel({
  collectResponse,
  onClose,
}: FeeCollectionOutcomePanelProps) {
  const summary = collectResponse.auditSummary;
  const lines = summary?.allocationLines ?? [];

  const auditTrailHref = collectResponse.correlationId
    ? `/finance/audit-trail?studentId=${collectResponse.studentId}&correlationId=${encodeURIComponent(collectResponse.correlationId)}`
    : `/finance/audit-trail?studentId=${collectResponse.studentId}`;

  return (
    <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Iconify icon="mdi:clipboard-check-outline" width={22} sx={{ color: 'success.main' }} />
        <Typography variant="subtitle1" fontWeight={700}>
          {summary?.headline ?? 'Payment recorded'}
        </Typography>
        {collectResponse.status === 2 && (
          <Chip label="Pending verification" size="small" color="warning" variant="soft" />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Total received: ₹
        {(summary?.totalAmount ?? collectResponse.receivedAmount).toLocaleString('en-IN')}
        {collectResponse.receiptNumber && ` · Receipt ${collectResponse.receiptNumber}`}
      </Typography>

      {lines.length > 0 && (
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fee head</TableCell>
              <TableCell>Period</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Pending after</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.dueFeeId}>
                <TableCell>{line.feeHeadName}</TableCell>
                <TableCell>{line.installmentLabel}</TableCell>
                <TableCell align="right">{formatNumber(line.amountPaid, 'INR')}</TableCell>
                <TableCell align="right">{formatNumber(line.pendingAfter, 'INR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          component={NextLink}
          href={auditTrailHref}
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:history" width={18} />}
        >
          View in audit trail
        </Button>
        {onClose && (
          <Button size="small" variant="text" onClick={onClose}>
            Close
          </Button>
        )}
      </Box>
    </Box>
  );
}
