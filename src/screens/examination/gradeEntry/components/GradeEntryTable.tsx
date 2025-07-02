import type { LabelColor } from 'src/components/label';

import { Typography } from '@mui/material';

import {
  ExamGradeStatusType,
  ExamGradeStatusColor,
  ExamGradeStatusOptions,
} from 'src/enums/grade-entry-status';

import { Label } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
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
      { id: 'rollNo', label: 'Roll No.', minWidth: 100, align: 'left' },
      { id: 'totalMarks', label: 'Total Marks', align: 'left', minWidth: 120 },
      {
        id: 'marks',
        label: 'Obtained Marks',
        align: 'left',
        minWidth: 150,
        filterType: 'number',
        render: (value, row) =>
          value == null ? (
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
        render: (value, row) => (
          <CustomTooltip title={value || '-'} arrow>
            <Typography
              variant="caption"
              fontSize="13px"
              noWrap
              sx={{
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {value || '-'}
            </Typography>
          </CustomTooltip>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        minWidth: 90,
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
        minWidth: 40,
        sticky: true,
        align: 'left',
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
