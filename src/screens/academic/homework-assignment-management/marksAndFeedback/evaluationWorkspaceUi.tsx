'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Button, Typography, IconButton } from '@mui/material';
import {
  TimetableSettingsSummaryCards,
  type ITimetableSummaryCard,
} from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

type Summary = {
  totalStudents?: number;
  submitted?: number;
  notSubmitted?: number;
  reviewed?: number;
  needsReview?: number;
  late?: number;
  totalMarks?: number | null;
  averageMarks?: number | null;
};

export const EVALUATION_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Needs Review', value: 'needsReview' },
  { label: 'Not Submitted', value: 'notSubmitted' },
  { label: 'Reviewed', value: 'reviewed' },
];

const getEvaluationRowKey = (row: any, index: number) =>
  row?.studentId ||
  row?.studentID ||
  row?.student?.id ||
  row?.grNumber ||
  row?.id ||
  `row-${index}`;

const STATUS_META: Record<number, { label: string; color: any }> = {
  0: { label: 'Not Submitted', color: 'warning' },
  1: { label: 'Submitted', color: 'info' },
  2: { label: 'Late', color: 'error' },
  3: { label: 'Excused', color: 'default' },
  4: { label: 'Reviewed', color: 'success' },
  5: { label: 'Draft', color: 'default' },
  6: { label: 'Needs Review', color: 'warning' },
};

export function dedupeEvaluationRows(rows: any[] = []) {
  const order: string[] = [];
  const rowsByKey = new Map<string, any>();

  rows.forEach((row, index) => {
    const key = String(getEvaluationRowKey(row, index));

    if (!rowsByKey.has(key)) {
      order.push(key);
    }

    rowsByKey.set(key, row);
  });

  return order.map((key) => rowsByKey.get(key));
}

export function getEvaluationSummary(rows: any[] = [], apiSummary?: Summary): Required<Summary> {
  const fallback = rows.reduce(
    (acc, row) => {
      const status = Number(row?.status);
      acc.totalStudents += 1;
      if ([1, 2, 4, 6].includes(status)) acc.submitted += 1;
      if (status === 0) acc.notSubmitted += 1;
      if (status === 4) acc.reviewed += 1;
      if ([1, 2, 6].includes(status)) acc.needsReview += 1;
      if (status === 2) acc.late += 1;
      if (Number.isFinite(Number(row?.marks))) {
        acc.markRows += 1;
        acc.markTotal += Number(row.marks);
      }
      if (!acc.totalMarks && Number.isFinite(Number(row?.totalMarks))) {
        acc.totalMarks = Number(row.totalMarks);
      }
      return acc;
    },
    {
      totalStudents: 0,
      submitted: 0,
      notSubmitted: 0,
      reviewed: 0,
      needsReview: 0,
      late: 0,
      totalMarks: null as number | null,
      markRows: 0,
      markTotal: 0,
    }
  );

  return {
    totalStudents: apiSummary?.totalStudents ?? fallback.totalStudents,
    submitted: apiSummary?.submitted ?? fallback.submitted,
    notSubmitted: apiSummary?.notSubmitted ?? fallback.notSubmitted,
    reviewed: apiSummary?.reviewed ?? fallback.reviewed,
    needsReview: apiSummary?.needsReview ?? fallback.needsReview,
    late: apiSummary?.late ?? fallback.late,
    totalMarks: apiSummary?.totalMarks ?? fallback.totalMarks,
    averageMarks:
      apiSummary?.averageMarks ??
      (fallback.markRows > 0 ? Number((fallback.markTotal / fallback.markRows).toFixed(2)) : null),
  };
}

export function filterEvaluationRows(rows: any[], filter: string) {
  if (filter === 'submitted')
    return rows.filter((row) => [1, 2, 4, 6].includes(Number(row.status)));
  if (filter === 'needsReview') return rows.filter((row) => [1, 2, 6].includes(Number(row.status)));
  if (filter === 'notSubmitted') return rows.filter((row) => Number(row.status) === 0);
  if (filter === 'reviewed') return rows.filter((row) => Number(row.status) === 4);
  return rows;
}

export function EvaluationSummaryCards({
  summary,
  showMarks = true,
  activeFilter = 'all',
  onFilterChange,
}: {
  summary: Required<Summary>;
  showMarks?: boolean;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}) {
  const cards: ITimetableSummaryCard[] = [
    {
      label: 'Students',
      value: summary.totalStudents,
      icon: 'solar:users-group-rounded-bold',
      color: 'primary',
      onClick: () => onFilterChange?.('all'),
      isActive: activeFilter === 'all',
    },
    {
      label: 'Submitted',
      value: summary.submitted,
      icon: 'solar:inbox-in-bold',
      color: 'info',
      onClick: () => onFilterChange?.('submitted'),
      isActive: activeFilter === 'submitted',
    },
    {
      label: 'Needs Review',
      value: summary.needsReview,
      icon: 'solar:clipboard-check-bold',
      color: 'warning',
      onClick: () => onFilterChange?.('needsReview'),
      isActive: activeFilter === 'needsReview',
    },
    {
      label: 'Reviewed',
      value: summary.reviewed,
      icon: 'solar:check-circle-bold',
      color: 'success',
      onClick: () => onFilterChange?.('reviewed'),
      isActive: activeFilter === 'reviewed',
    },
    {
      label: 'Not Submitted',
      value: summary.notSubmitted,
      icon: 'solar:clock-circle-bold',
      color: 'error',
      onClick: () => onFilterChange?.('notSubmitted'),
      isActive: activeFilter === 'notSubmitted',
    },
    ...(showMarks
      ? [
        {
          label: 'Average Marks',
          value: summary.averageMarks ?? '-',
          icon: 'solar:chart-2-bold',
          color: 'info' as const,
        },
      ]
      : []),
  ];

  return <TimetableSettingsSummaryCards cards={cards} />;
}

export function EvaluationFilterBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {EVALUATION_FILTERS.map((item) => (
        <Button
          key={item.value}
          size="small"
          variant={value === item.value ? 'contained' : 'outlined'}
          color={value === item.value ? 'primary' : 'inherit'}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );
}

export function EvaluationStatusChip({ row }: { row: any }) {
  const status = STATUS_META[Number(row?.status)] ?? {
    label: row?.submissionStatusLabel ?? '-',
    color: 'default',
  };
  return <Label color={status.color}>{row?.submissionStatusLabel || status.label}</Label>;
}

export function FeedbackStatusChip({ row }: { row: any }) {
  const isReviewed = Number(row?.status) === 4;
  const isNeedsReview = Number(row?.status) === 6;
  const hasFeedback = Boolean(row?.feedback);
  const hasMarks = row?.marks !== undefined && row?.marks !== null && row?.marks !== '';
  const apiStatus = row?.evaluationStatus;
  const statusLabel =
    isReviewed || ((hasFeedback || hasMarks) && apiStatus === 'Draft')
      ? 'Reviewed'
      : apiStatus ||
      (isNeedsReview ? 'Needs Review' : hasFeedback || hasMarks ? 'Reviewed' : 'Not Started');

  return (
    <Label
      color={
        statusLabel === 'Reviewed'
          ? 'success'
          : statusLabel === 'Needs Review'
            ? 'warning'
            : 'default'
      }
    >
      {statusLabel}
    </Label>
  );
}

export function isRowEvaluationDisabled(
  row: any,
  taskSubmissionType?: number | string | null
): boolean {
  const rowSubmissionType = row?.submissionType || taskSubmissionType;
  const normalizedSubmissionType = String(rowSubmissionType || '').toLowerCase();
  const isInPerson =
    Number(rowSubmissionType) === 2 ||
    normalizedSubmissionType.includes('inperson') ||
    normalizedSubmissionType.includes('in person') ||
    String(row?.homeworkType || '')
      .toLowerCase()
      .includes('in person');

  const status = Number(row?.status);
  return status === 0 && !isInPerson;
}

export function EvaluationActionButton({
  row,
  onOpen,
  canAdd,
  taskSubmissionType,
}: {
  row: any;
  canAdd: boolean;
  taskSubmissionType?: number | string | null;
  onOpen: (row: any) => void;
}) {
  if (!canAdd) return null;

  const isNotSubmitted = isRowEvaluationDisabled(row, taskSubmissionType);
  const rowSubmissionType = row?.submissionType || taskSubmissionType;
  const normalizedSubmissionType = String(rowSubmissionType || '').toLowerCase();
  const isInPerson =
    Number(rowSubmissionType) === 2 ||
    normalizedSubmissionType.includes('inperson') ||
    normalizedSubmissionType.includes('in person') ||
    String(row?.homeworkType || '')
      .toLowerCase()
      .includes('in person');

  const status = Number(row?.status);
  const isReviewed = status === 4;
  const title = isNotSubmitted
    ? 'Send Reminder'
    : isReviewed
      ? 'Edit Feedback'
      : isInPerson && status === 0
        ? 'Add Marks & Feedback'
        : 'Evaluate';
  const icon = isNotSubmitted
    ? 'mdi:bell-outline'
    : isReviewed
      ? 'solar:pen-bold'
      : 'solar:clipboard-check-bold';

  return (
    <CustomTooltip title={title} arrow>
      <span>
        <IconButton size="small" disabled={isNotSubmitted} onClick={() => onOpen(row)}>
          <Iconify icon={icon} width={18} />
        </IconButton>
      </span>
    </CustomTooltip>
  );
}
