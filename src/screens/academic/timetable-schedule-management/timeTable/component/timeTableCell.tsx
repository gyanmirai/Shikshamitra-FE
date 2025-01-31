'use client';

import React from 'react';

import { Box, Paper, MenuList, MenuItem, TableCell, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';

import AssignRoom from './assignRoomDialog';
import AssignTeacher from './assignTeacherDialog';

interface TimeTableCellProps {
  timeSlot: string;
  day: string;
  slotData: any;
  isBreak: boolean;
  onDrop: (e: any, timeSlot: string, day: string) => void;
  onTeacherSelect: (teacher: string, timeSlot: string, day: string) => void;
  onRoomSelect: (room: string, timeSlot: string, day: string) => void;
  onDeleteSlot: (timeSlot: string, day: string) => void;
}

const TimeTableCell = ({
  timeSlot,
  day,
  slotData,
  isBreak,
  onDrop,
  onTeacherSelect,
  onRoomSelect,
  onDeleteSlot,
}: TimeTableCellProps) => {
  const teacherDialog = useBoolean();
  const roomDialog = useBoolean();

  const slotKey = `${timeSlot}-${day}`;

  const handleDragOver = (e: any) => {
    // Only allow drag over if the slot is empty and not a break
    if (!isBreak && !slotData) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: any) => {
    // Only allow drop if the slot is empty and not a break
    if (!isBreak && !slotData) {
      e.preventDefault();
      onDrop(e, timeSlot, day);
    }
  };

  const handleDragStart = (e: any) => {
    if (!isBreak && slotData) {
      e.dataTransfer.setData('subject', JSON.stringify(slotData.subject));
      // Store the source location
      e.dataTransfer.setData('sourceTimeSlot', timeSlot);
      e.dataTransfer.setData('sourceDay', day);
    }
  };

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
                        <Iconify icon="solar:pen-bold" sx={{ height: '14px', width: '14px' }} />
                        Teacher
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          roomDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" sx={{ height: '14px', width: '14px' }} />
                        Room
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSlot(timeSlot, day);
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:trash" sx={{ height: '14px', width: '14px' }} />
                        Slot
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
