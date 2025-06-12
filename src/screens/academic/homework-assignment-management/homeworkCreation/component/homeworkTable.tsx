import dayjs from 'dayjs';
import React, { useCallback } from 'react';

import { Box, Tooltip, MenuItem, MenuList, useTheme, Typography, IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHomework, IHomeworkTableProps } from '../type';

/**
 * HomeworkTable Component - Displays a table of homework assignments with filtering and action capabilities
 * @param {Object} props - Component props
 * @param {Array<IHomework>} props.filteredData - Array of filtered homework data to display
 * @param {Function} props.setOpen - Function to control the dialog open state
 * @param {Object} props.dialog - Dialog control object containing onTrue method
 * @param {Function} props.handleSwitchChange - Handler for publish/unpublish status toggle
 * @param {Function} props.onDeleteDetails - Handler for deleting homework
 * @param {Function} props.onEditDetails - Handler for editing homework
 * @param {Function} props.onViewDetails - Handler for viewing homework details
 * @param {Function} props.onViewSubmission - Handler for viewing homework submissions
 */
const HomeworkTable: React.FC<IHomeworkTableProps> = ({
  filteredData,
  setOpen,
  dialog,
  handleSwitchChange,
  onDeleteDetails,
  onEditDetails,
  onViewDetails,
  onViewSubmission,
}) => {
  /**
   * Get the MUI theme object for styling
   * Used for accessing theme colors and other theme properties
   */
  const theme = useTheme();
  /**
   * Memoized actions menu renderer for the table
   * @param {Object} params - Action menu parameters
   * @param {Object} params.popover - Popover control object
   * @param {IHomework} params.row - Current row data
   * @returns {JSX.Element} Menu list with view submission action
   */
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {row.status === 1 ? (
          <MenuItem
            onClick={() => {
              handleSwitchChange(row as IHomework);
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.publish} />
            Publish
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onViewSubmission(row as IHomework);
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.eye} />
            View Submission
          </MenuItem>
        )}
      </MenuList>
    ),
    [handleSwitchChange, onViewSubmission]
  );

  return (
    <CustomizableTable
      tableId="homework-assignment-management"
      searchFieldProps={{
        placeholder: 'Search by Homework Title, Type , Start Date Time...',
        label: 'Search by Homework Title, Type, Start Date Time...',
        sx: {
          maxWidth: '500px',
          width: '100%',
        },
      }}
      // Custom no data message with action to create new homework
      noDataText={
        <>
          No Homework Created
          <Box
            onClick={() => {
              dialog.onTrue();
              setOpen(true);
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
            Create Homework
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
          id: 'homeworkType',
          label: 'Type',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'startDate',
          label: 'Start Date Time',
          align: 'left',
          filterType: 'date',
          render: (value) => (
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
          render: (value) => (
            <Typography fontSize="12px" gutterBottom>
              {value ? dayjs(value).format('DD-MM-YYYY hh:mm') : '-'}
            </Typography>
          ),
        },
        {
          id: 'submissionType',
          label: 'Submission Type',
          align: 'left',
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
                      handleSwitchChange(row as IHomework);
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
          isFilter: false,
          sticky: true,
          align: 'left',
          minWidth: 100,
          render: (value, row) => (
            <ThreeDotsActions
              placement="right-top"
              showThreeDots={false}
              // actions={(prop) => actions({ ...prop, row })}
              showViewIcon
              showEditIcon
              showDeleteIcon
              handleDeleteClick={() => {
                onDeleteDetails(row as IHomework);
              }}
              handleEditClick={() => onEditDetails(row as IHomework)}
              handleViewClick={() => onViewDetails(row as IHomework)}
            />
          ),
        },
      ]}
      data={filteredData}
    />
  );
};

export default HomeworkTable;
