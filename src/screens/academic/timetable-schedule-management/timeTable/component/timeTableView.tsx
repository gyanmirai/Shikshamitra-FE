import React, { useState, useEffect } from 'react';

import { Add } from '@mui/icons-material';
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

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';

import TimeTableCell from './timeTableCell';
import CreateSlotsForm from '../../settings/components/lectureSlots/createSlotsForm';

import type { DayData, TimetableSlot } from '../type';

interface ITimeTableView {
  timeTableData: TimetableSlot[];
  isTeacherVisible?: boolean;
  isRoomVisible?: boolean;
  isClassVisible?: boolean;
  isDivisionVisible?: boolean;
  isDrag?: boolean;
  onDrop?: (e: any, item: DayData, rowIndex: number, colIndex: number) => void;
  onTeacherSelect?: (
    updatedSlotData: any, // Contains the updated subjects array with teachers
    rowIndex: number,
    colIndex: number
  ) => void;
  onRoomSelect?: (
    updatedSlotData: any, // Contains the updated subjects array with rooms
    rowIndex: number,
    colIndex: number
  ) => void;
  // isDraggable: boolean;
  handleDeleteSlot?: (rowIndex: number, colIndex: number) => void;
  showThreeDots: boolean;
}

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
  const [timetable, setTimetable] = useState<TimetableSlot[]>(timeTableData);
  const createSlotsDialog = useBoolean();
  useEffect(() => {
    setTimetable(timeTableData);
  }, [timeTableData]);
  // Extract weekdays from the first slot that has `dayData` (i.e., non-break slot)
  const timeSlots = timetable.map((slot) => `${slot.startTime} - ${slot.endTime}`);
  const [firstSlotWithDayData] = timetable.filter((slot) => slot.dayData.length > 0);
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
        handleClose={createSlotsDialog.onFalse}
        title="Create Slots"
        maxWidth="md"
      >
        <CreateSlotsForm onClose={createSlotsDialog.onFalse} />
      </CustomDialog>
    </>
  );
};

export default TimeTableView;
