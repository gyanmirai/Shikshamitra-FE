import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import homeworkTableData from 'src/json/academic/homeworkAssignment/homework-table-data.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import HomeworkForm from './homeworkForm';
import HomeworkTable from './homeworkTable';

import type { IHomework } from '../type';

const HomeworkCreation = (props: TabComponentType) => {
  // Dialog state for adding disciplinary incidents
  const addHomeworkDialog = useBoolean();
  // Dialog state for deleting homework assignments
  const deleteHomeworkDialog = useBoolean();
  // Dialog state for publishing homework assignments
  const publishHomeworkDialog = useBoolean();

  // Controls form visibility
  const [open, setOpen] = useState(false);
  // Breadcrumb navigation links based on form state
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to track the currently selected homework assignment for editing
  const [selectedHomework, setSelectedHomework] = useState<IHomework | null>(null);
  // State to store the list of homework/subject assignments
  const [homeworkData, setHomeworkData] = useState<IHomework[]>(homeworkTableData);
  // Redux dispatch
  const dispatch = useDispatch();

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedHomework(null);
      addHomeworkDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedHomework(null);
      addHomeworkDialog.onFalse();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={addHomeworkDialog.onTrue}
          startIcon={<Add />}
          size="small"
        >
          Homework
        </Button>
      </Box>

      <CustomDialog
        open={addHomeworkDialog.value}
        handleClose={() => {
          addHomeworkDialog.onFalse();
          setSelectedHomework(null);
        }}
        title={selectedHomework ? 'Edit Homework' : 'Add Homework'}
        maxWidth="md"
      >
        <HomeworkForm
          dialog={addHomeworkDialog}
          onClose={() => {
            handleClose(null, false);
          }}
          editData={selectedHomework}
        />
      </CustomDialog>

      <HomeworkTable
        filteredData={homeworkData || []}
        setOpen={setOpen}
        dialog={addHomeworkDialog}
        handleSwitchChange={(row) => {
          setSelectedHomework(row);
          publishHomeworkDialog.onTrue();
        }}
        onEditDetails={(row) => {
          setSelectedHomework(row);
          addHomeworkDialog.onTrue();
          setOpen(true);
        }}
        onDeleteDetails={(row) => {
          setSelectedHomework(row);
          deleteHomeworkDialog.onTrue();
        }}
        onViewDetails={(row) => {
          console.log('View clicked', row); // or navigate to a details page/modal
        }}
      />

      <ConfirmDialog
        open={deleteHomeworkDialog.value}
        onClose={() => {
          setSelectedHomework(null);
          deleteHomeworkDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure want to Delete Homework ?"
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
        open={publishHomeworkDialog.value}
        onClose={() => {
          publishHomeworkDialog.onFalse();
          setSelectedHomework(null);
        }}
        title="Publish"
        content="Are you sure want to Publish Homework ?"
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

export default HomeworkCreation;
