'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Button, DialogContent, DialogActions } from '@mui/material';
import hostelRequestData from 'src/json/hostel/hostelRequest/hostelRequestTableData.json';

import StudentLeftForm from './components/studentLeftForm';
import StudentTableData from './components/studentTableData';
import RoomAllocateForm from './components/roomAllocateForm';
import RequestDetails from '../newRequest/components/requestDetails';
import RejectHostelRequestForm from './components/rejectHostelRequestForm';

import type { IHostelRequestFormType } from '../newRequest/components/type';

const StudentRoomAllocate = () => {
  // Dialog state management using custom boolean hook
  const deleteDialog = useBoolean();
  const rejectDialog = useBoolean();

  const requestDetailsDialog = useBoolean();
  const assignRoom = useBoolean();
  const leftStudentDialog = useBoolean();
  // State for managing form disable status
  const [disabled, setDisabled] = useState(false);
  // State for storing selected hostel request
  const [selectedRequest, setSelectedRequest] = useState<IHostelRequestFormType | null>(null);
  // State for storing list of hostel requests from mock data
  const [requestList] = useState<IHostelRequestFormType[]>(hostelRequestData);

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Navigation breadcrumb links
  const links = [
    { name: 'Hostel Management', href: '/hostel/dashboard' },
    { name: 'Room Allocation to Students', href: '' },
  ];

  /**
   * Handles closing of the request form
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      assignRoom.onFalse();
      leftStudentDialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedRequest(null);
    } else if (!isChanges) {
      assignRoom.onFalse();
      leftStudentDialog.onFalse();
      setSelectedRequest(null);
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Room Allocation to Students"
        description="Manage and track your hostel accommodation requests and assigned rooms."
        links={links}
        sx={{ px: 1, mb: 2 }}
      />

      <StudentTableData
        requests={requestList}
        onDelete={(req) => {
          setSelectedRequest(req);
          deleteDialog.onTrue();
        }}
        onRequestDetails={(req) => {
          setSelectedRequest(req);
          requestDetailsDialog.onTrue();
          setDisabled(true);
        }}
        onAssignRoom={(req) => {
          setSelectedRequest(req);
          assignRoom.onTrue();
        }}
        onRejected={(req) => {
          setSelectedRequest(req);
          rejectDialog.onTrue();
        }}
        onLeftStudent={(req) => {
          setSelectedRequest(req);
          leftStudentDialog.onTrue();
        }}
      />

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedRequest(null);
          deleteDialog.onFalse();
        }}
        title="Delete Request"
        content="Are you sure you want to delete this hostel request?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Delete
          </Button>
        }
      />

      <CustomDialog
        title="Details"
        open={requestDetailsDialog.value}
        handleClose={() => {
          setSelectedRequest(null);
          requestDetailsDialog.onFalse();
        }}
        maxWidth="md"
      >
        <DialogContent>
          <RequestDetails hostelRequest={selectedRequest} />
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={requestDetailsDialog.onFalse}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Assign Room"
        open={assignRoom.value}
        handleClose={() => {
          setSelectedRequest(null);
          assignRoom.onFalse();
        }}
        maxWidth="sm"
      >
        <RoomAllocateForm editData={selectedRequest} open={assignRoom} onClose={handleClose} />
      </CustomDialog>

      <CustomDialog
        title="Remarks"
        open={rejectDialog.value}
        handleClose={() => {
          // setWhichStatus(null);
          rejectDialog.onFalse();
          // setLeaveId('');
        }}
      >
        <RejectHostelRequestForm
          open={rejectDialog}
          handleClose={() => {
            rejectDialog.onFalse();
          }}
          selectedRequest={selectedRequest}
        />
      </CustomDialog>

      <CustomDialog
        title="Reason"
        open={leftStudentDialog.value}
        handleClose={() => {
          // setWhichStatus(null);
          leftStudentDialog.onFalse();
          // setLeaveId('');
        }}
      >
        <StudentLeftForm
          open={leftStudentDialog}
          handleClose={() => {
            leftStudentDialog.onFalse();
          }}
          selectedRequest={selectedRequest}
        />
      </CustomDialog>
    </Box>
  );
};

export default StudentRoomAllocate;
