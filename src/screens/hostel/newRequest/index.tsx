'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Card, Button, DialogContent, DialogActions } from '@mui/material';
import hostelRequestData from 'src/json/hostel/hostelRequest/hostelRequestTableData.json';

import HostelRequestForm from './components/requestForm';
import RequestDetails from './components/requestDetails';
import HostelRequestTable from './components/hostelRequestTable';

import type { IHostelRequestFormType } from './components/type';

const StudentHostelRequest = () => {
  // Dialog state for adding new request
  const addNewRequestDialog = useBoolean();
  // Dialog state for delete confirmation
  const deleteDialog = useBoolean();
  // Dialog state for room details
  const requestDetailsDialog = useBoolean();
  const [disabled, setDisabled] = useState(false);
  const assignRoom = useBoolean();
  // State to store selected request for edit/delete operations
  const [selectedRequest, setSelectedRequest] = useState<IHostelRequestFormType | null>(null);
  // State to control form visibility
  const [openForm, setOpenForm] = useState(false);
  // State to store list of hostel requests
  const [requestList] = useState<IHostelRequestFormType[]>(hostelRequestData);

  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Dynamic breadcrumb links based on form state
  const links = openForm
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Hostel Requests', href: '' },
        { name: 'Request Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Hostel Requests', href: '' },
      ];

  /**
   * Handles closing of the request form
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpenForm(false);
      addNewRequestDialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedRequest(null);
      setDisabled(false);
    } else if (!isChanges) {
      setOpenForm(false);
      addNewRequestDialog.onFalse();
      setSelectedRequest(null);
      setDisabled(false);
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Hostel Requests"
        description={
          openForm
            ? 'Submit your hostel request with accurate details for accommodation processing.'
            : 'Manage and track your hostel accommodation requests and assigned rooms.'
        }
        links={links}
        sx={{ mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={openForm ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              openForm
                ? () => handleClose(null, false)
                : () => {
                    setOpenForm(true);
                    setDisabled(false);
                  }
            }
          >
            {openForm ? 'Back' : 'New Request'}
          </Button>
        }
      />
      {openForm ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <HostelRequestForm
            open={addNewRequestDialog}
            onClose={() => handleClose(null, false)}
            editData={selectedRequest}
            disabled={disabled}
          />
        </Card>
      ) : (
        <HostelRequestTable
          requests={requestList}
          addNewRequestDialog={addNewRequestDialog}
          open={openForm}
          setOpen={setOpenForm}
          onDelete={(req) => {
            setSelectedRequest(req);
            deleteDialog.onTrue();
          }}
          onEdit={(req) => {
            setSelectedRequest(req);
            setOpenForm(true);
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
        />
      )}
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
        title="Request Details"
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
        title="Request Details"
        open={assignRoom.value}
        handleClose={() => {
          setSelectedRequest(null);
          requestDetailsDialog.onFalse();
        }}
        maxWidth="md"
      >
        <RequestDetails hostelRequest={selectedRequest} />
      </CustomDialog>
    </Box>
  );
};

export default StudentHostelRequest;
