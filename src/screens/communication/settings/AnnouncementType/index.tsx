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
// Replace with actual API hook when available

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAnnouncementTypeOptionsQuery } from 'src/redux/communication/setting/announcementTypeSetting';

import AnnouncementTypeForm from './Components/AnnouncementTypeForm';
import AnnouncementTypeTable from './Components/AnnouncementTypeTable';

import type { IAnnouncementType } from './Components/type';

const AnnouncementTypeCreation = () => {
  // Custom hook to fetch announcement type data
  const { data: announcementTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAnnouncementTypeOptionsQuery,
  });

  // Dialog control states
  const deleteAnnouncementTypeDialog = useBoolean();
  const addAnnouncementTypeDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedAnnouncementType, setSelectedAnnouncementType] =
    useState<IAnnouncementType | null>(null);
  const dispatch = useDispatch();

  // Close handler
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedAnnouncementType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addAnnouncementTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addAnnouncementTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedAnnouncementType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Announcement Type"
        description="Manage announcement types such as Holiday Notice, Exam Alert, Event Update, etc. Use actions to edit or delete existing types. Click ‘Add Announcement Type’ to create a new one."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Setting', href: '/communication/setting' },
          { name: 'Announcement Type', href: '/communication/announcement-type' },
        ]}
        action={
          <Button
            onClick={() => addAnnouncementTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Announcement Type
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <AnnouncementTypeTable
        onDelete={(data) => {
          setSelectedAnnouncementType(data);
          deleteAnnouncementTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedAnnouncementType(data);
          addAnnouncementTypeDialog.onTrue();
        }}
        open={addAnnouncementTypeDialog}
        onAddAnnouncementType={addAnnouncementTypeDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedAnnouncementType}
        data={announcementTypeData}
      />

      <CustomDialog
        open={addAnnouncementTypeDialog.value}
        handleClose={() => {
          addAnnouncementTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedAnnouncementType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedAnnouncementType ? 'Update Announcement Type' : 'Add Announcement Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedAnnouncementType
                  ? 'Update the announcement type details including name and description.'
                  : 'Create a new announcement type by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AnnouncementTypeForm
          open={addAnnouncementTypeDialog}
          onClose={handleClose}
          editData={selectedAnnouncementType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteAnnouncementTypeDialog.value}
        onClose={() => {
          setSelectedAnnouncementType(null);
          deleteAnnouncementTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete announcement type{' '}
            <strong>{selectedAnnouncementType?.announcementType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteAnnouncementTypeDialog.onFalse();
              setSelectedAnnouncementType(null);
              shikshaMitraToast.success({
                message: `Announcement Type ${selectedAnnouncementType?.announcementType} deleted successfully`,
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

export default AnnouncementTypeCreation;
