'use client';

import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import type { IRoom } from '../types';

interface IRoomTableProps {
  onEdit: (data: IRoom) => void;
  onDelete: (data: IRoom) => void;
}

const RoomTable: React.FC<IRoomTableProps> = ({ onEdit, onDelete }) => {
  const {
    data: rooms,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });
  return (
    <CustomizableTable
      tableId="room-data-table"
      isLoading={isLoading || isFetching}
      noDataText="Room Data Not Found"
      columns={[
        {
          id: 'roomName',
          label: 'Room Name/No.',
          align: 'left',
          minWidth: 150,
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'capacity',
          label: 'Capacity',
          align: 'left',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'buildingName',
          label: 'Building',
          align: 'left',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'floor',
          label: 'Floor',
          align: 'left',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'roomTypeName',
          label: 'Room Type',
          align: 'left',
          minWidth: 130,
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'totalBenches',
          label: 'Total Benches',
          minWidth: 140,
          align: 'left',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'features',
          label: 'Features',
          align: 'left',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {Array.isArray(value) ? value.join(', ') : value}
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
              handleEditClick={() => onEdit(row as IRoom)}
              handleDeleteClick={() => onDelete(row as IRoom)}
            />
          ),
        },
      ]}
      data={rooms?.items || []}
    />
  );
};

export default RoomTable;
