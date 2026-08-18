// components/ChapterTable.tsx
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, MenuList, MenuItem, Typography, LinearProgress } from '@mui/material';

import { statusColor, getCoverageStatus, getChapterProgress } from '../syllabusPlanningData';

import type { IChapter, IChapterTableProps } from '../type';

const ChapterTable = ({
  addChapterDialog,
  isLoading,
  onDelete,
  setEditData,
  data,
  actions,
  handleEyeClick,
  onViewDocuments,
  onCreateQuestion,
  onViewQuestions,
  subjectId,
  standardId,
  canAdd = true,
  canView = true,
  canDelete = true,
}: IChapterTableProps) => {
  const tableData = useMemo(
    () =>
      data?.map((chapter) => ({
        ...chapter,
        chapterStartTime: chapter.chapterStartTime
          ? dayjs(chapter.chapterStartTime).format('DD-MM-YYYY')
          : '',
        chapterEndTime: chapter.chapterEndTime
          ? dayjs(chapter.chapterEndTime).format('DD-MM-YYYY')
          : '',
        unitTerm: [chapter.unitName, chapter.termName].filter(Boolean).join(' / ') || '-',
        plannedLoad: `${chapter.estimatedTeachingDays || '-'} days / ${chapter.estimatedPeriods || '-'
          } periods`,
        outcomes: chapter.learningOutcomes || chapter.skillsCovered || '-',
        resources:
          (chapter.documents?.length ?? 0) > 1
            ? `${chapter.documents?.length} files`
            : chapter.documents?.length === 1
              ? '1 file'
              : chapter.resourceStatus || 'Missing',
        lessonPlanStatus: chapter.lessonPlanStatus || 'Not Linked',
        homeworkStatus: chapter.homeworkStatus || 'Not Mapped',
        questionCount: chapter.questionCount || 0,
        assessmentStatus: chapter.assessmentStatus || 'Not Mapped',
        progressPercentage: getChapterProgress(chapter),
        coverageStatus: getCoverageStatus(chapter),
        publishStatus: chapter.publishStatus || 'Draft',
        // Keep original HTML for tooltip display
        descriptionHtml: chapter.description || '',
        // Strip HTML for export and table display
        description: chapter.description ? chapter.description.replace(/<[^>]*>/g, '') : '',
      })) || [],
    [data]
  );

  const tableActions = useCallback(
    (actionProps: { popover: any; row: IChapter }) => {
      const { popover, row } = actionProps;

      return (
        <MenuList disablePadding dense>
          {canView && (
            <MenuItem
              onClick={() => {
                onViewDocuments(row);
                popover.onClose();
              }}
            >
              <Iconify icon="carbon:view-filled" sx={{ mr: 1, width: 18, height: 18 }} />
              View Documents
            </MenuItem>
          )}
          {canAdd && (
            <MenuItem
              onClick={() => {
                setEditData(row);
                addChapterDialog.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ mr: 1, width: 18, height: 18 }} />
              Edit Chapter
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              onCreateQuestion?.(row);
              popover.onClose();
            }}
          >
            <Iconify icon="mingcute:question-line" sx={{ mr: 1, width: 18, height: 18 }} />
            Create Question
          </MenuItem>
          <MenuItem
            onClick={() => {
              onViewQuestions?.(row);
              popover.onClose();
            }}
          >
            <Iconify icon="mingcute:list-check-line" sx={{ mr: 1, width: 18, height: 18 }} />
            View Questions
          </MenuItem>
          {canDelete && (
            <MenuItem
              onClick={() => {
                onDelete(row);
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1, width: 18, height: 18 }} />
              Delete Chapter
            </MenuItem>
          )}
        </MenuList>
      );
    },
    [
      addChapterDialog,
      canAdd,
      canDelete,
      canView,
      onCreateQuestion,
      onDelete,
      onViewDocuments,
      onViewQuestions,
      setEditData,
    ]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'chapterName',
        label: 'Chapter Name',
        align: 'left',
        sticky: true,
        minWidth: 220,
        filterType: 'string',
        render: (value, row) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            {row.chapterNumber !== undefined && row.chapterNumber !== null && (
              <Typography variant="caption" fontSize="13px" noWrap sx={{ maxWidth: 200 }}>
                {row.chapterNumber}.
              </Typography>
            )}
            <Typography variant="caption" fontSize="13px" noWrap sx={{ maxWidth: 200 }}>
              {value}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'unitTerm',
        label: 'Unit / Term',
        align: 'left',
        minWidth: 130,
        filterType: 'string',
      },
      {
        id: 'chapterStartTime',
        label: 'Start Date',
        align: 'left',
        minWidth: 120,
        filterType: 'date',
      },
      {
        id: 'chapterEndTime',
        label: 'End Date',
        align: 'left',
        minWidth: 120,
        filterType: 'date',
      },
      {
        id: 'plannedLoad',
        label: 'Teaching Load',
        align: 'left',
        minWidth: 150,
        filterType: 'string',
      },
      {
        id: 'outcomes',
        label: 'Outcomes / Skills',
        align: 'left',
        minWidth: 220,
        filterType: 'string',
        render: (value) => (
          <Typography variant="inherit" noWrap sx={{ maxWidth: 220 }}>
            {value}
          </Typography>
        ),
      },
      {
        id: 'resources',
        label: 'Resources',
        align: 'center',
        minWidth: 120,
        filterType: 'enum',
        enumOptions: [
          { label: 'Missing', value: 'Missing' },
          { label: 'Complete', value: 'Complete' },
          { label: 'In Progress', value: 'In Progress' },
        ],
        render: (value, row) => (
          <Label color={statusColor(row.resourceStatus || String(value)) as any}>
            {value}
          </Label>
        ),
      },
      {
        id: 'lessonPlanStatus',
        label: 'Lesson Plan',
        align: 'center',
        minWidth: 130,
        filterType: 'enum',
        enumOptions: [
          { label: 'Linked', value: 'Linked' },
          { label: 'Not Linked', value: 'Not Linked' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Approved', value: 'Approved' },
        ],
        render: (value) => (
          <Label color={statusColor(String(value)) as any}>
            {value}
          </Label>
        ),
      },
      {
        id: 'homeworkStatus',
        label: 'Homework',
        align: 'center',
        minWidth: 130,
        filterType: 'enum',
        enumOptions: [
          { label: 'Mapped', value: 'Mapped' },
          { label: 'Not Mapped', value: 'Not Mapped' },
          { label: 'Assigned', value: 'Assigned' },
        ],
        render: (value) => (
          <Label color={statusColor(String(value)) as any}>
            {value}
          </Label>
        ),
      },
      {
        id: 'questionCount',
        label: 'Questions',
        align: 'center',
        minWidth: 110,
        filterType: 'number',
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        minWidth: 180,
        filterType: 'string',
        render: (value, row) => {
          // value is already plain text (HTML stripped in tableData), use descriptionHtml for tooltip
          const htmlContent = row.descriptionHtml;
          return (
            <CustomTooltip
              title={
                htmlContent && (
                  <Box
                    sx={{
                      p: 1.5,
                      maxWidth: { xs: 'calc(100vw - 48px)', sm: 420 },
                      maxHeight: 'min(360px, 50vh)',
                      overflow: 'auto',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.45,
                      '& p': { m: 0 },
                      '& p + p': { mt: 1 },
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                )
              }
              arrow
              placement="left-start"
              sx={{
                '& .MuiTooltip-tooltip': {
                  maxWidth: { xs: 'calc(100vw - 48px)', sm: 420 },
                },
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: 180,
                }}
              >
                {value || '-'}
              </Typography>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'progressPercentage',
        label: 'Progress',
        align: 'left',
        minWidth: 160,
        sticky: true,
        stickyPosition: 'right',
        filterType: 'number',
        render: (value, row) => (
          <Stack spacing={1} sx={{ minWidth: 140 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption">{value}%</Typography>
              <Label color={statusColor(row.coverageStatus) as any}>
                {row.coverageStatus}
              </Label>
            </Stack>
            <LinearProgress variant="determinate" value={Number(value) || 0} />
          </Stack>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 60,
        width: 60,
        isSort: false,
        isFilter: false,
        align: 'center',
        sticky: true,
        stickyPosition: 'right',
        render(value, row) {
          const chapter = row as IChapter;
          return (
            <ThreeDotsActions
              showThreeDots
              placement="right-top"
              actions={(prop) => tableActions({ ...prop, row: chapter })}
            />
          );
        },
      },
    ],
    [tableActions]
  );
  return (
    <CustomizableTable
      tableId="chapterTable"
      isLoading={isLoading}
      noDataText={<>Chapters Data Not Found </>}
      columns={columns}
      data={tableData}
    />
  );
};

export default ChapterTable;
