import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  LinearProgress,
  TableContainer,
} from '@mui/material';

interface RoomRow {
  roomId: string;
  roomName: string;
  occupied: number;
  usable: number;
  empty: number;
  utilization: number;
}

export default function RoomAllocationSummary({ rooms }: { rooms: RoomRow[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Room</TableCell>
            <TableCell>Students</TableCell>
            <TableCell>Usable Capacity</TableCell>
            <TableCell>Empty Seats</TableCell>
            <TableCell>Utilization</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.roomId}>
              <TableCell>{room.roomName}</TableCell>
              <TableCell>{room.occupied}</TableCell>
              <TableCell>{room.usable}</TableCell>
              <TableCell>{room.empty}</TableCell>
              <TableCell sx={{ minWidth: 140 }}>
                <LinearProgress
                  variant="determinate"
                  value={room.utilization}
                  color={room.utilization > 100 ? 'error' : room.utilization < 40 ? 'warning' : 'success'}
                  sx={{ height: 5, borderRadius: 3, mb: 0.25 }}
                />
                <Typography variant="caption">{room.utilization}%</Typography>
              </TableCell>
              <TableCell>
                {room.occupied > room.usable ? 'Over capacity' : room.utilization < 40 ? 'Underused' : 'OK'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
