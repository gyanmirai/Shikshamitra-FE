// SubjectTable.tsx

import dayjs from 'dayjs';

import { Box, Switch, Typography } from '@mui/material';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ISubject, ISubjectFormValues, ISubjectTableProps } from './type';

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
}: ISubjectTableProps) => {
  function getSubjectTableData(formDataArray: ISubjectFormValues[]) {
    // Accumulate all rows here
    const rows: any[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const formData of formDataArray) {
      if (formData.subjectType === 'core') {
        // Each subject is a row
        (formData.subjects || []).forEach((subject: ISubject) => {
          rows.push({
            ...subject,
            id: formData.id,
            subjectColor: subject.subjectColor || '#1976d2',
            status: formData.status,
            secondaryTeacher: subject.secondaryTeacher || [],
          });
        });
      } else if (formData.subjectType === 'elective') {
        // All subjects in one row
        rows.push({
          id: formData.id,
          subjectName: (formData.subjects || []).map((s) => s.subjectName).join(', '),
          subjectCode: (formData.subjects || []).map((s) => s.subjectCode).join(', '),
          primaryTeacher: (formData.subjects || []).map((s) => s.primaryTeacher).join(', '),
          secondaryTeacher: (formData.subjects || []).flatMap((s) => s.secondaryTeacher || []),
          subjectColor: '#1976d2', // Or leave blank or pick a default
          scheduleDate: new Date().toISOString(), // Or pick first/last/none
          prerequisites: (formData.subjects || []).map((s) => s.prerequisites).join(', '),
          learningGoal: (formData.subjects || []).map((s) => s.learningGoal).join(', '),
          status: formData.status,
          description: (formData.subjects || []).map((s) => s.description).join(', '),
          isSubjectOpen: false,
        });
      }
    }
    return rows;
  }
  return (
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
                handleViewClick={() => {
                  const originalFormData = data.find((item) => item.id === row.id);
                  if (originalFormData) {
                    onView(originalFormData);
                  }
                }}
                handleEditClick={() => {
                  console.log('row', row);
                  console.log('data', data);

                  const originalFormData = data.find((item) => item.id === row.id);
                  console.log('originalFormData', originalFormData);

                  if (originalFormData) {
                    onEdit(originalFormData);
                  }
                }}
                handleDeleteClick={() => onDelete(row as ISubjectFormValues)}
              />
            );
          },
        },
      ]}
      data={getSubjectTableData(data)}
    />
  );
};

export default SubjectTable;
