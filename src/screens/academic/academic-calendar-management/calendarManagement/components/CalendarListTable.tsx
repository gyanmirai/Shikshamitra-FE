'use client';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CalendarStatus,
  CALENDAR_STATUS_LABELS,
  CALENDAR_STATUS_COLORS,
} from 'src/enums/academic-calendar';
import {
  Box,
  Chip,
  Stack,
  Table,
  Paper,
  Avatar,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CALENDARS = [
  {
    id: 'mock-1',
    name: 'Academic Year 2025–26',
    description: 'Main calendar for academic year June 2025 to March 2026',
    startDate: '2025-06-01',
    endDate: '2026-03-31',
    status: CalendarStatus.Published,
    isDefault: true,
    totalWorkingDays: 220,
    totalHolidays: 15,
    totalVacationDays: 30,
  },
  {
    id: 'mock-2',
    name: 'Academic Year 2024–25',
    description: 'Archived calendar for last academic year',
    startDate: '2024-06-01',
    endDate: '2025-03-31',
    status: CalendarStatus.Archived,
    isDefault: false,
    totalWorkingDays: 218,
    totalHolidays: 17,
    totalVacationDays: 28,
  },
  {
    id: 'mock-3',
    name: 'Summer Term 2025',
    description: 'Short summer term calendar',
    startDate: '2025-04-01',
    endDate: '2025-05-31',
    status: CalendarStatus.Draft,
    isDefault: false,
    totalWorkingDays: 42,
    totalHolidays: 2,
    totalVacationDays: 0,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  calendars: any[];
  isLoading: boolean;
  onEdit: (cal: any) => void;
  onDelete: (cal: any) => void;
  onPublish: (cal: any) => void;
  onArchive: (cal: any) => void;
  onView: (cal: any) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
}

// ─── Status badge colors ──────────────────────────────────────────────────────

const STATUS_BG: Record<CalendarStatus, string> = {
  [CalendarStatus.Draft]: '#78909c',
  [CalendarStatus.Published]: '#2e7d32',
  [CalendarStatus.Archived]: '#e65100',
};

// ─── Component ────────────────────────────────────────────────────────────────

const CalendarListTable = ({
  calendars,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onView,
  canEdit,
  canDelete,
  canPublish,
}: Props) => {
  const theme = useTheme();
  const rows = calendars.length > 0 ? calendars : MOCK_CALENDARS;

  if (isLoading) {
    return (
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Calendars
          </Typography>
        </Box>
        <LinearProgress />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  py: 1.5,
                  pl: 2,
                }}
              >
                Calendar Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Period
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Working Days
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Holidays
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Status
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  pr: 2,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify
                        icon="mdi:calendar-remove-outline"
                        width={32}
                        color="text.disabled"
                      />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      No calendars found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Create your first academic calendar to get started
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {rows.map((cal) => {
              const bgColor = STATUS_BG[cal.status as CalendarStatus] ?? '#78909c';
              const isPublished = cal.status === CalendarStatus.Published;
              const isDraft = cal.status === CalendarStatus.Draft;

              return (
                <TableRow
                  key={cal.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s',
                    borderLeft: isPublished
                      ? `3px solid ${theme.palette.success.main}`
                      : isDraft
                        ? `3px solid ${theme.palette.grey[400]}`
                        : `3px solid ${theme.palette.warning.main}`,
                    '&:hover': { backgroundColor: alpha(bgColor, 0.04) },
                  }}
                >
                  {/* Name */}
                  <TableCell sx={{ pl: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: '13px',
                          fontWeight: 800,
                          borderRadius: 2,
                          backgroundColor: alpha(bgColor, 0.14),
                          color: bgColor,
                        }}
                      >
                        {cal.name.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Stack direction="row" alignItems="center" gap={0.75}>
                          <Typography variant="body2" fontWeight={700}>
                            {cal.name}
                          </Typography>
                          {cal.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              color="primary"
                              sx={{ height: 16, fontSize: '9px', '& .MuiChip-label': { px: 0.75 } }}
                            />
                          )}
                        </Stack>
                        {cal.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 200, display: 'block' }}
                          >
                            {cal.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Period */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {dayjs(cal.startDate).format('DD MMM YY')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      to {dayjs(cal.endDate).format('DD MMM YY')}
                    </Typography>
                  </TableCell>

                  {/* Working Days */}
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.3,
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                      }}
                    >
                      <Iconify icon="mdi:briefcase-check-outline" width={12} color="success.main" />
                      <Typography variant="caption" fontWeight={700} color="success.main">
                        {cal.totalWorkingDays ?? '—'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Holidays */}
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.3,
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                      }}
                    >
                      <Iconify icon="mdi:flag-outline" width={12} color="error.main" />
                      <Typography variant="caption" fontWeight={700} color="error.main">
                        {cal.totalHolidays ?? '—'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      size="small"
                      label={CALENDAR_STATUS_LABELS[cal.status as CalendarStatus]}
                      color={CALENDAR_STATUS_COLORS[cal.status as CalendarStatus]}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <Stack direction="row" justifyContent="flex-end" spacing={0.25}>
                      <Tooltip title="Select & View Calendar">
                        <IconButton
                          size="small"
                          onClick={() => onView(cal)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                          }}
                        >
                          <Iconify icon="mdi:eye-outline" width={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CalendarListTable;
