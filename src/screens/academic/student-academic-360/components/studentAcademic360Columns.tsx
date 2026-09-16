import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import {
  StudentCell,
  HomeworkCell,
  AttendanceCell,
  ExamAverageCell,
} from './studentAcademic360MetricCells';
import {
  TrendCell,
  AlertCell,
  HealthCell,
  ActionCell,
  LastUpdatedCell,
} from './studentAcademic360StatusCells';

import type { Academic360StudentRow } from '../types';

export const createStudentAcademic360Columns = (
  onNotify: (student: Academic360StudentRow) => void,
  onOpen: (student: Academic360StudentRow) => void
): IColumn[] => [
  {
    id: 'name',
    label: 'Student',
    sticky: true,
    stickyPosition: 'left',
    minWidth: 280,
    render: (_value: unknown, row: IData) => <StudentCell row={row} />,
  },
  {
    id: 'attendance.percentage',
    label: 'Attendance',
    filterType: 'number',
    render: (_value: unknown, row: IData) => <AttendanceCell row={row} />,
  },
  {
    id: 'homework.percentage',
    label: 'Homework',
    filterType: 'number',
    render: (_value: unknown, row: IData) => <HomeworkCell row={row} />,
  },
  {
    id: 'examAverage.percentage',
    label: 'Exam Average',
    filterType: 'number',
    render: (_value: unknown, row: IData) => <ExamAverageCell row={row} />,
  },
  {
    id: 'trend',
    label: 'Trend',
    filterType: 'string',
    render: (_value: unknown, row: IData) => <TrendCell row={row} />,
  },
  {
    id: 'academicHealth',
    label: 'Academic Health',
    filterType: 'enum',
    sticky: true,
    stickyPosition: 'right',
    enumOptions: [
      'On Track',
      'Improving',
      'Needs Attention',
      'Support Recommended',
      'Insufficient Data',
    ].map((value) => ({ label: value, value })),
    render: (_value: unknown, row: IData) => <HealthCell row={row} />,
  },
  {
    id: 'alertCount',
    label: 'Alerts',
    filterType: 'number',
    render: (_value: unknown, row: IData) => <AlertCell row={row} />,
  },
  {
    id: 'lastUpdatedAt',
    label: 'Last Updated',
    filterType: 'date',
    render: (_value: unknown, row: IData) => <LastUpdatedCell row={row} />,
  },
  {
    id: 'action',
    label: 'Actions',
    align: 'left',
    isSort: false,
    sticky: true,
    stickyPosition: 'right',
    isFilter: false,
    excludeFromExport: true,
    render: (_value: unknown, row: IData) => (
      <ActionCell row={row} onNotify={onNotify} onOpen={onOpen} />
    ),
  },
];
