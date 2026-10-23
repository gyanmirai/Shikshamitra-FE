import { useMemo } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

interface RoomRow {
  roomId: string;
  roomName: string;
  occupied: number;
  usable: number;
  empty: number;
  utilization: number;
}

interface Props {
  rooms: RoomRow[];
  isLoading?: boolean;
}

export default function RoomAllocationSummary({ rooms, isLoading = false }: Props) {
  const columns = useMemo(
    () => [
      { id: 'roomName', label: 'Room', sticky: true, minWidth: 130 },
      { id: 'occupied', label: 'Students', filterType: 'number' as const },
      { id: 'usable', label: 'Usable Capacity', filterType: 'number' as const },
      { id: 'empty', label: 'Empty Seats', filterType: 'number' as const },
      {
        id: 'utilization',
        label: 'Utilization',
        filterType: 'string' as const,
        isFilter: true,
        isSort: false,
        minWidth: 140,
        render: (v: number) => (
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(v, 100)}
              color={v > 100 ? 'error' : v < 40 ? 'warning' : 'success'}
              sx={{ height: 5, borderRadius: 3, mb: 0.25 }}
            />
            <Typography variant="caption">{v}%</Typography>
          </Box>
        ),
      },
      {
        id: 'statusLabel',
        label: 'Status',
        filterType: 'string' as const,
        isFilter: true,
        isSort: false,
        sticky: true,
        stickyPosition: 'right' as const,
        minWidth: 110,
        render: (v: string) => (
          <Label
            color={v === 'Over capacity' ? 'error' : v === 'Underused' ? 'warning' : 'success'}
          >
            {v}
          </Label>
        ),
      },
    ],
    []
  );

  const data = useMemo(
    () =>
      rooms.map((room) => ({
        ...room,
        statusLabel:
          room.occupied > room.usable
            ? 'Over capacity'
            : room.utilization < 40
              ? 'Underused'
              : 'OK',
      })),
    [rooms]
  );

  return (
    <CustomizableTable
      tableId="room-allocation-summary"
      isLoading={isLoading}
      noDataText="No rooms assigned to this seating plan."
      columns={columns}
      data={data}
    />
  );
}
