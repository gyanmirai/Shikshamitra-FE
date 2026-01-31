'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import learningResourceData from 'src/json/academic/syllabus/learningResourceData.json';

import ResourceTypeTable from './learningResource';
import SettingResourceTypeForm from './settingResourceTypeForm';

import type { IResourceType } from './type';

const ResourceTypeCreation = () => {
  // Dialog state for add/edit resource type form
  const addDialog = useBoolean();
  // Dialog state for delete confirmation
  const deleteDialog = useBoolean();
  // State to control the visibility of the dialog
  const [open, setOpen] = useState(false);
  // State to track if there are unsaved changes from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to store the currently selected resource type for edit/delete
  const [selected, setSelected] = useState<IResourceType | null>(null);
  // State to store the list of resource types
  const [resourceTypes] = useState<IResourceType[]>(learningResourceData);
  // Redux dispatch function for dispatching actions
  const dispatch = useDispatch();

  // Handler for closing dialogs with optional submit flag
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
      <CustomBreadcrumbs
        heading="Setting"
        description="Setting for learning resource type and notification setting"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Syllabus', href: '/academic/courseSubjects' },
          { name: 'Setting' },
        ]}
        action={
          <Button variant="contained" onClick={addDialog.onTrue} startIcon={<Add />} size="small">
            Resource Type
          </Button>
        }
      />
      <ResourceTypeTable
        onDelete={(data) => {
          setSelected(data);
          deleteDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelected(data);
          addDialog.onTrue();
        }}
        open={open}
        onAddResourceType={addDialog}
        setOpenDialog={setOpen}
        editData={selected}
        setEditData={setSelected}
        data={resourceTypes}
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setSelected(null);
        }}
        title={selected ? 'Edit Resource Type' : 'Add Resource Type'}
      >
        <SettingResourceTypeForm
          open={addDialog}
          onClose={() => {
            handleClose(null, false);
          }}
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
        content="Are you sure want to Delete Resource ?"
        action={
          <Button
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            variant="contained"
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

export default ResourceTypeCreation;
