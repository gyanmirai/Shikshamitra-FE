import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import { useGetExamScheduleQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import {
  Box,
  Chip,
  Table,
  Tooltip,
  Divider,
  TableRow,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import type { IExamFormValues } from '../type';

interface ViewTimetableCompProps {
  examData: IExamFormValues | null;
}

dayjs.extend(utc);

const COLUMNS = [
  { id: 'subject', label: 'Subject' },
  { id: 'date', label: 'Date' },
  { id: 'startTime', label: 'Start Time' },
  { id: 'endTime', label: 'End Time' },
  { id: 'duration', label: 'Duration' },
  { id: 'totalMarks', label: 'Total Marks' },
  { id: 'passingMarks', label: 'Passing Marks' },
  { id: 'gradeScale', label: 'Grade Scale' },
  { id: 'notes', label: 'Notes' },
];

const CELL_SX = { py: 0.875, px: 1.5, borderBottom: '1px dashed' } as const;

const ViewTimetableComp: React.FC<ViewTimetableCompProps> = ({ examData }) => {
  const theme = useTheme();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: scheduleDetails, isLoading: scheduleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamScheduleQuery,
    params: { examId: examData?.examId },
    options: { skip: !examData?.examId },
  });

  const { data: gradeScalings } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (currentMedium as any)?.id },
    options: { skip: !(currentMedium as any)?.id },
  });

  const gradeMap = React.useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (gradeScalings?.data ?? []).forEach((g: any) => {
      map[g.id] = g.name ?? g.scaleName ?? g.title ?? g.id;
    });
    return map;
  }, [gradeScalings]);

  if (!examData) return null;

  const subjects = scheduleDetails?.subjects ?? [];

  // Status-aware left-border colour
  const accentColor =
    examData.status === 1
      ? theme.palette.info.main
      : examData.status === 2
        ? theme.palette.success.main
        : theme.palette.warning.main;

  return (
    <Box
      sx={{
        ml: 5,
        mr: 1,
        my: 1,
        borderRadius: 1.5,
        border: `1px solid ${theme.vars.palette.divider}`,
        borderLeft: `3px solid ${accentColor}`,
        bgcolor: 'background.neutral',
        overflow: 'hidden',
      }}
    >
      {/* ── Identity header strip ── */}
      <Box
        sx={{
          px: 2,
          py: 0.875,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        }}
      >
        <Typography variant="caption" fontWeight={700} color="text.primary" noWrap>
          {examData.examName}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ height: 14, my: 'auto' }} />

        <Typography variant="caption" color="text.secondary" noWrap>
          {examData.className ?? examData.className}
        </Typography>

        {(examData.divisions ?? []).slice(0, 4).map((div) => (
          <Chip
            key={div}
            label={div}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.68rem', borderRadius: 1 }}
          />
        ))}
        {(examData.divisions ?? []).length > 4 && (
          <Chip
            label={`+${examData.divisions.length - 4}`}
            size="small"
            sx={{ height: 18, fontSize: '0.68rem', borderRadius: 1 }}
          />
        )}

        <Chip
          label={`${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`}
          size="small"
          color="primary"
          variant="soft"
          sx={{ height: 18, fontSize: '0.68rem', borderRadius: 1, ml: 'auto' }}
        />
      </Box>

      {/* ── Lightweight read-only table ── */}
      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'auto', minWidth: 700 }}>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                    bgcolor: 'background.neutral',
                    borderBottom: `1px solid ${theme.vars.palette.divider}`,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {scheduleLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={{ py: 1, px: 1.5 }}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  sx={{ textAlign: 'center', py: 3, color: 'text.disabled', fontSize: '0.8rem' }}
                >
                  No subjects scheduled for this exam yet.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject: any, idx: number) => {
                const diffMins =
                  subject.startTime && subject.endTime
                    ? dayjs(subject.endTime).diff(dayjs(subject.startTime), 'minute')
                    : null;
                const hrs = diffMins != null ? Math.floor(diffMins / 60) : 0;
                const mins = diffMins != null ? diffMins % 60 : 0;
                const durationLabel =
                  diffMins != null && diffMins > 0
                    ? `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim()
                    : null;

                return (
                  <TableRow
                    key={subject.subjectId ?? idx}
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      bgcolor: idx % 2 !== 0 ? 'action.hover' : 'transparent',
                    }}
                  >
                    {/* Subject */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider', whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box
                          sx={{
                            width: 3,
                            height: 16,
                            borderRadius: 0.5,
                            flexShrink: 0,
                            bgcolor: subject.subjectColor ?? 'primary.main',
                          }}
                        />
                        <Typography variant="caption" fontWeight={600}>
                          {subject.subjectName}
                        </Typography>
                        {subject.subjectCode && (
                          <Typography variant="caption" color="text.secondary">
                            ({subject.subjectCode})
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider', whiteSpace: 'nowrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {subject.examDate ? dayjs(subject.examDate).format('DD MMM YYYY') : '—'}
                      </Typography>
                    </TableCell>

                    {/* Start Time */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider', whiteSpace: 'nowrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {subject.startTime ? dayjs(subject.startTime).format('hh:mm A') : '—'}
                      </Typography>
                    </TableCell>

                    {/* End Time */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider', whiteSpace: 'nowrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {subject.endTime ? dayjs(subject.endTime).format('hh:mm A') : '—'}
                      </Typography>
                    </TableCell>

                    {/* Duration */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider' }}>
                      {durationLabel ? (
                        <Chip
                          label={durationLabel}
                          size="small"
                          color="info"
                          variant="soft"
                          sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600, borderRadius: 1 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Total Marks */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider' }}>
                      <Typography variant="caption" fontWeight={600}>
                        {subject.totalMarks != null && subject.totalMarks !== ''
                          ? subject.totalMarks
                          : '—'}
                      </Typography>
                    </TableCell>

                    {/* Passing Marks */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider' }}>
                      <Typography variant="caption" fontWeight={600}>
                        {subject.passingMarks != null && subject.passingMarks !== ''
                          ? subject.passingMarks
                          : '—'}
                      </Typography>
                    </TableCell>

                    {/* Grade Scale */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider', whiteSpace: 'nowrap' }}>
                      {subject.gradeScalingId && gradeMap[subject.gradeScalingId] ? (
                        <Chip
                          label={gradeMap[subject.gradeScalingId]}
                          size="small"
                          color="secondary"
                          variant="soft"
                          sx={{ height: 18, fontSize: '0.68rem', borderRadius: 1 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Notes */}
                    <TableCell sx={{ ...CELL_SX, borderColor: 'divider', maxWidth: 220 }}>
                      {subject.notes ? (
                        <Tooltip title={subject.notes} placement="top-start">
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              cursor: 'default',
                            }}
                          >
                            {subject.notes}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewTimetableComp;
