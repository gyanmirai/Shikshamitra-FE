import { motion } from 'framer-motion';
import { Box, Grid, Typography } from '@mui/material';

import SeatBox from './SeatBox';

import type { IRoom, ISeat, ISeatAllocation, IStudentRoomAssignment } from '../type';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const SeatManagement = ({
  selectedRoom,
  assignedData,
  onStudentDrop,
  onStudentRemove,
  onSeatSwap,
}: {
  selectedRoom: IRoom;
  assignedData: ISeatAllocation[];
  onStudentDrop: (student: IStudentRoomAssignment, seatNumber: number) => void;
  onStudentRemove: (studentId: string | null) => void;
  onSeatSwap: (from: number, to: number) => void;
}) => {
  const roomRows = selectedRoom.rows ?? 6;
  const roomColumns = selectedRoom.columns ?? 2;
  const roomBenchCapacity = selectedRoom.benchCapacity ?? 2;

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
            studentName: undefined,
            standardName: undefined,
            rollNo: undefined,
          });
          seatNumber += 1;
        }
      }
    }
    return seats;
  };

  // Generate base seats and merge with assigned data
  const baseSeatList = generateDummySeats({
    rows: roomRows,
    columns: roomColumns,
    benchCapacity: roomBenchCapacity,
  });

  const seatList = baseSeatList.map((seat) => {
    const assigned = assignedData.find((s) => s.seatNumber === seat.seatNumber);
    if (assigned) {
      return {
        ...seat,
        isAssigned: true,
        studentId: assigned.studentId,
        studentName: assigned.studentName,
        standardName: assigned.standardName,
        rollNo: assigned.rollNo,
        benchId: assigned.benchId,
      };
    }
    return seat;
  });
  const allocatedCount = seatList.filter((s) => s.isAssigned).length;
  const emptyCount = seatList.length - allocatedCount;

  const handleSeatSwap = (fromSeatNumber: number, toSeatNumber: number) => {
    onSeatSwap(fromSeatNumber, toSeatNumber);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Seat Layout
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'success.main',
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.success.lighter}`,
              }}
            />
            <Typography variant="subtitle2" color="text.secondary">
              Allocated{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600, ml: 0.5 }}>
                {allocatedCount.toString().padStart(2, '0')}
              </Box>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
              }}
            />
            <Typography variant="subtitle2" color="text.secondary">
              Empty{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600, ml: 0.5 }}>
                {emptyCount}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          borderRadius: 2,
          bgcolor: 'background.default',
          border: 1,
          borderColor: 'divider',
          p: 3,
          '::-webkit-scrollbar': { width: 8 },
          '::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: 'grey.300' },
        }}
      >
        {/* NON-BREAKING: "Board" orientation indicator */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 4,
              py: 0.5,
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: (theme) => theme.palette.primary.main,
              color: 'primary.contrastText',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Board / Front
          </Box>
        </Box>

        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <Grid container spacing={4} justifyContent="center">
            {Array.from({ length: roomColumns }).map((_, colIdx) => {
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
                <Grid size={{ xs: 12, md: 6 }} key={`column-${colIdx}`}>
                  <motion.div variants={columnVariants}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.neutral',
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        align="center"
                        variant="overline"
                        sx={{
                          color: 'text.disabled',
                          fontWeight: 700,
                          letterSpacing: 1.2,
                          mb: 1,
                        }}
                      >
                        Column {colIdx + 1}
                      </Typography>

                      {benchNumbers.map((benchNo, rowIdx) => {
                        const benchSeats = benchesInColumn[benchNo];
                        benchSeats.sort((a, b) => a.seatNumber - b.seatNumber);

                        return (
                          <Box
                            key={`bench-${benchNo}-${colIdx}`}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            {/* NON-BREAKING: Row label */}
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.disabled',
                                fontWeight: 600,
                                fontSize: '0.62rem',
                                width: 36,
                                flexShrink: 0,
                                textAlign: 'right',
                              }}
                            >
                              R{rowIdx + 1}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flex: 1,
                                minWidth: 0,
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.06)',
                              }}
                            >
                              {benchSeats.map((seat) => (
                                <SeatBox
                                  key={`seat-${seat.seatNumber}`}
                                  seat={seat}
                                  onStudentDrop={onStudentDrop}
                                  onStudentRemove={onStudentRemove}
                                  onSeatSwap={handleSeatSwap}
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>
      </Box>
    </Box>
  );
};

export default SeatManagement;
