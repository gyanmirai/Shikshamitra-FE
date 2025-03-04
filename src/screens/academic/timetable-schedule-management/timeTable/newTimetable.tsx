'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Paper,
  Table,
  Button,
  useTheme,
  TableRow,
  MenuList,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectList from './component/subjectList';
import TimeTableCell from './component/timeTableCell';

export const subjects = [
  {
    id: 1,
    name: 'Math',
    color: '#FFE0E0',
    teachers: ['Mr. Smith', 'Mrs. Johnson'],
    room: '101',
    noOfLeacture: 5,
  },
  {
    id: 2,
    name: 'Science',
    color: '#E0FFE0',
    teachers: ['Mrs. Johnson', 'Mr. Davis'],
    room: '102',
    noOfLeacture: 7,
  },
  {
    id: 3,
    name: 'English',
    color: '#E0E0FF',
    teachers: ['Ms. Wilson', 'Mr. Brown'],
    room: '103',
    noOfLeacture: 6,
  },
];

const TimeTableGrid = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classroom, setClassroom] = useState<string>('');
  const [open, setOpen] = useState(false);
  const { searchParams, setSearchParams } = props;
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const theme = useTheme();

  const [remainingLectures, setRemainingLectures] = useState<any>(() =>
    subjects.reduce(
      (acc, subject) => ({
        ...acc,
        [subject.id]: subject.noOfLeacture,
      }),
      {}
    )
  );

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
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

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize timetable as an array of arrays
  const [timetable, setTimetable] = useState<
    Array<
      Array<{
        subject?: any;
        teacher?: any;
        room?: string;
      } | null>
    >
  >(() =>
    Array(timeSlots.length)
      .fill(null)
      .map(() => Array(weekDays.length).fill(null))
  );

  const handleDragStart = (e: any, subject: any) => {
    e.dataTransfer.setData('subject', JSON.stringify(subject));
  };

  const handleDrop = (e: any, timeSlot: string, day: string) => {
    e.preventDefault();
    const subject = JSON.parse(e.dataTransfer.getData('subject'));
    const sourceTimeSlot = e.dataTransfer.getData('sourceTimeSlot');
    const sourceDay = e.dataTransfer.getData('sourceDay');

    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    // Check if target slot is empty
    if (timetable[timeSlotIndex][dayIndex] !== null) {
      return;
    }

    // If it's a new drag (not moving an existing slot)
    if (!sourceTimeSlot && !sourceDay) {
      // Check if there are remaining lectures
      if (remainingLectures[subject.id] <= 0) {
        return;
      }

      // Decrease remaining lectures
      setRemainingLectures((prev: any) => ({
        ...prev,
        [subject.id]: prev[subject.id] - 1,
      }));
    }

    setTimetable((prev) => {
      const newTimetable = prev.map((row) => [...row]);

      if (sourceTimeSlot && sourceDay) {
        const sourceTimeSlotIndex = timeSlots.indexOf(sourceTimeSlot);
        const sourceDayIndex = weekDays.indexOf(sourceDay);
        const sourceSlotData = newTimetable[sourceTimeSlotIndex][sourceDayIndex];
        newTimetable[sourceTimeSlotIndex][sourceDayIndex] = null;
        newTimetable[timeSlotIndex][dayIndex] = {
          subject,
          teacher: sourceSlotData?.teacher || null,
          room: sourceSlotData?.room || subject.room,
        };
      } else {
        newTimetable[timeSlotIndex][dayIndex] = {
          subject,
          teacher: null,
          room: subject.room,
        };
      }

      return newTimetable;
    });
  };

  // Modified handleDeleteSlot to increase remaining lectures
  const handleDeleteSlot = (timeSlot: string, day: string) => {
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    const dayIndex = weekDays.indexOf(day);

    setTimetable((prev) => {
      const deletedSubject = prev[timeSlotIndex][dayIndex]?.subject;
      if (deletedSubject) {
        // Increase remaining lectures when deleting
        setRemainingLectures((pre: any) => ({
          ...pre,
          [deletedSubject.id]: pre[deletedSubject.id] + 1,
        }));
      }

      const newTimetable = prev.map((row) => [...row]);
      newTimetable[timeSlotIndex][dayIndex] = null;
      return newTimetable;
    });
  };

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

  const isBreak = (timeSlot: string) => timeSlot === '10:15 - 10:30';

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'Pending' && (
            <MenuItem
              onClick={() => {
                // uploadPictureDialog.onTrue();
                setOpen(true);
              }}
            >
              <Iconify icon="mdi:add" sx={{ height: '16px', width: '16px' }} />
              Timetable
            </MenuItem>
          )}
          {(row.status === 'Draft' || row.status === 'Publish') && (
            <MenuItem
              onClick={() => {
                // assignStudentDialog.onTrue();
                // setSelectedActivity(row as Activity);
                // pop.onClose();
              }}
            >
              <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
              Update
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    []
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Timetable"
        links={[{ name: 'Academic and Assignment' }, { name: 'Time Table' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          open && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => {
                setOpen(false);
              }}
            >
              Back
            </Button>
          )
        }
      />
      {open && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomSelect
              label="Class"
              options={classData?.items || []}
              labelKey="name"
              disabled
              valueKey="id"
              onChange={(val) => {
                const selectedClass: Standards = classData.items.find(
                  (i: Standards) => i.id === val
                );
                setSearchParams?.({
                  classId: val as string,
                });
                setDivisionOptions(selectedClass?.divisions || []);
              }}
              value={classes}
              formControlProps={{
                sx: { width: '100%', minWidth: '180px' },
              }}
            />
            <CustomSelect
              label="Division"
              disabled={!classes}
              labelKey="name"
              valueKey="id"
              options={divisionOptions}
              value={division}
              onChange={(val) => {
                const selectedDivision = divisionOptions.find((i: Division) => val === i.id);
                setDivision(val as string);
              }}
              formControlProps={{ sx: { width: '100%', minWidth: '180px' } }}
            />
            <CustomSelect
              label="Classroom"
              disabled={!division}
              options={[
                { id: 'A101', name: 'A101' },
                { id: 'A102', name: 'A102' },
                { id: 'B101', name: 'B101' },
              ]}
              labelKey="name"
              valueKey="id"
              value={classroom}
              onChange={(val) => {
                setClassroom(val as string);
              }}
              formControlProps={{ sx: { width: '100%', minWidth: '180px' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="warning" size="small">
              Draft
            </Button>
            <Button variant="contained" size="small">
              Publish
            </Button>
          </Box>
        </Box>
      )}
      {!open && (
        <>
          <CustomSelect
            label="Class"
            name="class"
            isLoading={isLoading}
            options={classData?.items || []}
            valueKey="id"
            labelKey="name"
            formControlProps={{ sx: { width: '150px', mb: 2 } }}
            value={classes}
            onChange={(value) => {
              // setClasses(value);
            }}
          />
          <CustomizableTable
            tableId="timetable-table"
            columns={[
              { id: 'division', label: 'Division' },
              {
                id: 'status',
                label: 'Status',
                render: (value, row) => (
                  <Label
                    color={
                      value === 'Pending'
                        ? 'error'
                        : value === 'Draft'
                          ? 'warning'
                          : value === 'Publish'
                            ? 'primary'
                            : 'default'
                    }
                  >
                    {value}
                  </Label>
                ),
              },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                isFilter: false,
                render: (value, row) => (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                  />
                ),
              },
            ]}
            data={[
              {
                id: 1,
                className: 'Class 10',
                division: 'A',
                status: 'Publish',
              },
              {
                id: 2,
                className: 'Class 9',
                division: 'B',
                status: 'Pending',
              },
              {
                id: 3,
                className: 'Class 8',
                division: 'C',
                status: 'Draft',
              },
              {
                id: 5,
                className: 'Class 6',
                division: 'E',
                status: 'Pending',
              },
              {
                id: 6,
                className: 'Class 5',
                division: 'F',
                status: 'Draft',
              },
              {
                id: 7,
                className: 'Class 4',
                division: 'G',
                status: 'Publish',
              },
            ]}
          />
        </>
      )}
      {open && (
        <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
          <Paper
            elevation={2}
            sx={{
              width: 200,
              height: 'fit-content',
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Subjects</Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <SubjectList onDragStart={handleDragStart} remainingLectures={remainingLectures} />
            </Box>
          </Paper>

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
                          slotData={timetable[timeSlotIndex][dayIndex]}
                          isBreak={isBreak(timeSlot)}
                          onDrop={handleDrop}
                          selectedRoom={classroom}
                          onTeacherSelect={handleTeacherSelect}
                          onRoomSelect={handleRoomSelect}
                          onDeleteSlot={handleDeleteSlot}
                        />
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default TimeTableGrid;
