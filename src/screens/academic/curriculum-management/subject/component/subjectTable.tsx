// SubjectTable.tsx

import { Box, Chip, Tooltip, IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { SubjectTypeOptions } from 'src/enums/subject-type';
import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
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
            subjectType: formData.subjectType,
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
          subjectColor: (formData.subjects || []).map((s) => s.subjectColor),
          scheduleDate: new Date().toISOString(),
          prerequisites: (formData.subjects || []).map((s) => s.prerequisites),
          learningGoal: (formData.subjects || []).map((s) => s.learningGoal),
          status: formData.status,
          description: (formData.subjects || []).map((s) => s.description),
          isSubjectOpen: false,
          subjectType: formData.subjectType,
        });
      }
    }
    console.log('rows---', rows);

    return rows;
  }

  return (
    <CustomizableTable
      tableId="subject-table"
      searchFieldProps={{
        placeholder: 'Search by Subject Name, Code, Type...',
        label: 'Search by Subject Name, Code, Type...',
        sx: {
          maxWidth: '350px',
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
          id: 'subjectName',
          label: 'Subject Name',
          align: 'left',
          render: (value, row) => (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {row.subjectType === 'core' ? (
                <Chip
                  key={value}
                  label={`${value} (${row.subjectCode})`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: row.subjectColor, color: row.subjectColor }}
                />
              ) : Array.isArray(value) ? (
                value.map((subjectName: string, index: number) => (
                  <Chip
                    key={subjectName}
                    label={`${subjectName} (${Array.isArray(row.subjectCode) ? row.subjectCode[index] : row.subjectCode})`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: Array.isArray(row.subjectColor)
                        ? row.subjectColor[index]
                        : row.subjectColor,
                      color: Array.isArray(row.subjectColor)
                        ? row.subjectColor[index]
                        : row.subjectColor,
                    }}
                  />
                ))
              ) : (
                <Chip
                  key={value}
                  label={`${value} (${row.subjectCode})`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: row.subjectColor, color: row.subjectColor }}
                />
              )}
            </Box>
          ),
        },
        {
          id: 'subjectType',
          label: 'Subject Type',
          align: 'left',
          filterType: 'enum',
          enumOptions: SubjectTypeOptions,
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
          label: 'Publish/Draft',
          align: 'center',
          minWidth: 100,
          isFilter: false,
          sticky: true,
          isSort: false,
          filterType: 'enum',
          enumOptions: PublishUnpublishStatusOptions,
          render: (value, row) => (
            <Tooltip title={value === 'Published' ? 'Publish' : 'Draft'}>
              <IconButton onClick={() => onToggleStatus(row as ISubjectFormValues)}>
                <Iconify
                  icon={GlobalIcons.tick}
                  sx={{
                    width: 25,
                    height: 25,
                    cursor: 'pointer',
                    color: value === 'Published' ? 'green' : 'gray',
                  }}
                />
              </IconButton>
            </Tooltip>
          ),
        },
        {
          id: 'action',
          label: 'Action',
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
