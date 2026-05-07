import React from 'react';
import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { RemoveCircle } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import type { ISeat, IStudentRoomAssignment } from '../type';

const SeatBox = ({
  seat,
  onStudentDrop,
  onStudentRemove,
  onSeatSwap,
}: {
  seat: ISeat;
  onStudentDrop: (student: IStudentRoomAssignment, seatNumber: number) => void;
  onStudentRemove: (studentId: string | null) => void;
  onSeatSwap: (fromSeatNumber: number, toSeatNumber: number) => void;
}) => {
  const theme = useTheme();

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
        if (fromSeat.isAssigned && !seat.isAssigned && fromSeat.studentId) {
          // First remove from old seat
          onStudentRemove(fromSeat.studentId);
          // Then add to new seat
          const studentToMove = {
            studentId: fromSeat.studentId,
            studentName: fromSeat.studentName,
            rollNo: fromSeat.rollNo,
            isSeatAllocate: false,
          };
          onStudentDrop(studentToMove, seat.seatNumber);
        }
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  return (
    <motion.div
      layout
      whileHover={seat.isAssigned ? { scale: 1.05 } : {}}
      whileTap={seat.isAssigned ? { scale: 0.95 } : {}}
      style={{ display: 'flex' }}
    >
      <Box
        draggable={seat.isAssigned} // Only occupied seats can be dragged
        onDragStart={(e: React.DragEvent) => {
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
          width: 140,
          height: 90,
          // Use sx tokens so MUI CSS-vars resolve correctly in both light & dark
          bgcolor:
            isDragOver && !seat.isAssigned
              ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
              : seat.isAssigned
                ? 'background.paper'
                : 'transparent',
          color: seat.isAssigned ? 'text.primary' : 'text.secondary',
          borderRadius: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border:
            isDragOver && !seat.isAssigned
              ? '2px dashed'
              : seat.isAssigned
                ? '1px solid'
                : '1px dashed',
          borderColor: isDragOver && !seat.isAssigned ? 'primary.main' : 'divider',
          cursor: seat.isAssigned ? 'move' : 'default',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: seat.isAssigned ? theme.customShadows?.card || 2 : 'none',
          '&:hover': {
            transform: seat.isAssigned ? 'translateY(-2px)' : 'none',
            boxShadow: seat.isAssigned ? 4 : 'none',
            borderColor: !seat.isAssigned ? 'text.disabled' : undefined,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 8,
            bgcolor: seat.isAssigned ? 'primary.main' : 'action.disabledBackground',
            color: seat.isAssigned ? 'primary.contrastText' : 'text.disabled',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '0.65rem',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {seat.seatNumber.toString().padStart(2, '0')}
        </Box>

        {seat.isAssigned && (
          <Box sx={{ width: '100%', px: 1.5, pt: 1 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ maxWidth: '100%', fontSize: '0.8rem', fontWeight: 600 }}
              >
                {seat.studentName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                    px: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {seat.standardName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                    px: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  Rank: {seat.rollNo}
                </Typography>
              </Box>
            </Box>

            <Box className="action-menu">
              <ThreeDotsActions
                placement="bottom-center"
                onClickThreeDots={(e) => {
                  e.stopPropagation();
                }}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  zIndex: 1,
                  width: 24,
                  height: 24,
                  '& .MuiSvgIcon-root': { fontSize: 16 },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStudentDialog.onTrue();
                        popover.onClose();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <RemoveCircle sx={{ width: 18, height: 18, mr: 1 }} />
                      Remove Student
                    </MenuItem>
                  </MenuList>
                )}
              />
            </Box>
          </Box>
        )}

        {isDragOver && !seat.isAssigned && (
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Drop Here
          </Typography>
        )}

        {/* NON-BREAKING: improved empty seat indicator */}
        {!seat.isAssigned && !isDragOver && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: '1.5px dashed',
                borderColor: 'text.disabled',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'text.disabled',
                  opacity: 0.4,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem' }}>
              Drag to assign
            </Typography>
          </Box>
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
              onClick={() => {
                onStudentRemove(seat?.studentId);
                removeStudentDialog.onFalse();
              }}
            >
              Remove
            </Button>
          }
        />
      </Box>
    </motion.div>
  );
};

export default SeatBox;
