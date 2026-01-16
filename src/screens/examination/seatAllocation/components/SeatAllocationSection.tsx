import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Paper } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
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
      examId: selectedExam?.id,
      divisionId: division,
      academicMediumId: 1,
      classNameId: selectedExam?.classId,
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
    params: { examId: selectedExam?.id, divisionId: division, roomId: classRoom },
  });

  // State to manage seat assignment data, tracking which students are assigned to which seats
  // Initialized with mock data from JSON file for seat allocation information
  const [assignedData, setAssignedData] = useState<ISeatAllocation[]>([]);
  // Tracks student details including assignment status and bench allocation
  const [students, setStudents] = useState<IStudentRoomAssignment[]>([]);

  React.useEffect(() => {
    if (seatLayoutData) {
      setAssignedData(seatLayoutData);
    }
  }, [seatLayoutData]);

  React.useEffect(() => {
    if (seatAllocationStudentsData) {
      setStudents(seatAllocationStudentsData);
    }
  }, [seatAllocationStudentsData]);

  const handleStudentRemove = (studentId: number | null) => {
    // Remove from assigned seats
    setAssignedData((prev) => prev.filter((seat) => seat.studentId !== studentId));

    // Update student status
    setStudents((prev) =>
      prev?.map((s) => (s.id === studentId ? { ...s, isRoomAssign: false, bench: undefined } : s))
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
    const newAssignment = {
      seatNumber,
      studentName: student.name,
      class: division || 'I',
      rollNo: Number(student.rollNo),
      studentId: student.id,
      isRoomAssign: false,
    };

    setAssignedData((prev) => [...prev, newAssignment]);

    // Update student status
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? { ...s, isRoomAssign: true, bench: Math.ceil(seatNumber / 2).toString() }
          : s
      )
    );

    setDroppedData((prev) => ({
      roomId: classRoom,
      students: [
        ...(prev?.students || []),
        {
          studentId: student.id,
          seatNumber,
          benchId: Math.ceil(seatNumber / 2).toString(),
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
    <Grid container spacing={1} height="calc(100vh - 150px)" p={2}>
      <Grid size={2.5} height="100%">
        <Paper elevation={3} sx={{ p: 1, height: '100%' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ borderBottom: `1px dashed gray`, pb: 2 }}
          >
            Total Students : {seatAllocationStudentsData?.length}
          </Box>
          <Scrollbar sx={{ height: 'calc(100% -  60px)' }}>
            <Box mt={1} p={0.5} display="flex" flexDirection="column" gap={1}>
              {[...students]
                .sort((a, b) => Number(a.isRoomAssign) - Number(b.isRoomAssign))
                .map((student) => (
                  <StudentCard key={student.id} student={student} theme={theme} />
                ))}
            </Box>
          </Scrollbar>
        </Paper>
      </Grid>
      <Grid size={9} height="100%">
        <Paper elevation={3} sx={{ p: 1, height: '100%' }}>
          <SeatManagement
            selectedRoom={{
              id: 1,
              roomName: 'A101',
              capacity: 24,
              building: 'Main',
              floor: '1st',
              roomType: 'Exam',
              totalBenches: 12,
              benchCapacity: 2,
              rows: 6,
              columns: 2,
              features: ['Projector'],
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
