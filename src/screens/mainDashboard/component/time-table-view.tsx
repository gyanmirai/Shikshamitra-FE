'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import {
  Box,
  Paper,
  Table,
  useTheme,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
} from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import TimeTableCell from 'src/screens/academic/timetable-schedule-management/timeTable/component/timeTableCell';

const dummySubjects: any[] = [
  {
    id: 1,
    subjectColor: '#FF6B6B', // Red
    subjects: [{ id: 1, name: 'Math' }],
  },
  {
    id: 2,
    subjectColor: '#4ECDC4', // Teal
    subjects: [{ id: 2, name: 'Science' }],
  },
  {
    id: 3,
    subjectColor: '#45B7D1', // Blue
    subjects: [{ id: 3, name: 'English' }],
  },
  {
    id: 4,
    subjectColor: '#96CEB4', // Green
    subjects: [{ id: 4, name: 'History' }],
  },
  {
    id: 5,
    subjectColor: '#FECA57', // Yellow
    subjects: [{ id: 5, name: 'Geography' }],
  },
];

const dummyRooms = ['101', '102', '103', '104', '105'];
const singleTeacher = 'Mr. Smith';

const TimeTableView = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [open, setOpen] = useState(false);
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const theme = useTheme();

  // const [remainingLectures, setRemainingLectures] = useState<any>(() =>
  //   subjects.reduce(
  //     (acc, subject) => ({
  //       ...acc,
  //       [subject.id]: subject.noOfLeacture,
  //     }),
  //     {}
  //   )
  // );

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        const divisions = selectedClass?.divisions || [];
        setDivisionOptions(divisions);
        if (divisions.length > 0) {
          setDivision(divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        const divisions = firstClass?.divisions || [];
        setDivisionOptions(divisions);
        if (divisions.length > 0) {
          setDivision(divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);

  const timeSlots = [
    '8:00 - 8:45',
    '8:45 - 9:30',
    '9:30 - 10:15',
    '10:15 - 10:30', // Break
    '10:30 - 11:15',
    '11:15 - 12:00',
  ];

  const isBreak = (timeSlot: string) => timeSlot === '10:15 - 10:30';

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize timetable as an array of arrays
  const [timetable, setTimetable] = useState<
    Array<
      Array<{
        subject?: any;
        teacher?: string;
        room?: string;
      } | null>
    >
  >(() =>
    Array(timeSlots.length) // Use timeSlots.length instead of hardcoded 5
      .fill(null)
      .map((_, rowIndex) =>
        Array(weekDays.length) // Also use weekDays.length for consistency
          .fill(null)
          .map((unused, colIndex) => {
            // Don't populate break slots with data
            const currentTimeSlot = timeSlots[rowIndex];
            if (isBreak(currentTimeSlot)) {
              return null; // Break slots should be null
            }

            return {
              subject: dummySubjects[(rowIndex + colIndex) % dummySubjects.length],
              teacher: singleTeacher,
              room: dummyRooms[(rowIndex + colIndex) % dummyRooms.length],
            };
          })
      )
  );

  const handleDragStart = (e: any, subject: any) => {
    e.dataTransfer.setData('subject', JSON.stringify(subject));
  };

  // const handleDrop = (e: any, timeSlot: string, day: string) => {
  //   e.preventDefault();
  //   const subject = JSON.parse(e.dataTransfer.getData('subject'));
  //   const sourceTimeSlot = e.dataTransfer.getData('sourceTimeSlot');
  //   const sourceDay = e.dataTransfer.getData('sourceDay');

  //   const timeSlotIndex = timeSlots.indexOf(timeSlot);
  //   const dayIndex = weekDays.indexOf(day);

  //   // Check if target slot is empty
  //   if (timetable[timeSlotIndex][dayIndex] !== null) {
  //     return;
  //   }

  //   // If it's a new drag (not moving an existing slot)
  //   if (!sourceTimeSlot && !sourceDay) {
  //     // Check if there are remaining lectures
  //     if (remainingLectures[subject.id] <= 0) {
  //       return;
  //     }

  //     // Decrease remaining lectures
  //     setRemainingLectures((prev: any) => ({
  //       ...prev,
  //       [subject.id]: prev[subject.id] - 1,
  //     }));
  //   }

  //   setTimetable((prev) => {
  //     const newTimetable = prev.map((row) => [...row]);

  //     if (sourceTimeSlot && sourceDay) {
  //       const sourceTimeSlotIndex = timeSlots.indexOf(sourceTimeSlot);
  //       const sourceDayIndex = weekDays.indexOf(sourceDay);
  //       const sourceSlotData = newTimetable[sourceTimeSlotIndex][sourceDayIndex];
  //       newTimetable[sourceTimeSlotIndex][sourceDayIndex] = null;
  //       newTimetable[timeSlotIndex][dayIndex] = {
  //         subject,
  //         teacher: sourceSlotData?.teacher || null,
  //         room: sourceSlotData?.room || subject.room,
  //       };
  //     } else {
  //       newTimetable[timeSlotIndex][dayIndex] = {
  //         subject,
  //         teacher: null,
  //         room: subject.room,
  //       };
  //     }

  //     return newTimetable;
  //   });
  // };

  // // Modified handleDeleteSlot to increase remaining lectures
  // const handleDeleteSlot = (timeSlot: string, day: string) => {
  //   const timeSlotIndex = timeSlots.indexOf(timeSlot);
  //   const dayIndex = weekDays.indexOf(day);

  //   setTimetable((prev) => {
  //     const deletedSubject = prev[timeSlotIndex][dayIndex]?.subject;
  //     if (deletedSubject) {
  //       // Increase remaining lectures when deleting
  //       setRemainingLectures((pre: any) => ({
  //         ...pre,
  //         [deletedSubject.id]: pre[deletedSubject.id] + 1,
  //       }));
  //     }

  //     const newTimetable = prev.map((row) => [...row]);
  //     newTimetable[timeSlotIndex][dayIndex] = null;
  //     return newTimetable;
  //   });
  // };

  const handleTeacherSelect = (teacher: string, timeSlot: string, day: string) => {
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    setTimetable((prev) => {
      const newTimetable = prev.map((row) => [...row]);
      if (newTimetable[timeSlotIndex][dayIndex]) {
        newTimetable[timeSlotIndex][dayIndex] = {
          ...newTimetable[timeSlotIndex][dayIndex]!,
          teacher,
        };
      }
      return newTimetable;
    });
  };

  const handleRoomSelect = (room: string, timeSlot: string, day: string) => {
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    setTimetable((prev) => {
      const newTimetable = prev.map((row) => [...row]);
      if (newTimetable[timeSlotIndex][dayIndex]) {
        newTimetable[timeSlotIndex][dayIndex] = {
          ...newTimetable[timeSlotIndex][dayIndex]!,
          room,
        };
      }
      return newTimetable;
    });
  };

  const [isVisibleGrid, setIsVisibleGrid] = useState(true);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Paper elevation={2} sx={{ flexGrow: 1 }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '8%' }}>Time Slot</TableCell>
                  {weekDays.map((day) => (
                    <TableCell key={day} align="center">
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {timeSlots.map((timeSlot, timeSlotIndex) => (
                  <TableRow key={timeSlot}>
                    <TableCell>{timeSlot}</TableCell>
                    {weekDays.map((day, dayIndex) => (
                      <TimeTableCell
                        key={`${timeSlot}-${day}`}
                        timeSlot={timeSlot}
                        day={day}
                        isThreeDots={false}
                        slotData={timetable[timeSlotIndex][dayIndex]}
                        isBreak={isBreak(timeSlot)}
                        onDrop={() => {}}
                        onTeacherSelect={handleTeacherSelect}
                        onRoomSelect={handleRoomSelect}
                        onDeleteSlot={() => {}}
                        selectedRoom="101"
                      />
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default TimeTableView;
