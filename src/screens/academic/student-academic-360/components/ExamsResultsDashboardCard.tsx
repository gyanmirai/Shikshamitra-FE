'use client';

import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
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
} from '@mui/material';

import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Academic360EmptyState } from './Academic360EmptyState';
import type { Academic360ExamResult } from '../types';

export type ExamStatusCategory =
  | 'UPCOMING'
  | 'ONGOING'
  | 'COMPLETED'
  | 'RESULT_PENDING'
  | 'PUBLISHED'
  | 'CANCELLED'
  | 'ABSENT'
  | 'WITHHELD';

type StatusConfig = {
  key: ExamStatusCategory;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  priority: number;
};

export type ExamItem = Academic360ExamResult & {
  id?: string;
  subjectName?: string;
  examType?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  status?: ExamStatusCategory | string;
  score?: number | null;
  maxScore?: number | null;
  resultPublished?: boolean;
};

type ExamsResultsDashboardCardProps = {
  exams?: ExamItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onViewAll?: () => void;
};

function normalizeExamStatus(exam: ExamItem): StatusConfig {
  const statusRaw = (exam.status || exam.resultStatus || '').toUpperCase().trim();
  const resStatus = (exam.resultStatus || '').toLowerCase();

  if (statusRaw === 'PUBLISHED' || resStatus.includes('published')) {
    return { key: 'PUBLISHED', label: 'Published', color: 'success', priority: 4 };
  }

  if (statusRaw === 'ABSENT' || resStatus.includes('absent')) {
    return { key: 'ABSENT', label: 'Absent', color: 'error', priority: 6 };
  }

  if (statusRaw === 'WITHHELD' || resStatus.includes('withheld')) {
    return { key: 'WITHHELD', label: 'Withheld', color: 'warning', priority: 7 };
  }

  if (statusRaw === 'CANCELLED' || resStatus.includes('cancel')) {
    return { key: 'CANCELLED', label: 'Cancelled', color: 'error', priority: 8 };
  }

  if (statusRaw === 'ONGOING' || resStatus.includes('ongoing') || resStatus.includes('progress')) {
    return { key: 'ONGOING', label: 'Ongoing', color: 'primary', priority: 1 };
  }

  if (statusRaw === 'UPCOMING' || resStatus.includes('upcoming')) {
    return { key: 'UPCOMING', label: 'Upcoming', color: 'info', priority: 2 };
  }

  if (
    statusRaw === 'RESULT_PENDING' ||
    resStatus.includes('pending') ||
    resStatus.includes('evaluation') ||
    (statusRaw === 'COMPLETED' && !exam.resultPublished && typeof exam.percentage !== 'number')
  ) {
    return { key: 'RESULT_PENDING', label: 'Result Pending', color: 'warning', priority: 3 };
  }

  if (statusRaw === 'COMPLETED' || resStatus.includes('completed')) {
    if (typeof exam.percentage === 'number' || exam.resultPublished || typeof exam.obtainedMarks === 'number') {
      return { key: 'PUBLISHED', label: 'Published', color: 'success', priority: 4 };
    }
    return { key: 'RESULT_PENDING', label: 'Result Pending', color: 'warning', priority: 3 };
  }

  // Fallbacks
  if (typeof exam.percentage === 'number' || exam.resultPublished || typeof exam.obtainedMarks === 'number') {
    return { key: 'PUBLISHED', label: 'Published', color: 'success', priority: 4 };
  }

  return { key: 'RESULT_PENDING', label: 'Result Pending', color: 'warning', priority: 3 };
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

export function ExamsResultsDashboardCard({
  exams = [],
  isLoading = false,
  isError = false,
  onRetry,
  onViewAll,
}: ExamsResultsDashboardCardProps) {
  const [activeModalExam, setActiveModalExam] = useState<ExamItem | null>(null);
  const [showAllDialog, setShowAllDialog] = useState(false);

  // Sorted and deduplicated exams list according to business priorities
  const sortedExams = useMemo(() => {
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

    const uniqueList = Array.from(map.values());

    return uniqueList.sort((a, b) => {
      const statusA = normalizeExamStatus(a);
      const statusB = normalizeExamStatus(b);
      if (statusA.priority !== statusB.priority) {
        return statusA.priority - statusB.priority;
      }
      const dateA = a.examDate ? new Date(a.examDate).getTime() : 0;
      const dateB = b.examDate ? new Date(b.examDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [exams]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = sortedExams.length;
    let upcoming = 0;
    let completed = 0;
    let published = 0;
    let totalPercentageSum = 0;
    let publishedCountWithPercentage = 0;

    sortedExams.forEach((exam) => {
      const st = normalizeExamStatus(exam).key;
      if (st === 'UPCOMING') {
        upcoming += 1;
      } else if (st === 'COMPLETED' || st === 'RESULT_PENDING' || st === 'PUBLISHED') {
        completed += 1;
      }
      if (st === 'PUBLISHED') {
        published += 1;
        if (typeof exam.percentage === 'number') {
          totalPercentageSum += exam.percentage;
          publishedCountWithPercentage += 1;
        }
      }
    });

    const average =
      publishedCountWithPercentage > 0
        ? Math.round(totalPercentageSum / publishedCountWithPercentage)
        : null;

    return { total, upcoming, completed, published, average };
  }, [sortedExams]);

  const handleViewAllClick = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      setShowAllDialog(true);
    }
  };

  // 1. Loading State
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

  // 2. Error State
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.primary.main}14`,
                  color: 'primary.main',
                }}
              >
                <Iconify icon="mdi:trophy-outline" width={22} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>
                    Exams & Results
                  </Typography>
                  <Label color="primary" variant="soft" sx={{ fontWeight: 600 }}>
                    {`${metrics.total} Exams`}
                  </Label>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Track your academic performance & result statuses
                </Typography>
              </Box>
            </Stack>

            {sortedExams.length > 4 && (
              <Button
                size="small"
                variant="text"
                color="primary"
                endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                onClick={handleViewAllClick}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                View All
              </Button>
            )}
          </Stack>

          {/* SUMMARY STATISTICS */}
          {sortedExams.length > 0 && (
            <Grid container spacing={1}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) => `${theme.palette.info.main}12`,
                    color: 'info.dark',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    Upcoming
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="info.main">
                    {metrics.upcoming}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) => `${theme.palette.grey[500]}12`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    Completed
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    {metrics.completed}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) => `${theme.palette.success.main}14`,
                    color: 'success.dark',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    Results Published
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {metrics.published}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) => `${theme.palette.warning.main}14`,
                    color: 'warning.dark',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    Average Score
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="warning.dark">
                    {metrics.average !== null ? `${metrics.average}%` : '—'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}

          <Divider />

          {/* EXAM LIST */}
          {sortedExams.length > 0 ? (
            <Stack spacing={1}>
              {sortedExams.slice(0, 4).map((exam) => {
                const statusInfo = normalizeExamStatus(exam);
                const iconName = getExamIcon(exam);
                const examTitle = exam.examName || 'Scheduled Exam';
                const subject = exam.subjectName || (exam.subjects && exam.subjects.length > 0 ? String(exam.subjects[0].subjectName || '') : '');
                const dateStr = exam.examDate || 'TBD';
                const subtitleText = [subject, dateStr].filter(Boolean).join(' • ');

                const isPublished = statusInfo.key === 'PUBLISHED';
                const isAbsent = statusInfo.key === 'ABSENT';
                const hasScore = typeof exam.percentage === 'number' || typeof exam.obtainedMarks === 'number';

                // Display score calculation
                let scoreText = '—';
                if (isAbsent) {
                  scoreText = 'AB';
                } else if (isPublished && typeof exam.percentage === 'number') {
                  scoreText = `${exam.percentage}%`;
                } else if (isPublished && typeof exam.obtainedMarks === 'number' && typeof exam.totalMarks === 'number') {
                  scoreText = `${exam.obtainedMarks} / ${exam.totalMarks}`;
                } else if (isPublished && exam.score !== undefined && exam.score !== null) {
                  scoreText = `${exam.score}%`;
                }

                const isLowScore = isPublished && typeof exam.percentage === 'number' && exam.percentage < 40;

                return (
                  <Box
                    key={exam.id || exam.examId || `${examTitle}-${dateStr}`}
                    onClick={() => setActiveModalExam(exam)}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.light',
                        boxShadow: (theme) => theme.customShadows?.z1 || '0 2px 6px 0 rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      gap={1.5}
                    >
                      {/* Left: Icon + Exam Name & Subject/Date */}
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 200, flex: 1 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: (theme) => `${theme.palette.grey[500]}12`,
                            color: 'text.secondary',
                            flexShrink: 0,
                          }}
                        >
                          <Iconify icon={iconName} width={20} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} noWrap color="text.primary">
                            {examTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {subtitleText}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Right: Score, Status Chip, Action affordance */}
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        {/* Score display */}
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            color={isLowScore ? 'warning.dark' : isPublished ? 'text.primary' : 'text.disabled'}
                          >
                            {scoreText}
                          </Typography>
                          {isLowScore && (
                            <Typography variant="caption" color="warning.main" display="block" sx={{ fontSize: 10 }}>
                              Needs Improvement
                            </Typography>
                          )}
                          {isPublished && exam.grade && !isLowScore && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                              Grade {exam.grade}
                            </Typography>
                          )}
                        </Box>

                        {/* Status Chip */}
                        <Label
                          color={statusInfo.color as any}
                          variant="soft"
                          sx={{ fontWeight: 600 }}
                        >
                          {statusInfo.label}
                        </Label>

                        {/* Action Affordance Button */}
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          endIcon={<Iconify icon="mdi:chevron-right" width={16} />}
                          sx={{
                            minWidth: 0,
                            px: 0.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          {isPublished ? 'View Result' : 'View Details'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}

              {sortedExams.length > 4 && (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={handleViewAllClick}
                  endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                  sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                >
                  View all {sortedExams.length} exams
                </Button>
              )}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon="mdi:trophy-outline"
              color="warning"
              title="No exams scheduled"
              description="Your upcoming exams will appear here as soon as they are scheduled."
              compact
            />
          )}
        </Stack>
      </Card>

      {/* SINGLE EXAM DETAIL DIALOG */}
      {activeModalExam && (
        <CustomDialog
          open={Boolean(activeModalExam)}
          handleClose={() => setActiveModalExam(null)}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
              <Iconify icon={getExamIcon(activeModalExam)} width={20} color="primary.main" />
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                {activeModalExam.examName || 'Exam Details'}
              </Box>
              <CustomTooltip
                arrow
                placement="right"
                title="Detailed breakdown of exam performance, schedule details, and subject-wise score evaluation."
              >
                <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={16} height={16} />
              </CustomTooltip>
            </Box>
          }
          maxWidth="sm"
        >
          <DialogScrollContent>
            <Stack spacing={2} sx={{ pt: 1, pb: 2 }}>
              {/* Top Banner (No repeated exam title) */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {activeModalExam.subjectName || 'General Academic Exam'}
                  </Typography>
                </Box>
                <Label
                  color={normalizeExamStatus(activeModalExam).color as any}
                  variant="soft"
                  sx={{ fontWeight: 700 }}
                >
                  {normalizeExamStatus(activeModalExam).label}
                </Label>
              </Stack>

              <Divider />

              {/* Info Grid */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Exam Date
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatExamDate(activeModalExam.examDate)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Exam Type
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {activeModalExam.examType || 'Standard Written'}
                  </Typography>
                </Grid>
                {activeModalExam.rank && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Class Rank
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      #{activeModalExam.rank}
                    </Typography>
                  </Grid>
                )}
                {activeModalExam.grade && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Grade Achieved
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {activeModalExam.grade}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Result Summary Box */}
              {normalizeExamStatus(activeModalExam).key === 'PUBLISHED' ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => `${theme.palette.success.main}0D`,
                    border: '1px solid',
                    borderColor: 'success.light',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    OVERALL PERCENTAGE
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="success.dark">
                    {activeModalExam.percentage !== undefined ? `${activeModalExam.percentage}%` : '—'}
                  </Typography>
                  {typeof activeModalExam.obtainedMarks === 'number' && typeof activeModalExam.totalMarks === 'number' && (
                    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                      Obtained {activeModalExam.obtainedMarks} out of {activeModalExam.totalMarks} total marks
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <Iconify icon="mdi:clock-outline" width={28} sx={{ color: 'warning.main', mb: 0.5 }} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    {normalizeExamStatus(activeModalExam).label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Full result scores and performance feedback will be displayed here once published by the academic evaluator.
                  </Typography>
                </Box>
              )}

              {/* Subjects Table if available */}
              {activeModalExam.subjects && activeModalExam.subjects.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Subject Wise Breakdown
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600 }}>Subject</TableCell>
                        <TableCell align="right" sx={{ bgcolor: 'background.neutral', fontWeight: 600 }}>Max Marks</TableCell>
                        <TableCell align="right" sx={{ bgcolor: 'background.neutral', fontWeight: 600 }}>Obtained</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeModalExam.subjects.map((sub: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{sub.subjectName || sub.name || `Subject ${idx + 1}`}</TableCell>
                          <TableCell align="right">{sub.totalMarks || sub.maxMarks || '100'}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {sub.obtainedMarks !== undefined ? sub.obtainedMarks : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Stack>
          </DialogScrollContent>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => setActiveModalExam(null)}
              variant="outlined"
              size="small"
            >
              Close
            </Button>
          </DialogActions>
        </CustomDialog>
      )}

      {/* ALL EXAMS LIST DIALOG */}
      {showAllDialog && (
        <CustomDialog
          open={showAllDialog}
          handleClose={() => setShowAllDialog(false)}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
              <Iconify icon="mdi:trophy-outline" width={20} color="primary.main" />
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                All Exams ({sortedExams.length})
              </Box>
              <CustomTooltip
                arrow
                placement="right"
                title="Complete list of all scheduled, ongoing, completed, and published academic examinations."
              >
                <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={16} height={16} />
              </CustomTooltip>
            </Box>
          }
          maxWidth="md"
        >
          <DialogScrollContent>
            <Stack spacing={2} sx={{ py: 1 }}>
              {sortedExams.map((exam) => {
                const statusInfo = normalizeExamStatus(exam);
                const iconName = getExamIcon(exam);
                const examTitle = exam.examName || 'Scheduled Exam';
                const subject = exam.subjectName || (exam.subjects && exam.subjects.length > 0 ? String(exam.subjects[0].subjectName || '') : '');
                const dateStr = formatExamDate(exam.examDate);

                return (
                  <Box
                    key={exam.id || exam.examId || `${examTitle}-${dateStr}`}
                    onClick={() => {
                      setShowAllDialog(false);
                      setActiveModalExam(exam);
                    }}
                    sx={{
                      p: 1,
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
                            bgcolor: (theme) => `${theme.palette.grey[500]}12`,
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
                        <Typography variant="subtitle2" fontWeight={700}>
                          {statusInfo.key === 'PUBLISHED' && typeof exam.percentage === 'number'
                            ? `${exam.percentage}%`
                            : '—'}
                        </Typography>
                        <Label color={statusInfo.color as any} variant="soft" sx={{ fontWeight: 600 }}>
                          {statusInfo.label}
                        </Label>
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
