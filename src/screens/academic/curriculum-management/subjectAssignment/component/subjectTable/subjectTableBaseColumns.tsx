import type { IColumn } from 'src/components/customizabaleTable/types';

import { Chip, Stack, Typography } from '@mui/material';

import { PeriodsPerWeekButton } from './SubjectTableCells';
import { getPrimaryTeacherNames } from '../../utils/primaryTeacherNames';

import type { ISubjectFormValues } from '../type';

export function getSubjectTableBaseColumns(
  onViewSchedule: (row: ISubjectFormValues) => void
): IColumn[] {
  return [
    {
      id: 'subjectTypeValue',
      label: 'Type',
      align: 'left',
      minWidth: 60,
      width: 70,
      sticky: true,
      render: (value) => (
        <Chip
          size="small"
          label={value}
          variant="soft"
          color={value === 'Core' ? 'primary' : value === 'Elective' ? 'secondary' : 'default'}
          sx={{ height: 20, fontSize: 11 }}
        />
      ),
    },
    {
      id: 'subjectsName',
      label: 'Subject',
      align: 'left',
      isFilter: false,
      isSort: false,
      minWidth: 180,
      sticky: true,
      render: (_value, row) => (
        <>
          {row.electiveGroupName ? `${row.electiveGroupName} - ` : ''}
          {row.subjectNameDisplay}
        </>
      ),
    },
    {
      id: 'subjectCodeValue',
      label: 'Code',
      align: 'left',
      minWidth: 100,
      isSort: false,
      isFilter: false,
      render: (value) => (
        <Typography variant="caption" fontFamily="monospace" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'primaryTeacherDisplay',
      label: 'Teachers',
      align: 'left',
      minWidth: 180,
      isSort: false,
      isFilter: false,
      render: (_value, row) => {
        const teacherNames = getPrimaryTeacherNames(row as ISubjectFormValues);
        return teacherNames.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Teacher not assigned
          </Typography>
        ) : (
          <Stack spacing={0.25}>
            {teacherNames.map((teacherName) => (
              <Typography key={teacherName} variant="body2" sx={{ lineHeight: 1.4 }}>
                {teacherName}
              </Typography>
            ))}
          </Stack>
        );
      },
    },
    {
      id: 'chaptersDisplay',
      label: 'Chapters',
      align: 'center',
      minWidth: 70,
      width: 70,
      isSort: false,
      isFilter: false,
      render: (value) => (
        <Typography variant="body2" textAlign="center">
          {value}
        </Typography>
      ),
    },
    {
      id: 'weeklyPeriodsDisplay',
      label: 'Periods/week',
      align: 'center',
      minWidth: 80,
      width: 80,
      isSort: false,
      isFilter: false,
      render: (_value, row) => (
        <PeriodsPerWeekButton row={row as ISubjectFormValues} onClick={onViewSchedule} />
      ),
    },
  ];
}
