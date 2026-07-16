'use client';

import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { Chip, Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetQuestionsQuery } from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ – Single Correct' },
  { value: 2, label: 'MCQ – Multiple Correct' },
  { value: 3, label: 'True / False' },
  { value: 4, label: 'Fill in the Blank' },
  { value: 5, label: 'Short Answer' },
  { value: 6, label: 'Long Answer' },
  { value: 7, label: 'Match the Following' },
  { value: 8, label: 'Assertion & Reason' },
  { value: 9, label: 'Case Study' },
  { value: 10, label: 'Diagram Based' },
  { value: 11, label: 'Practical' },
];

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const STATUS_OPTIONS = [
  { value: 1, label: 'Draft' },
  { value: 2, label: 'Submitted' },
  { value: 3, label: 'Approved' },
  { value: 4, label: 'Rejected' },
  { value: 5, label: 'Archived' },
];

const STATUS_COLOR: Record<number, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  1: 'default',
  2: 'info',
  3: 'success',
  4: 'error',
  5: 'warning',
};

const DIFFICULTY_COLOR: Record<number, 'success' | 'warning' | 'error'> = {
  1: 'success',
  2: 'warning',
  3: 'error',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChapterQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  chapterId: string;
  subjectId?: string;
  standardId?: string;
  chapterName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChapterQuestionsDialog({
  open,
  onClose,
  chapterId,
  subjectId,
  standardId,
  chapterName,
}: ChapterQuestionsDialogProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id;

  const { data, isFetching } = useGetQuestionsQuery(
    {
      academicYearId,
      standardId,
      subjectId,
      chapterId,
      pageSize: 300,
    },
    { skip: !open || !chapterId || !academicYearId }
  );

  const columns = useMemo(
    () => [
      {
        id: 'questionText',
        label: 'Question',
        filterType: 'string' as const,
        minWidth: 260,
        render: (_: any, row: any) => (
          <Stack spacing={1}>
            <Typography variant="body2">{row.questionText}</Typography>
            {!!row.tags?.length && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {row.tags.map((tag: string) => (
                  <Chip key={tag} size="small" label={tag} variant="soft" />
                ))}
              </Stack>
            )}
          </Stack>
        ),
      },
      {
        id: 'questionType',
        label: 'Type',
        filterType: 'enum' as const,
        width: 160,
        enumOptions: QUESTION_TYPE_OPTIONS,
        render: (v: any) => (
          <Typography variant="caption" color="text.secondary">
            {QUESTION_TYPE_OPTIONS.find((q) => q.value === v)?.label || '—'}
          </Typography>
        ),
      },
      {
        id: 'marks',
        label: 'Marks',
        filterType: 'number' as const,
        width: 80,
        align: 'center' as const,
        render: (v: any) => <Typography variant="subtitle2">{v}</Typography>,
      },
      {
        id: 'difficultyLevel',
        label: 'Difficulty',
        filterType: 'enum' as const,
        width: 110,
        enumOptions: DIFFICULTY_OPTIONS,
        render: (v: any) => (
          <Chip
            size="small"
            variant="soft"
            label={DIFFICULTY_OPTIONS.find((d) => d.value === v)?.label || '—'}
            color={(DIFFICULTY_COLOR[v] as any) || 'default'}
          />
        ),
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum' as const,
        width: 110,
        enumOptions: STATUS_OPTIONS,
        render: (v: any) => (
          <Chip
            size="small"
            color={(STATUS_COLOR[v] as any) || 'default'}
            label={STATUS_OPTIONS.find((s) => s.value === v)?.label || '—'}
          />
        ),
      },
    ],
    []
  );

  const title = chapterName ? `Questions — ${chapterName}` : 'Chapter Questions';

  return (
    <CustomDialog open={open} handleClose={onClose} title={title} maxWidth="lg">
      <CustomizableTable
        tableId="chapter-questions-view"
        tableTitle={`${data?.items?.length ?? 0} Question${data?.items?.length === 1 ? '' : 's'}`}
        columns={columns}
        data={data?.items || []}
        isLoading={isFetching}
        noDataText={
          <Stack alignItems="center" spacing={1} py={6}>
            <Iconify icon="mingcute:question-line" width={40} sx={{ color: 'text.disabled' }} />
            <Typography variant="subtitle2" color="text.secondary">
              No questions for this chapter yet
            </Typography>
          </Stack>
        }
      />
    </CustomDialog>
  );
}
