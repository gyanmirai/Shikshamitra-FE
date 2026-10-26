'use client';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { StudentDetailsDialog } from 'src/screens/examination/resultCreation/ResultCreation';
import ScheduleExamPreviewDrawer from 'src/screens/examination/scheduleExam/components/ScheduleExamPreviewDrawer';
import {
  Box,
  Tab,
  Card,
  Chip,
  Grid,
  Tabs,
  Stack,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  DialogActions,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { getStudentId, getStudentName } from '../types';
import { Academic360EmptyState } from './Academic360EmptyState';
import { Academic360SectionHeader } from './Academic360SectionHeader';

import type { Academic360ExamResult, Academic360StudentRow } from '../types';

export type ExamStatusCategory = 'UPCOMING' | 'COMPLETED' | 'PUBLISHED';

export type ExamItem = Academic360ExamResult & {
  id?: string;
  subjectName?: string;
  examType?: string;
  academicYear?: string;
  standardName?: string;
  divisionName?: string;
  classes?: string;
  examDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
  score?: number | null;
  maxScore?: number | null;
  resultPublished?: boolean;
  isPassed?: boolean;
  remarks?: string | null;
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

const PAGE_SIZE = 6;

// ─── Status Classification & Formatting Helpers ──────────────────────────────

/**
 * Determines whether grading and results are completed for an exam.
 */
export function isExamGradingCompleted(exam: ExamItem): boolean {
  const gradingStatus = (exam.gradingStatus || '').toLowerCase().trim();
  const resStatus = (exam.resultStatus || '').toLowerCase().trim();
  const rawStatus = (exam.status || exam.examStatus || '').toUpperCase().trim();

  if (gradingStatus === 'completed') return true;
  if (resStatus === 'completed' || resStatus.includes('published')) return true;
  if (exam.resultAvailable === true || exam.resultPublished === true) return true;

  // Fallback for legacy result records without explicit gradingStatus
  if (!exam.gradingStatus && !exam.resultStatus) {
    if (rawStatus === 'COMPLETED') return true;
    if (typeof exam.percentage === 'number' && exam.percentage > 0) return true;
    if (typeof exam.obtainedMarks === 'number' && exam.obtainedMarks > 0) return true;
    if (exam.grade) return true;
  }

  return false;
}

/**
 * Determines whether the exam belongs to 'UPCOMING' (schedule/ongoing) or 'COMPLETED' (results available)
 */
export function getExamStatusCategory(exam: ExamItem): 'UPCOMING' | 'COMPLETED' {
  if (isExamGradingCompleted(exam)) {
    return 'COMPLETED';
  }
  return 'UPCOMING';
}

export function getStatusBadgeConfig(exam: ExamItem): {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  category: 'UPCOMING' | 'COMPLETED';
} {
  const isCompleted = isExamGradingCompleted(exam);
  const category = isCompleted ? 'COMPLETED' : 'UPCOMING';
  const rawStatus = (exam.status || exam.examStatus || '').toUpperCase().trim();
  const gradingStatus = (exam.gradingStatus || '').toLowerCase().trim();

  if (isCompleted) {
    if (rawStatus === 'ABSENT' || exam.resultStatus?.toLowerCase().includes('absent')) {
      return { label: 'Absent', color: 'error', category };
    }
    if (rawStatus === 'WITHHELD' || exam.resultStatus?.toLowerCase().includes('withheld')) {
      return { label: 'Withheld', color: 'warning', category };
    }
    return { label: 'Completed', color: 'success', category };
  }

  if (gradingStatus === 'in progress') {
    return { label: 'Grading Pending', color: 'warning', category };
  }
  if (rawStatus === 'ONGOING') {
    return { label: 'Ongoing', color: 'primary', category };
  }
  if (rawStatus === 'CANCELLED') {
    return { label: 'Cancelled', color: 'error', category };
  }

  return { label: 'Upcoming', color: 'info', category };
}

export type ParsedExamDetails = {
  startDateStr: string | null;
  endDateStr: string | null;
  isDateRange: boolean;
  timeStr: string | null;
  subjectSummary: string | null;
  allSubjectsTooltip: string | null;
  totalMarksStr: string | null;
};

export function getParsedExamDetails(exam: ExamItem): ParsedExamDetails {
  // 1. Subjects Summary
  let subjectSummary: string | null = null;
  let allSubjectsTooltip: string | null = null;

  if (exam.subjectName) {
    subjectSummary = exam.subjectName;
  } else if (exam.subjects && exam.subjects.length > 0) {
    const subjectNames = exam.subjects
      .map((s: any) => s.subjectName || s.name)
      .filter(Boolean);

    if (subjectNames.length === 1) {
      subjectSummary = subjectNames[0];
    } else if (subjectNames.length === 2) {
      subjectSummary = subjectNames.join(', ');
    } else if (subjectNames.length > 2) {
      subjectSummary = `${exam.subjects.length} Subjects (${subjectNames.slice(0, 2).join(', ')} +${exam.subjects.length - 2})`;
      allSubjectsTooltip = subjectNames.join(', ');
    }
  }

  // 2. Dates
  const rawStart = exam.startDate || exam.examDate || (exam as any).date || (exam as any).scheduleDate;
  const rawEnd = exam.endDate;

  let startDateStr: string | null = null;
  let endDateStr: string | null = null;
  let isDateRange = false;

  if (rawStart) {
    const parsedStart = dayjs(rawStart);
    if (parsedStart.isValid()) {
      startDateStr = parsedStart.format('DD-MM-YYYY');
      if (rawEnd) {
        const parsedEnd = dayjs(rawEnd);
        if (parsedEnd.isValid()) {
          const formattedEnd = parsedEnd.format('DD-MM-YYYY');
          if (startDateStr !== formattedEnd) {
            endDateStr = formattedEnd;
            isDateRange = true;
          }
        }
      }
    } else {
      startDateStr = String(rawStart);
    }
  }

  // 3. Time
  let timeStr: string | null = null;
  if (exam.startTime && exam.endTime) {
    const parseTime = (t: string) => {
      if (t.includes('T')) {
        const p = dayjs(t);
        return p.isValid() ? p.format('hh:mm A') : t;
      }
      const p = dayjs(`2000-01-01T${t}`);
      return p.isValid() ? p.format('hh:mm A') : t;
    };
    timeStr = `${parseTime(exam.startTime)} – ${parseTime(exam.endTime)}`;
  } else if (exam.startDate && exam.endDate) {
    const startD = dayjs(exam.startDate);
    const endD = dayjs(exam.endDate);
    if (startD.isValid() && endD.isValid()) {
      const hasNonZeroTime =
        startD.format('HH:mm:ss') !== '00:00:00' || endD.format('HH:mm:ss') !== '00:00:00';
      if (hasNonZeroTime) {
        timeStr = `${startD.format('hh:mm A')} – ${endD.format('hh:mm A')}`;
      }
    }
  }

  // 4. Total Marks
  let totalMarksStr: string | null = null;
  const marks =
    typeof exam.totalMarks === 'number' && exam.totalMarks > 0
      ? exam.totalMarks
      : typeof exam.maxScore === 'number' && exam.maxScore > 0
        ? exam.maxScore
        : typeof (exam as any).maxMarks === 'number' && (exam as any).maxMarks > 0
          ? (exam as any).maxMarks
          : null;
  if (marks !== null) {
    totalMarksStr = `${marks} Marks`;
  }

  return {
    startDateStr,
    endDateStr,
    isDateRange,
    timeStr,
    subjectSummary,
    allSubjectsTooltip,
    totalMarksStr,
  };
}

function formatExamDate(dateStr?: string | null): string {
  if (!dateStr) return 'Not specified';
  const parsed = dayjs(dateStr);
  if (parsed.isValid()) {
    return parsed.format('DD-MM-YYYY');
  }
  return dateStr;
}

function formatExamTime(startDateStr?: string | null, endDateStr?: string | null): string {
  if (!startDateStr || !endDateStr) return '';
  const start = dayjs(startDateStr);
  const end = dayjs(endDateStr);
  if (!start.isValid() || !end.isValid()) return '';

  if (start.isSame(end, 'day')) {
    return `${start.format('hh:mm A')} – ${end.format('hh:mm A')}`;
  }
  return `${start.format('DD MMM, hh:mm A')} – ${end.format('DD MMM, hh:mm A')}`;
}

function formatExamSubjects(exam: ExamItem): string {
  if (exam.subjectName) return exam.subjectName;
  if (exam.subjects && exam.subjects.length > 0) {
    if (exam.subjects.length === 1) {
      return (exam.subjects[0] as any).subjectName || '';
    }
    const subjectNames = exam.subjects
      .map((s: any) => s.subjectName)
      .filter(Boolean);
    if (subjectNames.length <= 2) {
      return subjectNames.join(', ');
    }
    return `${exam.subjects.length} Subjects (${subjectNames.slice(0, 2).join(', ')} +${exam.subjects.length - 2})`;
  }
  return '';
}

function getExamIcon(exam: ExamItem): string {
  const typeStr = (exam.examType || exam.examName || '').toLowerCase();
  if (typeStr.includes('practical') || typeStr.includes('lab')) return 'mdi:flask-outline';
  if (typeStr.includes('oral') || typeStr.includes('viva') || typeStr.includes('speech')) return 'mdi:microphone-outline';
  if (typeStr.includes('assignment') || typeStr.includes('quiz')) return 'mdi:clipboard-text-outline';
  if (typeStr.includes('final') || typeStr.includes('annual') || typeStr.includes('term') || typeStr.includes('board')) return 'mdi:trophy-outline';
  return 'mdi:file-document-outline';
}

// ─── Subcomponent for Individual Exam Card Item ──────────────────────────────

type ExamCardItemProps = {
  exam: ExamItem;
  innerRef?: ((node: HTMLDivElement | null) => void) | null;
  onOpenPreview: (exam: ExamItem) => void;
  onOpenResultModal: (exam: ExamItem) => void;
};

function ExamCardItem({ exam, innerRef, onOpenPreview, onOpenResultModal }: ExamCardItemProps) {
  const theme = useTheme();
  const statusBadge = getStatusBadgeConfig(exam);
  const isCompleted = isExamGradingCompleted(exam);
  const iconName = getExamIcon(exam);
  const examTitle = exam.examName || 'Exam';
  const details = getParsedExamDetails(exam);

  // Score text computation
  let scoreText = '—';
  if (statusBadge.label === 'Absent') {
    scoreText = 'AB';
  } else if (typeof exam.percentage === 'number' && exam.percentage > 0) {
    scoreText = `${exam.percentage}%`;
  } else if (
    typeof exam.obtainedMarks === 'number' &&
    typeof exam.totalMarks === 'number' &&
    exam.totalMarks > 0
  ) {
    scoreText = `${exam.obtainedMarks} / ${exam.totalMarks}`;
  } else if (exam.score !== undefined && exam.score !== null) {
    scoreText = `${exam.score}%`;
  }

  const handleCardClick = () => {
    if (isCompleted) {
      onOpenResultModal(exam);
    } else {
      onOpenPreview(exam);
    }
  };

  return (
    <Box
      ref={innerRef}
      onClick={handleCardClick}
      sx={{
        p: 2,
        borderRadius: 1.75,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: isCompleted ? 'success.main' : 'primary.main',
          boxShadow: (t) => t.customShadows?.z1 || '0 2px 8px 0 rgba(0,0,0,0.06)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        gap={1.75}
      >
        {/* Left Side: Avatar Icon + Exam Header + Subjects + Schedule / Marks */}
        <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
          {/* Avatar Icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: isCompleted
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.info.main, 0.1),
              color: isCompleted ? 'success.main' : 'info.main',
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <Iconify icon={iconName} width={24} />
          </Box>

          {/* Exam Details Stack */}
          <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            {/* Title & Exam Type */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.primary"
                sx={{ fontSize: '0.9375rem', lineHeight: 1.3 }}
              >
                {examTitle}
              </Typography>
              {exam.examType && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={exam.examType}
                  sx={{
                    height: 20,
                    fontSize: 10.5,
                    fontWeight: 700,
                    borderColor: 'divider',
                    bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
                  }}
                />
              )}
            </Stack>

            {/* Subjects Row */}
            {details.subjectSummary && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <Iconify
                    icon="mdi:book-open-page-variant-outline"
                    width={15}
                    sx={{ color: 'text.secondary', flexShrink: 0 }}
                  />
                  {details.allSubjectsTooltip ? (
                    <Tooltip title={details.allSubjectsTooltip} arrow placement="top">
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: 'text.primary',
                          cursor: 'help',
                        }}
                      >
                        {details.subjectSummary}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}
                    >
                      {details.subjectSummary}
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}

            {/* Metadata Row: Dates, Time & Total Marks */}
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems="center"
              flexWrap="wrap"
              sx={{ rowGap: 0.5, pt: 0.25 }}
            >
              {/* Date Information */}
              {details.startDateStr && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Iconify
                    icon={details.isDateRange ? 'mdi:calendar-range-outline' : 'mdi:calendar-blank-outline'}
                    width={15}
                    sx={{ color: 'text.secondary', flexShrink: 0 }}
                  />
                  {details.isDateRange ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 500 }}>
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>Start:</Box>{' '}
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{details.startDateStr}</Box>
                      {' — '}
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>End:</Box>{' '}
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{details.endDateStr}</Box>
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 500 }}>
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>Date:</Box>{' '}
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{details.startDateStr}</Box>
                    </Typography>
                  )}
                </Stack>
              )}

              {/* Time Information */}
              {details.timeStr && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Iconify icon="mdi:clock-outline" width={15} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 500 }}>
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>Time:</Box>{' '}
                    <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{details.timeStr}</Box>
                  </Typography>
                </Stack>
              )}

              {/* Total Marks */}
              {details.totalMarksStr && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Iconify icon="mdi:certificate-outline" width={15} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 500 }}>
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>Total Marks:</Box>{' '}
                    <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{details.totalMarksStr}</Box>
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Right Side: Score / Scheduled Info, Status Badge & Actions */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent={{ xs: 'space-between', md: 'flex-end' }}
          sx={{
            width: { xs: '100%', md: 'auto' },
            flexShrink: 0,
            pt: { xs: 1, md: 0 },
            borderTop: { xs: '1px dashed', md: 'none' },
            borderColor: 'divider',
          }}
        >
          {/* Score display for completed, Neutral Date for upcoming */}
          <Box sx={{ textAlign: { xs: 'left', md: 'right' }, minWidth: { xs: 'auto', md: 80 } }}>
            {isCompleted ? (
              <>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  {scoreText}
                </Typography>
                <Stack direction="row" spacing={0.75} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  {exam.grade && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                      Grade {exam.grade}
                    </Typography>
                  )}
                  {exam.rank && (
                    <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ fontSize: 11 }}>
                      Rank #{exam.rank}
                    </Typography>
                  )}
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Scheduled
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  {details.startDateStr || 'TBD'}
                </Typography>
              </>
            )}
          </Box>

          {/* Status Label Badge */}
          <Label
            color={statusBadge.color as any}
            variant="soft"
            sx={{ fontWeight: 700, minWidth: 80, textAlign: 'center' }}
          >
            {statusBadge.label}
          </Label>

          {/* View Exam Details Icon Button */}
          <Tooltip title="View Exam Details" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview(exam);
              }}
              sx={{
                p: 0.75,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
                color: 'text.secondary',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'primary.softBg',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Iconify icon={GlobalIcons.eye} width={18} height={18} />
            </IconButton>
          </Tooltip>

          {/* View Result button for completed exams */}
          {isCompleted && (
            <Button
              size="small"
              variant="soft"
              color="success"
              startIcon={<Iconify icon="mdi:chart-box-outline" width={16} />}
              endIcon={<Iconify icon="mdi:chevron-right" width={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onOpenResultModal(exam);
              }}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                fontSize: 12,
                px: 1.25,
                whiteSpace: 'nowrap',
              }}
            >
              View Result
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
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
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalExam, setActiveModalExam] = useState<ExamItem | null>(null);
  const [previewExam, setPreviewExam] = useState<ExamItem | null>(null);
  const [showAllDialog, setShowAllDialog] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleOpenPreviewDrawer = (exam: ExamItem) => {
    setPreviewExam({
      ...exam,
      standardName: exam.standardName || student?.standardName || student?.standard,
      standard: exam.standard || student?.standard || student?.standardName,
      standardId: exam.standardId || student?.standardId,
      divisionName: exam.divisionName || student?.divisionName || student?.division,
      division: exam.division || student?.division || student?.divisionName,
      divisionId: exam.divisionId || student?.divisionId,
      divisions:
        exam.divisions ||
        (student?.divisionName || student?.division
          ? [student.divisionName || student.division]
          : []),
    });
  };

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
    let upcomingCount = 0;
    let completedCount = 0;
    let totalScoreSum = 0;
    let scoreCount = 0;

    deduplicatedExams.forEach((exam) => {
      const isCompleted = isExamGradingCompleted(exam);
      if (!isCompleted) {
        upcomingCount += 1;
      } else {
        completedCount += 1;
        if (typeof exam.percentage === 'number' && exam.percentage > 0) {
          totalScoreSum += exam.percentage;
          scoreCount += 1;
        } else if (typeof exam.obtainedMarks === 'number' && typeof exam.totalMarks === 'number' && exam.totalMarks > 0) {
          totalScoreSum += (exam.obtainedMarks / exam.totalMarks) * 100;
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
      upcoming: upcomingCount,
      published: upcomingCount,
      completed: completedCount,
      average,
    };
  }, [deduplicatedExams]);

  // Filtered exams according to active status tab and search
  const filteredExams = useMemo(() => deduplicatedExams.filter((exam) => {
      const isCompleted = isExamGradingCompleted(exam);

      // Status tab check
      if (activeStatusTab === 'upcoming' && isCompleted) return false;
      if (activeStatusTab === 'completed' && !isCompleted) return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const examName = (exam.examName || '').toLowerCase();
        const subjectName = (exam.subjectName || '').toLowerCase();
        const subjectsStr = (exam.subjects || []).map((s: any) => s.subjectName || '').join(' ').toLowerCase();
        const examType = (exam.examType || '').toLowerCase();
        return (
          examName.includes(query) ||
          subjectName.includes(query) ||
          subjectsStr.includes(query) ||
          examType.includes(query)
        );
      }

      return true;
    }), [deduplicatedExams, activeStatusTab, searchQuery]);

  // Reset pagination on filter or tab change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeStatusTab, searchQuery]);

  const hasMore = visibleCount < filteredExams.length;

  // Infinite scroll observer for loading exams on scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastExamRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!fullView) return;
      if (observer.current) observer.current.disconnect();
      if (!node || !hasMore) return;
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredExams.length));
        }
      });
      observer.current.observe(node);
    },
    [fullView, hasMore, filteredExams.length]
  );

  const visibleExams = useMemo(() => {
    if (!fullView) {
      return filteredExams.slice(0, 4);
    }
    return filteredExams.slice(0, visibleCount);
  }, [filteredExams, fullView, visibleCount]);

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
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2}>
          {/* HEADER SECTION */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Academic360SectionHeader
                icon={GlobalIcons.rubricFile}
                title="Exams & Performance"
                description="Exam schedules, timetable details and student evaluation results by status."
                action={<Label color="primary" variant="soft" sx={{ fontWeight: 600 }}>
                    {`${metrics.total} Total Exams`}
                  </Label>}
              />
            </Box>

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
                value="upcoming"
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <span>Upcoming</span>
                    <Label color="info" variant="soft" sx={{ height: 18, fontSize: 10, fontWeight: 700, px: 0.75 }}>
                      {metrics.upcoming}
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

          {/* EXAM LIST / CARDS */}
          {visibleExams.length > 0 ? (
            <Stack spacing={1.25}>
              {visibleExams.map((exam, index) => {
                const isLastItem = index === visibleExams.length - 1;
                const key = exam.id || exam.examId || `${exam.examName || 'exam'}-${exam.startDate || exam.examDate || ''}-${index}`;

                return (
                  <ExamCardItem
                    key={key}
                    exam={exam}
                    innerRef={isLastItem ? lastExamRef : null}
                    onOpenPreview={handleOpenPreviewDrawer}
                    onOpenResultModal={handleOpenExamModal}
                  />
                );
              })}

              {/* Scroll Pagination Spinner / End indicator for fullView */}
              {fullView && hasMore && (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} thickness={4} />
                </Stack>
              )}

              {fullView && !hasMore && filteredExams.length > PAGE_SIZE && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 1.5, display: 'block', fontWeight: 500 }}
                >
                  All {filteredExams.length} exams loaded
                </Typography>
              )}

              {/* Compact view view-all button */}
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
              title={
                searchQuery
                  ? 'No matching exams found'
                  : activeStatusTab === 'upcoming'
                    ? 'No upcoming exams'
                    : activeStatusTab === 'completed'
                      ? 'No completed exams'
                      : 'No exams scheduled'
              }
              description={
                searchQuery
                  ? `No exams found matching "${searchQuery}". Try a different keyword.`
                  : activeStatusTab === 'upcoming'
                    ? 'There are no active or upcoming exams currently scheduled.'
                    : activeStatusTab === 'completed'
                      ? 'No examination results have been completed or published yet.'
                      : 'Upcoming exams and results will appear here as soon as they are configured.'
              }
              compact
            />
          )}
        </Stack>
      </Card>

      {/* SCHEDULE EXAM PREVIEW DRAWER */}
      <ScheduleExamPreviewDrawer
        open={Boolean(previewExam)}
        exam={previewExam}
        onClose={() => setPreviewExam(null)}
      />

      {/* COMPLETED EXAM DIALOG */}
      {activeModalExam && isExamGradingCompleted(activeModalExam) && (
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
            <Stack spacing={1.25} sx={{ py: 1 }}>
              {deduplicatedExams.map((exam, index) => {
                const key = exam.id || exam.examId || `${exam.examName || 'exam'}-${exam.startDate || exam.examDate || ''}-${index}`;

                return (
                  <ExamCardItem
                    key={key}
                    exam={exam}
                    onOpenPreview={(ex) => {
                      setShowAllDialog(false);
                      handleOpenPreviewDrawer(ex);
                    }}
                    onOpenResultModal={(ex) => {
                      setShowAllDialog(false);
                      handleOpenExamModal(ex);
                    }}
                  />
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
