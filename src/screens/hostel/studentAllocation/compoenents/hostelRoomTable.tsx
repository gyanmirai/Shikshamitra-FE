import type { LabelColor } from 'src/components/label';

import React, { useState, useCallback } from 'react';

import { Box, MenuItem, MenuList, TextField, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import hostelRoomData from 'src/json/hostel/hostelConfiguration/hostelRoomAllocation.json';
import {
  HostelRoomStatusType,
  HostelRoomStatusColors,
  HostelRoomStatusOptions,
} from 'src/enums/hostelRoom-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import RoomDetailComp from './roomDetailComp';

import type { IHostelAllocationRoom } from '../type';

const HostelRoomTableComponent = () => {
  // Initialize room data with data from hostelRoomData.json
  const [roomData, setRoomData] = useState<IHostelAllocationRoom[]>(hostelRoomData);
  // Initialize selected room state
  const [selectedRoom, setSelectedRoom] = useState<IHostelAllocationRoom | null>(null);
  // Initialize assign room dialog state
  const assignRoomDialog = useBoolean();
  // Callback function for actions in the table
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {/* {(row.status === 'Cancelled' || row.status === 'Scheduled') && ( */}
          {/* Assign Room Menu Item */}
          <MenuItem
            onClick={() => {
              // Open the assign room dialog
              assignRoomDialog.onTrue();
              // Set the selected room
              setSelectedRoom(row as IHostelAllocationRoom);
              // Close the popover
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-bold" />
            Assign Room
          </MenuItem>
          {/* )} */}
        </MenuList>
      </>
    ),
    [assignRoomDialog]
  );
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2} mt={2} gap={1}>
        <Autocomplete
          options={[
            { id: '1', name: 'Hostel1' },
            { id: '2', name: 'Hostel 2' },
            { id: '3', name: 'Hostel 3' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            // setStudent(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Hostel Type"
              name="hostelType"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
        <Autocomplete
          options={[
            { id: '1', name: 'Hostel1' },
            { id: '2', name: 'Hostel 2' },
            { id: '3', name: 'Hostel 3' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            // setStudent(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Hostel Name"
              name="hostelName"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
      </Box>
      <CustomizableTable
        tableId="hostel-room-table"
        searchFieldProps={{
          placeholder: 'Search by Room Name,Type...',
          label: 'Search by Room Name,Type...',
        }}
        data={roomData}
        noDataText={<>No Room Data Found </>}
        columns={[
          { id: 'roomName', label: 'Room Name', align: 'left', minWidth: 120 },
          { id: 'roomType', label: 'Room Type', align: 'left', minWidth: 120 },
          {
            id: 'floorNumber',
            label: 'Floor Number',
            align: 'left',
            minWidth: 140,
            filterType: 'number',
          },
          {
            id: 'roomCapacity',
            label: 'Room Capacity',
            align: 'left',
            minWidth: 150,
            filterType: 'number',
            render(value, row) {
              return <>{row.currentOccupation / row.roomCapacity}</>;
            },
          },
          {
            id: 'roomStatus',
            label: 'Room Status',
            filterType: 'enum',
            enumOptions: HostelRoomStatusOptions,
            minWidth: '130px',
            align: 'left',
            render(value, row) {
              const color = HostelRoomStatusColors[value as HostelRoomStatusType] as LabelColor;
              return <Label color={color}>{HostelRoomStatusType[value]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 40,
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
      />

      <CustomDialog
        title={selectedRoom?.roomName}
        open={assignRoomDialog.value}
        handleClose={() => {
          assignRoomDialog.onFalse();
          setSelectedRoom(null);
        }}
        maxWidth="md"
      >
        <RoomDetailComp
          open={assignRoomDialog}
          onClose={() => {
            assignRoomDialog.onFalse();
            setSelectedRoom(null);
          }}
          editData={selectedRoom}
        />
      </CustomDialog>
    </Box>
  );
};

export default HostelRoomTableComponent;
