'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import MeetingTypeForm from './Components/MeetingTypeForm';
import MeetingTypeTable from './Components/MeetingTypeTable';

import type { IMeetingType } from './type';

const MeetingTypeCreation = () => {
  const deleteMeetingTypeDialog = useBoolean();
  const addMeetingTypeDialog = useBoolean();
  const [open, setOpen] = useState(false);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedMeetingType, setSelectedMeetingType] = useState<IMeetingType | null>(null);
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedMeetingType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addMeetingTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addMeetingTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedMeetingType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Meeting Type"
        description="Manage meeting types such as Staff Meeting, Parent Meeting, Online Meeting, etc. Use actions to edit or delete existing types. Click ‘Add Meeting Type’ to create a new one."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Setting', href: '/communication/setting' },
          { name: 'Meeting Type', href: '/communication/meeting-type' },
        ]}
        action={
          <Button
            onClick={() => addMeetingTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Meeting Type
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <MeetingTypeTable
        onDelete={(data) => {
          setSelectedMeetingType(data);
          deleteMeetingTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedMeetingType(data);
          addMeetingTypeDialog.onTrue();
        }}
        onAddMeetingType={addMeetingTypeDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedMeetingType}
        data={[]}
      />

      <CustomDialog
        open={addMeetingTypeDialog.value}
        handleClose={() => {
          addMeetingTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedMeetingType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedMeetingType ? 'Update Meeting Type' : 'Add Meeting Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedMeetingType
                  ? 'Update the meeting type details including name and description.'
                  : 'Create a new meeting type by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <MeetingTypeForm
          open={addMeetingTypeDialog}
          onClose={handleClose}
          editData={selectedMeetingType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteMeetingTypeDialog.value}
        onClose={() => {
          setSelectedMeetingType(null);
          deleteMeetingTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete meeting type{' '}
            <strong>{selectedMeetingType?.meetingType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteMeetingTypeDialog.onFalse();
              setSelectedMeetingType(null);
              shikshaMitraToast.success({
                message: `Meeting Type ${selectedMeetingType?.meetingType} deleted successfully`,
              });
              // handle delete API call here
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default MeetingTypeCreation;
