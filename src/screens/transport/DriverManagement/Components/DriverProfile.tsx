'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Card,
  Grid,
  Alert,
  Avatar,
  Button,
  Typography,
  IconButton,
  CardContent,
  DialogActions,
} from '@mui/material';

import type { IDriverConductor } from './type';

interface IDriverProfileProps {
  driverData: IDriverConductor | null;
  onClose: () => void;
}

const DriverProfile: React.FC<IDriverProfileProps> = ({ driverData, onClose }) => {
  if (!driverData) return null;

  // Calculate days until license expiry
  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = calculateDaysUntilExpiry(driverData.licenceExpiry);
  const isLicenseExpired = daysUntilExpiry < 0;
  const isLicenseExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

  return (
    <>
      <DialogScrollContent>
        <Box p={2}>
          {/* Header Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={driverData.avatarUrl || '/static/avatars/default-avatar.jpg'}
                  sx={{
                    width: 56,
                    height: 56,
                    border: '1px solid ',
                  }}
                >
                  {/* Fallback icon if no image */}
                  <Iconify icon="mdi:account" width={28} height={28} />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {driverData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employee ID: {driverData.employeeId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {driverData.experience} experience
                  </Typography>
                </Box>
                <Label
                  color={
                    driverData.status === 'Active'
                      ? 'success'
                      : driverData.status === 'On Leave'
                        ? 'error'
                        : 'default'
                  }
                >
                  {driverData.status}
                </Label>
              </Box>
            </CardContent>
          </Card>

          {/* License Expiry Alert */}
          {(isLicenseExpired || isLicenseExpiringSoon) && (
            <Alert
              severity="error"
              icon={<Iconify icon="mdi:alert-circle" width={20} height={20} />}
              sx={{ mb: 3 }}
              action={
                <IconButton size="small" color="inherit">
                  <Iconify icon="mdi:close" width={18} height={18} />
                </IconButton>
              }
            >
              {isLicenseExpired
                ? `License expired ${Math.abs(daysUntilExpiry)} days ago`
                : `License expiring in ${daysUntilExpiry} days`}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Contact Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="primary.main"
                    gutterBottom
                  >
                    Contact Information
                  </Typography>

                  <Box display="flex" alignItems="flex-start" gap={1} mb={1.5}>
                    <Iconify
                      icon="mdi:phone"
                      width={18}
                      height={18}
                      sx={{ color: 'text.secondary', mt: 0.3 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {driverData.phoneNo}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="flex-start" gap={1} mb={1.5}>
                    <Iconify
                      icon="mdi:email"
                      width={18}
                      height={18}
                      sx={{ color: 'text.secondary', mt: 0.3 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      dharmikjinjala2468@gmail.com
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Iconify
                      icon="mdi:map-marker"
                      width={18}
                      height={18}
                      sx={{ color: 'text.secondary', mt: 0.3 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      C-203 Drashti Residency Devadgaon
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* License & Employment */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="primary.main"
                    gutterBottom
                  >
                    Licence & Employment
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Licence No.
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        DL123456789
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Licence Expiry
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {driverData.licenceExpiry}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Joining Date
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        15-01-2025
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Experience
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {driverData.experience}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Current Route Assignment */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="primary.main"
                    gutterBottom
                    mb={2}
                  >
                    Current Route Assignment
                  </Typography>

                  {driverData.assignedRoute ? (
                    <Box
                      sx={{
                        backgroundColor: 'success.lighter',
                        border: '1px solid',
                        borderColor: 'success.light',
                        borderRadius: 1,
                        p: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {driverData.assignedRoute}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        backgroundColor: 'grey.50',
                        border: '1px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        p: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No route assigned
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="medium"
          startIcon={<Iconify icon="mdi:close" width={18} height={18} />}
        >
          Cancel
        </Button>
      </DialogActions>
    </>
  );
};

export default DriverProfile;
