import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { Box, useTheme, Typography, IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHomework, IHomeworkTableProps, DivisionHomeworkMeta } from '../type';

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
  homeworkData,
  selectedDivision,
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

  const filteredData = useMemo(() => {
    if (!selectedDivision) return homeworkData || [];

    return (homeworkData || [])
      .filter((hw) =>
        hw.divisions?.some((d: DivisionHomeworkMeta) => d.divisionId === selectedDivision)
      )
      .map((hw) => {
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
  }, [selectedDivision, homeworkData]);

  return (
    <CustomizableTable
      tableId="homework-assignment-management"
      // Custom no data message with action to create new homework
      noDataText={
        <>
          Homework Data Not Found
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
          minWidth: 40,
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
                  <IconButton
                    onClick={() => {
                      // Only allow click action when status is draft (1)
                      if (value === PublishUnpublishStatusType.Draft) {
                        handleSwitchChange(row as IHomework);
                      }
                    }}
                    sx={{
                      p: 0.6, // some padding for a more clickable area
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.06)', // light background to indicate clickability
                      transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(0,0,0,0.08)',
                      },
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
          minWidth: 80,
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
              handleViewClick={() => {
                const divisionData = row.divisions?.find(
                  (d: DivisionHomeworkMeta) => d.divisionId === selectedDivision
                );

                onViewDetails({
                  ...row,
                  divisionMeta: divisionData,
                } as IHomework & { divisionMeta?: DivisionHomeworkMeta });
              }}
            />
          ),
        },
      ]}
      data={filteredData}
    />
  );
};

export default HomeworkTable;
