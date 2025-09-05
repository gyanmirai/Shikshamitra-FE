import { Box } from '@mui/material';
import React, { useState } from 'react'; // adjust the path as needed
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  HostelRoomStatusType,
  HostelRoomStatusColors,
  HostelRoomStatusOptions,
} from 'src/enums/hostelRoom-status';

import type { IHostelRoom, IFacilityQuantities, IHostelRoomTableProps } from './type';

const RoomTable: React.FC<IHostelRoomTableProps> = ({ onAddRoom, data, onEdit, onDelete }) => {
  // State to store the selected room data
  const [selectedRoom, setSelectedRoom] = useState<IHostelRoom | null>(null);
  // State to manage the opening and closing of the room dialog
  const roomDialog = useBoolean();
  // useDispatch hook to dispatch actions
  const dispatch = useDispatch();
  // useSelector hook to access the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  return (
    <CustomizableTable
      tableId="room-configuration-table"
      searchFieldProps={{
        placeholder: 'Search by Room Name, Type...',
        label: 'Search by Room Name, Type...',
      }}
      data={data}
      noDataText={
        <>
          No Room Data Found{' '}
          <Box
            onClick={() => {
              onAddRoom(null);
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
          id: 'facility',
          label: 'Facilities',
          align: 'left',
          minWidth: 150,
          render(value, row) {
            return (
              <Box display="flex" gap={1}>
                {row.facilityQuantities.map((item: IFacilityQuantities) => (
                  <Label key={item.id}>
                    {item.facility} ({item.quantity})
                  </Label>
                ))}
              </Box>
            );
          },
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
                  onEdit(row as IHostelRoom);
                }}
                showDeleteIcon
                handleDeleteClick={() => {
                  onDelete(row as IHostelRoom);
                }}
                handleViewClick={() => {}}
              />
            );
          },
        },
      ]}
    />
  );
};

export default RoomTable;
