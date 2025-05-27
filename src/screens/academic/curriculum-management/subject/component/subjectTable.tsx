// SubjectTable.tsx

import { Box, Chip, Switch } from '@mui/material';

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
          subjectName: (formData.subjects || []).map((s) => s.subjectName),
          subjectCode: (formData.subjects || []).map((s) => s.subjectCode),
          primaryTeacher: (formData.subjects || []).map((s) => s.primaryTeacher),
          secondaryTeacher: (formData.subjects || []).flatMap((s) => s.secondaryTeacher || []),
          subjectColor: '#1976d2',
          scheduleDate: new Date().toISOString(),
          prerequisites: (formData.subjects || []).map((s) => s.prerequisites),
          learningGoal: (formData.subjects || []).map((s) => s.learningGoal),
          status: formData.status,
          description: (formData.subjects || []).map((s) => s.description),
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
        placeholder: 'Search by Subject Code, Type, Name...',
        label: 'Search by Subject Code, Type, Name...',
        sx: {
          maxWidth: '500px',
          width: '100%',
        },
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
        {
          id: 'subjectCode',
          label: 'Subject Code',
          align: 'left',
          render: (value, row) => (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {row.subjectType === 'core' ? (
                <Chip key={value} label={value} size="small" variant="outlined" />
              ) : Array.isArray(value) ? (
                value.map((subjectCode: string) => (
                  <Chip key={subjectCode} label={subjectCode} size="small" variant="outlined" />
                ))
              ) : (
                <Chip key={value} label={value} size="small" variant="outlined" />
              )}
            </Box>
          ),
        },
        {
          id: 'subjectType',
          label: 'Subject Type',
          align: 'left',
        },
        {
          id: 'subjectName',
          label: 'Subject Name',
          align: 'left',
          render: (value, row) => (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {row.subjectType === 'core' ? (
                <Chip key={value} label={value} size="small" variant="outlined" />
              ) : (
                Array.isArray(value) &&
                value.map((name: string) => (
                  <Chip key={name} label={name} size="small" variant="outlined" />
                ))
              )}
            </Box>
          ),
        },
        // {
        //   id: 'primaryTeacher',
        //   label: 'Primary Teacher',
        //   align: 'left',
        //   render: (value, row) => (
        //     <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        //       {row.subjectType === 'core' ? (
        //         <Chip key={value} label={value} size="small" variant="outlined" />
        //       ) : (
        //         Array.isArray(value) &&
        //         value.map((teacher: string) => (
        //           <Chip key={teacher} label={teacher} size="small" variant="outlined" />
        //         ))
        //       )}
        //     </Box>
        //   ),
        // },
        // {
        //   id: 'secondaryTeacher',
        //   label: 'Secondary Teacher',
        //   align: 'left',
        //   render: (value) => (
        //     <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        //       {Array.isArray(value) && value.length > 0 ? (
        //         value.map((teacher: string) => (
        //           <Chip key={teacher} label={teacher} size="small" variant="outlined" />
        //         ))
        //       ) : (
        //         <Chip label="None" size="small" variant="outlined" />
        //       )}
        //     </Box>
        //   ),
        // },
        {
          id: 'status',
          label: 'Publish',
          align: 'left',
          isFilter: false,
          isSort: false,
          filterType: 'enum',
          enumOptions: PublishUnpublishStatusOptions,
          render: (value, row) => (
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
                  const originalFormData = data.find((item) => item.id === row.id);
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
