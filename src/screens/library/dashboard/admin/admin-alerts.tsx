import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Button, Typography, CardHeader, IconButton } from '@mui/material';

import AlertsDrawer from './alerts-drawer';

export const DEFAULTERS = [
  { id: 1, name: 'Rahul', books: 3, days: 5 },
  { id: 2, name: 'Sneha', books: 2, days: 3 },
  { id: 3, name: 'Amit', books: 1, days: 10 },
];

export const OVERDUE_BOOKS = [
  { id: 1, title: 'Advanced Physics', member: 'Aryan', days: 12 },
  { id: 2, title: 'History of India', member: 'Priya', days: 8 },
];

export const HIGH_DEMAND = [
  { id: 1, title: 'JavaScript (Advanced)', requests: 12 },
  { id: 2, title: 'Atomic Habits', requests: 8 },
];

export const LOW_STOCK = [
  { id: 1, title: 'Introduction to Algorithms', stock: 2 },
  { id: 2, title: 'Database Systems', stock: 1 },
];

export interface AlertItemProps {
  title: string;
  subtitle: string;
  info: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'default';
  icon: string;
  isCritical?: boolean;
}

export const getSeverityStatus = (days: number): 'warning' | 'error' | 'default' => {
  if (days >= 8) return 'error';
  if (days >= 3) return 'warning';
  return 'default';
};

export const AlertItem = ({ title, subtitle, info, status, icon, isCritical }: AlertItemProps) => {
  const theme = useTheme();

  const getStatusColor = () => {
    if (isCritical || status === 'error') return theme.palette.error.main;
    if (status === 'warning') return theme.palette.warning.main;
    if (status === 'info') return theme.palette.info.main;
    if (status === 'primary') return theme.palette.primary.main;
    if (status === 'secondary') return theme.palette.secondary.main;
    return theme.palette.text.secondary;
  };

  const statusColor = getStatusColor();

  const getStatusIcon = () => {
    if (status === 'error' || isCritical) return 'solar:danger-circle-linear';
    if (status === 'warning') return 'solar:clock-circle-linear';
    if (status === 'info' || status === 'primary') return 'solar:info-circle-linear';
    return 'solar:check-circle-linear';
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

const SummaryStrip = () => (
  <Stack
    direction="row"
    spacing={2}
    sx={{
      px: 3,
      py: 1.5,
      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), // Softer background
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    {[
      { label: '12 Overdue', icon: 'solar:alarm-linear', color: 'error.main' },
      { label: '5 High Demand', icon: 'solar:star-linear', color: 'info.main' },
      { label: '3 Dead Stock', icon: 'solar:ghost-linear', color: 'warning.main' },
    ].map((item) => (
      <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
        <Iconify icon={item.icon} width={16} sx={{ color: item.color }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {item.label}
        </Typography>
      </Stack>
    ))}
  </Stack>
);

const AdminAlerts = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
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
                title="Important notifications requiring immediate attention"
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
          subheader="High priority tasks"
          sx={{ mb: 1, mt: -1, ml: -1 }}
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              onClick={handleOpenDrawer}
            >
              View All
            </Button>
          }
        />

        <SummaryStrip />

        <Scrollbar sx={{ px: 1, pb: 1, height: 420 }}>
          <Stack spacing={0}>
            <Typography
              variant="overline"
              sx={{ color: 'text.disabled', mt: 2, mb: 1, fontWeight: 800, display: 'block' }}
            >
              Top Defaulters
            </Typography>
            {DEFAULTERS.map((item) => (
              <AlertItem
                key={`def-${item.id}`}
                title={item.name}
                subtitle={`${item.books} books overdue`}
                info={`${item.days}d`}
                status={getSeverityStatus(item.days)}
                icon="solar:user-rounded-linear"
              />
            ))}

            <Typography
              variant="overline"
              sx={{ color: 'text.disabled', mt: 3, mb: 1, fontWeight: 800, display: 'block' }}
            >
              Overdue &gt; 7 Days
            </Typography>
            {OVERDUE_BOOKS.map((item) => (
              <AlertItem
                key={`ovr-${item.id}`}
                title={item.title}
                subtitle={item.member}
                info={`${item.days}d`}
                status="error"
                isCritical
                icon="solar:book-bookmark-linear"
              />
            ))}

            <Typography
              variant="overline"
              sx={{ color: 'text.disabled', mt: 3, mb: 1, fontWeight: 800, display: 'block' }}
            >
              High Demand
            </Typography>
            {HIGH_DEMAND.map((item) => (
              <AlertItem
                key={`dem-${item.id}`}
                title={item.title}
                subtitle="Waitlist items"
                info={`${item.requests} req`}
                status="info"
                icon="solar:star-linear"
              />
            ))}

            <Typography
              variant="overline"
              sx={{ color: 'text.disabled', mt: 3, mb: 1, fontWeight: 800, display: 'block' }}
            >
              Low Stock
            </Typography>
            {LOW_STOCK.map((item) => (
              <AlertItem
                key={`low-${item.id}`}
                title={item.title}
                subtitle="Less than 3 copies"
                info={`${item.stock} left`}
                status="error"
                icon="solar:box-linear"
              />
            ))}
          </Stack>
        </Scrollbar>
      </Card>

      <AlertsDrawer open={drawerOpen} onClose={handleCloseDrawer} />
    </>
  );
};

export default AdminAlerts;
