'use client';

import type { FinanceDashboardWork } from 'src/redux/finance/financeDashboardApi';

import Link from 'next/link';
import { fNumber } from 'src/utils/format-number';
import { Box, Stack, Typography } from '@mui/material';
import { financePaths } from 'src/constants/finance-menu';
import { FormSectionCard } from 'src/components/form-section-card';

import { financeDashboardCardSx } from './finance-dashboard-card-styles';
import { dashboardNumberSx, formatDashboardMoney } from '../finance-dashboard-format';

const workLabels = {
  refundFailed: { title: 'Refund payouts failed', href: financePaths.feeRefund, urgent: true },
  refundPayment: { title: 'Refunds awaiting payment', href: financePaths.feeRefund },
  concessionReview: { title: 'Concessions awaiting review', href: financePaths.concession },
  refundReview: { title: 'Refunds awaiting review', href: financePaths.feeRefund },
};

export function FinanceAttentionQueue({ work }: { work: FinanceDashboardWork[] }) {
  const items = work
    .filter((entry) => entry.count > 0)
    .sort((a, b) => Number(b.kind === 'refundFailed') - Number(a.kind === 'refundFailed'));

  return (
    <FormSectionCard
      title="Needs Attention"
      descriptionTooltip="Open requests you can view that were submitted during the selected period."
      sx={{ ...financeDashboardCardSx, height: 'auto' }}
    >
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No open requests submitted during this period.
        </Typography>
      ) : (
        <Stack
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            '& > li + li': { borderTop: '1px solid', borderColor: 'divider' },
          }}
        >
          {items.map((item) => {
            const entry = workLabels[item.kind];
            return (
              <Box component="li" key={item.kind}>
                <Box
                  component={Link}
                  href={entry.href}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    alignItems: 'center',
                    gap: 1,
                    px: 0.5,
                    py: 1,
                    borderRadius: 0.75,
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={'urgent' in entry ? 'error.main' : 'text.primary'}
                  >
                    {entry.title}
                  </Typography>
                  <Box sx={{ textAlign: 'end', ...dashboardNumberSx }}>
                    <Typography variant="body2" fontWeight={600}>
                      {fNumber(item.count)}
                    </Typography>
                    {item.amount !== null && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDashboardMoney(item.amount)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </FormSectionCard>
  );
}
