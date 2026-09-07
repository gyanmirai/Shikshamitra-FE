import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import InputAdornment from '@mui/material/InputAdornment';

import StudentCard from '../../components/workspace/StudentCard';

import type { SeatingStudent, SeatingAssignment } from '../../types';

interface GuidedStudentTrayProps {
  students: SeatingStudent[];
  assignments: SeatingAssignment[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  isReadOnly: boolean;
}

export function GuidedStudentTray({
  students,
  assignments,
  selectedStudentId,
  onSelectStudent,
  isReadOnly,
}: GuidedStudentTrayProps) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const visibleStudents = students
    .filter((student) => !student.isExternalExamOccupied)
    .filter(
      (student) =>
        !query ||
        student.studentName.toLowerCase().includes(query) ||
        String(student.rollNo).includes(query) ||
        student.divisionName?.toLowerCase().includes(query)
    )
    .sort((left, right) => left.rollNo - right.rollNo);
  const assignedIds = new Set(assignments.map((assignment) => assignment.studentId));
  const assignedCount = visibleStudents.filter((student) => assignedIds.has(student.studentId)).length;

  return (
    <Stack
      spacing={1}
      sx={{ height: '100%', minHeight: 0, p: 1.5, borderRight: { lg: '1px solid' }, borderColor: 'divider' }}
      aria-label="Students available for manual seating"
    >
      <Stack spacing={0.25}>
        <Typography variant="h6">Students</Typography>
        <Typography variant="caption" color="text.secondary" aria-live="polite">
          {assignedCount} assigned · {Math.max(0, visibleStudents.length - assignedCount)} remaining
        </Typography>
      </Stack>
      <TextField
        size="small"
        fullWidth
        label="Search students"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" width={18} />
              </InputAdornment>
            ),
          },
        }}
      />
      <Typography variant="caption" color="text.secondary">
        Drag an available student, or select one and then choose an empty seat. Assigned students
        are greyed out.
      </Typography>
      <Scrollbar sx={{ flex: 1, minHeight: 280 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pr: 0.5 }}>
          {visibleStudents.map((student) => (
            <StudentCard
              key={student.studentId}
              student={student}
              assignment={assignments.find(
                (assignment) => assignment.studentId === student.studentId
              )}
              isSelected={selectedStudentId === student.studentId}
              onSelect={onSelectStudent}
              isReadOnly={isReadOnly}
            />
          ))}
          {visibleStudents.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No students match this search.
            </Typography>
          )}
        </Box>
      </Scrollbar>
    </Stack>
  );
}
