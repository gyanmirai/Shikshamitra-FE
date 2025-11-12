// SubjectTable.tsx

import { useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RemoveCircle } from '@mui/icons-material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectType, SubjectTypeOptions } from 'src/enums/subject-type';
import { Box, MenuList, MenuItem, IconButton, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import type { ISubjectDetail, ISubjectFormValues, ISubjectTableProps } from './type';

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
      if (formData.subjectType === 0) {
        // Each subject is a row
        (formData.subjects || []).forEach((subject: ISubjectDetail) => {
          rows.push({
            ...subject,
            id: formData.id,
            subjectColor: subject.subjectColor || '#1976d2',
            status: formData.status,
            secondaryTeacher: subject.secondaryTeacher || [],
            subjectType:
              formData.subjectType !== undefined ? SubjectType[formData.subjectType] : '-',
            // subjectType: formData.subjectType && 0,
            subject: formData.subjectName,
          });
        });
      } else if (formData.subjectType === 1) {
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
          subjectType: SubjectType[formData.subjectType],
          subject: formData.subjectName,
        });
      }
    }
    return rows;
  }

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList disablePadding dense>
          {/* Show Add Timetable option for Pending status */}

          <MenuItem
            onClick={() => {
              onDelete(row as ISubjectFormValues);
              pop.onClose();
            }}
          >
            <RemoveCircle sx={{ width: '20px', height: '20px', color: 'error.main' }} />
            Remove
          </MenuItem>
        </MenuList>
      </>
    ),
    [onDelete]
  );

  return (
    <Box>
      <CustomizableTable
        tableId="subject-table"
        noDataText={
          <>
            No Subject data found
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
                    <Typography variant="caption" fontSize="13px">
                      {value} ({row.subjectCode})
                    </Typography>
                  </Box>
                ) : Array.isArray(value) ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SubjectColorIndicator color={row.subjectColor} />
                      <Typography variant="caption" fontSize="13px">
                        {row.subject}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {value.map((subjectName: string, index: number) => {
                        const subjectCode = Array.isArray(row.subjectCode)
                          ? row.subjectCode[index]
                          : row.subjectCode;

                        const subjectColor = Array.isArray(row.subjectColor)
                          ? row.subjectColor[index]
                          : row.subjectColor;

                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SubjectColorIndicator color={subjectColor} />
                            <Typography variant="caption" fontSize="13px">
                              ({subjectName} ({subjectCode}))
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {row.subjectType === 'Elective' && (
                      <Typography variant="caption" fontSize="13px">
                        ({row.subject})
                      </Typography>
                    )}
                    <SubjectColorIndicator color={row.subjectColor} />
                    <Typography variant="caption" fontSize="13px">
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
            label: 'Status',
            align: 'left',
            minWidth: 40,
            isFilter: false,
            sticky: true,
            isSort: false,
            filterType: 'enum',
            enumOptions: PublishUnpublishStatusOptions,
            render(value, row) {
              const statusColor =
                value === PublishUnpublishStatusType.Published
                  ? theme.vars.palette.success.main
                  : theme.vars.palette.text.secondary;

              return (
                <CustomTooltip
                  title={value === 0 ? 'Published' : 'Draft'}
                  arrow
                  placement="left"
                  PopperProps={{
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, 0], // Try 0 or adjust closer
                        },
                      },
                    ],
                  }}
                >
                  <IconButton
                    onClick={() => onToggleStatus(row as ISubjectFormValues)}
                    sx={{
                      p: 0.6, // some padding for a more clickable area
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.06)', // light background to indicate clickability
                      transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.08)' },
                    }}
                  >
                    <Iconify
                      icon={GlobalIcons.tick}
                      sx={{ width: 20, height: 20, color: statusColor }}
                    />
                  </IconButton>
                </CustomTooltip>
              );
            },
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 70,
            align: 'left',
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              const subject = subjectTableData.find((s) => s.id === row.id);
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={(prop) => actions({ ...prop, row })}
                  showViewIcon
                  showEditIcon
                  // showThreeDots={false}
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
                  // handleDeleteClick={() => onDelete(row as ISubjectFormValues)}
                />
              );
            },
          },
        ]}
        data={getSubjectTableData(data)}
      />
    </Box>
  );
};

export default SubjectTable;
