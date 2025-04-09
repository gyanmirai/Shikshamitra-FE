'use client';

import React from 'react';

import { Box, Paper, MenuList, MenuItem, TableCell, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';

import AssignRoom from './assignRoomDialog';
import AssignTeacher from './assignTeacherDialog';

import type { ITimeTableCellProps } from './type';

const TimeTableCell = ({
  timeSlot,
  day,
  slotData,
  isBreak,
  selectedRoom,
  onDrop,
  onTeacherSelect,
  onRoomSelect,
  onDeleteSlot,
}: ITimeTableCellProps) => {
  /**
   * Dialog state hooks for managing teacher and room assignment dialogs
   */
  const teacherDialog = useBoolean();
  const roomDialog = useBoolean();

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
    if (!isBreak && !slotData) {
      e.preventDefault();
    }
  };

  /**
   * Handles the drop event for the timetable cell
   * Processes the drop action only if the cell is empty and not a break slot
   * Calls the onDrop callback with the event and cell location data
   * @param e - The drop event object
   */
  const handleDrop = (e: any) => {
    if (!isBreak && !slotData) {
      e.preventDefault();
      onDrop(e, timeSlot, day);
    }
  };

  /**
   * Handles the drag start event for the timetable cell
   * Sets the drag data including subject details and source location
   * Only allows dragging if the cell has data and is not a break slot
   * @param e - The drag start event object
   */
  const handleDragStart = (e: any) => {
    if (!isBreak && slotData) {
      e.dataTransfer.setData('subject', JSON.stringify(slotData.subject));
      e.dataTransfer.setData('sourceTimeSlot', timeSlot);
      e.dataTransfer.setData('sourceDay', day);
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
        sx={{
          bgcolor: 'grey.100',
          height: 40,
          width: '10%',
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
        height: 40,
        width: '10%',
        '&:hover': { bgcolor: !slotData ? 'grey.50' : 'inherit' },
        padding: '4px',
        cursor: slotData ? 'grab' : 'default',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      draggable={!!slotData}
      onDragStart={handleDragStart}
    >
      {slotData && (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              height: '90%',
              bgcolor: slotData.subject.color,
              position: 'relative',
              '& .action-menu': {
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
              },
              '&:hover .action-menu': {
                opacity: 1,
              },
            }}
            // onClick={teacherDialog.onTrue}
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
                {slotData.subject.name}
              </Typography>
              <Box className="action-menu">
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
                          onDeleteSlot(timeSlot, day);
                          popover.onClose();
                        }}
                      >
                        <Iconify
                          icon="mdi:trash"
                          sx={{ height: '18px', width: '18px' }}
                          color="red"
                        />
                        Delete
                      </MenuItem>
                    </MenuList>
                  )}
                />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {slotData.room} / {slotData.teacher || '-'}
            </Typography>
          </Paper>

          <CustomDialog
            open={teacherDialog.value}
            handleClose={teacherDialog.onFalse}
            title={slotData?.teacher ? 'Edit Teacher' : 'Assign Teacher'}
          >
            <AssignTeacher
              slotData={slotData}
              onTeacherSelect={(value) => {
                onTeacherSelect(value, timeSlot, day);
                teacherDialog.onFalse();
              }}
            />
          </CustomDialog>

          <CustomDialog open={roomDialog.value} handleClose={roomDialog.onFalse} title="Edit Room">
            <AssignRoom
              slotData={slotData}
              selectedRoom={selectedRoom}
              onRoomSelect={(value) => {
                onRoomSelect(value, timeSlot, day);
                roomDialog.onFalse();
              }}
            />
          </CustomDialog>
        </>
      )}
    </TableCell>
  );
};

export default TimeTableCell;
