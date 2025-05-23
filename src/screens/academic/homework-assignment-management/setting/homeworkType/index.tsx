import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import HomeworkTypeForm from './homeworkTypeForm';
import HomeworkTypeTable from './homeworkTypeTable';

import type { IHomeworkType } from './type';

const HomeworkTypeCreation = (props: TabComponentType) => {
  // Dialog control for add/edit homework type
  const addDialog = useBoolean();

  // Dialog control for delete confirmation
  const deleteDialog = useBoolean();

  // Modal open/close state
  const [open, setOpen] = useState(false);

  // Track unsaved changes from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Currently selected homework type for edit/delete
  const [selectedData, setSelectedData] = useState<IHomeworkType | null>(null);

  // Table data state containing list of homework types
  const [tableData, setTableData] = useState<IHomeworkType[]>([]);

  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Handles closing of the add/edit dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedData(null);
      addDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedData(null);
      addDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={addDialog.onTrue} startIcon={<Add />} size="small">
          Homework Type
        </Button>
      </Box>

      <HomeworkTypeTable
        data={tableData}
        onEdit={(data) => {
          setSelectedData(data);
          addDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedData(data);
          deleteDialog.onTrue();
        }}
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setSelectedData(null);
        }}
        title={selectedData ? 'Edit Homework Type' : 'Add Homework Type'}
      >
        <HomeworkTypeForm
          open={addDialog}
          onClose={() => handleClose(null, false)}
          editData={selectedData}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedData(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete Homework Type?"
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
    </Box>
  );
};

export default HomeworkTypeCreation;
