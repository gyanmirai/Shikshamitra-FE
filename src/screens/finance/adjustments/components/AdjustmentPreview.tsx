import { formatCurrency } from 'src/utils/cureencyFormater';
import {
  Box,
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type {
  AdjustmentApplySummary,
  AdjustmentApplicationLineInput,
} from '../types/adjustmentApply.types';

interface AdjustmentPreviewProps {
  adjustment: AdjustmentRequest;
  summary: AdjustmentApplySummary;
  lines: AdjustmentApplicationLineInput[];
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

const AdjustmentPreview = ({ adjustment, summary, lines }: AdjustmentPreviewProps) => {
  const previewCards = [
    { label: 'Total Pending Fees', value: formatCurrency(summary.totalPendingFees) },
    { label: 'Adjustment Applied', value: formatCurrency(summary.totalAppliedAmount) },
    {
      label: 'Remaining Pending',
      value: formatCurrency(Math.max(summary.totalPendingFees - summary.totalAppliedAmount, 0)),
    },
  ];

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
          Student Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {adjustment.studentName} · GR No: {adjustment.studentGrNo ?? 'N/A'} ·{' '}
          {adjustment.className ?? 'N/A'}
          {adjustment.divisionName ? ` / ${adjustment.divisionName}` : ''}
        </Typography>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
          Adjustment Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {adjustment.adjustmentType} · {formatCurrency(adjustment.adjustmentAmount)}
        </Typography>
      </Card>

      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Applied Installments Preview
      </Typography>
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <HeadCell>Installment</HeadCell>
              <HeadCell align="right">Original Pending</HeadCell>
              <HeadCell align="right">Applied</HeadCell>
              <HeadCell align="right">Final Pending</HeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.installmentId}>
                <TableCell sx={{ px: 1.5, py: 1.25 }}>{line.installmentLabel}</TableCell>
                <TableCell align="right" sx={{ px: 1.5, py: 1.25 }}>
                  {formatCurrency(line.originalPendingAmount)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ px: 1.5, py: 1.25, color: 'success.main', fontWeight: 700 }}
                >
                  {formatCurrency(line.appliedAmount)}
                </TableCell>
                <TableCell align="right" sx={{ px: 1.5, py: 1.25 }}>
                  {formatCurrency(line.finalPendingAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }} gap={1.5}>
        {previewCards.map((item) => (
          <Card key={item.label} variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
            >
              {item.label}
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
              {item.value}
            </Typography>
          </Card>
        ))}
      </Box>
    </>
  );
};

export default AdjustmentPreview;
