'use client';

import React from 'react';

import {
  Box,
  alpha,
  Paper,
  Button,
  MenuList,
  MenuItem,
  TableCell,
  Typography,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';

import AssignRoom from './assignRoomDialog';
import AssignTeacher from './assignTeacherDialog';

const TimeTableCell = ({
  timeSlot,
  day,
  slotData,
  isBreak,
  onDrop,
  rowIndex,
  colIndex,
  item,
  onTeacherSelect,
  onRoomSelect,
  onDeleteSlot,
  isThreeDots = true,
}: any) => {
  console.log('slotData----', slotData);

  /**
   * Dialog state hooks for managing teacher and room assignment dialogs
   */
  const teacherDialog = useBoolean();
  const roomDialog = useBoolean();
  const deleteDialog = useBoolean();

  /**
   * Unique key for identifying the time slot based on time and day
   * @type {string}
   */
  const slotKey = `${timeSlot}-${day}`;

  /**
   * Handles the drag over event for the timetable cell
   * Prevents default behavior to allow dropping only if the cell is empty and not a break slot
   * @param e - The drag over event object
   */
  const handleDragOver = (e: any) => {
    // if (!isBreak && !slotData) {
    e.preventDefault();
    // }
  };

  /**
   * Handles the drop event for the timetable cell
   * Processes the drop action only if the cell is empty and not a break slot
   * Calls the onDrop callback with the event and cell location data
   * @param e - The drop event object
   */
  const handleDrop = (e: any) => {
    if (!isBreak && (!slotData || !slotData.subjects?.length)) {
      e.preventDefault();
      onDrop(e, item, rowIndex, colIndex);
    }
  };

  /**
   * Handles the drag start event for the timetable cell
   * Sets the drag data including subject details and source location
   * Only allows dragging if the cell has data and is not a break slot
   * @param e - The drag start event object
   */
  const handleDragStart = (e: any) => {
    if (!isBreak && slotData?.subjects?.length) {
      e.dataTransfer.setData('subject', JSON.stringify(slotData));
      e.dataTransfer.setData('rowIndex', rowIndex.toString());
      e.dataTransfer.setData('colIndex', colIndex.toString());
    }
  };

  /**
   * Renders a special break cell in the timetable
   * Displays a non-interactive cell with "Break" text and grey background
   * @returns {JSX.Element} Break cell component
   */
  if (isBreak) {
    return (
      <TableCell
        colSpan={6}
        sx={{
          bgcolor: 'grey.100',
          width: '14%',
          textAlign: 'center',
          padding: '4px',
          cursor: 'not-allowed',
        }}
      >
        <Typography color="text.secondary">Break</Typography>
      </TableCell>
    );
  }

  return (
    <TableCell
      sx={{
        height: 90,
        width: '14%',
        // '&:hover': { bgcolor: !slotData ? 'grey.50' : 'inherit' },

        // '&:hover': { bgcolor: !slotData ? 'grey.50' : 'inherit' },
        padding: '4px',
        cursor: slotData ? 'grab' : 'default',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      draggable={!!slotData?.subjects?.length}
      onDragStart={handleDragStart}
    >
      {slotData?.subjects?.length ? (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              height: '90%',
              bgcolor: alpha(slotData?.subjectColor, 0.2),
              position: 'relative',
              '& .action-menu': {
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
              },
              '&:hover .action-menu': {
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                position: 'relative',
              }}
            >
              <Typography variant="subtitle2" fontWeight="medium">
                {slotData.subjects.map((sub: any) => sub.subject).join('/')}
              </Typography>
              <Box className="action-menu">
                {isThreeDots && (
                  <ThreeDotsActions
                    placement="bottom-center"
                    onClickThreeDots={(e) => {
                      e.stopPropagation();
                    }}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      '& .MuiIconButton-root': {
                        padding: '4px',
                      },
                    }}
                    actions={({ popover }) => (
                      <MenuList>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            teacherDialog.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="mdi:teacher" sx={{ height: '18px', width: '18px' }} />
                          Teacher
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            roomDialog.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify
                            icon="mdi:google-classroom"
                            sx={{ height: '18px', width: '18px' }}
                          />
                          Room
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDialog.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify
                            icon={GlobalIcons.delete}
                            sx={{ height: '18px', width: '18px' }}
                            color="red"
                          />
                          Delete
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" color="text.secondary">
                {slotData?.subjects?.length
                  ? slotData.subjects.map((sub: any) => sub?.room || 'No Room').join('/')
                  : 'No Room'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {slotData?.subjects?.length
                  ? slotData.subjects.map((sub: any) => sub?.teacher || 'No Teacher').join('/')
                  : 'No Teacher'}
              </Typography>
            </Box>
          </Paper>

          <CustomDialog
            open={teacherDialog.value}
            handleClose={teacherDialog.onFalse}
            title="Assign Teacher"
            maxWidth="sm"
          >
            <AssignTeacher
              slotData={slotData}
              teacherDialog={teacherDialog}
              onTeacherSelect={(value) => {
                onTeacherSelect(value, rowIndex, colIndex);
                teacherDialog.onFalse();
              }}
            />
          </CustomDialog>

          <CustomDialog
            maxWidth="sm"
            open={roomDialog.value}
            handleClose={roomDialog.onFalse}
            title="Assign Room"
          >
            <AssignRoom
              roomDialog={roomDialog}
              slotData={slotData}
              onRoomSelect={(value) => {
                onRoomSelect(value, rowIndex, colIndex);
                roomDialog.onFalse();
              }}
            />
          </CustomDialog>

          <ConfirmDialog
            open={deleteDialog.value}
            onClose={() => {
              deleteDialog.onFalse();
            }}
            title="Delete"
            content="Are you sure you want to Delete Slot ?"
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  onDeleteSlot(rowIndex, colIndex);
                  deleteDialog.onFalse();
                }}
                // startIcon={<Iconify icon={GlobalIcons.delete} />}
              >
                Yes
              </Button>
            }
          />
        </>
      ) : null}
    </TableCell>
  );
};

export default TimeTableCell;
