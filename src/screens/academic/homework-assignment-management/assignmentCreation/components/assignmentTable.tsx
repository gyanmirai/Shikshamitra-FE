import dayjs from 'dayjs';
import React from 'react';

import { Box, Tooltip, useTheme, Typography, IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssignment, IAssignmentTableProps } from '../type';

const AssignmentTable: React.FC<IAssignmentTableProps> = ({
  data,
  onSwitchToggle,
  onEdit,
  onDelete,
  onView,
  dialog,
  onViewSubmission,
}) => {
  // Get the theme object from MUI theme provider
  const theme = useTheme();

  // Memoized callback function to render action menu items
  // Returns different menu items based on assignment status
  // const actions = useCallback(
  //   ({ popover: pop, row }: any) => (
  //     <MenuList>
  //       {/* Show Publish option if status is Draft (1) */}
  //       {row.status === 1 ? (
  //         <MenuItem
  //           onClick={() => {
  //             // Toggle publish status and close popover
  //             onSwitchToggle(row as IAssignment);
  //             pop.onClose();
  //           }}
  //         >
  //           <Iconify icon={GlobalIcons.publish} />
  //           Publish
  //         </MenuItem>
  //       ) : (
  //         // Show View Submission option if status is Published (0)
  //         <MenuItem
  //           onClick={() => {
  //             // View submission details and close popover
  //             onViewSubmission(row as IAssignment);
  //             pop.onClose();
  //           }}
  //         >
  //           <Iconify icon={GlobalIcons.eye} />
  //           View Submission
  //         </MenuItem>
  //       )}
  //     </MenuList>
  //   ),
  //   [onSwitchToggle, onViewSubmission] // Dependencies for useCallback
  // );
  return (
    <CustomizableTable
      tableId="assignment-management"
      searchFieldProps={{
        placeholder: 'Search by Assignment Title, Type, Start Date Time...',
        label: 'Search by Assignment Title, Type, Start Date Time...',
        sx: { maxWidth: 500, width: '100%' },
      }}
      noDataText={
        <>
          No Assignments Created
          <Box
            onClick={dialog.onTrue}
            color="primary.main"
            fontWeight={600}
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            Create Assignment
          </Box>
        </>
      }
      columns={[
        {
          id: 'title',
          label: 'Title',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'assignmentType',
          label: 'Type',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'startDate',
          label: 'Start Date Time',
          align: 'left',
          filterType: 'date',
          render: (value: string | Date | undefined) => (
            <Typography fontSize="12px" gutterBottom>
              {value ? dayjs(value).format('DD-MM-YYYY hh:mm') : '-'}
            </Typography>
          ),
        },
        {
          id: 'endDate',
          label: 'End Date Time',
          align: 'left',
          filterType: 'date',
          render: (value: string | Date | undefined) => (
            <Typography fontSize="12px" gutterBottom>
              {value ? dayjs(value).format('DD-MM-YYYY hh:mm') : '-'}
            </Typography>
          ),
        },
        {
          id: 'submissionType',
          label: 'Submission Type',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'status',
          label: 'Publish/Draft',
          align: 'left',
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
                <IconButton
                  onClick={() => {
                    // Only allow click action when status is draft (1)
                    if (value === PublishUnpublishStatusType.Draft) {
                      onSwitchToggle(row as IAssignment);
                    }
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
              </Tooltip>
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
          minWidth: 100,
          render: (value, row) => (
            <ThreeDotsActions
              placement="right-top"
              // actions={(prop) => actions({ ...prop, row })}
              showThreeDots={false}
              showViewIcon
              showEditIcon
              showDeleteIcon
              handleEditClick={() => onEdit(row as IAssignment)}
              handleViewClick={() => onView(row as IAssignment)}
              handleDeleteClick={() => onDelete(row as IAssignment)}
            />
          ),
        },
      ]}
      data={data}
    />
  );
};

export default AssignmentTable;
