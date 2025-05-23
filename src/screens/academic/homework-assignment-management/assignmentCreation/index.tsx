import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import assignmentTableData from 'src/json/academic/homeworkAssignment/assignment-table-data.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import AssignmentForm from './components/assignmentForm';
import AssignmentTable from './components/assignmentTable';

import type { IAssignment } from './type';

const AssignmentCreation = (props: TabComponentType) => {
  // Dialog state for add/edit assignment form
  const addAssignmentDialog = useBoolean();
  // Dialog state for delete assignment confirmation
  const deleteAssignmentDialog = useBoolean();
  // Dialog state for publish assignment confirmation
  const publishAssignmentDialog = useBoolean();

  // State to control modal open/close
  const [open, setOpen] = useState(false);
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to store currently selected assignment for edit/delete/publish
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignment | null>(null);
  // State to store list of all assignments
  const [assignmentData, setAssignmentData] = useState<IAssignment[]>(assignmentTableData);
  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Handles dialog close with confirmation if there are unsaved changes
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedAssignment(null);
      addAssignmentDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedAssignment(null);
      addAssignmentDialog.onFalse();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={addAssignmentDialog.onTrue}
          startIcon={<Add />}
          size="small"
        >
          Assignment
        </Button>
      </Box>

      <CustomDialog
        open={addAssignmentDialog.value}
        handleClose={() => {
          addAssignmentDialog.onFalse();
          setSelectedAssignment(null);
        }}
        title={selectedAssignment ? 'Edit Assignment' : 'Add Assignment'}
        maxWidth="md"
      >
        <AssignmentForm
          dialog={addAssignmentDialog}
          onClose={() => {
            handleClose(null, false);
          }}
          editData={selectedAssignment}
        />
      </CustomDialog>

      <AssignmentTable
        data={assignmentData || []}
        dialog={addAssignmentDialog}
        onSwitchToggle={(row) => {
          setSelectedAssignment(row);
          publishAssignmentDialog.onTrue();
        }}
        onEdit={(row) => {
          setSelectedAssignment(row);
          addAssignmentDialog.onTrue();
        }}
        onDelete={(row) => {
          setSelectedAssignment(row);
          deleteAssignmentDialog.onTrue();
        }}
        onView={(row) => {
          console.log('View clicked', row);
        }}
      />

      <ConfirmDialog
        open={deleteAssignmentDialog.value}
        onClose={() => {
          setSelectedAssignment(null);
          deleteAssignmentDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure want to Delete Assignment ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            color="error"
            onClick={() => {}}
          >
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={publishAssignmentDialog.value}
        onClose={() => {
          publishAssignmentDialog.onFalse();
          setSelectedAssignment(null);
        }}
        title="Publish"
        content="Are you sure want to Publish Assignment ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {}}
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default AssignmentCreation;
