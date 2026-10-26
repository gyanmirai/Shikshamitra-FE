'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography, LinearProgress, CircularProgress } from '@mui/material';

import { readText, readOptionalText } from '../types';
import { Academic360EmptyState } from './Academic360EmptyState';

import type { Academic360Record, Academic360Attendance } from '../types';

type AttendanceSnapshotProps = {
  attendance?: Academic360Attendance;
  isLoading: boolean;
};

const isPresentRecord = (record: Academic360Record): boolean => {
  const status = readOptionalText(record.status ?? record.attendanceStatus ?? record.attendance);
  const normalized = status.toLowerCase();

  return record.isPresent === true || normalized === 'present' || normalized === 'p';
};

const percentageColor = (percentage: number) => {
  if (percentage >= 90) return 'success';
  if (percentage >= 75) return 'warning';
  return 'error';
};

export function AttendanceSnapshot({ attendance, isLoading }: AttendanceSnapshotProps) {
  const records = attendance?.recentHistory || [];
  const presentCount = attendance?.presentDays || records.filter(isPresentRecord).length;
  const totalCount = attendance?.totalDays || records.length;
  const percentage =
    attendance?.percentage ?? (totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0);
  const recent = records.slice(0, 5);
  const color = percentageColor(percentage);

  return (
    <Card variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1">Attendance</Typography>
          <Typography variant="caption" color="text.secondary">
            Latest records from student attendance history
          </Typography>
        </Box>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => `${theme.palette.success.main}14`,
            color: 'success.main',
          }}
        >
          <Iconify icon="mdi:calendar-check-outline" width={20} />
        </Box>
      </Stack>

      {isLoading ? (
        <Box sx={{ minHeight: 160, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : totalCount > 0 ? (
        <Stack spacing={1}>
          <Box>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h4" sx={{ color: `${color}.main` }}>{percentage}%</Typography>
              <Typography variant="body2" color="text.secondary">
                {presentCount}/{totalCount} present
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={color}
              sx={{ mt: 1, height: 8, borderRadius: 1 }}
            />
          </Box>
          {recent.length > 0 && (
            <Stack spacing={1}>
              {recent.map((record, index) => {
                const present = isPresentRecord(record);
                return (
                  <Stack
                    key={`${readText(record.date ?? record.attendanceDate)}-${index}`}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2">
                      {readText(record.date ?? record.attendanceDate ?? record.creationTime)}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon={present ? 'mdi:check-circle' : 'mdi:close-circle'}
                        width={14}
                        sx={{ color: present ? 'success.main' : 'warning.main' }}
                      />
                      <Typography variant="body2" color={present ? 'success.main' : 'warning.main'}>
                        {present ? 'Present' : readText(record.status, 'Absent')}
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Stack>
      ) : (
        <Academic360EmptyState
          title="No attendance recorded yet"
          description="Attendance history for this student will appear here once daily attendance is marked."
          compact
        />
      )}
    </Card>
  );
}
