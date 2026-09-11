'use client';

import type { ChipProps } from '@mui/material/Chip';
import type {
  StudentReportingKpi,
  StudentDashboardPreview,
  StudentReportingCategory,
  StudentReportingDashboard,
  StudentReportingQuickLink,
  StudentDashboardPreviewStatus,
} from 'src/redux/student';

import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useMemo, useState, useEffect } from 'react';
import { Chart, useChart } from 'src/components/chart';
import {
  parseStudentDashboardPayload,
  useGetStudentDashboardPreviewQuery,
  useRefreshStudentDashboardPreviewMutation,
} from 'src/redux/student';
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Stack,
  Button,
  Divider,
  Skeleton,
  CardHeader,
  Typography,
  LinearProgress,
} from '@mui/material';

const DASHBOARD_KEY = 'Reporting';
const DASHBOARD_REFRESH_POLLING_INTERVAL = 5000;

const isDashboardRefreshing = (status?: StudentDashboardPreviewStatus) => status === 'Refreshing';

const formatDateTime = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : 'Not refreshed yet';

const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD MMM YYYY') : '');

const chipColor = (tone?: string): ChipProps['color'] => {
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  if (tone === 'critical') return 'error';
  if (tone === 'info') return 'info';
  return 'default';
};

const toneDotColor = (tone?: string) => {
  if (tone === 'success') return 'success.main';
  if (tone === 'warning') return 'warning.main';
  if (tone === 'critical') return 'error.main';
  if (tone === 'info') return 'info.main';
  return 'text.disabled';
};

const kpiIcon = (id: string) => {
  const icons: Record<string, string> = {
    'total-students': 'solar:users-group-rounded-bold-duotone',
    'enrolled-students': 'solar:user-check-rounded-bold-duotone',
    'attendance-rate': 'solar:chart-square-bold-duotone',
  };

  return icons[id] || 'solar:graph-new-up-bold-duotone';
};

const StudentDashboardScreen = () => {
  const theme = useTheme();
  const [dashboardPollingInterval, setDashboardPollingInterval] = useState(0);
  const {
    data: preview,
    isLoading,
    isFetching,
    isError,
  } = useGetStudentDashboardPreviewQuery(DASHBOARD_KEY, {
    pollingInterval: dashboardPollingInterval,
    skipPollingIfUnfocused: true,
  });
  const [refreshPreview, { isLoading: isRefreshStarting }] =
    useRefreshStudentDashboardPreviewMutation();

  useEffect(() => {
    const nextPollingInterval = isDashboardRefreshing(preview?.status)
      ? DASHBOARD_REFRESH_POLLING_INTERVAL
      : 0;
    setDashboardPollingInterval((current) =>
      current === nextPollingInterval ? current : nextPollingInterval
    );
  }, [preview?.status]);

  const payload = useMemo(
    () => parseStudentDashboardPayload<StudentReportingDashboard>(preview),
    [preview]
  );

  const enrollmentTrend = payload?.enrollmentTrend ?? [];
  const attendanceTrend = payload?.attendanceTrend ?? [];
  const classStrength = payload?.classStrength.slice(0, 8) ?? [];

  const enrollmentChart = useChart({
    colors: [
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
    ],
    xaxis: { categories: enrollmentTrend.map((item) => item.label) },
    legend: { show: true },
    stroke: { width: 0 },
    plotOptions: { bar: { columnWidth: '58%' } },
    tooltip: { y: { formatter: (value: number) => `${value} students` } },
  });

  const attendanceChart = useChart({
    colors: [theme.palette.success.main],
    xaxis: { categories: attendanceTrend.map((item) => dayjs(item.date).format('DD MMM')) },
    yaxis: { min: 0, max: 100 },
    stroke: { width: 3, curve: 'smooth' },
    tooltip: { y: { formatter: (value: number) => `${value}%` } },
  });

  const classStrengthChart = useChart({
    colors: [theme.palette.primary.main],
    xaxis: { categories: classStrength.map((item) => item.standard) },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    tooltip: { y: { formatter: (value: number) => `${value} students` } },
  });

  const refreshing = isDashboardRefreshing(preview?.status) || isRefreshStarting;

  if (isLoading && !preview) {
    return <DashboardSkeleton />;
  }

  return (
    <Box sx={{ width: '100%', pb: 2 }}>
      <Stack spacing={2}>
        <DashboardHeader
          preview={preview}
          isFetching={isFetching}
          isRefreshing={refreshing}
          onRefresh={() => refreshPreview(DASHBOARD_KEY)}
        />

        {isError ? (
          <Alert severity="error">Unable to load student reporting dashboard.</Alert>
        ) : null}
        {refreshing ? <LinearProgress /> : null}
        {preview?.lastError ? <Alert severity="warning">{preview.lastError}</Alert> : null}
        {preview?.isStale && preview?.status === 'Ready' ? (
          <Alert severity="info">
            Reporting data is older than 24 hours. A fresh snapshot is being prepared.
          </Alert>
        ) : null}

        {!payload ? (
          <EmptySnapshotState preview={preview} />
        ) : (
          <>
            <Grid container spacing={1.5}>
              {payload.kpis.map((kpi) => (
                <Grid key={kpi.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <KpiCard kpi={kpi} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title="Enrollment movement"
                    subheader={`${formatDate(payload.rangeStart)} to ${formatDate(payload.rangeEnd)}`}
                  />
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Chart
                      type="bar"
                      height={300}
                      series={[
                        {
                          name: 'Inquiries',
                          data: enrollmentTrend.map((item) => item.inquiries),
                        },
                        {
                          name: 'Registrations',
                          data: enrollmentTrend.map((item) => item.registrations),
                        },
                        {
                          name: 'Admissions',
                          data: enrollmentTrend.map((item) => item.admissions),
                        },
                        {
                          name: 'Enrolled',
                          data: enrollmentTrend.map((item) => item.enrolled),
                        },
                      ]}
                      options={enrollmentChart}
                    />
                  </Box>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Attendance trend" subheader="Last 7 marked days" />
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Chart
                      type="line"
                      height={300}
                      series={[
                        {
                          name: 'Attendance',
                          data: attendanceTrend.map((item) => item.percentage),
                        },
                      ]}
                      options={attendanceChart}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Report groups" />
                  <Stack divider={<Divider flexItem />} sx={{ px: 2, pb: 2 }}>
                    {payload.categories.map((category) => (
                      <ReportCategoryRow key={category.id} category={category} />
                    ))}
                  </Stack>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Class strength" subheader="Top visible enrolled classes" />
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Chart
                      type="bar"
                      height={320}
                      series={[
                        {
                          name: 'Students',
                          data: classStrength.map((item) => item.total),
                        },
                      ]}
                      options={classStrengthChart}
                    />
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Attention" />
                  <Stack spacing={1.25} sx={{ px: 2, pb: 2 }}>
                    {payload.alerts.length ? (
                      payload.alerts.map((alert) => (
                        <Stack
                          key={alert.id}
                          direction="row"
                          alignItems="flex-start"
                          justifyContent="space-between"
                          spacing={1.5}
                          sx={{
                            p: 1.25,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                color={chipColor(alert.severity)}
                                label={alert.count}
                                sx={{ height: 22, minWidth: 34 }}
                              />
                              <Typography variant="subtitle2" noWrap>
                                {alert.title}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {alert.summary}
                            </Typography>
                            <Button
                              component={RouterLink}
                              href={alert.actionHref}
                              size="small"
                              endIcon={<Iconify icon="solar:arrow-right-up-linear" />}
                              sx={{ mt: 0.5, px: 0 }}
                            >
                              {alert.actionLabel}
                            </Button>
                          </Box>
                        </Stack>
                      ))
                    ) : (
                      <Alert severity="success">No student reporting alerts.</Alert>
                    )}
                  </Stack>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardHeader title="Quick links" />
              <Grid container spacing={1.5} sx={{ px: 2, pb: 2 }}>
                {payload.quickLinks.map((link) => (
                  <Grid key={link.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <QuickLinkButton link={link} />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  );
};

type HeaderProps = {
  preview?: StudentDashboardPreview;
  isFetching: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

const DashboardHeader = ({ preview, isFetching, isRefreshing, onRefresh }: HeaderProps) => (
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    alignItems={{ xs: 'stretch', md: 'flex-start' }}
    justifyContent="space-between"
    spacing={1.25}
  >
    <Box>
      <Typography variant="h4">Reporting dashboard</Typography>
      <Typography variant="body2" color="text.secondary">
        Student records, enrollment, attendance, certificates, and report readiness
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Last refreshed:{' '}
        {formatDateTime(preview?.lastSuccessfulRefreshAt || preview?.lastRefreshedAt)}
      </Typography>
    </Box>

    <Button
      size="small"
      variant="outlined"
      onClick={onRefresh}
      disabled={isRefreshing || isFetching}
      startIcon={<Iconify icon="solar:refresh-linear" />}
      sx={{ minHeight: 34, alignSelf: { xs: 'flex-start', md: 'center' } }}
    >
      {isRefreshing ? 'Refreshing' : 'Refresh'}
    </Button>
  </Stack>
);

const KpiCard = ({ kpi }: { kpi: StudentReportingKpi }) => (
  <Card sx={{ height: '100%', p: 2 }}>
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1,
          display: 'grid',
          flexShrink: 0,
          placeItems: 'center',
          bgcolor: 'background.neutral',
          color: 'primary.main',
        }}
      >
        <Iconify icon={kpiIcon(kpi.id)} width={24} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary" noWrap>
            {kpi.label}
          </Typography>
          <Box
            component="span"
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              flexShrink: 0,
              bgcolor: toneDotColor(kpi.tone),
            }}
          />
        </Stack>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {kpi.displayValue || kpi.value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {kpi.description}
        </Typography>
        {kpi.href ? (
          <Button
            component={RouterLink}
            href={kpi.href}
            size="small"
            endIcon={<Iconify icon="solar:arrow-right-up-linear" />}
            sx={{ mt: 1, px: 0 }}
          >
            Open
          </Button>
        ) : null}
      </Box>
    </Stack>
  </Card>
);

const ReportCategoryRow = ({ category }: { category: StudentReportingCategory }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25 }}>
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: 1,
        display: 'grid',
        flexShrink: 0,
        placeItems: 'center',
        bgcolor: 'background.neutral',
        color: 'primary.main',
      }}
    >
      <Iconify icon={category.icon} width={22} />
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" noWrap>
          {category.title}
        </Typography>
        <Chip size="small" label={category.availableReports} sx={{ height: 22 }} />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {category.description}
      </Typography>
      <Button
        component={RouterLink}
        href={category.href}
        size="small"
        endIcon={<Iconify icon="solar:arrow-right-up-linear" />}
        sx={{ mt: 0.5, px: 0 }}
      >
        Open
      </Button>
    </Box>
  </Stack>
);

const QuickLinkButton = ({ link }: { link: StudentReportingQuickLink }) => (
  <Button
    component={RouterLink}
    href={link.href}
    variant="outlined"
    color="inherit"
    fullWidth
    sx={{
      minHeight: 82,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      textAlign: 'left',
      p: 1.25,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: 1 }}>
      <Iconify
        icon={link.icon}
        width={22}
        sx={{ mt: 0.25, flexShrink: 0, color: 'primary.main' }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" color="text.primary">
          {link.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {link.description}
        </Typography>
      </Box>
    </Stack>
  </Button>
);

const EmptySnapshotState = ({ preview }: { preview?: StudentDashboardPreview }) => (
  <Card sx={{ p: 2 }}>
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
        <Typography variant="subtitle1">
          {isDashboardRefreshing(preview?.status)
            ? 'Preparing reporting snapshot'
            : 'No reporting snapshot'}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {isDashboardRefreshing(preview?.status)
          ? 'The dashboard will update automatically when the saved snapshot is ready.'
          : 'Refresh to prepare the first saved reporting snapshot.'}
      </Typography>
    </Stack>
  </Card>
);

const DashboardSkeleton = () => (
  <Stack spacing={2}>
    <Stack spacing={0.75}>
      <Skeleton variant="text" width={260} height={42} />
      <Skeleton variant="text" width={420} />
    </Stack>
    <Grid container spacing={1.5}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Skeleton variant="rounded" height={146} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Skeleton variant="rounded" height={380} />
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <Skeleton variant="rounded" height={380} />
      </Grid>
    </Grid>
  </Stack>
);

export default StudentDashboardScreen;
