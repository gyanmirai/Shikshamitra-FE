import React, { useState } from 'react';

import { Box, Grid, Paper, useTheme } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import StudentCard from './StudentCard';
import SeatManagement from './SeatManagement';

const SeatAllocationSection = ({ division, classRoom }: any) => {
  const theme = useTheme();
  const [assignedData, setAssignedData] = useState([
    { seatNumber: 1, studentName: 'Dharmik Jinger', class: 'I', rollNo: '1', studentId: 101 },
    { seatNumber: 2, studentName: 'Nitre', class: 'I', rollNo: '1', studentId: 102 },
    { seatNumber: 3, studentName: 'Raj Baku', class: 'I', rollNo: '2', studentId: 103 },
    { seatNumber: 4, studentName: 'Mayur Solanki', class: '2', rollNo: '2', studentId: 104 },
    { seatNumber: 21, studentName: 'John Doe', class: '3', rollNo: '3', studentId: 105 },
    { seatNumber: 22, studentName: 'Jane Smith', class: '3', rollNo: '4', studentId: 106 },
  ]);
  const [students, setStudents] = useState<any[]>([
    { id: 1, name: 'Jignesh Jinjala', rollNo: '08', isRoomAssign: false },
    { id: 2, name: 'Sweta Badgujar', rollNo: '09', bench: '05', room: '101', isRoomAssign: true },
    { id: 3, name: 'Amit Patel', rollNo: '10', bench: '02', room: '102', isRoomAssign: true },
    { id: 4, name: 'Kavita Mehta', rollNo: '11', isRoomAssign: false },
    { id: 5, name: 'Raj Shah', rollNo: '12', bench: '03', room: '101', isRoomAssign: true },
    { id: 6, name: 'Priya Singh', rollNo: '13', isRoomAssign: false },
    { id: 7, name: 'Nikhil Verma', rollNo: '14', bench: '06', room: '103', isRoomAssign: true },
    { id: 8, name: 'Meera Desai', rollNo: '15', bench: '04', room: '102', isRoomAssign: true },
    { id: 9, name: 'Rohan Kumar', rollNo: '16', isRoomAssign: false },
    { id: 10, name: 'Anita Sharma', rollNo: '17', bench: '07', room: '103', isRoomAssign: true },
    { id: 11, name: 'Vikram Malhotra', rollNo: '18', bench: '08', room: '101', isRoomAssign: true },
    { id: 12, name: 'Neha Gupta', rollNo: '19', isRoomAssign: false },
    { id: 13, name: 'Arun Joshi', rollNo: '20', bench: '09', room: '102', isRoomAssign: true },
    { id: 14, name: 'Pooja Patel', rollNo: '21', bench: '10', room: '103', isRoomAssign: true },
    { id: 15, name: 'Sanjay Mehta', rollNo: '22', isRoomAssign: false },
    { id: 16, name: 'Deepa Reddy', rollNo: '23', bench: '11', room: '101', isRoomAssign: true },
    { id: 17, name: 'Karan Soni', rollNo: '24', bench: '12', room: '102', isRoomAssign: true },
    { id: 18, name: 'Maya Iyer', rollNo: '25', isRoomAssign: false },
    { id: 19, name: 'Rahul Kapoor', rollNo: '26', bench: '13', room: '103', isRoomAssign: true },
    { id: 20, name: 'Anjali Nair', rollNo: '27', bench: '14', room: '101', isRoomAssign: true },
  ]);

  const handleStudentRemove = (studentId: number | null) => {
    // Remove from assigned seats
    setAssignedData((prev) => prev.filter((seat) => seat.studentId !== studentId));

    // Update student status
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isRoomAssign: false, bench: undefined } : s))
    );
  };

  const handleStudentDrop = (student: any, seatNumber: number) => {
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
      rollNo: student.rollNo,
      studentId: student.id,
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
      {division && (
        <Grid item xs={2.5} height="100%">
          <Paper elevation={3} sx={{ p: 1, height: '100%' }}>
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ borderBottom: `1px dashed gray`, pb: 2 }}
            >
              Total Students : 20
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
      )}
      {division && classRoom && (
        <Grid item xs={9} height="100%">
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
      )}
    </Grid>
  );
};

export default SeatAllocationSection;
