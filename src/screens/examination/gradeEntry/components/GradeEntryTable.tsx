import type { LabelColor } from 'src/components/label';

import { Typography } from '@mui/material';

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
    searchFieldProps={{
      // placeholder: 'Search by Gr No, Student Name, Marks...',
      label: 'Search by Gr No, Student Name, Marks...',
      sx: {
        maxWidth: '500px',
        width: '100%',
      },
    }}
    columns={[
      // {
      //   id: 'select',
      //   label: 'Select',
      //   minWidth: 60,
      //   sticky: true,
      //   isFilter: false,
      //   isSort: false,
      //   render: (value, row) => (
      //     <Checkbox
      //       checked={selectedStudents.includes(row.id)}
      //       onChange={() => handleSelectStudent(row.id)}
      //     />
      //   ),
      // },
      { id: 'studentName', label: 'Student Name', sticky: true, minWidth: 180, align: 'left' },
      { id: 'GrNo', label: 'Gr No.', align: 'left' },
      { id: 'marks', label: 'Marks', filterType: 'number' },
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
        label: 'Marks Status',
        align: 'left',
        sticky: true,
        filterType: 'enum',
        enumOptions: ExamGradeStatusOptions,
        render(value: ExamGradeStatusType, row: any) {
          const color = ExamGradeStatusColor[value as ExamGradeStatusType] as LabelColor;
          return <Label color={color}>{ExamGradeStatusType[value]}</Label>;
        },
      },
      {
        id: 'actions',
        label: 'Action',
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
