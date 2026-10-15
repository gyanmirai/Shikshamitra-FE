import type { GrantedPermission } from 'src/utils/permissions';
import type { StudentModuleDashboardLink } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Paper, Stack, Skeleton, Typography, ButtonBase } from '@mui/material';

import type { StudentSectionQueries } from '../hooks/use-student-dashboard-sections';

const overview = [
  {
    id: 'active',
    section: 'records',
    link: 'directory',
    label: 'Active students',
    caption: 'Permanent student records',
    icon: 'mdi:account-school-outline',
  },
  {
    id: 'setup',
    section: 'admissions',
    link: 'onboarding',
    label: 'Unfinished onboarding',
    caption: 'Setup and app access pending',
    icon: 'mdi:clipboard-account-outline',
  },
  {
    id: 'applications',
    section: 'admissions',
    link: 'applications',
    label: 'Active applications',
    caption: 'Admissions in progress',
    icon: 'mdi:application-edit-outline',
  },
] as const;

export function AdminDashboardOverview({
  queries,
  links,
  permissions,
}: {
  queries: StudentSectionQueries;
  links: StudentModuleDashboardLink[];
  permissions: GrantedPermission[];
}) {
  const visible = overview.filter((item) => links.some((link) => link.id === item.link));
  if (!visible.length) return null;
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: `repeat(${visible.length}, minmax(0, 1fr))` },
        overflow: 'hidden',
      }}
    >
      {visible.map((item, index) => {
        const query = queries[item.section];
        const metric = !query.isError
          ? query.currentData?.metrics.find(
              (value) => value.id === item.id && hasGrantedPermission(permissions, value.permission)
            )
          : undefined;
        const content = (
          <>
            <Iconify icon={item.icon} width={32} sx={{ color: 'primary.main', flexShrink: 0 }} />
            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2">{item.label}</Typography>
              {!query.currentData && !query.isError ? (
                <Skeleton width={100} height={40} aria-label={`Loading ${item.label}`} />
              ) : (
                <Typography variant="h3">{metric ? fNumber(metric.value) : '—'}</Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {query.isError ? 'Summary unavailable · retry below' : item.caption}
              </Typography>
            </Stack>
            {metric && (
              <Iconify icon="mdi:chevron-right" width={20} sx={{ color: 'text.secondary' }} />
            )}
          </>
        );
        const sx = {
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          textAlign: 'left' as const,
          minWidth: 0,
          borderLeft: { xs: 0, md: index ? 1 : 0 },
          borderTop: { xs: index ? 1 : 0, md: 0 },
          borderColor: { xs: 'divider', md: 'divider' },
        };
        return metric ? (
          <ButtonBase
            key={item.id}
            component={Link}
            prefetch={false}
            href={metric.href}
            aria-label={`${item.label}: ${fNumber(metric.value)}. Open workspace`}
            sx={{
              ...sx,
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: -2,
              },
            }}
          >
            {content}
          </ButtonBase>
        ) : (
          <Box key={item.id} sx={sx}>
            {content}
          </Box>
        );
      })}
    </Paper>
  );
}
