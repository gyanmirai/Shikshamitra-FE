import type { ReactNode } from 'react';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { DashboardSectionCard } from 'src/screens/academic/AcademicDashboard/Components/DashboardSectionCard';
import {
  Box,
  Stack,
  Alert,
  Button,
  Skeleton,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import type { StudentSectionQuery } from '../hooks/use-student-dashboard-sections';

export function AdminDashboardPanel({
  title,
  description,
  query,
  action,
  children,
}: {
  title: string;
  description?: string;
  query?: StudentSectionQuery;
  action?: ReactNode;
  children: ReactNode;
}) {
  const loading = query && !query.currentData && !query.isError;
  return (
    <DashboardSectionCard
      title={
        <Stack component="span" direction="row" spacing={0.5} alignItems="center">
          <Typography component="span" variant="h6" sx={{ minWidth: 0 }}>
            {title}
          </Typography>
          {description && (
            <CustomTooltip
              title={<Box sx={{ p: 1, maxWidth: 280 }}>{description}</Box>}
              arrow
              placement="bottom"
            >
              <IconButton size="small" aria-label={`About ${title}`} sx={{ flexShrink: 0 }}>
                <Iconify icon="mdi:information-outline" width={16} sx={{ color: 'info.main' }} />
              </IconButton>
            </CustomTooltip>
          )}
        </Stack>
      }
      action={action}
      height="100%"
      sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
      contentSx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}
    >
      {query?.isFetching && query.currentData && (
        <LinearProgress aria-label={`Refreshing ${title}`} sx={{ mb: 1 }} />
      )}
      {query?.isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={query.refetch}>
              Retry
            </Button>
          }
        >
          {title} could not be loaded. Other sections remain available.
        </Alert>
      ) : loading ? (
        <Skeleton variant="rounded" height={200} aria-label={`Loading ${title}`} />
      ) : (
        children
      )}
    </DashboardSectionCard>
  );
}

export function DashboardWorkspaceLink({ href, children }: { href?: string; children: ReactNode }) {
  return href ? (
    <Button
      component={Link}
      href={href}
      prefetch={false}
      size="small"
      color="primary"
      sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
    >
      {children}
    </Button>
  ) : null;
}
