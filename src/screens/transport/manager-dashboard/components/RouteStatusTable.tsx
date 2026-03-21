import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Card,
  Chip,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  TableContainer,
} from '@mui/material';

const RouteStatusTable = () => {
  const tableData = [
    { route: 'R1', scheduled: '7:00', actual: '7:02', delay: '+2', status: 'On Time' },
    { route: 'R2', scheduled: '7:15', actual: '7:23', delay: '+8', status: 'Delayed' },
    { route: 'R3', scheduled: '7:20', actual: '—', delay: '—', status: 'Not Started' },
    { route: 'R4', scheduled: '7:30', actual: '7:30', delay: '0', status: 'On Time' },
    { route: 'R5', scheduled: '7:45', actual: '7:50', delay: '+5', status: 'Delayed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time':
        return 'success';
      case 'Delayed':
        return 'error';
      case 'Not Started':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader title="Today's Route Status" sx={{ mb: 2 }} />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 400 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Route</TableCell>
                <TableCell>Sch.</TableCell>
                <TableCell>Act.</TableCell>
                <TableCell>Delay</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.route}>
                  <TableCell>{row.route}</TableCell>
                  <TableCell>{row.scheduled}</TableCell>
                  <TableCell>{row.actual}</TableCell>
                  <TableCell
                    sx={{ color: row.status === 'Delayed' ? 'error.main' : 'text.primary' }}
                  >
                    {row.delay}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={getStatusColor(row.status) as any}
                      size="small"
                      variant="soft"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          View All Routes
        </Button>
      </Box>
    </Card>
  );
};

export default RouteStatusTable;
