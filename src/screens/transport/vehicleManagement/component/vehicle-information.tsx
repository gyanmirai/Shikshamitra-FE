import React from 'react';
import { Card, Grid, Typography } from '@mui/material';

// import CustomizableTable from 'src/components/customizabaleTable';

interface VehicleInformationProps {
  vehicleData: any;
}

// interface MaintenanceRecord {
//   vehicleNumber: string;
//   serviceDetails: string;
//   nextScheduledMaintenance: string;
// }

// interface MaintenanceRecord {
//   vehicleNumber: string;
//   serviceDetails: string;
//   maintenanceDate: string;
//   nextScheduledMaintenance: string;
// }

// const maintenanceRecords: MaintenanceRecord[] = [
//   {
//     vehicleNumber: 'V001',
//     serviceDetails: 'Oil change, tire rotation, brake inspection',
//     maintenanceDate: '2024-06-10',
//     nextScheduledMaintenance: '2024-12-15',
//   },
//   {
//     vehicleNumber: 'V002',
//     serviceDetails: 'Full service, transmission check, coolant flush',
//     maintenanceDate: '2024-05-20',
//     nextScheduledMaintenance: '2024-11-30',
//   },
//   {
//     vehicleNumber: 'V003',
//     serviceDetails: 'Brake pad replacement, battery check',
//     maintenanceDate: '2024-03-15',
//     nextScheduledMaintenance: '2024-10-20',
//   },
//   {
//     vehicleNumber: 'V004',
//     serviceDetails: 'Engine tune-up, filter replacement',
//     maintenanceDate: '2024-01-25',
//     nextScheduledMaintenance: '2025-01-10',
//   },
//   {
//     vehicleNumber: 'V005',
//     serviceDetails: 'Tire replacement, alignment check',
//     maintenanceDate: '2024-07-08',
//     nextScheduledMaintenance: '2024-09-05',
//   },
// ];

// const columnData = [
//   { id: 'vehicleNumber', label: 'Vehicle Number' },
//   { id: 'dateOfMaintenance', label: 'Date Of Maintenance' },
//   { id: 'serviceDetails', label: 'Service Details' },
//   { id: 'nextScheduledMaintenance', label: 'Next Schedule Maintenance' },
// ];

const VehicleInformation: React.FC<VehicleInformationProps> = ({ vehicleData }) => (
  // console.log("vehicleData",vehicleData)
  <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
    <Grid container spacing={2}>
      <Grid size={6}>
        <Typography variant="subtitle2">Vehicle Registration Number:</Typography>
        <Typography variant="body2">{vehicleData.vehicleNumber}</Typography>
      </Grid>
      <Grid size={6}>
        <Typography variant="subtitle2">Model:</Typography>
        <Typography variant="body2">{vehicleData.model}</Typography>
      </Grid>
      <Grid size={6}>
        <Typography variant="subtitle2">Capacity:</Typography>
        <Typography variant="body2">{vehicleData.capacity}</Typography>
      </Grid>
      <Grid size={6}>
        <Typography variant="subtitle2">Assigned Driver:</Typography>
        <Typography variant="body2">{vehicleData.driver}</Typography>
      </Grid>
    </Grid>
  </Card>
);
export default VehicleInformation;
