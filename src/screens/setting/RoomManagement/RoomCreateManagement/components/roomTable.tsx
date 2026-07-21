'use client';

import React, { useState } from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import type { IRoom } from '../types';

interface IRoomTableProps {
  onEdit: (data: IRoom) => void;
  onDelete: (data: IRoom) => void;
}

const ALL_FILTER_VALUE = 'all';

type BuildingOption = {
  id: string;
  buildingName: string;
  floors?: Array<{
    id: string;
    floorName?: string;
    floorNo?: string | number;
  }>;
};

const RoomTable: React.FC<IRoomTableProps> = ({ onEdit, onDelete }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState(ALL_FILTER_VALUE);
  const [selectedFloorKey, setSelectedFloorKey] = useState(ALL_FILTER_VALUE);
  const roomQueryParams = {
    ...(selectedBuildingId !== ALL_FILTER_VALUE ? { buildingId: selectedBuildingId } : {}),
    ...(selectedFloorKey !== ALL_FILTER_VALUE ? { floorId: selectedFloorKey } : {}),
    maxResultCount: 1000,
  };

  const {
    data: rooms,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
    params: roomQueryParams,
  });
  const { data: buildings, isLoading: isBuildingsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBuildingsQuery,
  });

  const roomRows: IRoom[] = rooms?.items || [];
  const buildingRows = ((buildings || []) as BuildingOption[]).filter(
    (building) => building.id && building.buildingName
  );
  const selectedBuilding = buildingRows.find((building) => building.id === selectedBuildingId);
  const floorOptions = selectedBuilding?.floors || [];

  return (
    <Box display="flex" flexDirection="column" gap={1.5} minHeight={0} flex={1}>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, minmax(180px, 260px))',
        }}
        gap={1.5}
      >
        <TextField
          select
          fullWidth
          size="small"
          label="Building"
          value={selectedBuildingId}
          onChange={(event) => {
            setSelectedBuildingId(event.target.value);
            setSelectedFloorKey(ALL_FILTER_VALUE);
          }}
        >
          <MenuItem value={ALL_FILTER_VALUE}>All Buildings</MenuItem>
          {buildingRows.map((building) => (
            <MenuItem key={building.id} value={building.id}>
              {building.buildingName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Floor"
          value={selectedFloorKey}
          onChange={(event) => setSelectedFloorKey(event.target.value)}
          disabled={selectedBuildingId === ALL_FILTER_VALUE}
        >
          <MenuItem value={ALL_FILTER_VALUE}>All Floors</MenuItem>
          {floorOptions.map((floor) => (
            <MenuItem key={floor.id} value={floor.id}>
              {floor.floorName || `Floor ${floor.floorNo}`}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <CustomizableTable
        tableId="room-data-table"
        isLoading={isLoading || isFetching || isBuildingsLoading}
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
            id: 'floorName',
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
        data={roomRows}
      />
    </Box>
  );
};

export default RoomTable;
