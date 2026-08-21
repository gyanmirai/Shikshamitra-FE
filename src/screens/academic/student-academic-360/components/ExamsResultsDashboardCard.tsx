'use client';

import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  Divider,
  Skeleton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';

import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetExamBasicDetailsQuery,
  useGetExamScheduleQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { StudentDetailsDialog } from 'src/screens/examination/resultCreation/ResultCreation';

import { Academic360EmptyState } from './Academic360EmptyState';
import { getStudentId, getStudentName } from '../types';
import type { Academic360ExamResult, Academic360StudentRow } from '../types';

export type ExamStatusCategory = 'PUBLISHED' | 'COMPLETED';

export type ExamItem = Academic360ExamResult & {
  id?: string;
  subjectName?: string;
  examType?: string;
  academicYear?: string;
  standardName?: string;
  divisionName?: string;
  classes?: string;
  examDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  score?: number | null;
  maxScore?: number | null;
  resultPublished?: boolean;
  isPassed?: boolean;
  remarks?: string;
  [key: string]: any;
};

type ExamsResultsDashboardCardProps = {
  exams?: ExamItem[];
  isLoading?: boolean;
  isError?: boolean;
  student?: Academic360StudentRow | null;
  fullView?: boolean;
  onRetry?: () => void;
  onViewAll?: () => void;
};

// ─── Status Classification ──────────────────────────────────────────────────

/**
 * Determines whether the exam belongs to 'PUBLISHED' (schedule/ongoing) or 'COMPLETED' (results available)
 */
export function getExamStatusCategory(exam: ExamItem): ExamStatusCategory {
  const rawStatus = (exam.status || exam.resultStatus || '').toUpperCase().trim();
  const resStatus = (exam.resultStatus || '').toLowerCase();

  // If explicit completed status or result flags are active
  if (
    rawStatus === 'COMPLETED' ||
    resStatus.includes('completed') ||
    rawStatus === 'RESULT_PENDING' ||
    rawStatus === 'RESULT_PUBLISHED' ||
    resStatus.includes('published') ||
    exam.resultPublished === true ||
    typeof exam.percentage === 'number' ||
    typeof exam.obtainedMarks === 'number' ||
    Boolean(exam.grade)
  ) {
    return 'COMPLETED';
  }

  // Otherwise it is in the Published / Schedule phase
  return 'PUBLISHED';
}

function getStatusBadgeConfig(exam: ExamItem): {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  category: ExamStatusCategory;
} {
  const category = getExamStatusCategory(exam);
  const rawStatus = (exam.status || exam.resultStatus || '').toUpperCase().trim();

  if (category === 'COMPLETED') {
    if (rawStatus === 'ABSENT' || exam.resultStatus?.toLowerCase().includes('absent')) {
      return { label: 'Absent', color: 'error', category };
    }
    if (rawStatus === 'WITHHELD' || exam.resultStatus?.toLowerCase().includes('withheld')) {
      return { label: 'Withheld', color: 'warning', category };
    }
    if (typeof exam.percentage === 'number' || exam.resultPublished || typeof exam.obtainedMarks === 'number') {
      return { label: 'Completed', color: 'success', category };
    }
    return { label: 'Completed', color: 'success', category };
  }

  // Published
  if (rawStatus === 'ONGOING') {
    return { label: 'Ongoing', color: 'primary', category };
  }
  return { label: 'Published', color: 'info', category };
}

function formatExamDate(dateStr?: string): string {
  if (!dateStr) return 'Not specified';
  const parsed = dayjs(dateStr);
  if (parsed.isValid()) {
    return parsed.format('DD-MM-YYYY');
  }
  return dateStr;
}

function getExamIcon(exam: ExamItem): string {
  const typeStr = (exam.examType || exam.examName || '').toLowerCase();
  if (typeStr.includes('practical') || typeStr.includes('lab')) return 'mdi:flask-outline';
  if (typeStr.includes('oral') || typeStr.includes('viva') || typeStr.includes('speech')) return 'mdi:microphone-outline';
  if (typeStr.includes('assignment') || typeStr.includes('quiz')) return 'mdi:clipboard-text-outline';
  if (typeStr.includes('final') || typeStr.includes('annual') || typeStr.includes('term') || typeStr.includes('board')) return 'mdi:trophy-outline';
  return 'mdi:file-document-outline';
}

const getSubjectTheme = (subjectName: string) => {
  const name = (subjectName || '').toLowerCase();
  if (name.includes('math')) {
    return { color: '#1976d2', icon: 'mdi:calculator', bg: 'rgba(25, 118, 210, 0.1)' };
  }
  if (name.includes('sci') || name.includes('phys') || name.includes('chem') || name.includes('bio')) {
    return { color: '#00897b', icon: 'mdi:flask', bg: 'rgba(0, 137, 123, 0.1)' };
  }
  if (name.includes('eng') || name.includes('lit')) {
    return { color: '#7b1fa2', icon: 'mdi:book-open-page-variant', bg: 'rgba(123, 31, 162, 0.1)' };
  }
  if (name.includes('soc') || name.includes('hist') || name.includes('geo')) {
    return { color: '#fb8c00', icon: 'mdi:earth', bg: 'rgba(251, 140, 0, 0.1)' };
  }
  if (name.includes('comp') || name.includes('ict') || name.includes('info')) {
    return { color: '#03a9f4', icon: 'mdi:monitor', bg: 'rgba(3, 169, 244, 0.1)' };
  }
  if (name.includes('hin')) {
    return { color: '#e91e63', icon: 'mdi:alphabet-latin', bg: 'rgba(233, 30, 99, 0.1)' };
  }
  if (name.includes('sans')) {
    return { color: '#9c27b0', icon: 'mdi:script-text-outline', bg: 'rgba(156, 39, 176, 0.1)' };
  }
  if (name.includes('phy') || name.includes('pe') || name.includes('sport')) {
    return { color: '#4caf50', icon: 'mdi:run', bg: 'rgba(76, 175, 80, 0.1)' };
  }
  return { color: '#607d8b', icon: 'mdi:book-outline', bg: 'rgba(96, 125, 139, 0.1)' };
};

// ─── Published Exam Details & Schedule Dialog ───────────────────────────────

type PublishedExamDialogProps = {
  open: boolean;
  onClose: () => void;
  exam: ExamItem | null;
  student?: Academic360StudentRow | null;
};

function PublishedExamScheduleDialog({ open, onClose, exam, student }: PublishedExamDialogProps) {
  const theme = useTheme();
  const examId = exam?.examId || exam?.id;

  const { data: basicDetails, isLoading: isBasicLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamBasicDetailsQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });

  const { data: scheduleData, isLoading: isScheduleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamScheduleQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });

  const examDetails = (basicDetails as any)?.data || basicDetails || exam;
  const scheduleItems = (scheduleData as any)?.data || scheduleData || exam?.subjects || [];

  const examTitle = examDetails?.examName || exam?.examName || 'Scheduled Exam';
  const examType = examDetails?.examTypeName || examDetails?.examType || exam?.examType || 'Standard Written';
  const academicYear = examDetails?.academicYearName || examDetails?.academicYear || student?.academicYearName || 'Current Academic Year';
  const standardName = examDetails?.standardName || student?.standardName || student?.standard || '-';
  const divisionName = examDetails?.divisionName || student?.divisionName || student?.division || '-';
  const dates = examDetails?.examDates || (exam?.examDate ? formatExamDate(exam.examDate) : 'Dates as scheduled');

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={
        <Box display="flex" flexDirection="row" gap={1.5} alignItems="center" component="span">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'info.softBg',
              color: 'info.main',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Iconify icon="mdi:calendar-clock" width={20} />
          </Box>
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {examTitle}
          </Box>
          <Label color="info" variant="soft" sx={{ fontWeight: 700 }}>
            Published
          </Label>
        </Box>
      }
      maxWidth="md"
    >
      <DialogScrollContent>
        <Stack spacing={2.5} sx={{ pt: 1, pb: 1 }}>
          {/* Top Banner / Key Details */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: (themeMode) => alpha(themeMode.palette.info.main, 0.05),
              border: '1px solid',
              borderColor: (themeMode) => alpha(themeMode.palette.info.main, 0.2),
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Academic Year
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {academicYear}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Class & Division
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {standardName} {divisionName !== '-' ? `(${divisionName})` : ''}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Exam Type
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {examType}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Exam Schedule Period
                </Typography>
                <Typography variant="body2" fontWeight={700} color="info.dark">
                  {dates}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Exam Schedule Table */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Exam Schedule & Subject Details
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color="info"
                label={`${Array.isArray(scheduleItems) ? scheduleItems.length : 0} Subjects`}
              />
            </Stack>

            {isScheduleLoading || isBasicLoading ? (
              <Stack spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            ) : Array.isArray(scheduleItems) && scheduleItems.length > 0 ? (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.neutral' }}>
                      <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Time Slot</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 1.25 }}>Max Marks</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 1.25 }}>Pass Marks</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.25 }}>Room / Hall</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduleItems.map((sub: any, idx: number) => {
                      const subjectName = sub.subjectName || sub.name || `Subject ${idx + 1}`;
                      const themeInfo = getSubjectTheme(subjectName);
                      const subDate = sub.examDate ? dayjs(sub.examDate).format('DD-MM-YYYY') : sub.date || '-';
                      const startTime = sub.startTime || sub.fromTime || '';
                      const endTime = sub.endTime || sub.toTime || '';
                      const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : startTime || 'As per session';
                      const maxMarks = sub.maxMarks || sub.totalMarks || '100';
                      const passMarks = sub.passingMarks || sub.passMarks || Math.round(Number(maxMarks) * 0.35) || '35';
                      const roomName = sub.roomName || sub.roomNumber || sub.hallNumber || 'Assigned Hall';

                      return (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 1,
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: themeInfo.bg,
                                  color: themeInfo.color,
                                  flexShrink: 0,
                                }}
                              >
                                <Iconify icon={themeInfo.icon} width={16} />
                              </Box>
                              <Typography variant="body2" fontWeight={600}>
                                {subjectName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {subDate}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {timeStr}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {maxMarks}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {passMarks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" variant="soft" label={roomName} sx={{ fontSize: 11 }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                <Iconify icon="mdi:calendar-blank-outline" width={32} sx={{ color: 'text.secondary', mb: 1 }} />
                <Typography variant="subtitle2">Detailed schedule will be published shortly</Typography>
                <Typography variant="caption" color="text.secondary">
                  Subject time-slots and seating arrangements are currently being finalized.
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
          variant="outlined"
          size="small"
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

// ─── Main Exams & Results Component ──────────────────────────────────────────

export function ExamsResultsDashboardCard({
  exams = [],
  isLoading = false,
  isError = false,
  student,
  fullView = false,
  onRetry,
  onViewAll,
}: ExamsResultsDashboardCardProps) {
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'published' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalExam, setActiveModalExam] = useState<ExamItem | null>(null);
  const [showAllDialog, setShowAllDialog] = useState(false);

  // Deduplicate and enrich exams
  const deduplicatedExams = useMemo(() => {
    const map = new Map<string, ExamItem>();
    exams.forEach((exam) => {
      const key =
        exam.id ||
        exam.examId ||
        `${(exam.examName || '').trim().toLowerCase()}_${(exam.subjectName || '').trim().toLowerCase()}_${exam.examDate || ''}`;
      if (!map.has(key)) {
        map.set(key, exam);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateA = a.examDate ? new Date(a.examDate).getTime() : 0;
      const dateB = b.examDate ? new Date(b.examDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [exams]);

  // Metrics summary
  const metrics = useMemo(() => {
    let publishedCount = 0;
    let completedCount = 0;
    let totalScoreSum = 0;
    let scoreCount = 0;

    deduplicatedExams.forEach((exam) => {
      const cat = getExamStatusCategory(exam);
      if (cat === 'PUBLISHED') {
        publishedCount += 1;
      } else {
        completedCount += 1;
        if (typeof exam.percentage === 'number') {
          totalScoreSum += exam.percentage;
          scoreCount += 1;
        } else if (typeof exam.score === 'number') {
          totalScoreSum += exam.score;
          scoreCount += 1;
        }
      }
    });

    const average = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : null;

    return {
      total: deduplicatedExams.length,
      published: publishedCount,
      completed: completedCount,
      average,
    };
  }, [deduplicatedExams]);

  // Filtered exams according to active status tab and search
  const filteredExams = useMemo(() => {
    return deduplicatedExams.filter((exam) => {
      const cat = getExamStatusCategory(exam);

      // Status tab check
      if (activeStatusTab === 'published' && cat !== 'PUBLISHED') return false;
      if (activeStatusTab === 'completed' && cat !== 'COMPLETED') return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const examName = (exam.examName || '').toLowerCase();
        const subjectName = (exam.subjectName || '').toLowerCase();
        const examType = (exam.examType || '').toLowerCase();
        return examName.includes(query) || subjectName.includes(query) || examType.includes(query);
      }

      return true;
    });
  }, [deduplicatedExams, activeStatusTab, searchQuery]);

  const handleOpenExamModal = (exam: ExamItem) => {
    setActiveModalExam(exam);
  };

  const handleCloseExamModal = () => {
    setActiveModalExam(null);
  };

  // Loading State
  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Skeleton variant="rectangular" width={38} height={38} sx={{ borderRadius: 1.5 }} />
              <Box>
                <Skeleton variant="text" width={140} height={24} />
                <Skeleton variant="text" width={180} height={16} />
              </Box>
            </Stack>
            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
          </Stack>
          <Grid container spacing={1}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 6, sm: 3 }}>
                <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1.5 }} />
              </Grid>
            ))}
          </Grid>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={64} sx={{ borderRadius: 1.5 }} />
            ))}
          </Stack>
        </Stack>
      </Card>
    );
  }

  // Error State
  if (isError) {
    return (
      <Card variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Stack spacing={1.5} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'error.softBg',
              color: 'error.main',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Iconify icon="mdi:alert-circle-outline" width={28} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Unable to load exams
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check your connection and try again.
          </Typography>
          {onRetry && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={onRetry}
              startIcon={<Iconify icon="mdi:refresh" width={16} />}
              sx={{ textTransform: 'none', fontWeight: 600, mt: 1 }}
            >
              Retry
            </Button>
          )}
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 3px 0 rgba(0,0,0,0.05)',
        }}
      >
        <Stack spacing={2}>
          {/* HEADER SECTION */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.primary.main}14`,
                  color: 'primary.main',
                }}
              >
                <Iconify icon="mdi:trophy-outline" width={24} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>
                    Exams & Performance
                  </Typography>
                  <Label color="primary" variant="soft" sx={{ fontWeight: 600 }}>
                    {`${metrics.total} Total Exams`}
                  </Label>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Status-wise exam schedules, timetable details & student evaluation results
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              {metrics.average !== null && (
                <Box
                  sx={{
                    py: 0.6,
                    px: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                      sx={{ fontSize: 10, lineHeight: 1.1 }}
                    >
                      Average Score
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      color="warning.dark"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {metrics.average}%
                    </Typography>
                  </Box>
                  <Iconify icon="mdi:trending-up" width={20} color="warning.main" />
                </Box>
              )}

              {!fullView && deduplicatedExams.length > 4 && (
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                  onClick={() => {
                    if (onViewAll) onViewAll();
                    else setShowAllDialog(true);
                  }}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  View All
                </Button>
              )}
            </Stack>
          </Stack>

          <Divider />

          {/* STATUS FILTER TABS & SEARCH BAR */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1.5}
          >
            <Tabs
              value={activeStatusTab}
              onChange={(_e, val) => setActiveStatusTab(val)}
              sx={{
                minHeight: 36,
                '& .MuiTabs-flexContainer': {
                  gap: 0.75,
                },
                '& .MuiTab-root': {
                  minHeight: 36,
                  minWidth: 0,
                  py: 0.5,
                  px: 1,
                  mr: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                },
              }}
            >
              <Tab
                value="all"
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <span>All</span>
                    <Chip size="small" label={metrics.total} sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                  </Stack>
                }
              />
              <Tab
                value="published"
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <span>Published</span>
                    <Label color="info" variant="soft" sx={{ height: 18, fontSize: 10, fontWeight: 700, px: 0.75 }}>
                      {metrics.published}
                    </Label>
                  </Stack>
                }
              />
              <Tab
                value="completed"
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <span>Completed</span>
                    <Label color="success" variant="soft" sx={{ height: 18, fontSize: 10, fontWeight: 700, px: 0.75 }}>
                      {metrics.completed}
                    </Label>
                  </Stack>
                }
              />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search exam or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:magnify" width={18} color="text.secondary" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
            />
          </Stack>

          {/* EXAM LIST / TABLE */}
          {filteredExams.length > 0 ? (
            <Stack spacing={1.25}>
              {(fullView ? filteredExams : filteredExams.slice(0, 4)).map((exam) => {
                const statusBadge = getStatusBadgeConfig(exam);
                const isCompleted = statusBadge.category === 'COMPLETED';
                const iconName = getExamIcon(exam);
                const examTitle = exam.examName || 'Exam';
                const subject = exam.subjectName || (exam.subjects && exam.subjects.length > 0 ? String((exam.subjects[0] as any).subjectName || '') : '');
                const dateStr = formatExamDate(exam.examDate);
                const subtitleText = [subject, dateStr].filter(Boolean).join(' • ');

                // Display score / schedule info
                let scoreText = '—';
                if (statusBadge.label === 'Absent') {
                  scoreText = 'AB';
                } else if (typeof exam.percentage === 'number') {
                  scoreText = `${exam.percentage}%`;
                } else if (typeof exam.obtainedMarks === 'number' && typeof exam.totalMarks === 'number') {
                  scoreText = `${exam.obtainedMarks} / ${exam.totalMarks}`;
                } else if (exam.score !== undefined && exam.score !== null) {
                  scoreText = `${exam.score}%`;
                }

                return (
                  <Box
                    key={exam.id || exam.examId || `${examTitle}-${dateStr}`}
                    onClick={() => handleOpenExamModal(exam)}
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: isCompleted ? 'success.light' : 'info.light',
                        boxShadow: (theme) => theme.customShadows?.z1 || '0 2px 8px 0 rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      gap={1.5}
                    >
                      {/* Left: Icon + Exam Info */}
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 220, flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: (theme) =>
                              isCompleted
                                ? `${theme.palette.success.main}14`
                                : `${theme.palette.info.main}14`,
                            color: isCompleted ? 'success.main' : 'info.main',
                            flexShrink: 0,
                          }}
                        >
                          <Iconify icon={iconName} width={22} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap>
                              {examTitle}
                            </Typography>
                            {exam.examType && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={exam.examType}
                                sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                              />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {subtitleText}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Right: Score/Schedule Info, Status Chip, Dynamic Action Button */}
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        {/* Score display for completed, Date for published */}
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 80 }}>
                          {isCompleted ? (
                            <>
                              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                {scoreText}
                              </Typography>
                              {exam.grade && (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11 }}>
                                  Grade {exam.grade}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                Scheduled
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={700} color="info.main">
                                {dateStr}
                              </Typography>
                            </>
                          )}
                        </Box>

                        {/* Status Label Chip */}
                        <Label
                          color={statusBadge.color as any}
                          variant="soft"
                          sx={{ fontWeight: 700, minWidth: 78, textAlign: 'center' }}
                        >
                          {statusBadge.label}
                        </Label>

                        {/* Dynamic Status-Based Action Button */}
                        <Button
                          size="small"
                          variant="soft"
                          color={isCompleted ? 'success' : 'info'}
                          startIcon={
                            <Iconify
                              icon={isCompleted ? 'mdi:chart-box-outline' : 'mdi:calendar-text-outline'}
                              width={16}
                            />
                          }
                          endIcon={<Iconify icon="mdi:chevron-right" width={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenExamModal(exam);
                          }}
                          sx={{
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: 12,
                            px: 1.25,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isCompleted ? 'View Result' : 'View Exam'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}

              {!fullView && filteredExams.length > 4 && (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    if (onViewAll) onViewAll();
                    else setShowAllDialog(true);
                  }}
                  endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                  sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                >
                  View all {filteredExams.length} exams
                </Button>
              )}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon={
                activeStatusTab === 'published'
                  ? 'mdi:calendar-blank-outline'
                  : activeStatusTab === 'completed'
                    ? 'mdi:trophy-outline'
                    : 'mdi:file-document-outline'
              }
              color={activeStatusTab === 'published' ? 'info' : 'warning'}
              title={
                searchQuery
                  ? 'No matching exams found'
                  : activeStatusTab === 'published'
                    ? 'No published exams'
                    : activeStatusTab === 'completed'
                      ? 'No completed exams'
                      : 'No exams scheduled'
              }
              description={
                searchQuery
                  ? `No exams found matching "${searchQuery}". Try a different keyword.`
                  : activeStatusTab === 'published'
                    ? 'There are no active or published exams currently scheduled.'
                    : activeStatusTab === 'completed'
                      ? 'No examination results have been completed or published yet.'
                      : 'Upcoming exams and results will appear here as soon as they are configured.'
              }
              compact
            />
          )}
        </Stack>
      </Card>

      {/* PUBLISHED EXAM DIALOG (Schedule & Exam Details View) */}
      {activeModalExam && getExamStatusCategory(activeModalExam) === 'PUBLISHED' && (
        <PublishedExamScheduleDialog
          open={Boolean(activeModalExam)}
          onClose={handleCloseExamModal}
          exam={activeModalExam}
          student={student}
        />
      )}

      {/* COMPLETED EXAM DIALOG (Exact StudentDetailsDialog from ResultCreation) */}
      {activeModalExam && getExamStatusCategory(activeModalExam) === 'COMPLETED' && (
        <StudentDetailsDialog
          open={Boolean(activeModalExam)}
          onClose={handleCloseExamModal}
          row={{
            studentId: student ? getStudentId(student) : (activeModalExam as any)?.studentId || '',
            StudentId: student ? getStudentId(student) : (activeModalExam as any)?.studentId || '',
            studentName: student ? getStudentName(student) : '',
            grNo: student?.grNo,
            rollNo: student?.rollNo,
            className: student?.standardName || student?.standard,
            divisionName: student?.divisionName || student?.division,
          }}
          examId={activeModalExam.examId || activeModalExam.id || ''}
          examName={activeModalExam.examName}
          schoolName=""
        />
      )}

      {/* ALL EXAMS POPUP (When opened from compact view) */}
      {showAllDialog && (
        <CustomDialog
          open={showAllDialog}
          handleClose={() => setShowAllDialog(false)}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
              <Iconify icon="mdi:trophy-outline" width={20} color="primary.main" />
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                All Student Exams ({deduplicatedExams.length})
              </Box>
            </Box>
          }
          maxWidth="md"
        >
          <DialogScrollContent>
            <Stack spacing={1.5} sx={{ py: 1 }}>
              {deduplicatedExams.map((exam) => {
                const statusBadge = getStatusBadgeConfig(exam);
                const isCompleted = statusBadge.category === 'COMPLETED';
                const iconName = getExamIcon(exam);
                const examTitle = exam.examName || 'Exam';
                const subject = exam.subjectName || (exam.subjects && exam.subjects.length > 0 ? String((exam.subjects[0] as any).subjectName || '') : '');
                const dateStr = formatExamDate(exam.examDate);

                return (
                  <Box
                    key={exam.id || exam.examId || `${examTitle}-${dateStr}`}
                    onClick={() => {
                      setShowAllDialog(false);
                      handleOpenExamModal(exam);
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: isCompleted ? 'success.softBg' : 'info.softBg',
                            color: isCompleted ? 'success.main' : 'info.main',
                          }}
                        >
                          <Iconify icon={iconName} width={20} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {examTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {[subject, dateStr].filter(Boolean).join(' • ')}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Label color={statusBadge.color as any} variant="soft" sx={{ fontWeight: 600 }}>
                          {statusBadge.label}
                        </Label>
                        <Button
                          size="small"
                          variant="soft"
                          color={isCompleted ? 'success' : 'info'}
                          endIcon={<Iconify icon="mdi:chevron-right" width={16} />}
                          sx={{ fontWeight: 700, fontSize: 12 }}
                        >
                          {isCompleted ? 'View Result' : 'View Exam'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </DialogScrollContent>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => setShowAllDialog(false)}
              variant="outlined"
              size="small"
            >
              Close
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
}
