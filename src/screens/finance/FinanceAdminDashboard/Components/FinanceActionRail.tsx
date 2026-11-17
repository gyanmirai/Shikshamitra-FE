'use client';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { financePaths } from 'src/constants/finance-menu';
import { Box, Card, Chip, Grid, Stack, CardHeader, Typography } from '@mui/material';

import {
  financeQueuePreview,
  financeReportShortcuts,
} from '../finance-admin-dashboard-preview-data';
import { financeDashboardCardSx, financeDashboardTileSx } from './finance-dashboard-card-styles';

export function FinanceAttentionQueue() {
  return (
    <Card component="section" aria-labelledby="finance-attention-title" sx={financeDashboardCardSx}>
      <CardHeader
        title={
          <Typography id="finance-attention-title" variant="h6">
            Needs Attention
          </Typography>
        }
        subheader="Finance items to review"
        action={<Chip size="small" label={`${financeQueuePreview.needsAttention.length} items`} />}
        sx={{ p: 0, mb: 2, '& .MuiCardHeader-action': { m: 0 } }}
      />
      <Stack spacing={1}>
        {financeQueuePreview.needsAttention.map((item) => (
          <Box
            key={item.id}
            component={Link}
            href={item.route}
            sx={{
              ...financeDashboardTileSx,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 1,
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: -2,
              },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  aria-hidden
                  sx={{
                    width: 7,
                    height: 7,
                    flex: '0 0 auto',
                    borderRadius: '50%',
                    bgcolor: `${item.severity}.main`,
                  }}
                />
                <Typography variant="subtitle2" noWrap>
                  {item.title}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                {item.description}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {item.id}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

export function FinanceReportRail() {
  return (
    <Card component="section" aria-labelledby="finance-report-title" sx={financeDashboardCardSx}>
      <CardHeader
        title={
          <Typography id="finance-report-title" variant="h6">
            Quick Reports
          </Typography>
        }
        subheader="Open Finance Reports to choose a period and filters"
        sx={{ p: 0, mb: 2 }}
      />
      <Grid container spacing={1.5}>
        {financeReportShortcuts.map((report) => (
          <Grid key={report} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box
              component={Link}
              href={financePaths.reports}
              sx={{
                ...financeDashboardTileSx,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: -2,
                },
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {report}
              </Typography>
              <Iconify
                icon="mdi:chevron-right"
                width={18}
                aria-hidden
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
