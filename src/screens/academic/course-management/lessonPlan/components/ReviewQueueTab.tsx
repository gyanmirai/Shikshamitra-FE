'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Divider,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  CardContent,
  CardActions,
  ToggleButton,
  InputAdornment,
  ToggleButtonGroup,
} from '@mui/material';

import ReviewStatusTabs, { type ReviewStatusFilter } from './ReviewStatusTabs';

import type { LessonPlanRow } from '../lessonPlanData';

type ReviewTarget = { type: 'plan'; id: string };
type ReviewDateFilterMode = 'all' | 'day' | 'week' | 'range';

const getWeekStart = (date: Dayjs) => date.startOf('day').subtract((date.day() + 6) % 7, 'day');
const getWeekEnd = (date: Dayjs) => getWeekStart(date).add(6, 'day');

const reviewStatusLabels: Record<ReviewStatusFilter, string> = {
  pending: 'Pending',
  approved: 'Approved',
  changes: 'Changes Requested',
  rejected: 'Rejected',
  all: 'All Reviews',
};

const reviewStatusColors: Record<ReviewStatusFilter, 'default' | 'success' | 'warning' | 'error'> =
  {
    pending: 'warning',
    approved: 'success',
    changes: 'warning',
    rejected: 'error',
    all: 'default',
  };

const REVIEW_STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'Pending: Awaiting reviewer action & approval',
  approved: 'Approved: Submission reviewed and approved',
  changes: 'Changes Requested: Returned with comments for teacher revisions',
  rejected: 'Rejected: Submission rejected',
};

const ReviewStatusHeaderTooltip = (
  <Box sx={{ p: 1, minWidth: 260 }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '135px 1fr',
        rowGap: 0.75,
        columnGap: 1,
        alignItems: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'warning.main', fontSize: '0.75rem' }}
      >
        Pending :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Awaiting reviewer action
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'success.main', fontSize: '0.75rem' }}
      >
        Approved :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Reviewed & approved
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'warning.main', fontSize: '0.75rem' }}
      >
        Changes Requested :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Requires teacher revisions
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.75rem' }}
      >
        Rejected :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Submission rejected
      </Typography>
    </Box>
  </Box>
);

type ReviewState = {
  target: ReviewTarget | null;
  action: 'approve' | 'reject' | 'changes';
  comment: string;
  updateProgress: boolean;
};

type ReviewRow = {
  id: string;
  targetType: 'plan';
  teacherId?: string;
  teacherName: string;
  submittedDate: string;
  pendingSince: string;
  classDivision: string;
  subjectName: string;
  chapterName: string;
  topic: string;
  plannedPct: number;
  actualPct: number | string;
  progressGap: number | string;
  evidenceCount: number;
  diaryQuality: string;
  aiSummary: string;
  submittedAt?: string;
  status: ReviewStatusFilter;
  reviewRemarks?: string;
  reviewedByName?: string;
  reviewedAt?: string;
};

type Props = {
  lessonPlans: LessonPlanRow[];
  canReviewSubmissions: boolean;
  currentTeacherId?: string;
  onApprove: (target: ReviewTarget, comment: string, updateProgress: boolean) => Promise<boolean>;
  onReject: (target: ReviewTarget, comment: string) => Promise<boolean>;
  onRequestChanges: (target: ReviewTarget, comment: string) => Promise<boolean>;
  onViewDetails?: (plan: LessonPlanRow) => void;
  onRevisePlan?: (plan: LessonPlanRow) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isRequesting?: boolean;
};

const ReviewQueueTab = ({
  lessonPlans,
  canReviewSubmissions,
  currentTeacherId,
  onApprove,
  onReject,
  onRequestChanges,
  onViewDetails,
  onRevisePlan,
  isApproving = false,
  isRejecting = false,
  isRequesting = false,
}: Props) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [dateFilterMode, setDateFilterMode] = useState<ReviewDateFilterMode>('all');
  const [filterDate, setFilterDate] = useState<Dayjs | null>(dayjs());
  const [rangeStart, setRangeStart] = useState<Dayjs | null>(getWeekStart(dayjs()));
  const [rangeEnd, setRangeEnd] = useState<Dayjs | null>(getWeekEnd(dayjs()));
  const [teacherSearch, setTeacherSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('pending');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [review, setReview] = useState<ReviewState>({
    target: null,
    action: 'approve',
    comment: '',
    updateProgress: true,
  });

  const openReview = (target: ReviewTarget, defaultAction: ReviewState['action'] = 'approve') => {
    if (!canReviewSubmissions) return;
    setReview({ target, action: defaultAction, comment: '', updateProgress: true });
    setReviewDialog(true);
  };

  const closeReview = () => setReviewDialog(false);

  const isSubmitLoading =
    (review.action === 'approve' && isApproving) ||
    (review.action === 'reject' && isRejecting) ||
    (review.action === 'changes' && isRequesting);

  const submitReview = async () => {
    if (!review.target) return;
    let success = false;
    if (review.action === 'approve') {
      success = await onApprove(review.target, review.comment, review.updateProgress);
    } else if (review.action === 'reject') {
      success = await onReject(review.target, review.comment);
    } else {
      success = await onRequestChanges(review.target, review.comment);
    }
    if (success) {
      closeReview();
    }
  };

  // Build review rows
  const reviewRows: ReviewRow[] = [
    ...lessonPlans
      .filter((p) => ['Submitted', 'Approved', 'NeedsChanges', 'Rejected'].includes(p.planStatus))
      .map((p): ReviewRow => ({
        id: p.id,
        targetType: 'plan',
        teacherId: p.teacherId,
        teacherName: p.teacherName,
        submittedDate: p.plannedDate,
        pendingSince: p.plannedDate,
        classDivision: `${p.className}-${p.divisionName}`,
        subjectName: p.subjectName,
        chapterName: p.chapterName,
        topic: p.topic,
        plannedPct: p.plannedCompletionPercentage,
        actualPct: '-',
        progressGap: '-',
        evidenceCount: 0,
        diaryQuality: '-',
        aiSummary: 'Plan matches curriculum. Objective is clear.',
        submittedAt: p.plannedDate,
        status:
          p.planStatus === 'Approved'
            ? 'approved'
            : p.planStatus === 'NeedsChanges'
              ? 'changes'
              : p.planStatus === 'Rejected'
                ? 'rejected'
                : 'pending',
        reviewRemarks: p.reviewRemarks,
        reviewedByName: p.reviewedByName,
        reviewedAt: p.reviewedAt,
      })),
  ];

  const statusCounts = reviewRows.reduce<Record<ReviewStatusFilter, number>>(
    (counts, row) => ({ ...counts, [row.status]: counts[row.status] + 1 }),
    { pending: 0, approved: 0, changes: 0, rejected: 0, all: reviewRows.length }
  );

  const filteredReviewRows = reviewRows.filter((row) => {
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    const teacherSearchText = teacherSearch.trim().toLowerCase();
    if (teacherSearchText && !row.teacherName.toLowerCase().includes(teacherSearchText)) {
      return false;
    }

    const submittedDate = dayjs(row.submittedDate);
    if (!submittedDate.isValid() || dateFilterMode === 'all') return true;

    if (dateFilterMode === 'day') {
      return filterDate ? submittedDate.isSame(filterDate, 'day') : true;
    }

    if (dateFilterMode === 'week') {
      if (!filterDate) return true;
      const start = getWeekStart(filterDate);
      const end = getWeekEnd(filterDate);
      return (
        submittedDate.isSame(start, 'day') ||
        submittedDate.isSame(end, 'day') ||
        (submittedDate.isAfter(start, 'day') && submittedDate.isBefore(end, 'day'))
      );
    }

    const start = rangeStart?.startOf('day');
    const end = rangeEnd?.endOf('day');
    if (start && submittedDate.isBefore(start, 'day')) return false;
    if (end && submittedDate.isAfter(end, 'day')) return false;
    return true;
  });

  const clearDateFilter = () => {
    setDateFilterMode('all');
    setFilterDate(dayjs());
    setRangeStart(getWeekStart(dayjs()));
    setRangeEnd(getWeekEnd(dayjs()));
    setTeacherSearch('');
    setStatusFilter('pending');
  };

  const getActionColor = (action: ReviewState['action']) => {
    if (action === 'approve') return 'success';
    if (action === 'reject') return 'error';
    return 'warning';
  };

  const canReviewRow = (row: ReviewRow) =>
    canReviewSubmissions &&
    (!currentTeacherId || !row.teacherId || row.teacherId !== currentTeacherId);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 0 auto', minHeight: '100%' }}
    >
      {/* Top Filter & Navigation Card */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 'none',
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Header Title & View Mode Toggle */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, py: 1.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              Review Queue
            </Typography>
            <Chip
              label={`${statusCounts.pending} pending · ${reviewRows.length} total`}
              size="small"
              color={statusCounts.pending > 0 ? 'warning' : 'default'}
              variant="soft"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
          >
            <ToggleButton value="card">
              <Iconify icon="mdi:view-grid-outline" width={18} />
            </ToggleButton>
            <ToggleButton value="table">
              <Iconify icon="mdi:table" width={18} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Divider />

        {/* Status Tabs Row */}
        <ReviewStatusTabs value={statusFilter} counts={statusCounts} onChange={setStatusFilter} />

        <Divider />

        {/* Search & Filters Controls Row */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
          sx={{ p: 2 }}
        >
          <TextField
            size="small"
            placeholder="Search Teacher..."
            value={teacherSearch}
            onChange={(event) => setTeacherSearch(event.target.value)}
            sx={{ minWidth: { xs: 1, md: 240 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:magnify" width={18} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: teacherSearch ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear teacher search"
                    onClick={() => setTeacherSearch('')}
                    edge="end"
                  >
                    <Iconify icon="mdi:close" width={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          <ToggleButtonGroup
            value={dateFilterMode}
            exclusive
            onChange={(_, value) => value && setDateFilterMode(value)}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="range">Range</ToggleButton>
          </ToggleButtonGroup>

          {(dateFilterMode === 'day' || dateFilterMode === 'week') && (
            <DatePicker
              label={dateFilterMode === 'day' ? 'Review date' : 'Week of'}
              value={filterDate}
              onChange={setFilterDate}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
            />
          )}

          {dateFilterMode === 'range' && (
            <>
              <DatePicker
                label="From"
                value={rangeStart}
                onChange={setRangeStart}
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
              />
              <DatePicker
                label="To"
                value={rangeEnd}
                onChange={setRangeEnd}
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
              />
            </>
          )}

          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<Iconify icon="mdi:filter-remove-outline" />}
            onClick={clearDateFilter}
            disabled={dateFilterMode === 'all' && !teacherSearch && statusFilter === 'pending'}
            sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
          >
            Clear
          </Button>
        </Stack>
      </Card>

      {!canReviewSubmissions && reviewRows.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Review actions are available only to Admin or Coordinator roles.
        </Alert>
      )}

      {reviewRows.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Iconify icon="mdi:check-all" width={48} sx={{ color: 'success.main', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No pending reviews
          </Typography>
          <Typography variant="body2" color="text.disabled">
            All lesson plans and diaries are reviewed.
          </Typography>
        </Card>
      )}

      {reviewRows.length > 0 && filteredReviewRows.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Iconify
            icon="mdi:calendar-search-outline"
            width={48}
            sx={{ color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="h6" color="text.secondary">
            {statusFilter === 'pending' ? 'No pending reviews' : 'No reviews match these filters'}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {statusFilter === 'pending'
              ? 'Use the status tabs to view approved, rejected, or change-requested history.'
              : 'Try another status, teacher name, day, week, or date range.'}
          </Typography>
        </Card>
      )}

      {/* Card View */}
      {viewMode === 'card' && filteredReviewRows.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
          }}
        >
          {filteredReviewRows.map((row) => {
            const sourcePlan = lessonPlans.find((plan) => plan.id === row.id);

            return (
              <Card
                key={row.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: (theme) => theme.palette.divider,
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                  },
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Header */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 1 }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {row.teacherName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.classDivision} • {row.subjectName} •{' '}
                        {dayjs(row.submittedDate).format('DD-MM-YYYY')}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="caption" display="block">
                              Planned: {row.plannedPct}%
                            </Typography>
                            <Typography variant="caption" display="block">
                              Actual: {row.actualPct === '-' ? '-' : `${row.actualPct}%`}
                            </Typography>
                            {row.progressGap !== '-' && (
                              <Typography variant="caption" display="block">
                                Gap: {Number(row.progressGap) > 0 ? '+' : ''}
                                {row.progressGap}%
                              </Typography>
                            )}
                            <Typography variant="caption" display="block">
                              Evidence:{' '}
                              {row.evidenceCount > 0 ? `${row.evidenceCount} file(s)` : 'Missing'}
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <IconButton size="small" sx={{ p: 0.5, color: 'text.secondary' }}>
                          <Iconify icon="mdi:information-outline" width={18} height={18} />
                        </IconButton>
                      </Tooltip>
                      <Chip label="Lesson Plan" size="small" color="info" variant="soft" />
                      <Chip
                        label={reviewStatusLabels[row.status]}
                        size="small"
                        color={reviewStatusColors[row.status]}
                        variant="soft"
                      />
                    </Stack>
                  </Stack>

                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    {row.chapterName} — {row.topic}
                  </Typography>

                  {row.status !== 'pending' && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 1 }}
                    >
                      {row.reviewedByName
                        ? `Reviewed by ${row.reviewedByName}`
                        : 'Review completed'}
                      {row.reviewedAt ? ` on ${dayjs(row.reviewedAt).format('DD-MM-YYYY')}` : ''}
                      {row.reviewRemarks ? ` â€¢ ${row.reviewRemarks}` : ''}
                    </Typography>
                  )}

                  {/* AI Summary */}
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Iconify
                        icon="mdi:robot-outline"
                        width={14}
                        sx={{ mt: 0.25, color: 'secondary.main', flexShrink: 0 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {row.aiSummary}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Warnings */}
                  {Number(row.progressGap) < -15 && (
                    <Alert severity="error" sx={{ py: 0.5, mb: 0.5 }}>
                      <Typography variant="caption">
                        Actual progress is significantly lower than planned.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>

                {row.status === 'pending' && canReviewRow(row) && (
                  <>
                    <Divider />
                    <CardActions
                      sx={{ px: 2, py: 1.25, justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Iconify icon="mdi:check" width={16} />}
                        onClick={() => openReview({ type: 'plan', id: row.id }, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={<Iconify icon="mdi:swap-horizontal" width={16} />}
                        onClick={() => openReview({ type: 'plan', id: row.id }, 'changes')}
                      >
                        Request Changes
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Iconify icon="mdi:close" width={16} />}
                        onClick={() => openReview({ type: 'plan', id: row.id }, 'reject')}
                      >
                        Reject
                      </Button>
                    </CardActions>
                  </>
                )}
                {row.status === 'pending' && canReviewSubmissions && !canReviewRow(row) && (
                  <>
                    <Divider />
                    <CardActions sx={{ px: 2, py: 1 }}>
                      <Alert severity="info" sx={{ width: 1, py: 0.5 }}>
                        You cannot review your own submission.
                      </Alert>
                    </CardActions>
                  </>
                )}
                {row.status !== 'pending' && (
                  <>
                    <Divider />
                    <CardActions sx={{ px: 2, py: 1, gap: 1 }}>
                      {sourcePlan && onViewDetails && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="mdi:eye-outline" />}
                          onClick={() => onViewDetails(sourcePlan)}
                        >
                          View Details
                        </Button>
                      )}
                      {sourcePlan &&
                        onRevisePlan &&
                        ['changes', 'rejected'].includes(row.status) && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<Iconify icon="mdi:pencil-outline" />}
                            onClick={() => onRevisePlan(sourcePlan)}
                          >
                            Revise
                          </Button>
                        )}
                    </CardActions>
                  </>
                )}
              </Card>
            );
          })}
        </Box>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredReviewRows.length > 0 && (
        <CustomizableTable
          tableId="review-queue-table"
          tableTitle="Review Queue"
          data={filteredReviewRows}
          columns={[
            { id: 'teacherName', label: 'Teacher', minWidth: 160, sticky: true },
            {
              id: 'status',
              label: (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700} fontSize="0.8125rem">
                    Status
                  </Typography>
                  <CustomTooltip title={ReviewStatusHeaderTooltip} placement="top" arrow>
                    <Iconify
                      icon="lucide:info"
                      width={14}
                      height={14}
                      sx={{ color: 'text.secondary', cursor: 'pointer' }}
                    />
                  </CustomTooltip>
                </Stack>
              ),
              minWidth: 150,
              sticky: true,
              render: (value: ReviewStatusFilter) => (
                <CustomTooltip
                  title={REVIEW_STATUS_DESCRIPTIONS[value] || `${reviewStatusLabels[value]} status`}
                  placement="top"
                  arrow
                >
                  <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                    <Chip
                      label={reviewStatusLabels[value]}
                      size="small"
                      color={reviewStatusColors[value]}
                      variant="soft"
                    />
                  </Box>
                </CustomTooltip>
              ),
            },
            {
              id: 'submittedDate',
              label: 'Date',
              filterType: 'date' as const,
              minWidth: 120,
              render: (v: any) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
            },
            {
              id: 'pendingSince',
              label: 'Pending Since',
              minWidth: 120,
              render: (v: any) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
            },
            { id: 'classDivision', label: 'Class', minWidth: 110 },
            { id: 'subjectName', label: 'Subject', minWidth: 130 },
            { id: 'chapterName', label: 'Chapter', minWidth: 150 },
            { id: 'topic', label: 'Topic', minWidth: 220 },
            {
              id: 'plannedPct',
              label: 'Planned %',
              filterType: 'number' as const,
              minWidth: 100,
              render: (v: any) => `${v}%`,
            },
            {
              id: 'actualPct',
              label: 'Actual %',
              filterType: 'number' as const,
              minWidth: 100,
              render: (v: any) => (v === '-' ? '-' : `${v}%`),
            },
            {
              id: 'progressGap',
              label: 'Gap',
              filterType: 'number' as const,
              minWidth: 90,
              render: (v: any) =>
                v === '-' ? (
                  '-'
                ) : (
                  <Typography
                    variant="body2"
                    color={Number(v) < 0 ? 'error.main' : 'success.main'}
                    fontWeight={600}
                  >
                    {Number(v) > 0 ? '+' : ''}
                    {v}%
                  </Typography>
                ),
            },
            {
              id: 'evidenceCount',
              label: 'Evidence',
              minWidth: 100,
              render: (v: any) => (
                <Chip
                  label={v > 0 ? `${v} file(s)` : 'Missing'}
                  size="small"
                  color={v > 0 ? 'success' : 'warning'}
                  variant="soft"
                />
              ),
            },
            { id: 'diaryQuality', label: 'Quality', minWidth: 110 },
            {
              id: 'reviewedAt',
              label: 'Review Details',
              minWidth: 220,
              render: (_: unknown, row: any) =>
                row.status === 'pending'
                  ? 'Awaiting review'
                  : `${row.reviewedByName || 'Review completed'}${row.reviewedAt ? ` on ${dayjs(row.reviewedAt).format('DD-MM-YYYY')}` : ''}${row.reviewRemarks ? ` â€¢ ${row.reviewRemarks}` : ''}`,
            },
            {
              id: 'targetType',
              label: 'Type',
              minWidth: 110,
              render: (v: any) => (
                <Chip label="Lesson Plan" size="small" color="info" variant="soft" />
              ),
            },
            ...(canReviewSubmissions
              ? [
                  {
                    id: 'actions',
                    label: 'Actions',
                    minWidth: 200,
                    align: 'center' as const,
                    isFilter: false,
                    isSort: false,
                    sticky: true,
                    stickyPosition: 'right' as const,
                    render: (_: any, row: any) => {
                      const reviewRow = row as ReviewRow;
                      return reviewRow.status === 'pending' && canReviewRow(reviewRow) ? (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() =>
                              openReview({ type: 'plan', id: reviewRow.id }, 'approve')
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() =>
                              openReview({ type: 'plan', id: reviewRow.id }, 'changes')
                            }
                          >
                            Changes
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => openReview({ type: 'plan', id: reviewRow.id }, 'reject')}
                          >
                            Reject
                          </Button>
                        </Stack>
                      ) : reviewRow.status === 'pending' ? (
                        <Chip label="Own submission" size="small" color="info" variant="soft" />
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {onViewDetails && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const plan = lessonPlans.find((item) => item.id === reviewRow.id);
                                if (plan) onViewDetails(plan);
                              }}
                            >
                              View
                            </Button>
                          )}
                          {onRevisePlan && ['changes', 'rejected'].includes(reviewRow.status) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              onClick={() => {
                                const plan = lessonPlans.find((item) => item.id === reviewRow.id);
                                if (plan) onRevisePlan(plan);
                              }}
                            >
                              Revise
                            </Button>
                          )}
                        </Stack>
                      );
                    },
                  },
                ]
              : []),
          ]}
        />
      )}

      {/* Review Dialog */}
      <CustomDialog
        open={reviewDialog}
        title={
          review.action === 'approve'
            ? 'Approve Submission'
            : review.action === 'reject'
              ? 'Reject Submission'
              : 'Request Changes'
        }
        maxWidth="sm"
        handleClose={closeReview}
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {/* Action toggle */}
            <Stack direction="row" spacing={1}>
              {(['approve', 'changes', 'reject'] as const).map((action) => (
                <Button
                  key={action}
                  size="small"
                  variant={review.action === action ? 'contained' : 'outlined'}
                  color={getActionColor(action) as any}
                  onClick={() => setReview((r) => ({ ...r, action }))}
                  sx={{ flex: 1, textTransform: 'capitalize' }}
                >
                  {action === 'changes'
                    ? 'Request Changes'
                    : action.charAt(0).toUpperCase() + action.slice(1)}
                </Button>
              ))}
            </Stack>

            <TextField
              size="small"
              label={
                review.action === 'approve'
                  ? 'Approval Comment (optional)'
                  : 'Comment (required for reject / changes)'
              }
              value={review.comment}
              onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
              fullWidth
              multiline
              minRows={4}
              placeholder={
                review.action === 'approve'
                  ? 'Any remarks for the teacher...'
                  : 'Specify what needs to be corrected...'
              }
            />

            {review.action !== 'approve' && !review.comment.trim() && (
              <Alert severity="warning">
                Comment is required when rejecting or requesting changes.
              </Alert>
            )}
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={closeReview} disabled={isSubmitLoading}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color={getActionColor(review.action) as any}
            disabled={review.action !== 'approve' && !review.comment.trim()}
            loading={isSubmitLoading}
            onClick={submitReview}
          >
            Submit Review
          </LoadingButton>
        </Stack>
      </CustomDialog>
    </Box>
  );
};

export default ReviewQueueTab;
