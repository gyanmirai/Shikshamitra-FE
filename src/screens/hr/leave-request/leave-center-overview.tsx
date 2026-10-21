'use client';

import { useId } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionHeader } from 'src/components/form-section-card';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Skeleton,
  Accordion,
  Typography,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { formatLeaveDays } from './leave-overview.utils';

import type { LeaveOverviewData, LeaveBucketBreakdown } from './leave-overview.utils';

type LeaveCenterOverviewPanelProps = {
  overview: LeaveOverviewData;
  isLoading: boolean;
  error?: unknown;
  onRetry?: () => void;
};

function LeaveTypeBalanceCard({ row }: { row: LeaveBucketBreakdown }) {
  const detailsId = useId();
  const isOverdrawn = !row.isUnlimited && row.remaining < 0;
  const usagePercent =
    row.total > 0 ? Math.max(0, Math.min(100, Math.round((row.used / row.total) * 100))) : null;
  const status = row.isUnlimited
    ? 'No limit'
    : isOverdrawn
      ? 'Overdrawn'
      : row.remaining === 0
        ? 'No days left'
        : 'Available';

  return (
    <Card
      component="section"
      aria-label={`${row.bucketName} leave balance`}
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        minWidth: 0,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <FormSectionHeader
        icon={row.isUnlimited ? 'solar:infinity-bold' : 'solar:calendar-outline'}
        title={row.bucketName}
        titleTypographyProps={{ variant: 'subtitle1' }}
        descriptionTooltip={
          row.isUnlimited
            ? 'This leave type has no finite entitlement. Used days and pending requests are still tracked.'
            : 'Your leave allocation for the current academic year, including available, used, and pending days.'
        }
        action={
          <Label
            color={
              isOverdrawn
                ? 'error'
                : row.isUnlimited
                  ? 'info'
                  : row.remaining === 0
                    ? 'warning'
                    : 'success'
            }
            variant="soft"
          >
            {status}
          </Label>
        }
      />
      <Box sx={{ mt: 2, mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Available balance
        </Typography>
        <Stack
          direction="row"
          alignItems="baseline"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 0.25 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: isOverdrawn ? 'error.main' : 'text.primary',
              fontVariantNumeric: 'tabular-nums',
              overflowWrap: 'anywhere',
            }}
          >
            {row.isUnlimited ? 'Unlimited' : formatLeaveDays(row.remaining)}
          </Typography>
          {!row.isUnlimited && (
            <Typography variant="body2" color="text.secondary">
              {row.remaining === 1 ? 'day' : 'days'}
            </Typography>
          )}
        </Stack>
      </Box>
      <Box sx={{ mb: 2 }}>
        {row.isUnlimited ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ py: 0.75, color: 'text.secondary' }}
          >
            <Iconify icon="solar:infinity-bold" width={18} aria-hidden />
            <Typography variant="caption">No fixed entitlement limit</Typography>
          </Stack>
        ) : (
          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Entitlement used
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {usagePercent == null ? 'No accrued days' : `${usagePercent}%`}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={usagePercent ?? 0}
              color={isOverdrawn ? 'error' : 'primary'}
              aria-label={`${row.bucketName} entitlement used`}
              aria-valuetext={usagePercent == null ? 'No accrued days' : `${usagePercent}% used`}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Stack>
        )}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'background.neutral',
          gap: 2,
        }}
      >
        {[
          { label: 'Used', value: row.used, icon: 'solar:calendar-check-outline' },
          { label: 'Pending', value: row.pendingDays, icon: 'solar:clock-circle-outline' },
        ].map((metric) => (
          <Stack key={metric.label} spacing={0.5}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: 'text.secondary' }}
            >
              <Iconify icon={metric.icon} width={16} aria-hidden />
              <Typography variant="caption">{metric.label}</Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
            >
              {formatLeaveDays(metric.value)}{' '}
              <Box
                component="span"
                sx={{ typography: 'caption', fontWeight: 400, color: 'text.secondary' }}
              >
                {metric.value === 1 ? 'day' : 'days'}
              </Box>
            </Typography>
          </Stack>
        ))}
      </Box>
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          mt: 1,
          bgcolor: 'transparent',
          '&::before': { display: 'none' },
          '&.Mui-expanded': { boxShadow: 'none', bgcolor: 'transparent' },
          border: 0,
        }}
      >
        <AccordionSummary
          id={`${detailsId}-summary`}
          aria-controls={`${detailsId}-content`}
          expandIcon={<Iconify icon="eva:chevron-down-fill" width={18} />}
          sx={{ px: 0, minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Typography variant="body2" color="text.secondary">
            Balance details
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0.5, pb: 0 }}>
          {row.isUnlimited ? (
            <Typography variant="caption" color="text.secondary">
              Used and pending days are tracked without reducing a fixed entitlement.
            </Typography>
          ) : (
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Accrued
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatLeaveDays(row.total)} {row.total === 1 ? 'day' : 'days'}
              </Typography>
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}

export function LeaveCenterOverviewPanel({
  overview,
  isLoading,
  error,
  onRetry,
}: LeaveCenterOverviewPanelProps) {
  const rows = overview.bucketBreakdown;
  const gridSx = {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: `repeat(${Math.min(Math.max(rows.length, 2), 3)}, minmax(0, 1fr))`,
    },
    gap: 2,
    alignItems: 'start',
  };

  if (error)
    return (
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        Unable to load leave balances. Please try again.
      </Alert>
    );

  if (isLoading && !rows.length)
    return (
      <Box sx={gridSx} role="status" aria-label="Loading leave balances">
        {[0, 1].map((key) => (
          <Card key={key} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Skeleton width="50%" height={44} />
              <Skeleton width="35%" height={52} />
              <Skeleton width="90%" />
              <Skeleton variant="rounded" height={68} />
              <Skeleton width="40%" height={36} />
            </Stack>
          </Card>
        ))}
      </Box>
    );

  if (!rows.length)
    return (
      <Card variant="outlined">
        <EmptyContent
          title="Your leave allocation hasn't been set up for this year."
          description="Contact HR for assistance. Your requests are available in My Requests."
          sx={{ p: 3 }}
        />
      </Card>
    );

  return (
    <Stack spacing={1} data-testid="leave-center-overview-panel" aria-busy={isLoading}>
      {isLoading && <LinearProgress aria-label="Refreshing leave balances" />}
      <Box sx={gridSx}>
        {rows.map((row) => (
          <LeaveTypeBalanceCard key={row.bucketId} row={row} />
        ))}
      </Box>
    </Stack>
  );
}
