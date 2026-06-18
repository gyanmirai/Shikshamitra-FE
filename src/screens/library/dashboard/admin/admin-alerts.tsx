import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Typography, CardHeader, IconButton } from '@mui/material';

export const DEFAULTERS: { id: number; name: string; books: number; days: number }[] = [];
export const OVERDUE_BOOKS: { id: number; title: string; member: string; days: number }[] = [];
export const HIGH_DEMAND: { id: number; title: string; requests: number }[] = [];
export const LOW_STOCK: { id: number; title: string; stock: number }[] = [];

export interface AlertItemProps {
  title: string;
  subtitle: string;
  info: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'default';
  icon: string;
  isCritical?: boolean;
}

const severityToStatus = (
  severity?: string
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const value = (severity || '').toLowerCase();
  if (value === 'critical' || value === 'error') return 'error';
  if (value === 'warning') return 'warning';
  if (value === 'success') return 'success';
  if (value === 'info') return 'info';
  return 'default';
};

export const getSeverityStatus = (days: number): 'warning' | 'error' | 'default' => {
  if (days >= 8) return 'error';
  if (days >= 3) return 'warning';
  return 'default';
};

const alertIcon = (type?: string) => {
  const value = (type || '').toLowerCase();
  if (value.includes('overdue')) return 'solar:alarm-linear';
  if (value.includes('reservation')) return 'solar:calendar-mark-linear';
  if (value.includes('charge')) return 'solar:wallet-money-linear';
  if (value.includes('stock')) return 'solar:box-linear';
  return 'solar:info-circle-linear';
};

export const AlertItem = ({ title, subtitle, info, status, icon, isCritical }: AlertItemProps) => {
  const theme = useTheme();

  const getStatusColor = () => {
    if (isCritical || status === 'error') return theme.palette.error.main;
    if (status === 'warning') return theme.palette.warning.main;
    if (status === 'info') return theme.palette.info.main;
    if (status === 'primary') return theme.palette.primary.main;
    if (status === 'secondary') return theme.palette.secondary.main;
    if (status === 'success') return theme.palette.success.main;
    return theme.palette.text.secondary;
  };

  const statusColor = getStatusColor();

  const getStatusIcon = () => {
    if (status === 'error' || isCritical) return 'solar:danger-circle-linear';
    if (status === 'warning') return 'solar:clock-circle-linear';
    if (status === 'success') return 'solar:check-circle-linear';
    return 'solar:info-circle-linear';
  };

  return (
    <Box
      sx={{
        mb: 1,
        p: 1,
        borderRadius: 1,
        position: 'relative',
        border: `1px solid ${alpha(statusColor, 0.1)}`,
        borderLeft: `4px solid ${statusColor}`,
        transition: theme.transitions.create(['background-color', 'transform']),
        '&:hover': {
          bgcolor: alpha(statusColor, 0.08),
          transform: 'translateX(4px)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon={icon} width={24} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
              {info}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <Iconify icon={getStatusIcon()} width={16} sx={{ color: statusColor }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {subtitle}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

const SummaryStrip = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const items = [
    {
      label: `${overview?.circulation.overdueIssues || 0} Overdue`,
      icon: 'solar:alarm-linear',
      color: 'error.main',
    },
    {
      label: `${overview?.reservations.activeReservations || 0} Reservations`,
      icon: 'solar:calendar-mark-linear',
      color: 'info.main',
    },
    {
      label: `${overview?.stockTotals.damagedCopies || 0} Damaged`,
      icon: 'solar:shield-warning-linear',
      color: 'warning.main',
    },
  ];

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        px: 3,
        py: 1.5,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
      }}
    >
      {items.map((item) => (
        <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
          <Iconify icon={item.icon} width={16} sx={{ color: item.color }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

const AdminAlerts = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const alerts = overview?.alerts || [];

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        mb: 2,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="h6">Operational Alerts</Typography>
            <CustomTooltip
              title="Important Library notifications requiring attention"
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        subheader="Live backend signals"
        sx={{ mb: 1, mt: -1, ml: -1 }}
      />

      <SummaryStrip overview={overview} />

      <Scrollbar sx={{ px: 1, pb: 1, height: 420 }}>
        <Stack spacing={0} sx={{ pt: 2 }}>
          {alerts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No operational alerts right now.
              </Typography>
            </Box>
          ) : (
            alerts.map((item: any, index: number) => (
              <AlertItem
                key={`${item.type}-${index}`}
                title={item.title}
                subtitle={item.message}
                info={item.count ? `${item.count}` : ''}
                status={severityToStatus(item.severity)}
                isCritical={severityToStatus(item.severity) === 'error'}
                icon={alertIcon(item.type)}
              />
            ))
          )}
        </Stack>
      </Scrollbar>
    </Card>
  );
};

export default AdminAlerts;
