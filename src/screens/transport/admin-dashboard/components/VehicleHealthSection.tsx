'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Card,
  Grid,
  Stack,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// ----------------------------------------------------------------------

interface VehicleHealth {
  id: string;
  vehicleNo: string;
  model: string;
  insuranceDaysLeft: number;
  pucDaysLeft: number;
  serviceDuePct: number; // 0–100, higher = more overdue
  fuelPct: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

const VEHICLES: VehicleHealth[] = [
  {
    id: 'v1',
    vehicleNo: 'GJ 01 AB 1123',
    model: 'Tata Starbus 50',
    insuranceDaysLeft: 45,
    pucDaysLeft: 12,
    serviceDuePct: 30,
    fuelPct: 72,
    status: 'Active',
  },
  {
    id: 'v2',
    vehicleNo: 'GJ 01 CD 2244',
    model: 'Ashok Leyland Lynx',
    insuranceDaysLeft: 5,
    pucDaysLeft: 60,
    serviceDuePct: 85,
    fuelPct: 45,
    status: 'Active',
  },
  {
    id: 'v3',
    vehicleNo: 'GJ 01 EF 8899',
    model: 'Tata Starbus 50',
    insuranceDaysLeft: 120,
    pucDaysLeft: 90,
    serviceDuePct: 15,
    fuelPct: 88,
    status: 'Active',
  },
  {
    id: 'v4',
    vehicleNo: 'GJ 01 GH 5521',
    model: 'Force Traveller 26',
    insuranceDaysLeft: 8,
    pucDaysLeft: 3,
    serviceDuePct: 95,
    fuelPct: 20,
    status: 'Maintenance',
  },
  {
    id: 'v5',
    vehicleNo: 'GJ 01 JK 7700',
    model: 'Tata Starbus 40',
    insuranceDaysLeft: 200,
    pucDaysLeft: 150,
    serviceDuePct: 10,
    fuelPct: 95,
    status: 'Active',
  },
  {
    id: 'v6',
    vehicleNo: 'GJ 01 MN 3344',
    model: 'Ashok Leyland Lynx',
    insuranceDaysLeft: 14,
    pucDaysLeft: 7,
    serviceDuePct: 70,
    fuelPct: 55,
    status: 'Maintenance',
  },
];

const getDaysColor = (days: number): { color: string; bg: string; label: string } => {
  if (days <= 7) return { color: '#FF4842', bg: '#FFE9D0', label: 'Critical' };
  if (days <= 15) return { color: '#FFC107', bg: '#FFF8E1', label: 'Expiring Soon' };
  return { color: '#00AB55', bg: '#C8FAD6', label: 'OK' };
};

// ----------------------------------------------------------------------

const VehicleHealthItem = ({ vehicle }: { vehicle: VehicleHealth }) => {
  const theme = useTheme();

  const isMaintenance = vehicle.status === 'Maintenance';
  const minDays = Math.min(vehicle.insuranceDaysLeft, vehicle.pucDaysLeft);
  const statusInfo = getDaysColor(minDays);

  // Determine border color based on status or expiry urgency
  const borderColor = isMaintenance ? theme.palette.error.main : statusInfo.color;
  const bgColor = isMaintenance ? alpha(theme.palette.error.main, 0.08) : alpha(borderColor, 0.08);

  const icon = isMaintenance ? 'arcticons:samsung-self-repair-assistant' : 'solar:bus-linear';

  return (
    <Box
      sx={{
        mb: 1,
        p: 1.5,
        borderRadius: 1,
        position: 'relative',
        border: `1px solid ${alpha(borderColor, 0.2)}`,
        borderLeft: `4px solid ${borderColor}`,
        transition: theme.transitions.create(['transform', 'background-color']),
        '&:hover': {
          bgcolor: alpha(borderColor, 0.04),
          transform: 'translateX(4px)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Icon Box */}
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: bgColor,
            color: borderColor,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>

        {/* Info */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {vehicle.vehicleNo}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {vehicle.model}
              </Typography>
            </Box>

            {/* Status / Expiry Tag */}
            <Stack alignItems="flex-end">
              {isMaintenance ? (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon="solar:wrench-linear" width={14} sx={{ color: 'error.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                    Maintenance
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify
                    icon={minDays <= 15 ? 'solar:clock-circle-linear' : 'solar:check-circle-linear'}
                    width={14}
                    sx={{ color: statusInfo.color }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: statusInfo.color }}>
                    {minDays <= 15
                      ? `${minDays} days left (${
                          vehicle.insuranceDaysLeft <= 15 ? 'Insurance' : 'PUC'
                        })`
                      : 'Compliant'}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>

          {/* Secondary Info Line (optional, e.g. service due) */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Service Due: <strong>{vehicle.serviceDuePct}%</strong>
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

const VehicleHealthColumn = ({
  title,
  vehicles,
  icon,
  color,
}: {
  title: string;
  vehicles: VehicleHealth[];
  icon: string;
  color: string;
}) => (
  <Box>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
      <Iconify icon={icon} width={20} sx={{ color }} />
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.disabled' }}>
        {title} ({vehicles.length})
      </Typography>
    </Stack>
    <Stack spacing={0}>
      {vehicles.map((vehicle) => (
        <VehicleHealthItem key={vehicle.id} vehicle={vehicle} />
      ))}
      {vehicles.length === 0 && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
          No vehicles in this category.
        </Typography>
      )}
    </Stack>
  </Box>
);

const VehicleHealthSection = () => {
  const theme = useTheme();

  const totalVehicles = VEHICLES.length;
  const underMaintenanceCount = VEHICLES.filter((v) => v.status === 'Maintenance').length;
  const insuranceExpiringSoonCount = VEHICLES.filter((v) => v.insuranceDaysLeft <= 15).length;
  const pucExpiringSoonCount = VEHICLES.filter((v) => v.pucDaysLeft <= 15).length;

  // Group vehicles
  const maintenanceVehicles = VEHICLES.filter((v) => v.status === 'Maintenance');
  const expiringVehicles = VEHICLES.filter(
    (v) => v.status !== 'Maintenance' && (v.insuranceDaysLeft <= 15 || v.pucDaysLeft <= 15)
  );
  const compliantVehicles = VEHICLES.filter(
    (v) => v.status !== 'Maintenance' && v.insuranceDaysLeft > 15 && v.pucDaysLeft > 15
  );

  return (
    <Box>
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Vehicle Health & Compliance
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Fleet status, expiry countdowns, and maintenance tracking
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={1} sx={{ mb: 2, mt: 1 }}>
          {[
            {
              label: 'Total Fleet',
              value: totalVehicles,
              icon: 'solar:bus-linear',
              color: '#00AB55',
              bg: '#C8FAD6',
            },
            {
              label: 'Under Maintenance',
              value: underMaintenanceCount,
              icon: 'arcticons:samsung-self-repair-assistant',
              color: '#FF4842',
              bg: '#FFE9D0',
            },
            {
              label: 'Insurance Expiring',
              value: insuranceExpiringSoonCount,
              icon: 'solar:shield-warning-linear',
              color: '#FFC107',
              bg: '#FFF8E1',
            },
            {
              label: 'PUC Expiring',
              value: pucExpiringSoonCount,
              icon: 'solar:document-text-linear',
              color: '#FFC107',
              bg: '#FFF8E1',
            },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
              <Card
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={item.icon} width={22} sx={{ color: item.color }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}
                  >
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Vehicle Health List Accordion with 3 Columns */}
        <Accordion
          defaultExpanded
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            '&:before': { display: 'none' },
            boxShadow: 'none',
            mt: 2,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Per-Vehicle Health Monitor
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Sorted by urgency — vehicles expiring soon appear first
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <VehicleHealthColumn
                  title="Under Maintenance"
                  vehicles={maintenanceVehicles}
                  icon="arcticons:samsung-self-repair-assistant"
                  color={theme.palette.error.main}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <VehicleHealthColumn
                  title="Expiring Soon"
                  vehicles={expiringVehicles}
                  icon="solar:clock-circle-linear"
                  color={theme.palette.warning.main}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <VehicleHealthColumn
                  title="Compliant"
                  vehicles={compliantVehicles}
                  icon="solar:check-circle-linear"
                  color={theme.palette.success.main}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Card>
    </Box>
  );
};

export default VehicleHealthSection;
