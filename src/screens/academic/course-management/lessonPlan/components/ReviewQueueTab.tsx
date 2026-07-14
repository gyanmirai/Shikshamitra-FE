'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Switch,
  Divider,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  CardContent,
  CardActions,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

type ReviewTarget = { type: 'plan' | 'diary'; id: string };
type ReviewDateFilterMode = 'all' | 'day' | 'week' | 'range';

const getWeekStart = (date: Dayjs) => date.startOf('day').subtract((date.day() + 6) % 7, 'day');
const getWeekEnd = (date: Dayjs) => getWeekStart(date).add(6, 'day');

type ReviewState = {
  target: ReviewTarget | null;
  action: 'approve' | 'reject' | 'changes';
  comment: string;
  updateProgress: boolean;
};

type ReviewRow = {
  id: string;
  targetType: 'plan' | 'diary';
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
};

type Props = {
  lessonPlans: LessonPlanRow[];
  diaryEntries: TeacherDiaryRow[];
  canReviewSubmissions: boolean;
  currentTeacherId?: string;
  onApprove: (target: ReviewTarget, comment: string, updateProgress: boolean) => void;
  onReject: (target: ReviewTarget, comment: string) => void;
  onRequestChanges: (target: ReviewTarget, comment: string) => void;
};

const ReviewQueueTab = ({
  lessonPlans,
  diaryEntries,
  canReviewSubmissions,
  currentTeacherId,
  onApprove,
  onReject,
  onRequestChanges,
}: Props) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [dateFilterMode, setDateFilterMode] = useState<ReviewDateFilterMode>('all');
  const [filterDate, setFilterDate] = useState<Dayjs | null>(dayjs());
  const [rangeStart, setRangeStart] = useState<Dayjs | null>(getWeekStart(dayjs()));
  const [rangeEnd, setRangeEnd] = useState<Dayjs | null>(getWeekEnd(dayjs()));
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

  const submitReview = () => {
    if (!review.target) return;
    if (review.action === 'approve')
      onApprove(review.target, review.comment, review.updateProgress);
    else if (review.action === 'reject') onReject(review.target, review.comment);
    else onRequestChanges(review.target, review.comment);
    closeReview();
  };

  // Build review rows
  const reviewRows: ReviewRow[] = [
    ...lessonPlans
      .filter((p) => p.planStatus === 'Submitted')
      .map(
        (p): ReviewRow => ({
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
        })
      ),
    ...diaryEntries
      .filter((e) => e.diaryStatus === 'Submitted')
      .map((e): ReviewRow => {
        const plan = lessonPlans.find((p) => p.id === e.lessonPlanId);
        const gap = plan ? e.actualCompletionPercentage - plan.plannedCompletionPercentage : 0;
        return {
          id: e.id,
          targetType: 'diary',
          teacherId: plan?.teacherId || e.teacherId,
          teacherName: plan?.teacherName || '-',
          submittedDate: e.actualDate,
          pendingSince: e.submittedAt
            ? `${Math.max(0, dayjs().diff(dayjs(e.submittedAt), 'day'))} day(s)`
            : '-',
          classDivision: plan ? `${plan.className}-${plan.divisionName}` : '-',
          subjectName: plan?.subjectName || '-',
          chapterName: plan?.chapterName || '-',
          topic: e.actualTopicCovered || plan?.topic || '-',
          plannedPct: plan?.plannedCompletionPercentage || 0,
          actualPct: e.actualCompletionPercentage,
          progressGap: gap,
          evidenceCount: e.evidence?.length || 0,
          diaryQuality: e.reflection ? 'Complete' : 'Incomplete',
          aiSummary:
            gap < 0
              ? `Actual progress (${e.actualCompletionPercentage}%) is lower than planned (${plan?.plannedCompletionPercentage}%). Suggest request changes.`
              : 'Diary matches lesson plan. Progress update is reasonable.',
          submittedAt: e.submittedAt,
        };
      }),
  ];

  const filteredReviewRows = reviewRows.filter((row) => {
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
    <Box>
      {/* Toolbar */}
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">
            Review Queue ({filteredReviewRows.length}/{reviewRows.length} pending)
          </Typography>
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

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
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
            disabled={dateFilterMode === 'all'}
            sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
          >
            Clear
          </Button>
        </Stack>
      </Stack>

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
            No submissions match this date filter
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Try another day, week, or date range.
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
          {filteredReviewRows.map((row) => (
            <Card key={row.id} variant="outlined" sx={{ borderRadius: 2 }}>
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
                    <Chip
                      label={row.targetType === 'plan' ? 'Lesson Plan' : 'Diary'}
                      size="small"
                      color={row.targetType === 'plan' ? 'info' : 'secondary'}
                      variant="soft"
                    />
                  </Stack>
                </Stack>

                <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                  {row.chapterName} — {row.topic}
                </Typography>

                {/* AI Summary */}
                <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                  <Stack direction="row" spacing={0.5} alignItems="flex-start">
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
                {row.evidenceCount === 0 && row.targetType === 'diary' && (
                  <Alert severity="warning" sx={{ py: 0.5, mb: 0.5 }}>
                    <Typography variant="caption">Diary submitted without evidence.</Typography>
                  </Alert>
                )}
                {Number(row.progressGap) < -15 && (
                  <Alert severity="error" sx={{ py: 0.5, mb: 0.5 }}>
                    <Typography variant="caption">
                      Actual progress is significantly lower than planned.
                    </Typography>
                  </Alert>
                )}
              </CardContent>

              {canReviewRow(row) && (
                <>
                  <Divider />
                  <CardActions sx={{ px: 2, py: 1, gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => openReview({ type: row.targetType, id: row.id }, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => openReview({ type: row.targetType, id: row.id }, 'changes')}
                    >
                      Request Changes
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => openReview({ type: row.targetType, id: row.id }, 'reject')}
                    >
                      Reject
                    </Button>
                  </CardActions>
                </>
              )}
              {canReviewSubmissions && !canReviewRow(row) && (
                <>
                  <Divider />
                  <CardActions sx={{ px: 2, py: 1 }}>
                    <Alert severity="info" sx={{ width: 1, py: 0.5 }}>
                      You cannot review your own submission.
                    </Alert>
                  </CardActions>
                </>
              )}
            </Card>
          ))}
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
              id: 'targetType',
              label: 'Type',
              minWidth: 110,
              render: (v: any) => (
                <Chip
                  label={v === 'plan' ? 'Lesson Plan' : 'Diary'}
                  size="small"
                  color={v === 'plan' ? 'info' : 'secondary'}
                  variant="soft"
                />
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
                      return canReviewRow(reviewRow) ? (
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() =>
                              openReview(
                                { type: reviewRow.targetType, id: reviewRow.id },
                                'approve'
                              )
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() =>
                              openReview(
                                { type: reviewRow.targetType, id: reviewRow.id },
                                'changes'
                              )
                            }
                          >
                            Changes
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              openReview({ type: reviewRow.targetType, id: reviewRow.id }, 'reject')
                            }
                          >
                            Reject
                          </Button>
                        </Stack>
                      ) : (
                        <Chip label="Own submission" size="small" color="info" variant="soft" />
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
          <Stack spacing={2}>
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

            {review.action === 'approve' && review.target?.type === 'diary' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={review.updateProgress}
                    onChange={(e) => setReview((r) => ({ ...r, updateProgress: e.target.checked }))}
                  />
                }
                label="Update syllabus progress after approval"
              />
            )}

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
          <Button variant="outlined" onClick={closeReview}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={getActionColor(review.action) as any}
            disabled={review.action !== 'approve' && !review.comment.trim()}
            onClick={submitReview}
          >
            Submit Review
          </Button>
        </Stack>
      </CustomDialog>
    </Box>
  );
};

export default ReviewQueueTab;
