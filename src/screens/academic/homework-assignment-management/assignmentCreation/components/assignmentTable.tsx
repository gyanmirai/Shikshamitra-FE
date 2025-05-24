import dayjs from 'dayjs';
import React, { useCallback } from 'react';

import { Box, Switch, MenuList, MenuItem, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';

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
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onViewSubmission(row as IAssignment);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} />
          View Submission
        </MenuItem>
      </MenuList>
    ),
    [onViewSubmission]
  );
  return (
    <CustomizableTable
      tableId="assignment-management"
      searchFieldProps={{
        placeholder: 'Search by Assignment Title, Type, Creation Date...',
        label: 'Search by Assignment Title, Type, Creation Date...',
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
          label: 'Assignment Title',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'assignmentType',
          label: 'Assignment Type',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'todaysDate',
          label: 'Creation Date',
          align: 'left',
          filterType: 'date',
          render: (value: string | Date | undefined) => (
            <Typography fontSize="12px" gutterBottom>
              {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            </Typography>
          ),
        },
        {
          id: 'dueDate',
          label: 'Due Date Time',
          align: 'left',
          filterType: 'date',
          render: (value: string | Date | undefined) => (
            <Typography fontSize="12px" gutterBottom>
              {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
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
          label: 'Publish',
          align: 'left',
          filterType: 'enum',
          isFilter: false,
          isSort: false,
          enumOptions: PublishUnpublishStatusOptions,
          render: (value, row) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                size="small"
                checked={value === 'Publish'}
                onChange={() => onSwitchToggle(row as IAssignment)}
              />
            </Box>
          ),
        },
        {
          id: 'action',
          label: 'Action',
          isSort: false,
          isFilter: false,
          sticky: true,
          minWidth: 100,
          render: (value, row) => (
            <ThreeDotsActions
              placement="right-top"
              actions={(prop) => actions({ ...prop, row })}
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
