import { Checkbox, Typography } from '@mui/material';

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
        isFilter: false,
        isSort: false,
        render: (value, row) => (
          <Checkbox
            checked={selectedStudents.includes(row.id)}
            onChange={() => handleSelectStudent(row.id)}
          />
        ),
      },
      { id: 'studentName', label: 'Student Name' },
      { id: 'assignments', label: 'Assignments' },
      { id: 'subject', label: 'Subject' },
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
        render: (value, row) => (
          <Label
            color={value === 'Assigned' ? 'primary' : value === 'Pending' ? 'warning' : 'default'}
          >
            {value}
          </Label>
        ),
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
