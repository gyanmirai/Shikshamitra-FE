import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Chip, Grid, Paper, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetSeatLayoutQuery,
  useGetSeatAllocationStudentsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import StudentCard from './StudentCard';
import SeatManagement from './SeatManagement';

import type {
  IDroppedData,
  IDroppedStudent,
  IExamAllocation,
  ISeatAllocation,
  IStudentRoomAssignment,
} from '../type';

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

const SeatAllocationSection = ({
  division,
  classRoom,
  selectedExam,
  setDroppedData,
}: {
  division: string;
  classRoom: string;
  selectedExam: IExamAllocation | null;
  setDroppedData: React.Dispatch<React.SetStateAction<IDroppedData>>;
}) => {
  // Material-UI theme hook for accessing theme colors and styling properties
  const theme = useTheme();

  const {
    data: seatAllocationStudentsData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading: seatAllocationStudentsLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFetching: seatAllocationStudentsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationStudentsQuery,
    params: {
      examId: selectedExam?.examId,
      divisionId: division,
    },
    options: {
      skip: !selectedExam?.examId || !division, // Skip the query if examId or division is not selected
    },
  });

  const {
    data: seatLayoutData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading: seatLayoutLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFetching: seatLayoutFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatLayoutQuery,
    params: { examId: selectedExam?.examId, divisionId: division, roomId: classRoom },
    options: {
      skip: !selectedExam?.examId || !division || !classRoom, // Skip the query if any of the required parameters is missing
    },
  });

  // State to manage seat assignment data, tracking which students are assigned to which seats
  // Initialized with mock data from JSON file for seat allocation information
  const [assignedData, setAssignedData] = useState<ISeatAllocation[]>([]);
  // Tracks student details including assignment status and bench allocation
  const [students, setStudents] = useState<IStudentRoomAssignment[]>([]);

  // Reset assigned data when room changes
  React.useEffect(() => {
    setAssignedData([]);
  }, [classRoom]);

  // Reset students when division changes
  React.useEffect(() => {
    setStudents([]);
  }, [division]);

  React.useEffect(() => {
    if (seatLayoutData?.items) {
      setAssignedData(seatLayoutData.items);
    }
  }, [seatLayoutData]);

  React.useEffect(() => {
    if (seatAllocationStudentsData?.items) {
      setStudents(
        seatAllocationStudentsData.items.map((s: any) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          rollNo: s.rollNo,
          standardName: s.standardName,
          isSeatAllocate: s.isSeatAllocate,
          seatNumber: s.seatNumber,
        }))
      );
    }
  }, [seatAllocationStudentsData]);

  const handleStudentRemove = (studentId: string | null) => {
    // Remove from assigned seats
    setAssignedData((prev) => prev.filter((seat) => seat.studentId !== studentId));

    // Update student status
    setStudents((prev) =>
      prev?.map((s) =>
        s.studentId === studentId ? { ...s, isSeatAllocate: false, bench: undefined } : s
      )
    );

    // Sync droppedData
    setDroppedData((prev) => ({
      ...prev,
      students: (prev?.students || []).filter((s: IDroppedStudent) => s.studentId !== studentId),
    }));
  };

  const handleStudentDrop = (student: IStudentRoomAssignment, seatNumber: number) => {
    // Check if seat is already assigned
    const isAlreadyAssigned = assignedData.some((seat) => seat.seatNumber === seatNumber);
    if (isAlreadyAssigned) {
      return; // Don't allow drop on occupied seat
    }
    // Add new assignment
    const newAssignment: ISeatAllocation = {
      seatNumber,
      studentName: student.studentName,
      standardName: student.standardName,
      rollNo: student.rollNo,
      studentId: student.studentId,
      isRoomAssign: false,
    };

    setAssignedData((prev) => [...prev, newAssignment]);

    // Update student status
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === student.studentId
          ? { ...s, isSeatAllocate: true, bench: String(seatNumber) }
          : s
      )
    );

    setDroppedData((prev) => ({
      roomId: classRoom,
      students: [
        ...(prev?.students || []),
        {
          studentId: student.studentId,
          seatNumber,
          benchId: null,
          isRoomAssign: true,
        },
      ],
    }));
  };

  const handleSeatSwap = (fromSeat: number, toSeat: number) => {
    setAssignedData((prev) => {
      const updated = [...prev];
      const fromIndex = updated.findIndex((s) => s.seatNumber === fromSeat);
      const toIndex = updated.findIndex((s) => s.seatNumber === toSeat);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const temp = updated[fromIndex].seatNumber;
      updated[fromIndex].seatNumber = updated[toIndex].seatNumber;
      updated[toIndex].seatNumber = temp;

      return updated;
    });
  };

  return (
    <Grid container spacing={1} height="calc(100vh - 150px)" p={1}>
      <Grid size={2.5} height="100%">
        <Paper
          elevation={3}
          sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* NON-BREAKING: enhanced sidebar header with stats */}
          <Box sx={{ pb: 1.5, mb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Students
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify
                    icon="mdi:account-group-outline"
                    width={14}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </Box>
                <Chip
                  label={seatAllocationStudentsData?.totalCount ?? 0}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
              </Box>
              {/* Allocated */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify
                    icon="mdi:check-circle-outline"
                    width={14}
                    sx={{ color: 'success.main' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Allocated
                  </Typography>
                </Box>
                <Chip
                  label={students.filter((s) => s.isSeatAllocate).length}
                  size="small"
                  color="success"
                  variant="soft"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
              </Box>
              {/* Unassigned */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="mdi:clock-outline" width={14} sx={{ color: 'warning.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                <Chip
                  label={students.filter((s) => !s.isSeatAllocate).length}
                  size="small"
                  color="warning"
                  variant="soft"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
              </Box>
            </Box>
          </Box>
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              style={{
                marginTop: '8px',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {[...students]
                .sort((a, b) => Number(a.isSeatAllocate) - Number(b.isSeatAllocate))
                .map((student) => (
                  <motion.div key={student.studentId} variants={itemVariants}>
                    <StudentCard student={student} theme={theme} />
                  </motion.div>
                ))}
            </motion.div>
          </Scrollbar>
        </Paper>
      </Grid>
      <Grid size={9} height="100%">
        <Paper elevation={3} sx={{ p: 1, height: '100%' }}>
          <SeatManagement
            selectedRoom={{
              id: classRoom,
              roomName: seatLayoutData?.roomId ?? classRoom,
              capacity: seatLayoutData?.totalSeats ?? 0,
              rows: 6,
              columns: 2,
              benchCapacity: 2,
            }}
            onStudentRemove={handleStudentRemove}
            assignedData={assignedData}
            onStudentDrop={handleStudentDrop}
            onSeatSwap={handleSeatSwap}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SeatAllocationSection;
