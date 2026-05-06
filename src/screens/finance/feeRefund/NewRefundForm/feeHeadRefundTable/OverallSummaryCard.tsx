'use client';

import React, { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';

import type { RefundFormik, IFeeHeadPayment } from '../types';
import type { IFeeHeadRefundItem } from '../initialValuesAndValidation';

interface OverallSummaryCardProps {
  feeHeads: IFeeHeadPayment[];
  formik: RefundFormik;
}

interface ISummaryTotals {
  totalPaid: number;
  totalRefunded: number;
  totalRefundable: number;
  totalRefundInput: number;
  totalSelectedMonths: number;
}

const OverallSummaryCard: React.FC<OverallSummaryCardProps> = ({
  feeHeads,
  formik,
}): React.ReactElement => {
  const theme = useTheme();

  /**
   * Memoization Justification:
   * - Aggregates N fee heads × M months across the entire dataset
   * - formik.values.feeHeadRefunds changes on every user interaction;
   *   without memoization this runs on every parent render
   * - Prevents redundant iteration over all fee head payment records
   */
  const { totalPaid, totalRefunded, totalRefundable, totalRefundInput, totalSelectedMonths } =
    useMemo((): ISummaryTotals => {
      let tPaid = 0;
      let tRefunded = 0;
      let tRefundable = 0;
      let tInput = 0;
      let tMonths = 0;
      const refunds = formik.values.feeHeadRefunds as IFeeHeadRefundItem[];
      feeHeads.forEach((fh) => {
        const fhEntry = refunds.find((r) => r.feeHeadId === fh.feeHeadId);
        const selectedMonthNames = (fhEntry?.months ?? []).map((m) => m.month);
        fh.items
          .filter((m) => m.paid > 0)
          .forEach((m) => {
            const refundable = Math.max(0, m.paid - m.refunded);
            tPaid += m.paid;
            tRefunded += m.refunded;
            tRefundable += refundable;
            if (selectedMonthNames.includes(m.month)) {
              tMonths += 1;
              const entry = fhEntry?.months.find((x) => x.month === m.month);
              tInput += Number(entry?.amount) || 0;
            }
          });
      });
      return {
        totalPaid: tPaid,
        totalRefunded: tRefunded,
        totalRefundable: tRefundable,
        totalRefundInput: tInput,
        totalSelectedMonths: tMonths,
      };
    }, [feeHeads, formik.values.feeHeadRefunds]);

  const summaryItems = [
    { label: 'Total Paid', value: totalPaid, color: 'text.primary', highlight: false },
    { label: 'Already Refunded', value: totalRefunded, color: 'error.main', highlight: false },
    { label: 'Max Refundable', value: totalRefundable, color: 'success.main', highlight: false },
    { label: 'Refund Requested', value: totalRefundInput, color: 'primary.main', highlight: true },
  ] as const;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
          Overall Summary
        </Typography>
        {totalSelectedMonths > 0 && (
          <Chip
            size="small"
            label={`${totalSelectedMonths} month${totalSelectedMonths !== 1 ? 's' : ''} selected`}
            color="primary"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />
        )}
      </Box>
      <Stack direction="row" spacing={4} flexWrap="wrap">
        {summaryItems.map((s) => (
          <Box key={s.label}>
            <Typography variant="caption" color="text.secondary">
              {s.label}
            </Typography>
            <Typography
              variant="body1"
              fontWeight={s.highlight ? 800 : 600}
              color={s.color}
              sx={s.highlight ? { fontSize: '1.1rem' } : undefined}
            >
              {formatCurrency(s.value)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
};

export default OverallSummaryCard;
