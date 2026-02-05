import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Tooltip, CardHeader, IconButton } from '@mui/material';

const LiveOperationsTable = () => (
  <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader
      title="Live Route Operations"
      action={
        <IconButton>
          <Iconify icon="mdi:refresh" />
        </IconButton>
      }
    />

    <Box sx={{ p: 2, flexGrow: 1 }}>
      <CustomizableTable
        tableId="TR_ADMIN_TABLE_LIVE_OPERATIONS"
        columns={[
          { id: 'routeNo', label: 'Route' },
          { id: 'status', label: 'Status' },
          { id: 'driver', label: 'Driver' },
          { id: 'vehicle', label: 'Vehicle' },
          { id: 'capacity', label: 'Cap. (%)' },
          { id: 'actions', label: 'Actions' },
        ]}
        data={[
          {
            id: 1,
            routeNo: 'R-12',
            status: <Label color="success">On Time</Label>,
            driver: 'Rajesh K.',
            vehicle: 'GJ 01 AB 1123',
            capacity: '42/50 (84%)',
            actions: (
              <Tooltip title="View Details">
                <IconButton size="small">
                  <Iconify icon="eva:eye-fill" />
                </IconButton>
              </Tooltip>
            ),
          },
          {
            id: 2,
            routeNo: 'R-05',
            status: <Label color="error">Delayed</Label>,
            driver: 'Suresh P.',
            vehicle: 'GJ 01 CD 2244',
            capacity: '30/50 (60%)',
            actions: (
              <Tooltip title="View Details">
                <IconButton size="small">
                  <Iconify icon="eva:eye-fill" />
                </IconButton>
              </Tooltip>
            ),
          },
          {
            id: 3,
            routeNo: 'R-03',
            status: <Label color="success">On Time</Label>,
            driver: 'Mahesh T.',
            vehicle: 'GJ 01 EF 8899',
            capacity: '48/50 (96%)',
            actions: (
              <Tooltip title="View Details">
                <IconButton size="small">
                  <Iconify icon="eva:eye-fill" />
                </IconButton>
              </Tooltip>
            ),
          },
          {
            id: 4,
            routeNo: 'R-09',
            status: <Label color="warning">Stopped</Label>,
            driver: 'Vikram S.',
            vehicle: 'GJ 01 GH 5521',
            capacity: '0/50 (0%)',
            actions: (
              <Tooltip title="View Details">
                <IconButton size="small">
                  <Iconify icon="eva:eye-fill" />
                </IconButton>
              </Tooltip>
            ),
          },
          {
            id: 5,
            routeNo: 'R-01',
            status: <Label color="success">On Time</Label>,
            driver: 'Anil M.',
            vehicle: 'GJ 01 JK 7700',
            capacity: '44/50 (88%)',
            actions: (
              <Tooltip title="View Details">
                <IconButton size="small">
                  <Iconify icon="eva:eye-fill" />
                </IconButton>
              </Tooltip>
            ),
          },
        ]}
      />
    </Box>
  </Card>
);

export default LiveOperationsTable;
