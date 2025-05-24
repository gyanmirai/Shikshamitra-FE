import dayjs from 'dayjs';
import React, { useCallback } from 'react';

import { Box, Switch, MenuItem, MenuList, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHomework, IHomeworkTableProps } from '../type';

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
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onViewSubmission(row as IHomework);
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
      tableId="homework-assignment-management"
      searchFieldProps={{
        placeholder: 'Search by Homework Title, Type , Creation Date...',
        label: 'Search by Homework Title, Type, Creation Date...',
        sx: {
          maxWidth: '500px',
          width: '100%',
        },
      }}
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
          label: 'Homework Title',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'homeworkType',
          label: 'Homework Type',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'submissionType',
          label: 'Submission Type',
          align: 'left',
          filterType: 'string',
        },
        {
          id: 'todaysDate',
          label: 'Creation Date',
          align: 'left',
          filterType: 'date',
          render: (value) => (
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
          render: (value) => (
            <Typography fontSize="12px" gutterBottom>
              {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
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
          label: 'Publish',
          align: 'left',
          isFilter: false,
          isSort: false,
          filterType: 'enum',
          enumOptions: PublishUnpublishStatusOptions,
          render: (value: PublishUnpublishStatusType, row: any) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                size="small"
                checked={value === PublishUnpublishStatusType.Publish}
                onChange={() => handleSwitchChange(row)}
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
          align: 'center',
          minWidth: 100,
          render: (value, row) => (
            <ThreeDotsActions
              placement="right-top"
              actions={(prop) => actions({ ...prop, row })}
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
