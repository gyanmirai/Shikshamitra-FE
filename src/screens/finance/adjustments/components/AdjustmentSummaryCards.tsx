import React from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Card, Divider, Typography } from '@mui/material';

import type { AdjustmentApplySummary } from '../types/adjustmentApply.types';

const AdjustmentSummaryCards = ({ summary }: { summary: AdjustmentApplySummary }) => {
  const cards = [
    {
      label: 'Approved Adjustment Amount',
      value: formatCurrency(summary.approvedAdjustmentAmount),
    },
    {
      label: 'Total Pending Fees',
      value: formatCurrency(summary.totalPendingFees),
    },
    {
      label: 'Applied Adjustment Amount',
      value: formatCurrency(summary.totalAppliedAmount),
    },
    {
      label: 'Remaining Adjustment Balance',
      value: formatCurrency(summary.remainingAdjustmentBalance),
    },
  ];

  return (
    <Card sx={{ boxShadow: 'var(--shadows-10)', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {cards.map((item, idx, arr) => (
          <React.Fragment key={item.label}>
            <Box sx={{ flex: '1 1 180px', px: 3, py: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  letterSpacing: 1.5,
                  fontSize: '0.65rem',
                  lineHeight: 1.4,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}
              >
                {item.value}
              </Typography>
            </Box>
            {idx < arr.length - 1 && <Divider orientation="vertical" flexItem />}
          </React.Fragment>
        ))}
      </Box>
    </Card>
  );
};

export default AdjustmentSummaryCards;
