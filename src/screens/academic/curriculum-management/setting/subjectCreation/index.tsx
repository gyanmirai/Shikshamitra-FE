import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import settingSubjectTableData from 'src/json/academic/curriculum/settingSubjectTableData.json';

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
    const resetState = () => {
      setTimeout(() => {
        setSelectedSubject(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addSubjectDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addSubjectDialog.onFalse();
      setTimeout(() => {
        setSelectedSubject(null);
      }, 200);
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
          setTimeout(() => {
            setSelectedSubject(null);
          }, 200); // Adjust the delay based on your dialog transition duration
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedSubject ? 'Update Subject' : 'Add Subject'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedSubject
                  ? 'You can update the subject details including name and color.'
                  : 'You can create a new subject by entering the subject name and color.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SettingSubjectForm
          open={addSubjectDialog}
          onClose={handleClose}
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
            size="small"
            onClick={() => {
              deleteSubjectDialog.onFalse();
              setSelectedSubject(null);
              shikshaMitraToast.success({
                message: `Subject ${selectedSubject?.subjectName} deleted successfully`,
              });
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
