import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetDriverConductorByIdQuery } from 'src/redux/transport/vehicle-management/driver-conductor-api';
import {
  Box,
  Card,
  Grid,
  Alert,
  Stack,
  Avatar,
  Divider,
  Typography,
  IconButton,
  CardContent,
  CircularProgress,
} from '@mui/material';

import type { IDriverConductor } from './type';

interface IDriverProfileProps {
  driverData: IDriverConductor | null;
  onClose: () => void;
}

// UI Helper for displaying info rows
type ColorType = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

const InfoRow = ({
  icon,
  label,
  value,
  isLink = false,
  color = 'primary',
}: {
  icon: string;
  label: string;
  value: string;
  isLink?: boolean;
  color?: ColorType;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: (theme) => varAlpha(theme.palette[color].mainChannel, 0.08),
        color: `${color}.main`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Iconify icon={icon} width={24} height={24} />
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: isLink ? 'primary.main' : 'text.primary',
          textDecoration: isLink ? 'underline' : 'none',
          cursor: isLink ? 'pointer' : 'default',
        }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const DriverProfile: React.FC<IDriverProfileProps> = ({ driverData, onClose }) => {
  const theme = useTheme();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  // Fetch detailed staff profile if staffId is available
  const { data: staffProfile, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDriverConductorByIdQuery,
    params: { staffId: driverData?.staffId || driverData?.id, academicMediumId: currentMedium?.id },
    options: { skip: !driverData?.id || !currentMedium?.id },
  });

  // Use fetched profile data if available, otherwise use prop data
  const profileData = staffProfile || driverData;

  if (!profileData) return null;
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="450px">
        <CircularProgress size={20} />
      </Box>
    );
  }

  // Calculate days until license expiry
  const calculateDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return Number.POSITIVE_INFINITY;
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (Number.isNaN(expiry.getTime())) return Number.POSITIVE_INFINITY;
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const licenceExpiry =
    profileData.licenceExpiry || profileData.licenceExpiryDate || profileData.licenseExpiryDate;
  const licenseNo = profileData.licenceNo || profileData.licenseNo || '-';
  const status =
    typeof profileData.status === 'number'
      ? profileData.status === 1
        ? 'On Leave'
        : profileData.status === 2
          ? 'Inactive'
          : 'Active'
      : profileData.status || profileData.statusName || 'Active';
  const daysUntilExpiry = calculateDaysUntilExpiry(licenceExpiry);
  const isLicenseExpired = daysUntilExpiry < 0;
  const isLicenseExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

  return (
    <Scrollbar sx={{ height: '450px', px: 2, py: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          position: 'relative',
          bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.04),
          border: `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.1)}`,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Avatar
          src={profileData.avatarUrl || '/static/avatars/default-avatar.jpg'}
          alt={profileData.name}
          sx={{
            width: 80,
            height: 80,
            border: `4px solid ${theme.palette.background.paper}`,
            boxShadow:
              theme.customShadows?.z8 ||
              `0 8px 16px 0 ${varAlpha(theme.palette.grey['500Channel'], 0.24)}`,
          }}
        >
          <Iconify icon="mdi:account" width={40} height={40} />
        </Avatar>

        <Box flex={1} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={{ xs: 'center', sm: 'flex-start' }}
            spacing={1}
            mb={0.5}
          >
            <Typography variant="h5" fontWeight={700}>
              {profileData.name}
            </Typography>
            <Label
              variant="soft"
              color={status === 'Active' ? 'success' : status === 'On Leave' ? 'error' : 'default'}
            >
              {status}
            </Label>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent={{ xs: 'center', sm: 'flex-start' }}
            spacing={2}
            sx={{ color: 'text.secondary' }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify icon="mdi:card-account-details-outline" width={16} />
              <Typography variant="body2">{profileData.employeeId}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify icon="mdi:briefcase-clock-outline" width={16} />
              <Typography variant="body2">{profileData.experience} Exp.</Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
            flexShrink: 0,
          }}
        >
          {profileData.assignedRoute ? (
            <>
              <Label color="success" variant="soft" sx={{ height: 22 }}>
                Active
              </Label>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
                  color: 'primary.dark',
                  border: `1px dashed ${varAlpha(theme.palette.primary.mainChannel, 0.2)}`,
                }}
              >
                <Iconify icon="mdi:bus-school" width={18} />
                <Typography variant="subtitle2">{profileData.assignedRoute}</Typography>
              </Box>
            </>
          ) : (
            <>
              <Label color="error" variant="soft" sx={{ height: 22 }}>
                Inactive
              </Label>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
                  color: 'primary.dark',
                  border: `1px dashed ${varAlpha(theme.palette.primary.mainChannel, 0.2)}`,
                }}
              >
                <Iconify icon="mdi:bus-school" width={18} />
                <Typography variant="subtitle2">No Route Assigned</Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* License Expiry Alert */}
      {(isLicenseExpired || isLicenseExpiringSoon) && (
        <Alert
          severity="error"
          variant="outlined"
          icon={<Iconify icon="mdi:alert-circle" width={24} />}
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <IconButton size="small" color="inherit" onClick={onClose}>
              <Iconify icon="mdi:close" width={18} />
            </IconButton>
          }
        >
          {isLicenseExpired
            ? `License expired ${Math.abs(daysUntilExpiry)} days ago`
            : `License expiring in ${daysUntilExpiry} days`}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="overline"
                sx={{ color: 'text.disabled', display: 'block', mb: 2, fontWeight: 700 }}
              >
                Contact Information
              </Typography>

              <InfoRow
                icon="mdi:phone"
                label="Phone Number"
                value={profileData.phoneNo}
                color="success"
              />
              <InfoRow
                icon="mdi:email"
                label="Email Address"
                value={profileData.email || ''}
                color="success"
              />
              <InfoRow
                icon="mdi:map-marker"
                label="Residence"
                value={profileData.address || ''}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* License & Employment */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="overline"
                sx={{ color: 'text.disabled', display: 'block', mb: 2, fontWeight: 700 }}
              >
                Employment Details
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      License No.
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {licenseNo}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Expiry Date
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ color: isLicenseExpiringSoon ? 'error.main' : 'inherit' }}
                    >
                      {licenceExpiry || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Joined On
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      15-01-2025
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Experience
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {profileData.experience}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Scrollbar>
  );
};

export default DriverProfile;
