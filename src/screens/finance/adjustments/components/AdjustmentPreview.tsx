import { formatCurrency } from 'src/utils/cureencyFormater';
import { Card, Table, TableRow, TableBody, TableCell, TableHead, Typography } from '@mui/material';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type { AdjustmentApplicationLineInput } from '../types/adjustmentApply.types';

interface AdjustmentPreviewProps {
  adjustment: AdjustmentRequest;
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

const AdjustmentPreview = ({ adjustment, lines }: AdjustmentPreviewProps) => (
  <>
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
  </>
);

export default AdjustmentPreview;
