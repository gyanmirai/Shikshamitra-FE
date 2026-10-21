import Box from '@mui/material/Box';
import { useId, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Tab, Tabs } from '@mui/material';
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
  const id = useId();
  const [showAssigned, setShowAssigned] = useState(false);
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
  const assignedCount = visibleStudents.filter((student) =>
    assignedIds.has(student.studentId)
  ).length;

  return (
    <Stack
      spacing={1}
      sx={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        p: 2,
        borderRight: { md: '1px solid' },
        borderBottom: { xs: '1px solid', md: 0 },
        borderColor: 'divider',
      }}
      aria-label="Students available for manual seating"
    >
      <Stack spacing={0.25}>
        <Typography variant="subtitle2">Students</Typography>
        <Typography variant="caption" color="text.secondary" aria-live="polite">
          {assignedCount} assigned · {Math.max(0, visibleStudents.length - assignedCount)} remaining
        </Typography>
      </Stack>
      <Tabs
        variant="fullWidth"
        value={showAssigned ? 'all' : 'unassigned'}
        onChange={(_, value) => setShowAssigned(value === 'all')}
        aria-label="Student list"
      >
        <Tab id={`${id}-unassigned`} aria-controls={`${id}-students`} value="unassigned" label="Unassigned" />
        <Tab id={`${id}-all`} aria-controls={`${id}-students`} value="all" label="All students" />
      </Tabs>
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
        Drag an available student, or select one and then choose an empty seat.
        {showAssigned ? ' Assigned students are greyed out.' : ''}
      </Typography>
      <Scrollbar role="tabpanel" id={`${id}-students`} aria-labelledby={`${id}-${showAssigned ? 'all' : 'unassigned'}`}
        sx={{ flex: 1, minHeight: { xs: 160, md: 280 }, maxHeight: { xs: 260, md: 600 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pr: 0.5,
          '& [role="button"]:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
          {visibleStudents
            .filter((student) => showAssigned || !assignedIds.has(student.studentId))
            .map((student) => (
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
          {!visibleStudents.some(
            (student) => showAssigned || !assignedIds.has(student.studentId)
          ) && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              {query
                ? 'No students match this search.'
                : 'All students have a seat. Open All students to review assignments.'}
            </Typography>
          )}
        </Box>
      </Scrollbar>
    </Stack>
  );
}
