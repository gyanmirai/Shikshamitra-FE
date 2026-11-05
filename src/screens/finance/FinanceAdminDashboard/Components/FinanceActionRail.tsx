'use client';

import Link from 'next/link';
import { financePaths } from 'src/constants/finance-menu';
import { Box, Chip, Paper, Stack, Divider, Typography } from '@mui/material';

import { financeQueuePreview, financeReportShortcuts } from '../finance-admin-dashboard-preview-data';

export function FinanceAttentionQueue() {
  return (
    <Paper component="section" aria-labelledby="finance-attention-title" variant="outlined">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 2 }}
      >
        <Box>
          <Typography id="finance-attention-title" variant="h6">
            Needs attention
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Open operational exceptions and pending requests
          </Typography>
        </Box>
        <Chip size="small" label={`${financeQueuePreview.needsAttention.length  } items`} />
      </Stack>
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
                    bgcolor: `${item.severity  }.main`,
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
    </Paper>
  );
}

export function FinanceReportRail() {
  return (
    <Paper component="section" aria-labelledby="finance-report-title" variant="outlined">
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography id="finance-report-title" variant="h6">
          Report shortcuts
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Open Finance Reports to choose the reporting period and filters.
        </Typography>
      </Box>
      <Divider />
      <Stack divider={<Divider flexItem />}>
        {financeReportShortcuts.map((report, index) => (
          <Box
            key={report}
            component={Link}
            href={financePaths.reports}
            sx={{
              px: 2.5,
              py: 1.5,
              display: 'grid',
              gridTemplateColumns: '32px minmax(0, 1fr) auto',
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
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              0{index + 1}
            </Typography>
            <Typography variant="body2">{report}</Typography>
            <Typography aria-hidden variant="body2" color="text.secondary">
              ↗
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
