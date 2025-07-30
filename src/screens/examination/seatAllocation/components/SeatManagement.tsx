import { Box, Grid, Typography } from '@mui/material';

import SeatBox from './SeatBox';

import type { ISeat } from '../type';

const SeatManagement = ({
  selectedRoom,
  assignedData,
  onStudentDrop,
  onStudentRemove,
  onSeatSwap,
}: {
  selectedRoom: any;
  assignedData: any[];
  onStudentDrop: (student: any, seatNumber: number) => void;
  onStudentRemove: (studentId: number | null) => void;
  onSeatSwap: (from: number, to: number) => void;
}) => {
  console.log('assignedData--', assignedData);

  const generateDummySeats = (room: { rows: number; columns: number; benchCapacity: number }) => {
    const seats: ISeat[] = [];
    let seatNumber = 1;

    // Generate seats column by column, then row by row within each column
    for (let col = 0; col < room.columns; col += 1) {
      for (let row = 0; row < room.rows; row += 1) {
        for (let i = 0; i < room.benchCapacity; i += 1) {
          seats.push({
            seatNumber,
            benchNumber: Math.ceil(seatNumber / room.benchCapacity),
            row,
            column: col,
            isAssigned: false,
            studentId: null,
            studentName: undefined, // Add missing properties
            class: undefined,
            rollNo: undefined,
          });
          seatNumber += 1;
        }
      }
    }
    return seats;
  };

  // Generate base seats and merge with assigned data
  const baseSeatList = generateDummySeats(selectedRoom);

  const seatList = baseSeatList.map((seat) => {
    const assigned = assignedData.find((s) => s.seatNumber === seat.seatNumber);
    if (assigned) {
      return {
        ...seat,
        isAssigned: true,
        studentId: assigned.studentId,
        studentName: assigned.studentName,
        class: assigned.class,
        rollNo: assigned.rollNo,
      };
    }
    return seat;
  });
  const allocatedCount = seatList.filter((s) => s.isAssigned).length;
  const emptyCount = seatList.length - allocatedCount;

  const handleSeatSwap = (fromSeatNumber: number, toSeatNumber: number) => {
    onSeatSwap(fromSeatNumber, toSeatNumber);
  };

  console.log('seatList---', seatList);

  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h6">Seat Layout</Typography>
      <Box sx={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
        <Grid container spacing={2}>
          {Array.from({ length: selectedRoom.columns }).map((_, colIdx) => {
            // Filter seats for this column and group by bench
            const columnSeats = seatList.filter((s) => s.column === colIdx);

            // Group seats by bench number
            const benchesInColumn = columnSeats.reduce((acc: Record<number, ISeat[]>, seat) => {
              if (!acc[seat.benchNumber]) acc[seat.benchNumber] = [];
              acc[seat.benchNumber].push(seat);
              return acc;
            }, {});

            // Sort bench numbers numerically
            const benchNumbers = Object.keys(benchesInColumn)
              .map(Number)
              .sort((a, b) => a - b);

            return (
              <Grid item xs={6} key={`column-${colIdx}`}>
                <Typography align="center" variant="subtitle2" sx={{ mb: 2 }}>
                  Column {colIdx + 1}
                </Typography>

                {benchNumbers.map((benchNo) => {
                  const benchSeats = benchesInColumn[benchNo];
                  // Sort seats within bench by seat number
                  benchSeats.sort((a, b) => a.seatNumber - b.seatNumber);

                  return (
                    <Box
                      key={`bench-${benchNo}-${colIdx}`}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        gap: 1,
                      }}
                    >
                      {benchSeats.map((seat) => (
                        <SeatBox
                          key={`seat-${seat.seatNumber}`} // Use unique seat number as key
                          seat={seat}
                          onStudentDrop={onStudentDrop}
                          onStudentRemove={onStudentRemove}
                          onSeatSwap={handleSeatSwap}
                        />
                      ))}
                    </Box>
                  );
                })}
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,

          // borderTop: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: 'success.main',
              boxShadow: 1,
            }}
          />
          <Typography variant="subtitle2">
            Allocated ({allocatedCount.toString().padStart(2, '0')})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f2f2f2', boxShadow: 1 }}
          />
          <Typography variant="subtitle2">Empty ({emptyCount})</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SeatManagement;
