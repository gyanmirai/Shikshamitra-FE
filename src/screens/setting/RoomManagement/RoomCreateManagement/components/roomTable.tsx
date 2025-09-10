'use client';

import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IRoom } from '../types';

interface IRoomTableProps {
  data: IRoom[];
  onEdit: (data: IRoom) => void;
  onDelete: (data: IRoom) => void;
}

const RoomTable: React.FC<IRoomTableProps> = ({ data, onEdit, onDelete }) => (
  <CustomizableTable
    tableId="room-data-table"
    noDataText="Room Data Not Found"
    columns={[
      {
        id: 'roomName',
        label: 'Room Name/No.',
        align: 'left',
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
        id: 'building',
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
        id: 'roomType',
        label: 'Room Type',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'totalBenches',
        label: 'Total Benches',
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
    data={data}
  />
);

export default RoomTable;
