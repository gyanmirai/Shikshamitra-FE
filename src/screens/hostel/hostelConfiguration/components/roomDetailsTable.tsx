import React, { useState } from 'react';

import { Box } from '@mui/material'; // adjust the path as needed
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { useSelector, useDispatch } from 'react-redux';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  HostelRoomStatusType,
  HostelRoomStatusColors,
  HostelRoomStatusOptions,
} from 'src/enums/hostelRoom-status';

import { Label } from 'src/components/label';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddRoomForm from './addRoomForm';

import type { IHostelRoom, IHostelRoomTableProps } from './type';

const HostelRoomTable: React.FC<IHostelRoomTableProps> = ({ open, onClose, roomData }) => {
  // State to store the selected room data
  const [selectedRoom, setSelectedRoom] = useState<IHostelRoom | null>(null);
  // State to manage the opening and closing of the room dialog
  const roomDialog = useBoolean();
  // useDispatch hook to dispatch actions
  const dispatch = useDispatch();
  // useSelector hook to access the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles the closing of the room dialog.
   * @param _e - The event object.
   * @param isSubmit - A boolean indicating whether the form was submitted.
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setSelectedRoom(null);

      roomDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedRoom(null);

      roomDialog.onFalse();
    }
  };

  return (
    <Box p={2}>
      <CustomizableTable
        tableId="hostel-room-table"
        searchFieldProps={{
          placeholder: 'Search by Room Name,Type...',
          label: 'Search by Room Name,Type...',
        }}
        data={roomData}
        noDataText={
          <>
            No Room Data Found{' '}
            <Box
              onClick={() => {
                roomDialog.onTrue();
                setSelectedRoom(null);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Room
            </Box>
          </>
        }
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
                  placement="right-top"
                  showEditIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setSelectedRoom(row as IHostelRoom);
                    roomDialog.onTrue();
                  }}
                  handleViewClick={() => {}}
                />
              );
            },
          },
        ]}
      />

      <CustomDialog
        title={selectedRoom?.roomName ? 'Edit Room Configuration' : 'Add Room Configuration'}
        open={roomDialog.value}
        handleClose={() => {
          roomDialog.onFalse();
          setSelectedRoom(null);
        }}
        maxWidth="md"
      >
        <AddRoomForm
          open={roomDialog}
          onClose={() => {
            handleClose(null, false);
          }}
          editData={selectedRoom}
        />
      </CustomDialog>
    </Box>
  );
};

export default HostelRoomTable;
