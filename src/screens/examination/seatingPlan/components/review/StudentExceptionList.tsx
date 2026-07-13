import { Box, Chip, Button, Typography } from '@mui/material';

import type { SeatingStudent } from '../../types';

interface Props {
  unallocatedStudents: SeatingStudent[];
  excludedStudents: SeatingStudent[];
  onFix: (student: SeatingStudent) => void;
}

export default function StudentExceptionList({ unallocatedStudents, excludedStudents, onFix }: Props) {
  if (unallocatedStudents.length === 0 && excludedStudents.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        No exceptions — every eligible student has a seat.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {unallocatedStudents.map((student) => (
        <Box
          key={student.studentId}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {student.studentName}
            </Typography>
            <Chip size="small" color="warning" variant="soft" label="Unallocated" sx={{ mt: 0.5 }} />
          </Box>
          <Button size="small" onClick={() => onFix(student)}>
            Fix
          </Button>
        </Box>
      ))}
      {excludedStudents.map((student) => (
        <Box
          key={student.studentId}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {student.studentName}
            </Typography>
            <Chip size="small" label="Excluded" sx={{ mt: 0.5 }} />
          </Box>
          <Button size="small" onClick={() => onFix(student)}>
            Fix
          </Button>
        </Box>
      ))}
    </Box>
  );
}
