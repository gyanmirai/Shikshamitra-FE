import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Paper, Button, Typography } from '@mui/material';

import type { SeatingStudent } from '../../types';

interface Props {
  unallocatedStudents: SeatingStudent[];
  excludedStudents: SeatingStudent[];
  onFix: (student: SeatingStudent) => void;
}

export default function StudentExceptionList({
  unallocatedStudents,
  excludedStudents,
  onFix,
}: Props) {
  if (unallocatedStudents.length === 0 && excludedStudents.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.08),
          borderColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.24),
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Iconify icon="solar:check-circle-bold" color="success.main" width={20} height={20} />
        <Typography
          variant="body2"
          sx={{ color: (theme) => theme.vars.palette.success.main }}
          fontWeight={600}
        >
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
            borderColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.3),
            bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'warning.main',
              boxShadow: (theme) =>
                `0 4px 12px ${varAlpha(theme.vars.palette.warning.mainChannel, 0.16)}`,
            },
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.16),
                color: (theme) => theme.vars.palette.warning.main,
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
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
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
