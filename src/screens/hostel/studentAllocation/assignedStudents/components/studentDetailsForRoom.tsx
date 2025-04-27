import type { RootState } from 'src/redux/store';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import hostelRoomData from 'src/json/hostel/hostelLeaveApprove/hostelRoomData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import StudentRoomAssign from './studentRoomAssign';

import type { IHostelAllocationRoom } from '../../type';
import type { IHostelRoomStudent, IStudentRoomAssignFormValues } from '../type';

const StudentDetailsForRoom = ({
  selectedRoom,
}: {
  selectedRoom: IHostelAllocationRoom | null;
}) => {
  const [roomData, setRoomData] = useState<IHostelRoomStudent[]>(hostelRoomData);
  const [student, setStudent] = useState<IStudentRoomAssignFormValues | null>(null);
  const assignRoomDialog = useBoolean();
  // Redux dispatch function for dispatching actions.
  const dispatch = useDispatch();
  // Selector for retrieving the 'isChanges' state from the Redux store.
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
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
              setStudent(row as IStudentRoomAssignFormValues);
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

  // Handler function for closing the hostel form, optionally handling form submission and changes.
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      assignRoomDialog.onFalse();
      dispatch(setIsChanges(false));
      setStudent(null);
    } else if (!isChanges) {
      assignRoomDialog.onFalse();
      setStudent(null);
    }
  };

  return (
    <Box>
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
      <CustomDialog
        open={assignRoomDialog.value}
        handleClose={() => {
          assignRoomDialog.onFalse();
          setStudent(null);
        }}
        title={`${student?.studentName}'s Room Assign`}
      >
        <StudentRoomAssign
          open={assignRoomDialog}
          onClose={() => {
            handleClose(null, false);
          }}
          selectedStudent={student}
        />
      </CustomDialog>
    </Box>
  );
};

export default StudentDetailsForRoom;
