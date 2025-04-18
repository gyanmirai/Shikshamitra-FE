// SubjectTable.tsx

import dayjs from 'dayjs';

import { Box, Switch, Typography } from '@mui/material';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ISubject, ISubjectTableProps } from './type';

const SubjectTable = ({
  addSubjectDialog,
  data,
  editData,
  setEditData,
  subjectTableData,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: ISubjectTableProps) => (
  <CustomizableTable
    tableId="subject-table"
    searchFieldProps={{
      placeholder:
        'Search by Subject Code, Subject Name, Primary Teacher, Secondary Teacher, Prerequisites, Learning Goal',
      label:
        'Search by Subject Code, Subject Name, Primary Teacher, Secondary Teacher, Prerequisites, Learning Goal',
    }}
    noDataText={
      <>
        No Subject Found{' '}
        <Box
          onClick={() => {
            addSubjectDialog.onTrue();
            setEditData(null);
          }}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          Add Subject
        </Box>
      </>
    }
    columns={[
      { id: 'subjectCode', label: 'Subject Code', minWidth: '180px', align: 'left' },
      {
        id: 'subjectName',
        label: 'Subject Name',
        minWidth: '200px',
        align: 'left',
        render(value, row) {
          return (
            <Typography variant="caption" color={row.subjectColor}>
              {value}
            </Typography>
          );
        },
      },
      {
        id: 'primaryTeacher',
        label: 'Primary Teacher',
        minWidth: '200px',
        align: 'left',
      },
      {
        id: 'secondaryTeacher',
        label: 'Secondary Teacher',
        minWidth: '200px',
        align: 'left',
        render: (value) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {value.map((audience: string, index: number) => (
              <Typography key={index} variant="caption">
                {audience}
                {index < value.length - 1 && ' | '}
              </Typography>
            ))}
          </Box>
        ),
      },
      {
        id: 'scheduleDate',
        label: 'Schedule Date',
        minWidth: '180px',
        align: 'left',
        filterType: 'date',
        isDateRangeFilter: true,
        render: (value) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      { id: 'prerequisites', label: 'Prerequisites', minWidth: '200px', align: 'left' },
      { id: 'learningGoal', label: 'Learning Goal', minWidth: '200px', align: 'left' },
      {
        id: 'status',
        label: 'Publish',
        minWidth: '200px',
        align: 'left',
        filterType: 'enum',
        enumOptions: PublishUnpublishStatusOptions,
        render: (value: PublishUnpublishStatusType, row: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              size="small"
              checked={value === PublishUnpublishStatusType.Publish}
              onChange={() => onToggleStatus(row.id, value)}
            />
          </Box>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        align: 'left',
        minWidth: 100,
        sticky: true,
        isFilter: false,
        isSort: false,
        render(value, row) {
          const subject = subjectTableData.find((s) => s.id === row.id);
          return (
            <ThreeDotsActions
              placement="right-top"
              showViewIcon
              showEditIcon
              showDeleteIcon
              showThreeDots={false}
              handleViewClick={() => subject && onView(subject)}
              handleEditClick={() => onEdit(row as ISubject)}
              handleDeleteClick={() => onDelete(row as ISubject)}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default SubjectTable;
