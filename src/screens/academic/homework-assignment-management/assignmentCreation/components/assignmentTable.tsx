import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Typography, IconButton } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import type { IAssignment, IAssignmentTableProps } from '../type';
import type { DivisionHomeworkMeta } from '../../homeworkCreation/type';

const AssignmentTable: React.FC<IAssignmentTableProps> = ({
  assignmentData,
  selectedDivision,
  selectedClass,
  onSwitchToggle,
  onEdit,
  onDelete,
  onView,
  dialog,
}) => {
  // const {
  //   data: assignmentData,
  //   isLoading,
  //   isFetching,
  // } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetAssignmentsQuery,
  //   params: { academicMediumId: (currentMedium as Medium)?.id, classId: selectedClass },
  //   options: {
  //     skip: !(currentMedium as Medium)?.id,
  //   },
  // });
  // Get the theme object from MUI theme provider
  const theme = useTheme();
  const filteredData = useMemo(() => {
    if (!selectedDivision) return assignmentData || [];

    return (assignmentData || [])
      .filter((hw: IAssignment) =>
        hw.divisions?.some((d: DivisionHomeworkMeta) => d.divisionId === selectedDivision)
      )
      .map((hw: IAssignment) => {
        const currentDivision = hw.divisions.find(
          (d: DivisionHomeworkMeta) => d.divisionId === selectedDivision
        );
        return {
          ...hw,
          currentDivisionId: currentDivision?.divisionId,
          createdAt: currentDivision?.createdAt,
          publishDate: currentDivision?.publishDate,
          dueDate: currentDivision?.dueDate,
          status: currentDivision?.status,
        };
      });
  }, [assignmentData, selectedDivision]);

  return (
    <CustomizableTable
      tableId="assignment-management"
      // isLoading={isLoading || isFetching}
      noDataText={
        <>
          Assignment Data Not Found
          <Box
            onClick={dialog.onTrue}
            color="primary.main"
            fontWeight={600}
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { color: 'primary.dark' },
            }}
          >
            Create Assignment
          </Box>
        </>
      }
      columns={[
        { id: 'title', label: 'Title', align: 'left', filterType: 'string' },
        { id: 'assignmentType', label: 'Type', align: 'left', filterType: 'string' },
        {
          id: 'createdAt',
          label: 'Created On',
          align: 'left',
          filterType: 'date',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            </Typography>
          ),
        },
        {
          id: 'publishDate',
          label: 'Publish Date',
          align: 'left',
          filterType: 'date',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            </Typography>
          ),
        },
        {
          id: 'dueDate',
          label: 'Due Date',
          align: 'left',
          filterType: 'date',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            </Typography>
          ),
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          isFilter: false,
          minWidth: 40,
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <span>
                    {' '}
                    {/* Wrap IconButton in span to ensure tooltip works with disabled button */}
                    <IconButton
                      onClick={() => {
                        // Only allow click action when status is draft (1)
                        if (value === PublishUnpublishStatusType.Draft) {
                          onSwitchToggle(row as IAssignment);
                        }
                      }}
                      sx={{
                        p: 0.6, // some padding for a more clickable area
                        borderRadius: '50%',
                        backgroundColor:
                          value === PublishUnpublishStatusType.Draft
                            ? 'rgba(0,0,0,0.06)'
                            : 'transparent',
                        transition:
                          value === PublishUnpublishStatusType.Draft
                            ? 'transform 0.2s ease-in-out, background-color 0.2s'
                            : 'none',
                        cursor:
                          value === PublishUnpublishStatusType.Draft ? 'pointer' : 'not-allowed',
                        '&:hover':
                          value === PublishUnpublishStatusType.Draft
                            ? { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.08)' }
                            : {},
                      }}
                      disabled={value === PublishUnpublishStatusType.Published}
                    >
                      <Iconify
                        icon={GlobalIcons.tick}
                        sx={{
                          width: 20,
                          height: 20,
                          cursor:
                            value === PublishUnpublishStatusType.Draft ? 'pointer' : 'not-allowed',
                          color: statusColor,
                        }}
                      />
                    </IconButton>
                  </span>
                </CustomTooltip>
              </Box>
            );
          },
        },
        {
          id: 'action',
          label: 'Actions',
          isSort: false,
          align: 'left',
          isFilter: false,
          sticky: true,
          minWidth: 80,
          render: (value, row) => (
            <ThreeDotsActions
              placement="right-top"
              // actions={(prop) => actions({ ...prop, row })}
              showThreeDots={false}
              showViewIcon
              showEditIcon
              showDeleteIcon
              handleEditClick={() => onEdit(row as IAssignment)}
              handleViewClick={() => {
                const divisionData = row.divisions?.find(
                  (d: DivisionHomeworkMeta) => d.divisionId === selectedDivision
                );

                onView({ ...row, divisionMeta: divisionData } as IAssignment & {
                  divisionMeta?: DivisionHomeworkMeta;
                });
              }}
              handleDeleteClick={() => onDelete(row as IAssignment)}
            />
          ),
        },
      ]}
      data={filteredData || []}
    />
  );
};

export default AssignmentTable;
