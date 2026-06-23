'use client';

import type {
  ClassManagementDashboardData,
  ClassManagementDashboardAlert,
  ClassManagementDashboardAction,
  ClassManagementDashboardMetric,
  ClassManagementDashboardProgress,
  ClassManagementDashboardWorkload,
  ClassManagementDashboardClassRisk,
} from 'src/redux/classManagementApi/dashboardApi/classManagementDashboardApi';

import { useMemo } from 'react';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { useGetClassManagementDashboardQuery } from 'src/redux/classManagementApi/dashboardApi/classManagementDashboardApi';
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Stack,
  Table,
  Button,
  Divider,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardHeader,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

type Props = {
  role: string;
  academicMediumId?: string;
};

const severityColor = (
  value?: string
): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' =>
  value === 'critical' || value === 'high' || value === 'error' || value === 'behind'
    ? 'error'
    : value === 'warning' || value === 'medium' || value === 'watch'
      ? 'warning'
      : value === 'success' || value === 'low' || value === 'on-track' || value === 'balanced'
        ? 'success'
        : 'info';

const severityTextColor = (value?: string) => `${severityColor(value)}.main`;

const metricIcon = (metric: ClassManagementDashboardMetric) => {
  const key = `${metric.id} ${metric.label}`.toLowerCase();

  if (key.includes('student')) return 'solar:users-group-rounded-bold-duotone';
  if (key.includes('teacher')) return 'solar:user-id-bold-duotone';
  if (key.includes('progress') || key.includes('course')) return 'solar:chart-2-bold-duotone';
  if (key.includes('risk') || key.includes('gap')) return 'solar:danger-triangle-bold-duotone';
  if (key.includes('elective')) return 'solar:clipboard-check-bold-duotone';

  return 'solar:notebook-bold-duotone';
};

export default function ClassManagementDashboardView({ role, academicMediumId }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } = useGetClassManagementDashboardQuery(
    {
      role,
      academicMediumId: academicMediumId ?? '',
    },
    {
      skip: !academicMediumId,
    }
  );

  if (!academicMediumId) {
    return (
      <Alert severity="info">
        Please select academic year, board and medium to view dashboard.
      </Alert>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        Unable to load class management dashboard.
      </Alert>
    );
  }

  const title =
    data.role === 'Teacher'
      ? 'Teacher Command Center'
      : data.role === 'Principal'
        ? 'Principal Class Overview'
        : 'Class Management Command Center';

  return (
    <Stack spacing={1}>
      <DashboardHeader
        title={title}
        data={data}
        isFetching={isFetching}
        onRefresh={() => refetch()}
      />

      <MetricGrid metrics={data.metrics} />

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ProgressPanel
            items={data.progressItems}
            trend={data.progressTrend}
            isFetching={isFetching}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <AlertsPanel alerts={data.alerts} onNavigate={(href) => href && router.push(href)} />
        </Grid>
      </Grid>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ClassRiskTable rows={data.classRisks} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ActionPanel actions={data.actions} onNavigate={(href) => router.push(href)} />
        </Grid>
      </Grid>

      <TeacherWorkloadPanel rows={data.teacherWorkload} />
    </Stack>
  );
}

function DashboardHeader({
  title,
  data,
  isFetching,
  onRefresh,
}: {
  title: string;
  data: ClassManagementDashboardData;
  isFetching: boolean;
  onRefresh: () => void;
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      {isFetching && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
          }}
        />
      )}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify icon="solar:command-bold-duotone" width={24} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role-wise operational view for class ownership, teacher coverage, course progress and
              capacity risks.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ minWidth: 180 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Health score
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {data.healthScore}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={data.healthScore}
              color={severityColor(data.healthScore >= 70 ? 'success' : 'warning') as any}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          <Chip
            label={data.healthLabel}
            color={severityColor(data.healthScore >= 70 ? 'success' : 'warning')}
            variant="soft"
          />
          <Button
            size="small"
            variant="outlined"
            onClick={onRefresh}
            disabled={isFetching}
            startIcon={
              isFetching ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Iconify icon="solar:refresh-bold" />
              )
            }
          >
            {isFetching ? 'Refreshing' : 'Refresh'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

function MetricGrid({ metrics }: { metrics: ClassManagementDashboardMetric[] }) {
  const theme = useTheme();

  return (
    <Grid container spacing={1}>
      {metrics.map((metric) => (
        <Grid key={metric.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.25,
                    display: 'grid',
                    placeItems: 'center',
                    color: severityTextColor(metric.severity),
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                  }}
                >
                  <Iconify icon={metricIcon(metric)} width={21} />
                </Box>
                <Chip
                  size="small"
                  variant="soft"
                  color={severityColor(metric.severity)}
                  label={metric.severity}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Stack>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {metric.value}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {metric.helper}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function ProgressPanel({
  items,
  trend,
  isFetching,
}: {
  items: ClassManagementDashboardProgress[];
  trend: ClassManagementDashboardData['progressTrend'];
  isFetching: boolean;
}) {
  const currentProgress = trend.actual.at(-1) ?? 0;

  return (
    <Card sx={{ height: '100%', boxShadow: 'none', position: 'relative', overflow: 'hidden' }}>
      {isFetching && (
        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }} />
      )}
      <CardHeader
        avatar={<PanelIcon icon="solar:chart-2-bold-duotone" />}
        title="Course Progress"
        subheader={`Current average ${currentProgress}% against planned milestone`}
      />
      <Stack spacing={1.75} sx={{ p: 2.5, pt: 1 }}>
        <Stack spacing={1}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Box>
                  <Typography variant="subtitle2">{item.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.subLabel}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${item.value}%`}
                  color={severityColor(item.status)}
                  variant="soft"
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={item.value}
                color={severityColor(item.status) as any}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          ))}
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Planned vs actual</Typography>
          {trend.labels.map((label, index) => (
            <Stack key={label} direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="caption" color="text.secondary" sx={{ width: 56 }}>
                {label}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={trend.actual[index] ?? 0}
                  sx={{ height: 6, borderRadius: 1, bgcolor: 'background.neutral' }}
                />
              </Box>
              <Typography variant="caption" sx={{ width: 70, textAlign: 'right' }}>
                {trend.actual[index] ?? 0}% / {trend.planned[index] ?? 0}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

function AlertsPanel({
  alerts,
  onNavigate,
}: {
  alerts: ClassManagementDashboardAlert[];
  onNavigate: (href?: string) => void;
}) {
  return (
    <Card sx={{ height: '100%', boxShadow: 'none' }}>
      <CardHeader
        avatar={<PanelIcon icon="solar:bell-bing-bold-duotone" />}
        title="Attention Needed"
        subheader="Priority issues and recommended action"
      />
      <Stack spacing={1} sx={{ p: 2.5, pt: 1 }}>
        {alerts.map((alert) => (
          <Box
            key={alert.id}
            sx={{
              p: 1.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Iconify
                    icon="solar:danger-triangle-bold-duotone"
                    width={20}
                    sx={{ color: severityTextColor(alert.severity), mt: 0.25, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography variant="subtitle2">{alert.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {alert.description}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  size="small"
                  label={alert.category}
                  color={severityColor(alert.severity)}
                  variant="soft"
                />
              </Stack>
              <Box sx={{ pl: 3.5 }}>
                <Button
                  size="small"
                  onClick={() => onNavigate(alert.actionHref)}
                  endIcon={<Iconify icon="solar:arrow-right-linear" width={15} />}
                >
                  {alert.actionLabel}
                </Button>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

function ClassRiskTable({ rows }: { rows: ClassManagementDashboardClassRisk[] }) {
  return (
    <Card sx={{ boxShadow: 'none' }}>
      <CardHeader
        avatar={<PanelIcon icon="solar:shield-warning-bold-duotone" />}
        title="Class Risk Review"
        subheader="Capacity, ownership and progress by division"
      />
      <Box sx={{ overflowX: 'auto', p: 2.5, pt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Class Teacher</TableCell>
              <TableCell>Risk</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Iconify
                      icon="solar:buildings-2-bold-duotone"
                      width={18}
                      sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        {row.className} - {row.divisionName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.riskReason}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  {row.students}/{row.capacity}
                </TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LinearProgress
                      variant="determinate"
                      value={row.courseProgress}
                      sx={{ flex: 1, height: 6, borderRadius: 1 }}
                    />
                    <Typography variant="caption">{row.courseProgress}%</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{row.classTeacher}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.riskLevel}
                    color={severityColor(row.riskLevel)}
                    variant="soft"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}

function ActionPanel({
  actions,
  onNavigate,
}: {
  actions: ClassManagementDashboardAction[];
  onNavigate: (href: string) => void;
}) {
  return (
    <Card sx={{ height: '100%', boxShadow: 'none' }}>
      <CardHeader
        avatar={<PanelIcon icon="solar:checklist-minimalistic-bold-duotone" />}
        title="Action Center"
        subheader="Work that needs ownership"
      />
      <Stack spacing={1} sx={{ p: 2.5, pt: 1 }}>
        {actions.map((action) => (
          <Box
            key={action.id}
            sx={{
              p: 1.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Iconify
                  icon="solar:clipboard-check-bold-duotone"
                  width={20}
                  sx={{ color: severityTextColor(action.priority), mt: 0.25, flexShrink: 0 }}
                />
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">{action.title}</Typography>
                    <Chip
                      size="small"
                      label={action.count}
                      variant="soft"
                      color={severityColor(action.priority)}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onNavigate(action.actionHref)}
                endIcon={<Iconify icon="solar:arrow-right-linear" width={15} />}
              >
                {action.actionLabel}
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

function TeacherWorkloadPanel({ rows }: { rows: ClassManagementDashboardWorkload[] }) {
  const visibleRows = useMemo(() => rows.filter((row) => row.id !== 'empty'), [rows]);

  return (
    <Card sx={{ boxShadow: 'none' }}>
      <CardHeader
        avatar={<PanelIcon icon="solar:user-id-bold-duotone" />}
        title="Teacher Workload"
        subheader="Balanced allocation across classes and subjects"
      />
      <Grid container spacing={1} sx={{ p: 2.5, pt: 1 }}>
        {(visibleRows.length ? visibleRows : rows).map((row) => (
          <Grid key={row.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                p: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify
                      icon="solar:user-rounded-bold-duotone"
                      width={18}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="subtitle2">{row.teacherName}</Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={row.status}
                    color={severityColor(row.status)}
                    variant="soft"
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {row.classes} classes / {row.subjects} subjects
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={row.loadScore}
                  color={severityColor(row.status === 'overloaded' ? 'warning' : 'success') as any}
                  sx={{ height: 7, borderRadius: 1 }}
                />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

function PanelIcon({ icon }: { icon: string }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1,
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.neutral',
        color: 'text.secondary',
      }}
    >
      <Iconify icon={icon} width={20} />
    </Box>
  );
}

function DashboardSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={112} />
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rounded" height={128} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={360} />
    </Stack>
  );
}
