import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions/types';

import { Label } from 'src/components/label';
import { Stack, Typography, LinearProgress } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { statusColor } from '../syllabusPlanningData';
import { ChapterDescriptionCell } from './ChapterDescriptionCell';

import type { IChapter } from '../type';

export function getChapterTableColumns(
  getRowActions: (chapter: IChapter) => AdaptiveThreeDotsAction[]
): IColumn[] {
  return [
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
        <Label color={statusColor(String(value))} variant="soft">
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
        <Label color={statusColor(String(value))} variant="soft">
          {value}
        </Label>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      align: 'left',
      minWidth: 180,
      filterType: 'string',
      render: (value, row) => (
        <ChapterDescriptionCell value={String(value || '')} htmlContent={row.descriptionHtml} />
      ),
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
            <Label color={statusColor(row.coverageStatus)}>{row.coverageStatus}</Label>
          </Stack>
          <LinearProgress variant="determinate" value={Number(value) || 0} />
        </Stack>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      width: 150,
      isSort: false,
      isFilter: false,
      align: 'center',
      sticky: true,
      stickyPosition: 'right',
      render: (_, row) => (
        <AdaptiveThreeDotsActions
          directActionLimit={2}
          actions={getRowActions(row as IChapter)}
          placement="right-top"
          moreLabel="More chapter actions"
        />
      ),
    },
  ];
}
