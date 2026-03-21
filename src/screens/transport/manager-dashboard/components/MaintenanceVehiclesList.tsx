import { Scrollbar } from 'src/components/scrollbar';
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  TableContainer,
} from '@mui/material';

const MaintenanceVehiclesList = () => {
  const tableData = [
    {
      id: '1',
      vehicleNo: 'MH-12-AB-1234',
      issueType: 'Engine Overheat',
      expectedDate: '2023-11-01',
    },
    {
      id: '2',
      vehicleNo: 'MH-14-CD-5678',
      issueType: 'Brake Failure',
      expectedDate: '2023-11-05',
    },
  ];

  return (
    <Card id="TR_MGR_LIST_MAINTENANCE_VEHICLES">
      <CardHeader title="Vehicles in Maintenance" />
      <Scrollbar>
        <TableContainer sx={{ minWidth: 600, position: 'relative' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle No.</TableCell>
                <TableCell>Issue Type</TableCell>
                <TableCell>Expected Repair Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.vehicleNo}</TableCell>
                  <TableCell>{row.issueType}</TableCell>
                  <TableCell>{row.expectedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
};

export default MaintenanceVehiclesList;
