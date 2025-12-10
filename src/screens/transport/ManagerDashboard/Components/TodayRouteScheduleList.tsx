import { Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

const TodayRouteScheduleList = () => (
  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Typography variant="h6">Today’s Route Timings</Typography>

    <CustomizableTable
      tableId="TR_MGR_TABLE_TODAY_ROUTE_SCHEDULE"
      columns={[
        { id: 'route', label: 'Route' },
        { id: 'startTime', label: 'Start Time', align: 'left' },
        { id: 'driver', label: 'Driver', align: 'left' },
        { id: 'vehicleNo', label: 'Vehicle No.', align: 'left' },
      ]}
      data={[
        {
          id: 1,
          route: 'Route 1 - City Center',
          startTime: '07:15 AM',
          driver: 'Ramesh Solanki',
          vehicleNo: 'GJ 01 AB 1123',
        },
        {
          id: 2,
          route: 'Route 5 - Paldi',
          startTime: '07:30 AM',
          driver: 'Mahesh Patel',
          vehicleNo: 'GJ 01 CD 2244',
        },
        {
          id: 3,
          route: 'Route 12 - Maninagar',
          startTime: '07:45 AM',
          driver: 'Sunil Chauhan',
          vehicleNo: 'GJ 01 EF 8899',
        },
        {
          id: 4,
          route: 'Route 8 - SG Highway',
          startTime: '08:00 AM',
          driver: 'Ketan Arora',
          vehicleNo: 'GJ 01 GH 5521',
        },
        {
          id: 5,
          route: 'Route 3 - Satellite',
          startTime: '08:15 AM',
          driver: 'Rajat Sharma',
          vehicleNo: 'GJ 01 JK 7700',
        },
      ]}
    />
  </Card>
);

export default TodayRouteScheduleList;
