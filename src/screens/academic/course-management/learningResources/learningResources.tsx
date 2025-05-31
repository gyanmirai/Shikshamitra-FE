'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HierarchyTree from './components/treeStrcutre';
import CreateNewResource from './components/addResourceForm';

// Initial sample data for learning resources

const LearningResources = (props: TabComponentType) => {
  // Get search parameters from props
  const { searchParams } = props;
  // Dialog state for adding/editing learning resources
  const addLearningResourceDialog = useBoolean();

  // Get class value from URL parameters, default to empty string if not present
  const classFromUrl = searchParams?.class || '';

  // Get subject value from URL parameters, default to empty string if not present
  const subjectFromUrl = searchParams?.subject || '';

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);
  // State to store selected class, initialized from URL parameter
  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
  }, [medium]);

  // State to store currently selected resource entry for editing
  const [selectedEntry, setSelectedEntry] = useState<any>();

  // Boolean state to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Redux state to track if there are unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function
  const dispatch = useDispatch();

  // Dialog state for general confirmations
  const confirm_dialog = useBoolean();

  // Dialog state specifically for delete confirmations
  const deleteDialog = useBoolean();

  // State to store selected subject, initialized from URL parameter
  const [subject, setSubject] = useState(subjectFromUrl);
  // State to track pending status changes for publish/unpublish actions
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newStatus: string;
  } | null>(null);

  const editResourceDialog = useBoolean();

  // Function to close the dialog and reset form state
  const handleClose = (_e: any, isSubmit?: boolean) => {
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
        { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
        { name: 'Resources' },
        { name: 'Add Learning Resource' },
      ]
    : [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
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
        sx={{ px: 1, mb: 2 }}
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

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedEntry(null);
        }}
        title="Delete"
        content="Are you sure you want to Delete Resource ?"
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

      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          confirm_dialog.onFalse();
        }}
        title="Confirm Publication"
        content="Are you sure want to Publish Resource ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              confirm_dialog.onFalse();
            }}
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default LearningResources;
