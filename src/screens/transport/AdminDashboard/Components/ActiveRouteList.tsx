import { Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

const ActiveRouteList = () => (
  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Typography variant="h6">Active Route List</Typography>

    <CustomizableTable
      tableId="TR_ADMIN_TABLE_ACTIVE_ROUTES"
      columns={[
        { id: 'routeNo', label: 'Route No.' },
        { id: 'stopsCount', label: 'Stops Count' },
        { id: 'vehicle', label: 'Assigned Vehicle' },
      ]}
      data={[
        {
          id: 1,
          routeNo: 'R-12',
          stopsCount: 8,
          vehicle: 'Bus 21 – GJ 01 AB 1123',
        },
        {
          id: 2,
          routeNo: 'R-05',
          stopsCount: 5,
          vehicle: 'Bus 14 – GJ 01 CD 2244',
        },
        {
          id: 3,
          routeNo: 'R-03',
          stopsCount: 10,
          vehicle: 'Bus 19 – GJ 01 EF 8899',
        },
        {
          id: 4,
          routeNo: 'R-09',
          stopsCount: 6,
          vehicle: 'Bus 08 – GJ 01 GH 5521',
        },
        {
          id: 5,
          routeNo: 'R-01',
          stopsCount: 12,
          vehicle: 'Bus 05 – GJ 01 JK 7700',
        },
      ]}
    />
  </Card>
);

export default ActiveRouteList;
