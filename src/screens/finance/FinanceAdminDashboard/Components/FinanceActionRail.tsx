'use client';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { financePaths } from 'src/constants/finance-menu';
import { Box, Card, Chip, Stack, Divider, CardHeader, Typography } from '@mui/material';

import {
  financeQueuePreview,
  financeReportShortcuts,
} from '../finance-admin-dashboard-preview-data';

export function FinanceAttentionQueue() {
  return (
    <Card
      component="section"
      aria-labelledby="finance-attention-title"
      variant="outlined"
      sx={{ height: '100%', boxShadow: 'none' }}
    >
      <CardHeader
        title={
          <Typography id="finance-attention-title" variant="h6">
            Needs Attention
          </Typography>
        }
        subheader="Finance items to review"
        action={<Chip size="small" label={`${financeQueuePreview.needsAttention.length} items`} />}
        sx={{ p: 2, '& .MuiCardHeader-action': { m: 0 } }}
      />
      <Divider />
      <Stack divider={<Divider flexItem />}>
        {financeQueuePreview.needsAttention.map((item) => (
          <Box
            key={item.id}
            component={Link}
            href={item.route}
            sx={{
              px: 2.5,
              py: 1.5,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 1,
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { bgcolor: 'action.hover' },
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
    <Card
      component="section"
      aria-labelledby="finance-report-title"
      variant="outlined"
      sx={{ boxShadow: 'none' }}
    >
      <CardHeader
        title={
          <Typography id="finance-report-title" variant="h6">
            Quick Reports
          </Typography>
        }
        subheader="Open Finance Reports to choose a period and filters"
        sx={{ p: 2 }}
      />
      <Divider />
      <Stack divider={<Divider flexItem />}>
        {financeReportShortcuts.map((report) => (
          <Box
            key={report}
            component={Link}
            href={financePaths.reports}
            sx={{
              px: 2.5,
              py: 1.5,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              alignItems: 'center',
              gap: 1,
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
            <Typography variant="body2">{report}</Typography>
            <Iconify
              icon="mdi:chevron-right"
              width={18}
              aria-hidden
              sx={{ color: 'text.secondary' }}
            />
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
