'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RoomTypeForm from './components/roomTypeForm';
import RoomTypeTable from './components/roomTypeTable';

import type { IRoomType } from './types';

const RoomTypeManagement = () => {
  // Dialog control hooks for add/edit and delete room type modals
  const addRoomTypeDialog = useBoolean();
  const deleteRoomTypeDialog = useBoolean();

  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State for managing selected room type and room type data
  const [selectedRoomType, setSelectedRoomType] = useState<IRoomType | null>(null);
  const [roomTypeData, setRoomTypeData] = useState<IRoomType[]>([
    {
      id: 1,
      roomType: 'Classroom',
      shortName: 'CR',
    },
    {
      id: 2,
      roomType: 'Laboratory',
      shortName: 'LAB',
    },
    {
      id: 3,
      roomType: 'Conference Room',
      shortName: 'CONF',
    },
  ]);

  // Redux dispatch hook
  const dispatch = useDispatch();

  /**
   * Handles closing of the add/edit room type dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset component state
    const resetState = () => {
      setTimeout(() => {
        setSelectedRoomType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Close dialog if form submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addRoomTypeDialog.onFalse();
      resetState();
    }
    // Close dialog if no unsaved changes
    else if (!isChanges) {
      addRoomTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedRoomType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Room Type Management"
        description="Define and organize room types to ensure effective facility management."
        links={[
          { name: 'Institute Setup', href: '/academic/dashboard' },
          { name: 'Rooms Management', href: '/academic/curriculumSubjects' },
          { name: 'Room Type Management' },
        ]}
        sx={{ px: 1, mb: 1 }}
        action={
          <Button
            variant="contained"
            onClick={addRoomTypeDialog.onTrue}
            startIcon={<Add />}
            size="small"
            sx={{
              width: '130px',
            }}
          >
            Room Type
          </Button>
        }
      />

      <CustomDialog
        open={addRoomTypeDialog.value}
        handleClose={() => {
          addRoomTypeDialog.onFalse();
        }}
        title={selectedRoomType ? 'Update Room Type' : 'Add Room Type'}
      >
        <RoomTypeForm open={addRoomTypeDialog} onClose={handleClose} editData={selectedRoomType} />
      </CustomDialog>

      <RoomTypeTable
        onDelete={(data) => {
          setSelectedRoomType(data);
          deleteRoomTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedRoomType(data);
          addRoomTypeDialog.onTrue();
        }}
        data={roomTypeData}
      />

      <ConfirmDialog
        open={deleteRoomTypeDialog.value}
        onClose={() => {
          setSelectedRoomType(null);
          deleteRoomTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete room type <strong>{selectedRoomType?.roomType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteRoomTypeDialog.onFalse();
              setSelectedRoomType(null);
              shikshaMitraToast.success({
                message: `Room type ${selectedRoomType?.roomType} deleted successfully`,
              });
              // handle delete action
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default RoomTypeManagement;
