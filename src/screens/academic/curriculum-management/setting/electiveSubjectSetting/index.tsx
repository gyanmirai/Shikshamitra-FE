import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import ElectiveSubjectTable from './components/electiveSubjectTable';
import SettingElectiveSubjectForm from './components/electiveSubjectForm';

import type { IElectiveSubject } from './type';

const ElectiveSubjectSetting = ({ addElectiveGroupDialog }: any) => {
  // Dialog control hooks
  // Controls visibility of add/edit elective subject dialog
  // const addElectiveGroupDialog = useBoolean();
  // Controls visibility of delete confirmation dialog
  const deleteDialog = useBoolean();
  // Controls visibility of main dialog window
  const [open, setOpen] = useState(false);

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Local state management
  const [selected, setSelected] = useState<IElectiveSubject | null>(null);

  /**
   * Handles dialog close with confirmation
   * @param _e - Event object
   * @param isSubmit - Flag indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelected(null);
      addElectiveGroupDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelected(null);
      addElectiveGroupDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button
          variant="contained"
          onClick={addElectiveGroupDialog.onTrue}
          startIcon={<Add />}
          size="small"
        >
          Elective Group
        </Button>
      </Box> */}

      <ElectiveSubjectTable
        onDelete={(data) => {
          setSelected(data);
          deleteDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelected(data);
          addElectiveGroupDialog.onTrue();
        }}
        open={open}
        onAddElective={addElectiveGroupDialog}
        setOpenDialog={setOpen}
        editData={selected}
        setEditData={setSelected}
        data={[
          {
            title: 'Elective Group 1',
            subjectColor: '#1E90FF',
            subjects: [
              { name: 'Computer', subjectColor: '#4169E1' },
              { name: 'Physical Training', subjectColor: '#FF69B4' },
            ],
            createdBy: 'Patel Jeena Rajeshbhai',
          },
          {
            title: 'Elective Group 2',
            subjectColor: '#FF4500',
            subjects: [
              { name: 'Hindi', subjectColor: '#FF4500' },
              { name: 'Sanskrit', subjectColor: '#DA70D6' },
            ],
            createdBy: 'Shah Meena Prakashbhai',
          },
        ]}
      />

      <CustomDialog
        open={addElectiveGroupDialog.value}
        handleClose={() => {
          addElectiveGroupDialog.onFalse();
          setSelected(null);
        }}
        title={selected ? 'Update Elective Group' : 'Add Elective Group'}
      >
        <SettingElectiveSubjectForm
          open={addElectiveGroupDialog}
          onClose={handleClose}
          editData={selected}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelected(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete elective subject <strong>{selected?.title}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // handle delete
              deleteDialog.onFalse();
              shikshaMitraToast.success({
                message: `Subject ${selected?.title} deleted successfully`,
              });
            }}
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default ElectiveSubjectSetting;
