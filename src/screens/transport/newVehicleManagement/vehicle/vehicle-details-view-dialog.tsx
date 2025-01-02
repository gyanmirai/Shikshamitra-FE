import React from 'react';

import InfoIcon from '@mui/icons-material/Info';
import RouteIcon from '@mui/icons-material/Route';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { Grid, Card, Stack, Avatar, Divider, Typography, CardContent } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

interface ViewVehicleDetailsDialogProps {
  vehicle: any;
}

const ViewVehicleDetailsDialog: React.FC<ViewVehicleDetailsDialogProps> = ({ vehicle }) => {
  if (!vehicle) {
    return null;
  }

  const stops = [
    {
      id: 'stop1',
      name: 'Navjeevan Circle',
      details: 'Near the central park.',
      students: [
        { id: 's1', name: 'John Doe' },
        { id: 's2', name: 'Jane Smith' },
      ],
    },
    {
      id: 'stop2',
      name: 'Madhuvan Circle',
      details: 'Next to the supermarket.',
      students: [
        { id: 's3', name: 'Alice Brown' },
        { id: 's4', name: 'Charlie Johnson' },
      ],
    },
    // {
    //     id: "stop3",
    //     name: "Stop C",
    //     details: "Near the school entrance.",
    //     students: [],
    // },
    // {
    //     id: "stop4",
    //     name: "Stop D",
    //     details: "Near the school entrance.",
    //     students: [],
    // },
    // {
    //     id: "stop5",
    //     name: "Stop E",
    //     details: "Near the school entrance.",
    //     students: [],
    // },
    // {
    //     id: "stop6",
    //     name: "Stop F",
    //     details: "Near the school entrance.",
    //     students: [],
    // },
  ];
  return (
    <Grid container spacing={3}>
      {/* General Information */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} style={{ backgroundColor: '#dfced4' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar style={{ backgroundColor: '#54182d' }}>
                <DirectionsBusIcon style={{ color: '#fff' }} />
              </Avatar>
              <Typography color="#5e3241" variant="h6" style={{ fontWeight: 'bold' }}>
                General Information
              </Typography>
            </Stack>
            <Divider sx={{ my: 1, borderColor: '#ddd' }} />
            <Typography color="#5e3241" variant="body1">
              <strong>Name:</strong> {vehicle.name}
            </Typography>

            <Typography color="#5e3241" variant="body1">
              <strong>Type:</strong> {vehicle.type}
            </Typography>

            <Typography color="#5e3241" variant="body1">
              <strong>Capacity:</strong> {vehicle.capacity}
            </Typography>

            <Typography color="#5e3241" variant="body1">
              <strong>Occupied Seats:</strong> {vehicle.occupied}
            </Typography>

            <Typography color="#5e3241" variant="body1">
              <strong>Fuel Type:</strong> {vehicle.fuelType}
            </Typography>

            {/* <Chip label={vehicle.currentStatus} color={vehicle.currentStatus === 'Active' ? 'success' : 'default'} size="small" sx={{ mt: 1 }} /> */}
          </CardContent>
        </Card>
      </Grid>

      {/* Insurance Details */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} style={{ backgroundColor: '#dfced4' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar style={{ backgroundColor: '#54182d' }}>
                <InfoIcon />
              </Avatar>
              <Typography color="#5e3241" variant="h6">
                Insurance Details
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Typography color="#5e3241">
              <strong>Policy Number:</strong> {vehicle.insurance.policyNumber}
            </Typography>
            <Typography color="#5e3241">
              <strong>Provider:</strong> {vehicle.insurance.provider}
            </Typography>
            <Typography color="#5e3241">
              <strong>Expiry Date: </strong>
              {vehicle.insurance.expiryDate}
            </Typography>
            <Typography color="#5e3241">
              <strong>Coverage:</strong> {vehicle.insurance.coverageDetails}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Registration Details */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} style={{ backgroundColor: '#dfced4' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar style={{ backgroundColor: '#54182d' }}>
                <InfoIcon />
              </Avatar>
              <Typography color="#5e3241" variant="h6">
                Registration Details
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Typography color="#5e3241">
              <strong>Number: </strong>
              {vehicle.registrationNumber}
            </Typography>
            <Typography color="#5e3241">
              <strong>Registration Date:</strong> {vehicle.registrationDate}
            </Typography>
            <Typography color="#5e3241">
              <strong>Expiry Date:</strong> {vehicle.registrationExpiryDate}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Assigned Details */}
      <Grid item xs={12} md={6}>
        <Card elevation={3} style={{ height: '100%', backgroundColor: '#dfced4' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar style={{ backgroundColor: '#54182d' }}>
                <PersonIcon />
              </Avatar>
              <Typography color="#5e3241" variant="h6">
                Assigned Details
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Typography color="#5e3241">
              <strong>Driver:</strong> {vehicle.assignedDriver?.name || 'N/A'}
            </Typography>
            <Typography color="#5e3241">
              <strong>Route: </strong>
              {vehicle.assignedRoute?.name || 'N/A'}
            </Typography>
            <Typography />
          </CardContent>
        </Card>
      </Grid>
      {/* <Grid item xs={12} md={12}> <RouteUI vehicleName="School Bus 1" stops={stops} /></Grid> */}
      {/* <Grid item xs={12} md={12}> <RouteWithStops vehicleName="School Bus 1" stops={stops} /></Grid> */}
      {/* Assigned Students */}
      <Grid item xs={12}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar>
                <RouteIcon />
              </Avatar>
              <Typography variant="h6">Assigned Students</Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <CustomizableTable
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
            {/* {vehicle.studentList && vehicle.studentList.length > 0 ? (
                                    <List>
                                        {vehicle.studentList.map((student: any, index: number) => (
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={student.name}
                                                    secondary={`ID: ${student.id}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography>No students assigned.</Typography>
                                )} */}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ViewVehicleDetailsDialog;
