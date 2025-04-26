import React, { useState, useCallback } from 'react';

import { MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import hostelRoomData from 'src/json/hostel/hostelLeaveApprove/hostelRoomData.json';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHostelRoomStudent } from '../type';
import type { IHostelAllocationRoom } from '../../type';

const StudentDetailsForRoom = ({
  selectedRoom,
}: {
  selectedRoom: IHostelAllocationRoom | null;
}) => {
  const [roomData, setRoomData] = useState<IHostelRoomStudent[]>(hostelRoomData);
  const [room, setRoom] = useState<IHostelRoomStudent | null>(null);
  const assignRoomDialog = useBoolean();
  // Callback function for actions in the table
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              // Open the assign room dialog
              assignRoomDialog.onTrue();
              // Set the selected room
              setRoom(row as IHostelRoomStudent);
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
    <CustomizableTable
      tableId="hostel-room-table"
      searchFieldProps={{
        placeholder: 'Search by Student Name, Class, Division...',
        label: 'Search by Student Name, Class, Division...',
      }}
      data={roomData}
      noDataText={<>No Room Data Found</>}
      columns={[
        {
          id: 'studentName',
          label: 'Student Name',
          align: 'left',
          minWidth: 150,
        },
        {
          id: 'class',
          label: 'Class',
          align: 'left',
          minWidth: 100,
        },
        {
          id: 'division',
          label: 'Division',
          align: 'left',
          minWidth: 100,
        },
        {
          id: 'bedNumber',
          label: 'Bed Number',
          align: 'left',
          filterType: 'number',
          minWidth: 140,
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
  );
};

export default StudentDetailsForRoom;
