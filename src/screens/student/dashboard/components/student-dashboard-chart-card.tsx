'use client';

import type { StudentModuleDashboardMetric } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { fNumber } from 'src/utils/format-number';
import { Box, Stack, Alert, Skeleton, Typography, ButtonBase } from '@mui/material';
import { useDeferredRender } from 'src/screens/academic/AcademicDashboard/hooks/useDeferredRender';
import { DashboardSectionCard } from 'src/screens/academic/AcademicDashboard/Components/DashboardSectionCard';

import { dashboardChartPalette } from '../dashboard-graph-data';

const StudentDashboardChart = dynamic(() => import('./student-dashboard-chart'), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={220} />,
});
export type DashboardChartRow = Pick<
  StudentModuleDashboardMetric,
  'id' | 'label' | 'value' | 'href'
>;

export default function StudentDashboardChartCard({
  title,
  description,
  rows,
  type,
  loading,
  failed,
}: {
  title: string;
  description: string;
  rows: DashboardChartRow[];
  type: 'bar' | 'donut';
  loading: boolean;
  failed: boolean;
}) {
  const { targetRef, shouldRender } = useDeferredRender('100px');
  const hasValues = rows.some((row) => row.value > 0);
  return (
    <DashboardSectionCard title={title} subheader={description} height="100%">
      <Box ref={targetRef}>
        {failed ? (
          <Alert severity="warning">Summary unavailable. Retry its workspace section below.</Alert>
        ) : loading ? (
          <Skeleton variant="rounded" height={220} aria-label={`Loading ${title}`} />
        ) : rows.length ? (
          <>
            {hasValues ? (
              shouldRender ? (
                <Box
                  role="img"
                  aria-label={`${title}: ${rows.map((row) => `${row.label} ${row.value}`).join(', ')}`}
                >
                  <StudentDashboardChart rows={rows} type={type} title={title} />
                </Box>
              ) : (
                <Skeleton
                  variant="rounded"
                  height={220}
                  aria-label={`Chart preview for ${title}`}
                />
              )
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No records to plot in this academic year and scope.
              </Typography>
            )}
            <Stack spacing={0.5} aria-label={`${title} values`}>
              {rows.map((row, index) => (
                <ButtonBase
                  key={row.id}
                  component={Link}
                  href={row.href}
                  prefetch={false}
                  aria-label={`Open ${row.label}: ${fNumber(row.value)}`}
                  sx={{
                    minHeight: 44,
                    px: 1,
                    borderRadius: 1,
                    justifyContent: 'space-between',
                    gap: 1,
                    textAlign: 'left',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {type === 'donut' && (
                      <Box
                        aria-hidden="true"
                        sx={{
                          width: 10,
                          height: 10,
                          flexShrink: 0,
                          borderRadius: '50%',
                          bgcolor: `${dashboardChartPalette[index % dashboardChartPalette.length]}.main`,
                        }}
                      />
                    )}
                    <Typography variant="body2">{row.label}</Typography>
                  </Stack>
                  <Typography variant="subtitle2">{fNumber(row.value)}</Typography>
                </ButtonBase>
              ))}
            </Stack>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No chart data is available in this academic year and scope.
          </Typography>
        )}
      </Box>
    </DashboardSectionCard>
  );
}
