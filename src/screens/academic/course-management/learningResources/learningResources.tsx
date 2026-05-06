'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import HierarchyTree from './components/treeStrcutre';
import CreateNewResource from './components/addResourceForm';

import type { IResourceData } from './type';

const LearningResources = (props: TabComponentType) => {
  const addLearningResourceDialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<IResourceData | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const deleteDialog = useBoolean();
  const editResourceDialog = useBoolean();

  // Function to close the dialog and reset form state
  const handleClose = (_e: unknown, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      dispatch(setIsChanges(false));
      editResourceDialog.onFalse();
      setIsEdit(false);
      setSelectedEntry(null);
      addLearningResourceDialog.onFalse();
    } else if (!isChanges) {
      setIsEdit(false);
      editResourceDialog.onFalse();
      setSelectedEntry(null);
      addLearningResourceDialog.onFalse();
    }
  };

  // Define breadcrumb navigation links based on form state
  const links = addLearningResourceDialog.value
    ? [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Curriculum', href: '/academic/curriculumSubjects' },
        { name: 'Resources' },
        { name: 'Add Learning Resource' },
      ]
    : [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Curriculum', href: '/academic/curriculumSubjects' },
        { name: 'Resources' },
      ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* CustomBreadcrumbs component for navigation and page header */}
      <CustomBreadcrumbs
        heading="Resources"
        description={
          addLearningResourceDialog.value
            ? 'Create learning resource details, including the title, content, and associated subject. Manage resources efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize learning resources for each subject efficiently. View the list of resources, add new ones, update existing resources, or remove them as needed.'
        }
        links={links}
        action={
          !addLearningResourceDialog.value && (
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                addLearningResourceDialog.onTrue();
              }}
            >
              Resource
            </Button>
          )
        }
      />

      {/* Conditional rendering of Create/Edit form or Resource list */}

      <CustomDialog
        title={selectedEntry ? 'Update Learning Resource' : 'Add Learning Resource'}
        open={addLearningResourceDialog.value}
        maxWidth="sm"
        handleClose={() => {
          addLearningResourceDialog.onFalse();
          setSelectedEntry(null);
        }}
      >
        <CreateNewResource
          onSave={() => {}}
          onClose={handleClose}
          data={selectedEntry}
          isEdit={isEdit}
        />
      </CustomDialog>

      <HierarchyTree
        onEdit={(doc) => {
          setSelectedEntry(doc);
          editResourceDialog.onTrue();
        }}
      />

      <CustomDialog
        title="Update Learning Resource"
        open={editResourceDialog.value}
        maxWidth="sm"
        handleClose={() => {
          editResourceDialog.onFalse();
          setSelectedEntry(null);
        }}
      >
        <CreateNewResource
          onSave={() => {}}
          onClose={handleClose}
          data={selectedEntry}
          isEdit={isEdit}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedEntry(null);
        }}
        title="Delete"
        content="Are you sure you want to Delete Resource ?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default LearningResources;
