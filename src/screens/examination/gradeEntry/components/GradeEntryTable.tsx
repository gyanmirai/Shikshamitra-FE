import type { LabelColor } from 'src/components/label';

import { Checkbox, Typography } from '@mui/material';

import {
  ExamGradeStatusType,
  ExamGradeStatusColor,
  ExamGradeStatusOptions,
} from 'src/enums/grade-entry-status';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IGradeEntryTableProps } from '../type';

const GradeEntryTable = ({
  data,
  selectedStudents,
  handleSelectStudent,
  actions,
}: IGradeEntryTableProps) => (
  <CustomizableTable
    tableId="grade-entry-table"
    noDataText={<>No Student Found For Grading</>}
    columns={[
      {
        id: 'select',
        label: 'Select',
        minWidth: 60,
        sticky: true,
        isFilter: false,
        isSort: false,
        render: (value, row) => (
          <Checkbox
            checked={selectedStudents.includes(row.id)}
            onChange={() => handleSelectStudent(row.id)}
          />
        ),
      },
      { id: 'Gr No', label: 'Gr No', minWidth: 80 },
      { id: 'studentName', label: 'Student Name', minWidth: 150 },
      { id: 'marks', label: 'Marks', minWidth: 80, filterType: 'number' },
      {
        id: 'grade',
        label: 'Grade',
        render: (value, row) =>
          value === '' ? (
            <Typography variant="subtitle2" color="textSecondary">
              -
            </Typography>
          ) : (
            <Typography variant="caption" gutterBottom>
              {value}
            </Typography>
          ),
      },
      {
        id: 'feedback',
        label: 'Feedback',
        render: (value, row) =>
          value === '' ? (
            <Typography variant="subtitle2" color="textSecondary">
              -
            </Typography>
          ) : (
            <Typography variant="caption" gutterBottom>
              {value}
            </Typography>
          ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: '200px',
        align: 'left',
        filterType: 'enum',
        enumOptions: ExamGradeStatusOptions,
        render(value: ExamGradeStatusType, row: any) {
          const color = ExamGradeStatusColor[value as ExamGradeStatusType] as LabelColor;
          return <Label color={color}>{ExamGradeStatusType[value]}</Label>;
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 50,
        sticky: true,
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <ThreeDotsActions actions={(prop) => actions({ ...prop, row })} placement="right-top" />
          );
        },
      },
    ]}
    data={data}
  />
);

export default GradeEntryTable;
