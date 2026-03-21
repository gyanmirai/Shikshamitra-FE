'use client';

import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomTypesQuery } from 'src/redux/institute-setup/room-type-api/roomTypeApi';

import type { IRoomType } from '../types';

interface IRoomTypeTableProps {
  onEdit: (row: IRoomType) => void;
  onDelete: (row: IRoomType) => void;
}

const RoomTypeTable: React.FC<IRoomTypeTableProps> = ({ onEdit, onDelete }) => {
  const {
    data: roomTypes,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomTypesQuery,
  });

  return (
    <CustomizableTable
      tableId="room-type-data-table"
      isLoading={isLoading || isFetching}
      noDataText="Room Type Data Not Found"
      columns={[
        {
          id: 'roomTypeName',
          label: 'Room Type',
          align: 'left',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'shortName',
          label: 'Short Name',
          align: 'left',
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
          render: (value, row) => (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showEditIcon
              showDeleteIcon
              handleEditClick={() => onEdit(row as IRoomType)}
              handleDeleteClick={() => onDelete(row as IRoomType)}
            />
          ),
        },
      ]}
      data={roomTypes?.items || []}
    />
  );
};

export default RoomTypeTable;
