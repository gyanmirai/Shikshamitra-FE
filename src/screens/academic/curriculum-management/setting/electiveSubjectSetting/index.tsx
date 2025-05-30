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

import ElectiveSubjectTable from './components/electiveSubjectTable';
import SettingElectiveSubjectForm from './components/electiveSubjectForm';

import type { IElectiveSubject } from './type';

const ElectiveSubjectSetting = (props: TabComponentType) => {
  // Dialog control hooks
  // Controls visibility of add/edit elective subject dialog
  const addDialog = useBoolean();
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
      addDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelected(null);
      addDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button variant="contained" onClick={addDialog.onTrue} startIcon={<Add />} size="small">
          Elective Group
        </Button>
      </Box>

      <ElectiveSubjectTable
        onDelete={(data) => {
          setSelected(data);
          deleteDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelected(data);
          addDialog.onTrue();
        }}
        open={open}
        onAddElective={addDialog}
        setOpenDialog={setOpen}
        editData={selected}
        setEditData={setSelected}
        data={[
          {
            title: 'Language Electives',
            subjects: [{ name: 'French' }, { name: 'German' }, { name: 'Spanish' }],
            subjectColor: '#FF5733',
            createdBy: 'John Smith',
          },
          {
            title: 'Science Electives',
            subjects: [
              { name: 'Astronomy' },
              { name: 'Biotechnology' },
              { name: 'Environmental Science' },
            ],
            subjectColor: '#33FF57',
            createdBy: 'Sarah Johnson',
          },
          {
            title: 'Arts Electives',
            subjects: [{ name: 'Painting' }, { name: 'Sculpture' }, { name: 'Music' }],
            subjectColor: '#3357FF',
            createdBy: 'Michael Brown',
          },
        ]}
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setSelected(null);
        }}
        title={selected ? 'Update Elective Group' : 'Add Elective Group'}
      >
        <SettingElectiveSubjectForm open={addDialog} onClose={handleClose} editData={selected} />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelected(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to Delete Elective Subject ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            color="error"
            onClick={() => {}}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default ElectiveSubjectSetting;
