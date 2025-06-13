// SubjectTable.tsx

import { Box, Tooltip, useTheme, IconButton, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { SubjectType, SubjectTypeOptions } from 'src/enums/subject-type';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

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
  const theme = useTheme();

  function getSubjectTableData(formDataArray: ISubjectFormValues[]) {
    // Accumulate all rows here
    const rows: any[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const formData of formDataArray) {
      if (formData.subjectType === 'Core') {
        // Each subject is a row
        (formData.subjects || []).forEach((subject: ISubject) => {
          rows.push({
            ...subject,
            id: formData.id,
            subjectColor: subject.subjectColor || '#1976d2',
            status: formData.status,
            secondaryTeacher: subject.secondaryTeacher || [],
            subjectType: formData.subjectType && 0,
          });
        });
      } else if (formData.subjectType === 'Elective') {
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
          subjectType: formData.subjectType && 1,
        });
      }
    }
    return rows;
  }

  return (
    <CustomizableTable
      tableId="subject-table"
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
          id: 'subjectType',
          label: 'Subject Type',
          align: 'left',
          filterType: 'enum',
          minWidth: 130,
          enumOptions: SubjectTypeOptions,
          sticky: true,
          render: (value, row) => <Typography variant="caption">{SubjectType[value]}</Typography>,
        },
        {
          id: 'subjectName',
          label: 'Subject Name',
          align: 'left',
          render: (value, row) => (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {row.subjectType === 'Core' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={row.subjectColor} />
                  <Typography variant="caption">
                    {value} ({row.subjectCode})
                  </Typography>
                </Box>
              ) : Array.isArray(value) ? (
                value.map((subjectName: string, index: number) => {
                  const subjectCode = Array.isArray(row.subjectCode)
                    ? row.subjectCode[index]
                    : row.subjectCode;

                  const subjectColor = Array.isArray(row.subjectColor)
                    ? row.subjectColor[index]
                    : row.subjectColor;

                  return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SubjectColorIndicator color={subjectColor} />
                      <Typography variant="caption">
                        {subjectName} ({subjectCode})
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={row.subjectColor} />
                  <Typography variant="caption">
                    {value} ({row.subjectCode})
                  </Typography>
                </Box>
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
          label: 'Publish/Draft',
          align: 'left',
          minWidth: 100,
          isFilter: false,
          sticky: true,
          isSort: false,
          filterType: 'enum',
          enumOptions: PublishUnpublishStatusOptions,
          render(value, row) {
            const statusColor =
              value === PublishUnpublishStatusType.Published
                ? theme.palette.success.main
                : theme.palette.text.secondary;

            return (
              <Tooltip title={value === 0 ? 'Publish' : 'Draft'}>
                <IconButton onClick={() => onToggleStatus(row as ISubjectFormValues)}>
                  <Iconify
                    icon={GlobalIcons.tick}
                    sx={{
                      width: 20,
                      height: 20,
                      cursor: 'pointer',
                      color: statusColor,
                    }}
                  />
                </IconButton>
              </Tooltip>
            );
          },
        },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 100,
          align: 'left',
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
