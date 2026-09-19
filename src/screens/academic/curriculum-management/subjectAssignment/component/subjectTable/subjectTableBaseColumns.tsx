import type { IColumn } from 'src/components/customizabaleTable/types';

import { Box, Chip, Typography } from '@mui/material';

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
      label: 'Subject Name',
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
          <Chip
            size="small"
            label="Not Assigned"
            color="warning"
            variant="soft"
            sx={{ height: 20, fontSize: 11 }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {teacherNames.map((name) => (
              <Chip
                key={name}
                size="small"
                label={name}
                variant="soft"
                color="info"
                sx={{ height: 22, fontSize: 11 }}
              />
            ))}
          </Box>
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
      label: 'Periods/Wk',
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
