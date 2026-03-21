import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Card,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  TableContainer,
} from '@mui/material';

const PendingApplicationsList = () => {
  const tableData = [
    {
      id: '1',
      student: 'Rahul Kumar',
      stop: 'Stop A',
      date: '2023-10-25',
      status: 'Pending',
    },
    {
      id: '2',
      student: 'Priya Singh',
      stop: 'Stop B',
      date: '2023-10-26',
      status: 'Pending',
    },
    {
      id: '3',
      student: 'Amit Patel',
      stop: 'Stop C',
      date: '2023-10-27',
      status: 'Pending',
    },
  ];

  return (
    <Card id="TR_MGR_LIST_PENDING_APPLICATIONS">
      <CardHeader title="Applications Pending Review" />
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Preferred Stop</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.student}</TableCell>
                  <TableCell>{row.stop}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <Label color="warning">{row.status}</Label>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success">
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error">
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
};

export default PendingApplicationsList;
