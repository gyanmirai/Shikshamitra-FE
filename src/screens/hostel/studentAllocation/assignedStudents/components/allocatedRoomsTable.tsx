import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import hostelRoomData from 'src/json/hostel/hostelConfiguration/hostelRoomAllocation.json';
import {
  HostelRoomStatusType,
  HostelRoomStatusColors,
  HostelRoomStatusOptions,
} from 'src/enums/hostelRoom-status';

import { Label } from 'src/components/label';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import StudentDetailsForRoom from './studentDetailsForRoom';

import type { IHostelAllocationRoom } from '../../type';

const AllocatedRoomsTable = () => {
  // Initialize room data with data from hostelRoomData.json
  const [roomData, setRoomData] = useState<IHostelAllocationRoom[]>(hostelRoomData);
  const [selectedRoom, setSelectedRoom] = useState<IHostelAllocationRoom | null>(null);
  const viewDetailsDialog = useBoolean();
  return (
    <Box>
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
            id: '',
            label: 'Current Occupation',
            align: 'left',
            minWidth: 180,
            filterType: 'number',
            render(value, row) {
              return <>{`${row.currentOccupation}/${row.roomCapacity}`}</>;
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
                  showViewIcon
                  handleViewClick={() => {
                    viewDetailsDialog.onTrue();
                    setSelectedRoom(row as IHostelAllocationRoom);
                  }}
                  showThreeDots={false}
                  placement="right-top"
                />
              );
            },
          },
        ]}
      />
      <CustomDialog
        open={viewDetailsDialog.value}
        handleClose={() => {
          viewDetailsDialog.onFalse();
        }}
        title={`${selectedRoom?.roomName} Details`}
        maxWidth="md"
      >
        <StudentDetailsForRoom selectedRoom={selectedRoom} />
      </CustomDialog>
    </Box>
  );
};

export default AllocatedRoomsTable;
