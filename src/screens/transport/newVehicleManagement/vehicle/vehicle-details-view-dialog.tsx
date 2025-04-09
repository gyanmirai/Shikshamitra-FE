import React from 'react';

import InfoIcon from '@mui/icons-material/Info';
import RouteIcon from '@mui/icons-material/Route';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { Grid, Card, Stack, Avatar, Divider, Typography, CardContent } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IViewVehicleDetailsDialogProps } from '../interface/vehicle-interface';

const ViewVehicleDetailsDialog: React.FC<IViewVehicleDetailsDialogProps> = ({ vehicle }) => {
  if (!vehicle) {
    return null;
  }
  return (
    <Grid container spacing={3}>
      {/* General Information */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} sx={{ bgcolor: '#E5F6FD', height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: '#0C53B7' }}>
                <DirectionsBusIcon sx={{ color: 'white' }} />
              </Avatar>
              <Typography color="#0B4F9C" variant="h6" fontWeight="bold">
                General Information
              </Typography>
            </Stack>
            <Divider sx={{ my: 1, borderColor: 'divider' }} />
            {[
              { label: 'Name', value: vehicle.name },
              { label: 'Type', value: vehicle.type },
              { label: 'Capacity', value: vehicle.capacity },
              { label: 'Occupied Seats', value: vehicle.occupied },
              { label: 'Fuel Type', value: vehicle.fuelType },
            ].map(({ label, value }) => (
              <Typography key={label} color="#0B4F9C" variant="body1">
                <strong>{label}:</strong> {value}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Insurance Details */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} sx={{ bgcolor: '#E8F5E9', height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: '#2E7D32' }}>
                <InfoIcon />
              </Avatar>
              <Typography color="#1B5E20" variant="h6">
                Insurance Details
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            {[
              { label: 'Policy Number', value: vehicle.insurance.policyNumber },
              { label: 'Provider', value: vehicle.insurance.provider },
              { label: 'Expiry Date', value: vehicle.insurance.expiryDate },
              { label: 'Coverage', value: vehicle.insurance.coverageDetails },
            ].map(({ label, value }) => (
              <Typography key={label} color="#1B5E20">
                <strong>{label}:</strong> {value}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Registration Details */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} sx={{ bgcolor: '#FFF3E0', height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: '#E65100' }}>
                <InfoIcon />
              </Avatar>
              <Typography color="#FF7043" variant="h6">
                Registration Details
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            {[
              { label: 'Number', value: vehicle.registrationNumber },
              { label: 'Registration Date', value: vehicle.registrationDate },
              { label: 'Expiry Date', value: vehicle.registrationExpiryDate },
            ].map(({ label, value }) => (
              <Typography key={label} color="#FF7043">
                <strong>{label}:</strong> {value}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Assigned Details */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} sx={{ bgcolor: '#EDE7F6', height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: '#4A148C' }}>
                <PersonIcon />
              </Avatar>
              <Typography color="#4A148C" variant="h6">
                Assigned Details
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            {[
              { label: 'Driver', value: vehicle.assignedDriver?.name || 'N/A' },
              { label: 'Route', value: vehicle.assignedRoute?.name || 'N/A' },
            ].map(({ label, value }) => (
              <Typography key={label} color="#673AB7">
                <strong>{label}:</strong> {value}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Assigned Students */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ bgcolor: '#F5F5F5' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: '#424242' }}>
                <RouteIcon />
              </Avatar>
              <Typography variant="h6" color="#616161">
                Assigned Students
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <CustomizableTable
              tableId="assigned-students"
              data={[
                {
                  name: 'Jay Desai',
                  standard: '10',
                  stop: 'Madhuram circle',
                  role: 'student',
                },
                {
                  name: 'Jay Desai',
                  standard: '-',
                  stop: 'Madhuram circle',
                  role: 'Teacher',
                },
              ]}
              columns={[
                { id: 'name', label: 'Name' },
                { id: 'standard', label: 'Standard' },
                { id: 'stop', label: 'Stop' },
                { id: 'role', label: 'Role' },
              ]}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ViewVehicleDetailsDialog;
