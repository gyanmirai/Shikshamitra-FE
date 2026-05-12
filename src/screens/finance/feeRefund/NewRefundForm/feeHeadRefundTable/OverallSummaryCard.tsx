'use client';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Chip, Stack, Typography } from '@mui/material';

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

  // ── Stat card definitions ──────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Paid',
      value: totalPaid,
      icon: 'solar:wallet-bold',
      accent: theme.palette.text.secondary,
      accentBg: alpha(theme.palette.text.secondary, 0.06),
      accentBorder: alpha(theme.palette.text.secondary, 0.12),
      sub: 'Gross fees paid',
      highlight: false,
    },
    {
      label: 'Already Refunded',
      value: totalRefunded,
      icon: 'solar:arrow-left-up-bold',
      accent: theme.palette.warning.dark,
      accentBg: alpha(theme.palette.warning.main, 0.07),
      accentBorder: alpha(theme.palette.warning.main, 0.2),
      sub: 'Previous refunds',
      highlight: false,
    },
    {
      label: 'Max Refundable',
      value: totalRefundable,
      icon: 'solar:shield-check-bold',
      accent: theme.palette.success.main,
      accentBg: alpha(theme.palette.success.main, 0.07),
      accentBorder: alpha(theme.palette.success.main, 0.2),
      sub: 'Available to refund',
      highlight: false,
    },
    {
      label: 'Refund Requested',
      value: totalRefundInput,
      icon: 'solar:money-bag-bold',
      accent: theme.palette.primary.main,
      accentBg: alpha(theme.palette.primary.main, 0.07),
      accentBorder: alpha(theme.palette.primary.main, 0.2),
      sub:
        totalSelectedMonths > 0
          ? `${totalSelectedMonths} month${totalSelectedMonths !== 1 ? 's' : ''} selected`
          : 'Select months',
      highlight: true,
    },
  ];

  // Progress bar: how much of refundable amount has been requested
  const progressPct =
    totalRefundable > 0 ? Math.min(100, (totalRefundInput / totalRefundable) * 100) : 0;

  return (
    <Box mb={1}>
      {/* ── Section label ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}
        >
          Refund Summary
        </Typography>
        {totalSelectedMonths > 0 && (
          <Chip
            size="small"
            label={`${totalSelectedMonths} month${totalSelectedMonths !== 1 ? 's' : ''} selected`}
            color="primary"
            variant="soft"
            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
          />
        )}
      </Box>

      {/* ── 4 KPI Stat Cards ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1.5 }}
      >
        {statCards.map((card) => (
          <Box
            key={card.label}
            sx={{
              flex: '1 1 130px',
              minWidth: 0,
              p: { xs: 1.5, md: 1.75 },
              borderRadius: '14px',
              border: `1px solid ${card.accentBorder}`,
              bgcolor: card.accentBg,
              cursor: 'default',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 16px ${alpha(card.accent, 0.18)}`,
              },
            }}
          >
            {/* Icon + active chip */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={0.75}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(card.accent, 0.14),
                }}
              >
                <Iconify icon={card.icon} width={16} sx={{ color: card.accent }} />
              </Box>
              {card.highlight && totalRefundInput > 0 && (
                <Chip
                  size="small"
                  label="Active"
                  sx={{
                    height: 16,
                    fontSize: 9,
                    fontWeight: 700,
                    bgcolor: alpha(card.accent, 0.14),
                    color: card.accent,
                    border: `1px solid ${alpha(card.accent, 0.25)}`,
                  }}
                />
              )}
            </Box>

            {/* Label */}
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                color: alpha(card.accent, 0.75),
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontSize: 10,
                display: 'block',
              }}
            >
              {card.label}
            </Typography>

            {/* Amount */}
            <Typography
              fontWeight={800}
              sx={{
                fontSize: { xs: '1rem', md: '1.15rem' },
                color: card.highlight ? card.accent : 'text.primary',
                lineHeight: 1.25,
                mt: 0.25,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(card.value)}
            </Typography>

            {/* Sub-label */}
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {card.sub}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* ── Refund utilization progress bar ── */}
      {totalRefundable > 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Refund utilization
            </Typography>
            <Typography variant="caption" fontWeight={700} color="primary.main">
              {Math.round(progressPct)}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 5,
              borderRadius: 999,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progressPct}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                transition: 'width 0.5s ease',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OverallSummaryCard;
