import React from 'react';

import { RemoveCircle } from '@mui/icons-material';
import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';

import type { ISeat, IStudentRoomAssignment } from '../type';

const SeatBox = ({
  seat,
  onStudentDrop,
  onStudentRemove,
  onSeatSwap,
}: {
  seat: ISeat;
  onStudentDrop: (student: IStudentRoomAssignment, seatNumber: number) => void;
  onStudentRemove: (studentId: number | null) => void;
  onSeatSwap?: (fromSeatNumber: number, toSeatNumber: number) => void;
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const removeStudentDialog = useBoolean();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    // Only allow drag over empty seats (for both student drops and seat moves)
    if (!seat.isAssigned) {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set dragOver to false if we're actually leaving the seat box
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dragDataString = e.dataTransfer.getData('application/json');
      if (!dragDataString) {
        return;
      }

      const dragData = JSON.parse(dragDataString);

      // Handle student drops (from student list to empty seats)
      if (dragData.type === 'student') {
        if (!seat.isAssigned) {
          onStudentDrop(dragData.student, seat.seatNumber);
        }
      }

      // Handle seat moving (occupied seat to empty seat)
      if (dragData.type === 'seat') {
        const fromSeat = dragData.seat;

        // Prevent drop on same seat
        if (fromSeat.seatNumber === seat.seatNumber) {
          return;
        }

        // Only allow move from occupied seat to empty seat
        if (fromSeat.isAssigned && !seat.isAssigned) {
          // First remove from old seat
          onStudentRemove(fromSeat.studentId);
          // Then add to new seat
          const studentToMove = {
            id: fromSeat.studentId,
            name: fromSeat.studentName,
            rollNo: fromSeat.rollNo,
            isRoomAssign: false,
          };
          onStudentDrop(studentToMove, seat.seatNumber);
        }
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const getBgColor = () => {
    // Only show drag over effect on empty seats
    if (isDragOver && !seat.isAssigned) return 'primary.light'; // Blue for drop zone
    if (seat.isAssigned) return 'success.main'; // Green for occupied
    return 'grey.200'; // Gray for empty
  };

  const getTextColor = () => {
    if (isDragOver) return 'white';
    if (seat.isAssigned) return 'white';
    return 'black';
  };

  const getBorderStyle = () => {
    if (isDragOver && !seat.isAssigned) return '2px dashed white'; // White dashed for drop zone
    return 'none';
  };

  return (
    <Box
      draggable={seat.isAssigned} // Only occupied seats can be dragged
      onDragStart={(e) => {
        if (seat.isAssigned) {
          const dragData = { type: 'seat', seat };
          e.dataTransfer.setData('application/json', JSON.stringify(dragData));
          e.dataTransfer.effectAllowed = 'move';
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        position: 'relative',
        width: 130,
        height: 80,
        bgcolor: getBgColor(),
        color: getTextColor(),
        textAlign: 'center',
        borderRadius: 1,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: getBorderStyle(),
        cursor: seat.isAssigned ? 'move' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: seat.isAssigned ? 'scale(1.02)' : 'none',
        },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        {seat.seatNumber.toString().padStart(2, '0')}
      </Typography>

      {seat.isAssigned && (
        <Box sx={{ width: '100%', position: 'relative' }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="caption" noWrap sx={{ maxWidth: '110px' }}>
              {seat.studentName}
            </Typography>
            <Typography variant="caption" noWrap sx={{ maxWidth: '110px', fontSize: '0.65rem' }}>
              Class : {seat.class} , Roll No. : {seat.rollNo}
            </Typography>
          </Box>

          <Box className="action-menu">
            <ThreeDotsActions
              placement="bottom-center"
              onClickThreeDots={(e) => {
                e.stopPropagation();
              }}
              sx={{
                position: 'absolute',
                top: -33,
                right: 2,
                zIndex: 1,
                '& .MuiIconButton-root': {
                  padding: '4px',
                },
              }}
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStudentDialog.onTrue();
                      popover.onClose();
                    }}
                  >
                    <RemoveCircle sx={{ width: '20px', height: '20px', color: 'error.main' }} />
                    Remove
                  </MenuItem>
                </MenuList>
              )}
            />
          </Box>
        </Box>
      )}

      {isDragOver && !seat.isAssigned && (
        <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 1 }}>
          Drop Here
        </Typography>
      )}

      <ConfirmDialog
        open={removeStudentDialog.value}
        onClose={() => {
          removeStudentDialog.onFalse();
        }}
        title="Remove Student"
        content={
          <>
            Are you sure you want to remove <strong>{seat.studentName}</strong> from seat{' '}
            {seat.seatNumber}?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              onStudentRemove(seat?.studentId);
              removeStudentDialog.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default SeatBox;
