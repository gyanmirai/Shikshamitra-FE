'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IBuilding, IBuildingTableProps } from '../types';

const BuildingTable: React.FC<IBuildingTableProps> = ({
  data,
  onAddBuilding,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="building-data-table"
    noDataText={
      <>
        Building Data Not Found{' '}
        <Box
          onClick={() => {
            onAddBuilding.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
        >
          Building
        </Box>
      </>
    }
    columns={[
      {
        id: 'buildingName',
        label: 'Building Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'totalFloors',
        label: 'Total Floors',
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
              handleDeleteClick={() => onDelete(row as IBuilding)}
              handleEditClick={() => onEdit(row as IBuilding)}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default BuildingTable;
