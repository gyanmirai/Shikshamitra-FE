import type { GrantedPermission } from 'src/utils/permissions';
import type { StudentModuleDashboardMetric } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Typography, ButtonBase } from '@mui/material';

export default function StudentDashboardMetrics({
  metrics,
  permissions,
}: {
  metrics: StudentModuleDashboardMetric[];
  permissions: GrantedPermission[];
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {metrics
        .filter((metric) => hasGrantedPermission(permissions, metric.permission))
        .map((metric) => (
          <ButtonBase
            key={metric.id}
            component={Link}
            href={metric.href}
            prefetch={false}
            aria-label={`${metric.label}: ${fNumber(metric.value)}. Open workspace`}
            sx={{
              minHeight: 88,
              p: 1.5,
              textAlign: 'left',
              justifyContent: 'space-between',
              gap: 1,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                color={metric.tone === 'warning' ? 'warning.main' : 'text.primary'}
              >
                {fNumber(metric.value)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.label}
              </Typography>
            </Stack>
            <Iconify
              icon={
                metric.tone === 'warning' && metric.value > 0
                  ? 'mdi:alert-circle-outline'
                  : 'mdi:arrow-top-right'
              }
              width={20}
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            />
          </ButtonBase>
        ))}
    </Box>
  );
}
