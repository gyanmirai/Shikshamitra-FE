import { Add } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import {
  Box,
  Table,
  Paper,
  Button,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
} from '@mui/material';

import TimeTableCell from './timeTableCell';
import CreateSlotsForm from '../../settings/components/lectureSlots/createSlotsForm';

import type { ITimeTableView } from './type';
import type { TimetableSlot } from '../type';

const TimeTableView: React.FC<ITimeTableView> = ({
  timeTableData,
  isTeacherVisible,
  isRoomVisible,
  isDrag,
  isClassVisible,
  isDivisionVisible,
  onDrop,
  // isDraggable,
  onTeacherSelect,
  onRoomSelect,
  handleDeleteSlot,
  showThreeDots,
}) => {
  // Local state to manage timetable data, initialized with prop data
  // Allows for local manipulation while keeping sync with parent component
  const [timetable, setTimetable] = useState<TimetableSlot[]>(timeTableData);

  // Boolean hook to control the visibility of the create slots dialog
  const createSlotsDialog = useBoolean();

  // Effect to sync local timetable state with incoming prop changes
  // Updates local state whenever parent component updates timeTableData
  useEffect(() => {
    setTimetable(timeTableData);
  }, [timeTableData]);

  // Extract weekdays from the first slot that has `dayData` (i.e., non-break slot)
  // Create array of formatted time slot strings for display purposes
  const timeSlots = timetable.map((slot) => `${slot.startTime} - ${slot.endTime}`);

  // Find the first non-break slot that contains day data to extract weekday structure
  // This ensures we get the proper day layout even if some slots are breaks
  const [firstSlotWithDayData] = timetable.filter((slot) => slot.dayData.length > 0);

  // Extract weekday names from the first valid slot to create table headers
  // Falls back to empty array if no valid slot data exists
  const weekDays = firstSlotWithDayData?.dayData.map((d) => d.day) || [];
  return (
    <>
      {firstSlotWithDayData && firstSlotWithDayData.dayData.length > 0 ? (
        <Paper elevation={2} sx={{ flexGrow: 1 }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '15%', textAlign: 'center' }}>Time Slot</TableCell>
                  {weekDays.map((day) => (
                    <TableCell key={day} align="center">
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {timetable.map((timeTableItem, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {timeTableItem.startTime} - {timeTableItem.endTime}
                    </TableCell>
                    {(timeTableItem.isBreak ? [''] : timeTableItem.dayData).map((dayItem, ind) => (
                      <TimeTableCell
                        // isDraggable={isDraggable}
                        key={ind}
                        timeSlot={`${timeTableItem.startTime} - ${timeTableItem.endTime}`}
                        day={typeof dayItem === 'string' ? dayItem : dayItem.day}
                        item={timeTableItem}
                        isTeacherVisible={isTeacherVisible}
                        isRoomVisible={isRoomVisible}
                        isClassVisible={isClassVisible}
                        isDivisionVisible={isDivisionVisible}
                        isDrag={isDrag}
                        rowIndex={index}
                        colIndex={ind}
                        slotData={dayItem}
                        isBreak={timeTableItem.isBreak}
                        onDrop={onDrop}
                        onTeacherSelect={onTeacherSelect}
                        onRoomSelect={onRoomSelect}
                        onDeleteSlot={handleDeleteSlot}
                        showThreeDots={showThreeDots}
                      />
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            mt: 2,
            mb: 2,
          }}
        >
          <Button
            startIcon={<Add />}
            size="small"
            variant="contained"
            onClick={() => {
              createSlotsDialog.onTrue();
            }}
          >
            Create Slots
          </Button>
        </Box>
      )}
      <CustomDialog
        open={createSlotsDialog.value}
        handleClose={(e, isSubmit) => {
          createSlotsDialog.onFalse();
        }}
        title="Create Slots"
        maxWidth="md"
      >
        <CreateSlotsForm handleClose={() => createSlotsDialog.onFalse()} />
      </CustomDialog>
    </>
  );
};

export default TimeTableView;
