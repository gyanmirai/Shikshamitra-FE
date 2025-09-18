import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IMeetingType, IMeetingTypeTableProps } from '../type';

const MeetingTypeTable: React.FC<IMeetingTypeTableProps> = ({
  data,
  onAddMeetingType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="meeting-type-data-table"
    noDataText={
      <>
        Meeting Data Not Found{' '}
        <Typography
          component="span"
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            onAddMeetingType.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Meeting
        </Typography>
      </>
    }
    columns={[
      {
        id: 'meetingType',
        label: 'Type Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px" sx={{ color: 'text.secondary' }}>
            {value || '--'}
          </Typography>
        ),
      },
      {
        id: 'createdBy',
        label: 'Created By',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'createdDate',
        label: 'Created Date',
        align: 'left',
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IMeetingType);
              }}
              handleEditClick={() => {
                onEdit(row as IMeetingType);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default MeetingTypeTable;
