// SubjectTable.tsx

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RemoveCircle } from '@mui/icons-material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuList, MenuItem, IconButton, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import type { ISubjectTableProps } from './type';

const SubjectTable = ({
  classId,
  addSubjectDialog,
  data,
  setEditData,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: ISubjectTableProps) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const {
    data: subjectTableData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { academicMediumId: (medium as Medium)?.id, classId },
  });
  const theme = useTheme();
  console.log('data---', data);
  function getSubjectTableData(formDataArray: any[]) {
    return formDataArray.map((item: any) => {
      // Core Subject
      if (item.subjectType === 0) {
        return {
          id: item.subjects[0]?.assignedId || item.subjects[0]?.subjectId,
          type: 'Core', // For UI display
          subjectTypeRaw: 0,
          subjectName: item.subjects[0]?.subject?.name || item.subjects[0]?.subjectName,
          subjectCode: item.subjects[0]?.subjectCode,
          status: item?.status,
          // Generate a color if not present
          color: item.subjects[0]?.subject?.color || item.subjects[0]?.color,
          originalData: item,
        };
      }
      // Elective Group
      if (item.subjectType === 1) {
        return {
          // Use electiveGroupId or generate a unique ID
          id: item.subjects?.[0]?.electiveGroupId || item.electiveGroupId,
          type: 'Elective',
          subjectTypeRaw: 1,

          subjectName: item.electiveGroupName,
          // Extract sub-subjects
          subjects:
            item.subjects?.map((sub: any) => ({
              ...sub,
              subjectName: sub.subject?.name || sub.subjectName,
              color: sub.subject?.color || sub.color,
            })) || [],
          status: item?.status,
          color: item.color,
          originalData: item,
        };
      }
      return item;
    });
  }

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList disablePadding dense>
        <MenuItem
          onClick={() => {
            onDelete(row.originalData);
            pop.onClose();
          }}
        >
          <RemoveCircle sx={{ width: '20px', height: '20px', color: 'error.main' }} />
          Remove
        </MenuItem>
      </MenuList>
    ),
    [onDelete]
  );

  return (
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
          id: 'type',
          label: 'Subject Type',
          align: 'left',
          minWidth: 130,
          sticky: true,
          render: (value) => <Typography variant="body2">{value}</Typography>,
        },
        {
          id: 'subjectName',
          label: 'Subject Name',
          align: 'left',
          render: (value, row) => {
            if (row.subjectTypeRaw === 0) {
              // Core Subject
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={row.color} />
                  <Typography variant="body2">
                    {value} ({row.subjectCode})
                  </Typography>
                </Box>
              );
            }
            if (row.subjectTypeRaw === 1) {
              // Elective Group
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {/* Group Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SubjectColorIndicator color={row.color} />
                    <Typography variant="body2">{value}</Typography>
                  </Box>

                  {/* Sub Subjects */}
                  {row.subjects?.map((sub: any, index: number) => (
                    <Box
                      key={sub.subjectId || index}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {/* Separator Pipe logic could go here if we used strings, but distinct blocks are nicer. 
                           The user image uses colored bars as separators effectively. */}
                      <SubjectColorIndicator color={sub.color} />
                      <Typography variant="body2">
                        ({sub.subjectName} ({sub.subjectCode}))
                      </Typography>
                    </Box>
                  ))}
                </Box>
              );
            }
            return value;
          },
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: 60,
          isSort: false,
          isFilter: false,
          sticky: true,
          enumOptions: PublishUnpublishStatusOptions,
          render(value, row) {
            const statusColor =
              value === PublishUnpublishStatusType.Published
                ? theme.vars.palette.success.main
                : theme.vars.palette.text.secondary;

            return (
              <CustomTooltip title={value === 1 ? 'Published' : 'Draft'} arrow placement="left">
                {/* Using a span or div wrapper to avoid nested button issues if any */}
                <Box component="span">
                  <IconButton
                    onClick={() => onToggleStatus(row.originalData)}
                    sx={{
                      p: 0.6,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.06)',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.08)' },
                    }}
                  >
                    <Iconify
                      icon={GlobalIcons.tick}
                      sx={{ width: 20, height: 20, color: statusColor }}
                    />
                  </IconButton>
                </Box>
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
          isSort: false,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                actions={(prop) => actions({ ...prop, row })}
                showViewIcon
                showEditIcon
                handleViewClick={() => {
                  onView(row.originalData);
                }}
                handleEditClick={() => {
                  onEdit(row.originalData);
                }}
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
