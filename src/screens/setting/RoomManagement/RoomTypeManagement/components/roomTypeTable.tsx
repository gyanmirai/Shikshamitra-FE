'use client';

import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IRoomType } from '../types';

interface IRoomTypeTableProps {
  data: IRoomType[];
  onEdit: (row: IRoomType) => void;
  onDelete: (row: IRoomType) => void;
}

const RoomTypeTable: React.FC<IRoomTypeTableProps> = ({ data, onEdit, onDelete }) => (
  <CustomizableTable
    tableId="room-type-data-table"
    noDataText="Room Type Data Not Found"
    columns={[
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
    data={data}
  />
);

export default RoomTypeTable;
