import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import settingSubjectTableData from 'src/json/academic/curriculum/settingSubjectTableData.json';

import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import SettingSubjectForm from './subjectForm';
import SettingSubjectTable from './settingSubjectTable';

import type { ISubject } from './type';

const SubjectCreation = ({ addSubjectDialog }: any) => {
  // Dialog state for adding disciplinary incidents
  // const addSubjectDialog = useBoolean();
  const deleteSubjectDialog = useBoolean();
  // Controls form visibility
  const [open, setOpen] = useState(false);
  // Breadcrumb navigation links based on form state
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const [subjectData, setSubjectData] = useState<ISubject[]>(settingSubjectTableData);
  // Redux dispatch
  const dispatch = useDispatch();

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedSubject(null);
      addSubjectDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedSubject(null);
      addSubjectDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button
          variant="contained"
          onClick={addSubjectDialog.onTrue}
          startIcon={<Add />}
          size="small"
          sx={{
            width: '130px',
          }}
        >
          Subject
        </Button>
      </Box> */}

      <SettingSubjectTable
        onDelete={(data) => {
          setSelectedSubject(data);
          deleteSubjectDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedSubject(data);
          addSubjectDialog.onTrue();
        }}
        open={open}
        onAddSubject={addSubjectDialog}
        setOpenDialog={setOpen}
        editData={selectedSubject}
        setEditData={setSelectedSubject}
        data={subjectData}
      />

      <CustomDialog
        open={addSubjectDialog.value}
        handleClose={() => {
          addSubjectDialog.onFalse();
          setSelectedSubject(null);
        }}
        title={selectedSubject ? 'Update Subject' : 'Add Subject'}
      >
        <SettingSubjectForm
          open={addSubjectDialog}
          onClose={() => {
            handleClose(null, false);
          }}
          editData={selectedSubject}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteSubjectDialog.value}
        onClose={() => {
          setSelectedSubject(null);
          deleteSubjectDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete subject <strong>{selectedSubject?.subjectName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // handle delete action
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

export default SubjectCreation;
