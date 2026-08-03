import { Box, Chip, Stack, Paper, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

import type { SeatingStudent } from '../../types';

interface Props {
  unallocatedStudents: SeatingStudent[];
  excludedStudents: SeatingStudent[];
  onFix: (student: SeatingStudent) => void;
}

export default function StudentExceptionList({ unallocatedStudents, excludedStudents, onFix }: Props) {
  if (unallocatedStudents.length === 0 && excludedStudents.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
          borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Iconify icon="solar:check-circle-bold" color="success.main" width={20} height={20} />
        <Typography variant="body2" color="success.dark" fontWeight={600}>
          No exceptions — every eligible student has been successfully allocated a seat.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={1}>
      {unallocatedStudents.map((student) => (
        <Paper
          key={student.studentId}
          variant="outlined"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.25,
            borderRadius: 1,
            borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.03),
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'warning.main',
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.warning.main, 0.12)}`,
            },
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                color: 'warning.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:user-bold" width={18} height={18} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  {student.studentName}
                </Typography>
                <Chip size="small" color="warning" variant="soft" label="Unallocated" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {student.divisionName ? `Division: ${student.divisionName}` : ''}
                {student.rollNo ? ` • Roll No: ${student.rollNo}` : ''}
                {student.admissionNo ? ` • GR: ${student.admissionNo}` : ''}
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<Iconify icon="solar:pen-bold" width={14} height={14} />}
            onClick={() => onFix(student)}
            sx={{ borderRadius: 1 }}
          >
            Fix Seat
          </Button>
        </Paper>
      ))}

      {excludedStudents.map((student) => (
        <Paper
          key={student.studentId}
          variant="outlined"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.25,
            borderRadius: 1,
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:user-block-bold" width={18} height={18} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  {student.studentName}
                </Typography>
                <Chip size="small" color="default" variant="soft" label="Excluded" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {student.divisionName ? `Division: ${student.divisionName}` : ''}
                {student.rollNo ? ` • Roll No: ${student.rollNo}` : ''}
              </Typography>
            </Box>
          </Stack>
          <Button size="small" variant="outlined" color="inherit" onClick={() => onFix(student)}>
            Edit
          </Button>
        </Paper>
      ))}
    </Stack>
  );
}

