'use client';

import type { Dayjs } from 'dayjs';
import type { LessonPlanRow } from '../lessonPlanData';
import type { ReviewDateFilterMode } from './review-queue/FilterToolbar';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import { alpha, useTheme } from '@mui/material/styles';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { shikshaMitraToast } from 'src/components/toast';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { EmptyContent } from 'src/components/empty-content';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import StatusBadge from './review-queue/StatusBadge';
import MetricCard from './review-queue/MetricCard';
import ReviewCard, { type ReviewItem } from './review-queue/ReviewCard';
import FilterToolbar from './review-queue/FilterToolbar';
import { SkeletonCardGrid, SkeletonTable } from './review-queue/SkeletonLoader';
import ReviewStatusTabs, { type ReviewStatusFilter } from './ReviewStatusTabs';

type ReviewTarget = { type: 'plan'; id: string };

const getWeekStart = (date: Dayjs) => date.startOf('day').subtract((date.day() + 6) % 7, 'day');
const getWeekEnd = (date: Dayjs) => getWeekStart(date).add(6, 'day');

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
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main', fontSize: '0.75rem' }}>
        Pending :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Awaiting reviewer action
      </Typography>

      <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', fontSize: '0.75rem' }}>
        Approved :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Reviewed & approved
      </Typography>

      <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main', fontSize: '0.75rem' }}>
        Changes Requested :
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
        Requires teacher revisions
      </Typography>

      <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.75rem' }}>
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
  isLoading?: boolean;
  onRefresh?: () => void;
};

export const ReviewQueueTab = ({
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
  isLoading = false,
  onRefresh,
}: Props) => {
  const theme = useTheme();

  // Layout & Navigation State
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('pending');

  // Filter States
  const [teacherSearch, setTeacherSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<ReviewDateFilterMode>('all');
  const [filterDate, setFilterDate] = useState<Dayjs | null>(dayjs());
  const [rangeStart, setRangeStart] = useState<Dayjs | null>(getWeekStart(dayjs()));
  const [rangeEnd, setRangeEnd] = useState<Dayjs | null>(getWeekEnd(dayjs()));

  // Review Dialog State
  const [reviewDialog, setReviewDialog] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
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
    try {
      let success = false;
      if (review.action === 'approve') {
        success = await onApprove(review.target, review.comment, review.updateProgress);
        if (success) {
          shikshaMitraToast.success({ message: 'Lesson plan approved successfully.' });
        }
      } else if (review.action === 'reject') {
        success = await onReject(review.target, review.comment);
        if (success) {
          shikshaMitraToast.success({ message: 'Lesson plan rejected.' });
        }
      } else {
        success = await onRequestChanges(review.target, review.comment);
        if (success) {
          shikshaMitraToast.warning({ message: 'Changes requested from teacher.' });
        }
      }
      if (success) {
        closeReview();
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string; message?: string } };
      shikshaMitraToast.error({
        message: apiErr.data?.detail || apiErr.data?.message || 'Failed to submit review.',
      });
    }
  };

  // Convert raw lesson plans to structured ReviewItem rows
  const reviewRows: ReviewItem[] = useMemo(
    () =>
      lessonPlans
        .filter((p) => ['Submitted', 'Approved', 'NeedsChanges', 'Rejected'].includes(p.planStatus))
        .map((p): ReviewItem => ({
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
          learningObjective: p.learningObjective,
          lessonType: 'Lesson Plan',
          plannedPct: p.plannedCompletionPercentage ?? 0,
          actualPct: p.actualCompletionPercentage ?? '-',
          progressGap:
            typeof p.actualCompletionPercentage === 'number'
              ? p.actualCompletionPercentage - (p.plannedCompletionPercentage ?? 0)
              : '-',
          evidenceCount: 0,
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
    [lessonPlans]
  );

  const activeTargetPlan = useMemo(() => {
    if (!review.target) return null;
    return reviewRows.find((r) => r.id === review.target?.id);
  }, [review.target, reviewRows]);

  const initialFormValues = useMemo(
    () => ({
      comment: '',
      updateProgress: true,
    }),
    []
  );

  const currentFormValues = useMemo(
    () => ({
      comment: review.comment,
      updateProgress: review.updateProgress,
    }),
    [review.comment, review.updateProgress]
  );

  // Dynamic Options for Filters
  const classOptions = useMemo(() => {
    const unique = Array.from(new Set(reviewRows.map((r) => r.classDivision)));
    return unique.map((c) => ({ label: c, value: c }));
  }, [reviewRows]);

  const subjectOptions = useMemo(() => {
    const unique = Array.from(new Set(reviewRows.map((r) => r.subjectName)));
    return unique.map((s) => ({ label: s, value: s }));
  }, [reviewRows]);

  const reviewerOptions = useMemo(() => {
    const unique = Array.from(
      new Set(reviewRows.map((r) => r.reviewedByName).filter(Boolean) as string[])
    );
    return unique.map((rev) => ({ label: rev, value: rev }));
  }, [reviewRows]);

  // Counts for status tabs
  const statusCounts = useMemo(
    () =>
      reviewRows.reduce<Record<ReviewStatusFilter, number>>(
        (counts, row) => ({
          ...counts,
          [row.status as ReviewStatusFilter]: (counts[row.status as ReviewStatusFilter] || 0) + 1,
        }),
        { pending: 0, approved: 0, changes: 0, rejected: 0, all: reviewRows.length }
      ),
    [reviewRows]
  );

  // Filtering Logic
  const filteredReviewRows = useMemo(() => {
    return reviewRows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;

      const searchTxt = teacherSearch.trim().toLowerCase();
      if (searchTxt && !row.teacherName.toLowerCase().includes(searchTxt)) {
        return false;
      }

      if (selectedClass && row.classDivision !== selectedClass) return false;
      if (selectedSubject && row.subjectName !== selectedSubject) return false;
      if (selectedReviewer && row.reviewedByName !== selectedReviewer) return false;

      const submittedDate = dayjs(row.submittedDate);
      if (!submittedDate.isValid() || dateFilterMode === 'all') return true;

      if (dateFilterMode === 'day') {
        return filterDate ? submittedDate.isSame(filterDate, 'day') : true;
      }

      const start = rangeStart?.startOf('day');
      const end = rangeEnd?.endOf('day');
      if (start && submittedDate.isBefore(start, 'day')) return false;
      if (end && submittedDate.isAfter(end, 'day')) return false;
      return true;
    });
  }, [
    reviewRows,
    statusFilter,
    teacherSearch,
    selectedClass,
    selectedSubject,
    selectedReviewer,
    dateFilterMode,
    filterDate,
    rangeStart,
    rangeEnd,
  ]);

  const isFiltered =
    dateFilterMode !== 'all' ||
    Boolean(teacherSearch) ||
    Boolean(selectedClass) ||
    Boolean(selectedSubject) ||
    Boolean(selectedReviewer) ||
    statusFilter !== 'pending';

  const resetFilters = () => {
    setDateFilterMode('all');
    setFilterDate(dayjs());
    setRangeStart(getWeekStart(dayjs()));
    setRangeEnd(getWeekEnd(dayjs()));
    setTeacherSearch('');
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedReviewer('');
    setStatusFilter('pending');
  };

  const canReviewRow = (row: ReviewItem) =>
    canReviewSubmissions &&
    (!currentTeacherId || !row.teacherId || row.teacherId !== currentTeacherId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      {/* Header Controls: 2 Separate Cards with Gap (Status Tabs + Filter Toolbar) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
        {/* Status Navigation Card */}
        <Card
          sx={{
            borderRadius: '12px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <ReviewStatusTabs
            value={statusFilter}
            counts={statusCounts}
            onChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </Card>

        {/* Filter Toolbar Card */}
        <Card
          sx={{
            borderRadius: '12px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <FilterToolbar
            teacherSearch={teacherSearch}
            onTeacherSearchChange={setTeacherSearch}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            classOptions={classOptions}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            subjectOptions={subjectOptions}
            selectedReviewer={selectedReviewer}
            onReviewerChange={setSelectedReviewer}
            reviewerOptions={reviewerOptions}
            dateFilterMode={dateFilterMode}
            onDateFilterModeChange={setDateFilterMode}
            filterDate={filterDate}
            onFilterDateChange={setFilterDate}
            rangeStart={rangeStart}
            onRangeStartChange={setRangeStart}
            rangeEnd={rangeEnd}
            onRangeEndChange={setRangeEnd}
            onResetFilters={resetFilters}
            isFiltered={isFiltered}
          />
        </Card>
      </Box>

      {/* Permission Notice */}
      {!canReviewSubmissions && reviewRows.length > 0 && (
        <Alert severity="info">
          Review actions (Approve, Reject, Request Changes) are restricted to Principal, Admin, or Coordinator roles.
        </Alert>
      )}

      {/* Loading Skeletons */}
      {isLoading && (viewMode === 'card' ? <SkeletonCardGrid count={6} /> : <SkeletonTable rows={6} />)}

      {/* Empty States */}
      {!isLoading && reviewRows.length === 0 && (
        <Card sx={{ p: 4 }}>
          <EmptyContent
            title="No Pending Reviews"
            description="All lesson plans and diaries have been reviewed and processed."
            action={
              onRefresh ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.refresh} />}
                  onClick={onRefresh}
                  sx={{ mt: 2 }}
                >
                  Refresh Queue
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      {!isLoading && reviewRows.length > 0 && filteredReviewRows.length === 0 && (
        <Card sx={{ p: 4 }}>
          <EmptyContent
            title={statusFilter === 'pending' ? 'No Pending Reviews' : 'No Reviews Found'}
            description={
              statusFilter === 'pending'
                ? 'No pending review items match your selected filters.'
                : 'Try adjusting your search criteria, teacher name, class, subject, or date range.'
            }
            action={
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:restart-bold" />}
                onClick={resetFilters}
                sx={{ mt: 2 }}
              >
                Reset All Filters
              </Button>
            }
          />
        </Card>
      )}

      {/* Card Grid View */}
      {!isLoading && viewMode === 'card' && filteredReviewRows.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            flex: '1 0 auto',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
          }}
        >
          {filteredReviewRows.map((row) => {
            const sourcePlan = lessonPlans.find((plan) => plan.id === row.id);
            const isSelf = Boolean(currentTeacherId && row.teacherId === currentTeacherId);
            // Only the card whose target matches the active review dialog should
            // reflect the in-flight mutation isLoading. Other cards stay idle.
            const isReviewTarget = review.target?.id === row.id;

            return (
              <ReviewCard
                key={row.id}
                item={row}
                canReview={canReviewRow(row)}
                canReviewSubmissions={canReviewSubmissions}
                isSelfSubmission={isSelf}
                isApproving={isApproving && isReviewTarget}
                isRequesting={isRequesting && isReviewTarget}
                isRejecting={isRejecting && isReviewTarget}
                onApprove={() => openReview({ type: 'plan', id: row.id }, 'approve')}
                onRequestChanges={() => openReview({ type: 'plan', id: row.id }, 'changes')}
                onReject={() => openReview({ type: 'plan', id: row.id }, 'reject')}
                onViewDetails={sourcePlan && onViewDetails ? () => onViewDetails(sourcePlan) : undefined}
                onRevisePlan={
                  sourcePlan && onRevisePlan && ['changes', 'rejected'].includes(row.status)
                    ? () => onRevisePlan(sourcePlan)
                    : undefined
                }
              />
            );
          })}
        </Box>
      )}

      {/* Data Table View */}
      {!isLoading && viewMode === 'table' && filteredReviewRows.length > 0 && (
        <CustomizableTable
          tableId="review-queue-table"
          tableTitle="Review Queue"
          data={filteredReviewRows}
          columns={[
            {
              id: 'teacherName',
              label: 'Teacher',
              align: 'left' as const,
              minWidth: 180,
              sticky: true,
              filterType: 'string' as const,
              render: (_v, row) => (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {row.teacherName}
                  </Typography>
                </Stack>
              ),
            },
            {
              id: 'submittedDate',
              label: 'Lecture Date',
              align: 'left' as const,
              filterType: 'date' as const,
              minWidth: 120,
              render: (v: any) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
            },
            {
              id: 'pendingSince',
              label: 'Pending Since',
              align: 'left' as const,
              filterType: 'date' as const,
              minWidth: 120,
              render: (v: any) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
            },
            { id: 'classDivision', label: 'Class', align: 'left' as const, minWidth: 120, filterType: 'enum' as const },
            { id: 'subjectName', label: 'Subject', align: 'left' as const, minWidth: 140, filterType: 'enum' as const },
            { id: 'chapterName', label: 'Chapter', align: 'left' as const, minWidth: 160, filterType: 'string' as const },
            { id: 'topic', label: 'Topic', align: 'left' as const, minWidth: 220, filterType: 'string' as const },
            {
              id: 'plannedPct',
              label: 'Planned %',
              align: 'left' as const,
              filterType: 'number' as const,
              minWidth: 100,
              render: (v: any) => `${v}%`,
            },
            {
              id: 'actualPct',
              label: 'Actual %',
              align: 'left' as const,
              filterType: 'number' as const,
              minWidth: 100,
              render: (v: any) => (v === '-' ? '-' : `${v}%`),
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left' as const,
              minWidth: 150,
              sticky: true,
              stickyPosition: 'right' as const,
              filterType: 'enum' as const,
              enumOptions: [
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Changes Requested', value: 'changes' },
                { label: 'Rejected', value: 'rejected' },
              ],
              render: (value: string) => {
                const labelMap: Record<
                  string,
                  { label: string; color: 'warning' | 'success' | 'info' | 'error' | 'default' }
                > = {
                  pending: { label: 'Pending', color: 'warning' },
                  approved: { label: 'Approved', color: 'success' },
                  changes: { label: 'Changes Requested', color: 'info' },
                  rejected: { label: 'Rejected', color: 'error' },
                };
                const config = labelMap[value] || { label: value, color: 'default' };
                return (
                  <Label color={config.color} variant="soft">
                    {config.label}
                  </Label>
                );
              },
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'left' as const,
              sticky: true,
              stickyPosition: 'right' as const,
              isFilter: false,
              isSort: false,
              minWidth: 120,
              render: (_v, row) => {
                const item = row as ReviewItem;
                const sourcePlan = lessonPlans.find((plan) => plan.id === item.id);
                const canRev = canReviewRow(item);

                return (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {sourcePlan && onViewDetails && (
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onViewDetails(sourcePlan)}
                        >
                          <Iconify icon={GlobalIcons.eye} width={18} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {item.status === 'pending' && canRev && (
                      <ThreeDotsActions
                        actions={({ popover }) => (
                          <Box sx={{ py: 0.5 }}>
                            <Button
                              fullWidth
                              size="small"
                              color="success"
                              variant="text"
                              startIcon={<Iconify icon="solar:check-circle-bold" />}
                              onClick={() => {
                                popover.onClose();
                                openReview({ type: 'plan', id: item.id }, 'approve');
                              }}
                              sx={{ justifyContent: 'flex-start', px: 2 }}
                            >
                              Approve
                            </Button>
                            <Button
                              fullWidth
                              size="small"
                              color="warning"
                              variant="text"
                              startIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
                              onClick={() => {
                                popover.onClose();
                                openReview({ type: 'plan', id: item.id }, 'changes');
                              }}
                              sx={{ justifyContent: 'flex-start', px: 2 }}
                            >
                              Request Changes
                            </Button>
                            <Button
                              fullWidth
                              size="small"
                              color="error"
                              variant="text"
                              startIcon={<Iconify icon="solar:close-circle-bold" />}
                              onClick={() => {
                                popover.onClose();
                                openReview({ type: 'plan', id: item.id }, 'reject');
                              }}
                              sx={{ justifyContent: 'flex-start', px: 2 }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      />
                    )}
                  </Stack>
                );
              },
            },
          ]}
        />
      )}

      {/* Review Action Modal */}
      <CustomDialog
        open={reviewDialog}
        handleClose={closeReview}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
            <Iconify
              icon={
                review.action === 'approve'
                  ? 'solar:check-circle-bold-duotone'
                  : review.action === 'reject'
                    ? 'solar:close-circle-bold-duotone'
                    : 'solar:alt-arrow-right-bold-duotone'
              }
              color={
                review.action === 'approve'
                  ? 'success.main'
                  : review.action === 'reject'
                    ? 'error.main'
                    : 'warning.main'
              }
              width={22}
              height={22}
            />
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              {review.action === 'approve'
                ? 'Approve Lesson Plan'
                : review.action === 'reject'
                  ? 'Reject Lesson Plan'
                  : 'Request Changes'}
            </Box>
            <CustomTooltip
              arrow
              placement="right"
              title="Submit official review decision and feedback to teacher."
            >
              <Iconify
                icon={GlobalIcons.info}
                color="info.main"
                width={16}
                height={16}
                sx={{ cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
        hasForm
      >
        <BackPopUpChecked initialValues={initialFormValues} currentValues={currentFormValues}>
          <DialogScrollContent onSubmit={submitReview}>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {/* Target Plan Summary Card */}
              {activeTargetPlan && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                    borderColor: (theme) => alpha(theme.palette.divider, 0.8),
                  }}
                >
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700}>
                        {activeTargetPlan.teacherName}
                      </Typography>
                      <Chip
                        label={`${activeTargetPlan.classDivision} • ${activeTargetPlan.subjectName}`}
                        size="small"
                        variant="soft"
                        color="primary"
                        sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {activeTargetPlan.chapterName} — {activeTargetPlan.topic}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              <Alert
                severity={
                  review.action === 'approve'
                    ? 'success'
                    : review.action === 'reject'
                      ? 'error'
                      : 'warning'
                }
                sx={{ borderRadius: 1.5 }}
              >
                {review.action === 'approve'
                  ? 'Approve this submission for official record and execution.'
                  : review.action === 'reject'
                    ? 'Rejecting this submission will notify the teacher.'
                    : 'Request revisions from the teacher with detailed feedback.'}
              </Alert>

              {review.action === 'approve' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={review.updateProgress}
                      onChange={(e) =>
                        setReview((prev) => ({ ...prev, updateProgress: e.target.checked }))
                      }
                      color="success"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      Automatically sync and update syllabus completion progress
                    </Typography>
                  }
                />
              )}

              <TextField
                label="Review Remarks / Comments"
                placeholder="Enter remarks or feedback for the teacher..."
                multiline
                rows={3}
                fullWidth
                size="small"
                value={review.comment}
                onChange={(e) => setReview((prev) => ({ ...prev, comment: e.target.value }))}
              />
            </Stack>
          </DialogScrollContent>
          <DialogActions sx={{ boxShadow: 'var(--shadows-10)' }}>
            <CancelButton onClick={closeReview} />
            <SubmitButton
              buttonText={
                review.action === 'approve'
                  ? 'Confirm Approve'
                  : review.action === 'reject'
                    ? 'Confirm Reject'
                    : 'Submit Request'
              }
              loading={isSubmitLoading}
              onClick={submitReview}
            />
          </DialogActions>

        </BackPopUpChecked>
      </CustomDialog>

      {/* Help Dialog */}
      <CustomDialog
        open={helpDialogOpen}
        handleClose={() => setHelpDialogOpen(false)}
        title="Review Queue Help & Guide"
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Stack spacing={2} sx={{ py: 1 }}>
            <Typography variant="subtitle2">Understanding the Review Queue</Typography>
            <Typography variant="body2" color="text.secondary">
              The Review Queue is designed for Principal, Admin, and Academic Head roles to efficiently evaluate, approve, or request revisions for lesson plans and teacher diaries submitted by staff.
            </Typography>

            <Divider />

            <Typography variant="subtitle2">Review Status Workflow</Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <Typography variant="body2">
                  <strong>Pending:</strong> Awaiting initial review and approval.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Approved:</strong> Submission meets curriculum criteria and is logged.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Changes Requested:</strong> Returned to teacher with feedback for edits.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Rejected:</strong> Submission declined.
                </Typography>
              </li>
            </Box>

            <DialogActions sx={{ px: 0, pb: 0 }}>
              <Button size="small" variant="contained" onClick={() => setHelpDialogOpen(false)}>
                Got it
              </Button>
            </DialogActions>
          </Stack>
        </DialogScrollContent>
      </CustomDialog>
    </Box>
  );
};

export default ReviewQueueTab;
