'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Paper,
  Table,
  Stack,
  Button,
  useTheme,
  TableRow,
  MenuList,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// TimeTableCell Component
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

const TimeTableCell: React.FC<TimeTableCellProps> = ({
  timeSlot,
  day,
  slotData,
  isBreak,
  onDrop,
  onTeacherSelect,
  onRoomSelect,
  onDeleteSlot,
}) => {
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

interface AssignTeacherProps {
  slotData: any;
  onTeacherSelect: (value: string) => void;
}

const AssignTeacher: React.FC<AssignTeacherProps> = ({ slotData, onTeacherSelect }) => {
  console.log('slotData----', slotData);

  const [selectedTeacher, setSelectedTeacher] = useState(slotData?.teacher || '');
  const handleSubmit = () => {
    onTeacherSelect(selectedTeacher);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Teacher"
                name="teacher"
                options={[
                  { id: 'Mr. Smith', name: 'Mr. Smith' },
                  { id: 'Ms. Johnson', name: 'Ms. Johnson' },
                  { id: 'Mr. Brown', name: 'Mr. Brown' },
                ]}
                labelKey="name"
                valueKey="id"
                value={selectedTeacher}
                onChange={(value) => {
                  setSelectedTeacher(value);
                }}
                // disabled={!formik.values.subject}
                // error={formik.touched.teacher && Boolean(formik.errors.teacher)}
                // helperText={formik.touched.teacher && formik.errors.teacher}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

interface AssignRoomProps {
  slotData: any;
  onRoomSelect: (value: string) => void;
}

const AssignRoom: React.FC<AssignRoomProps> = ({ slotData, onRoomSelect }) => {
  const [selectedRoom, setSelectedRoom] = useState(slotData?.room || '');
  const handleSubmit = () => {
    onRoomSelect(selectedRoom);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Room"
                name="teacher"
                options={[
                  { id: 'A101', name: 'A101' },
                  { id: 'A102', name: 'A102' },
                  { id: 'B101', name: 'B101' },
                ]}
                labelKey="name"
                valueKey="id"
                value={selectedRoom}
                onChange={(value) => {
                  setSelectedRoom(value);
                }}
                // disabled={!formik.values.subject}
                // error={formik.touched.teacher && Boolean(formik.errors.teacher)}
                // helperText={formik.touched.teacher && formik.errors.teacher}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

const subjects = [
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
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
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

  return (
    <Box>
      <CustomBreadcrumbs
        heading="New Timetable"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'New Timetable' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            setSearchParams?.({
              classId: val as string,
            });
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{
            sx: { width: '100%', maxWidth: '150px' },
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
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '150px' },
          }}
        />
      </Box>
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
    </Box>
  );
};

export default TimeTableGrid;

interface SubjectListProps {
  onDragStart: (e: any, subject: any) => void;
  remainingLectures: any;
}

const SubjectList: React.FC<SubjectListProps> = ({ onDragStart, remainingLectures }) => (
  <Stack spacing={1}>
    {subjects.map((subject) => (
      <Paper
        key={subject.id}
        elevation={1}
        draggable
        onDragStart={(e) => onDragStart(e, subject)}
        sx={{
          p: 1,
          cursor: 'move',
          backgroundColor: subject.color,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2">{subject.name}</Typography>
          <Typography variant="body2">
            ({remainingLectures[subject.id]} / {subject.noOfLeacture})
          </Typography>
        </Box>
      </Paper>
    ))}
  </Stack>
);
