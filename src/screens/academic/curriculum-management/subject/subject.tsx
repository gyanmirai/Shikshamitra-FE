'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import electiveSubjectData from 'src/json/academic/curriculum/electiveSubjectData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectTable from './component/subjectTable';
import SubjectForm from './component/subjectFormComponent';
import { ViewSubject } from './component/viewDetailComponents/viewSubjectComponent';

import type { ISubjectFormValues } from './component/type';

const Subject = (props: TabComponentType) => {
  // State to manage subject table data and filtered data
  const [subjectTableData, setSubjectTableData] =
    useState<ISubjectFormValues[]>(electiveSubjectData);

  // Query hook to fetch class data
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);
  // URL search parameter state for form visibility
  const addSubjectDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteConfirmDialog = useBoolean();
  // Dialog control for publish/unpublish confirmation
  const confirmPublishDialog = useBoolean();
  // Dialog control for viewing subject details
  const showSubjectDialog = useBoolean();
  // State for managing selected subject and edit mode
  // State to store the currently selected subject for editing/viewing
  const [selectedSubject, setSelectedSubject] = useState<ISubjectFormValues | null>(null);

  // Boolean flag to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Get the changes status from the confirm popup redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();
  // State to track pending status changes for subjects
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  // Handle subject status toggle between Publish/Unpublish
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  // Open dialog to view subject details
  const handleViewSubject = (subject: ISubjectFormValues) => {
    setSelectedSubject(subject);
    showSubjectDialog.onTrue();
  };
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addSubjectDialog.onFalse();
      setIsEdit(false);
      setSelectedSubject(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addSubjectDialog.onFalse();
      setIsEdit(false);
      setSelectedSubject(null);
    }
  };
  // Close all dialogs and reset form state
  const handleCloseDialog = () => {
    addSubjectDialog.onFalse();
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
    setSelectedSubject(null);
  };

  // Delete selected subject from table
  const handleDelete = () => {
    if (selectedSubject) {
      setSubjectTableData(subjectTableData.filter((subject) => subject.id !== selectedSubject.id));
      deleteConfirmDialog.onFalse();
      setSelectedSubject(null);
    }
  };

  // Confirm and apply status change for subject
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setSubjectTableData((prevSubject) =>
        prevSubject.map((subject) =>
          subject.id === id ? { ...subject, status: newValue } : subject
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {addSubjectDialog.value ? (
        <CustomBreadcrumbs
          heading={selectedSubject ? 'Update Subject' : 'Publish Subject'}
          description="Create or update subject details, including the name, code, and associated curriculum. Manage subjects efficiently by adding new ones or editing existing entries."
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            // Links when viewing subject list
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management' },
            { name: 'Allocate Subject' },

            { name: selectedSubject ? 'Update Subject' : 'Publish Subject' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Allocate Subject"
          description="Manage and organize your academic subjects efficiently. View the list of subjects, add new subjects, update existing ones, or remove them as needed."
          links={[
            // Links when form is open
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management' },
            { name: 'Allocate Subject' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      )}
      {/* Conditional rendering based on form state */}
      {addSubjectDialog.value ? (
        <>
          {/* Subject form card for creating/editing subjects */}
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <SubjectForm
              onClose={handleClose}
              data={selectedSubject}
              isEdit={isEdit}
              selectedClass={classes}
            />{' '}
          </Card>
        </>
      ) : (
        <>
          {/* Class selection dropdown */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <CustomSelect
              label="Class"
              name="class"
              options={allClass}
              valueKey="id"
              labelKey="name"
              formControlProps={{ sx: { maxWidth: '360px', width: '100%' } }}
              value={classes}
              onChange={(value) => {
                setClasses(value as string);
              }}
            />
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={
                addSubjectDialog.value
                  ? () => handleClose(null, false)
                  : () => {
                      addSubjectDialog.onTrue();
                      setIsEdit(false);
                      setSelectedSubject(null);
                    }
              }
            >
              Allocate Subject
            </Button>
          </Box>
          {/* Subject table displayed when class is selected */}

          <SubjectTable
            addSubjectDialog={addSubjectDialog}
            data={subjectTableData}
            editData={selectedSubject}
            setEditData={setSelectedSubject}
            subjectTableData={subjectTableData}
            onView={handleViewSubject}
            onEdit={(row: ISubjectFormValues) => {
              setSelectedSubject(row);
              setIsEdit(true);
              addSubjectDialog.onTrue();
            }}
            onDelete={(row: ISubjectFormValues) => {
              setSelectedSubject(row);
              deleteConfirmDialog.onTrue();
            }}
            onToggleStatus={handleStatusChange}
          />
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirmDialog.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure you want to Delete Subject ?"
        action={
          <Button
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              handleDelete();
            }}
          >
            Yes
          </Button>
        }
      />

      {/* Publish confirmation dialog */}
      <ConfirmDialog
        open={confirmPublishDialog.value}
        onClose={() => {
          confirmPublishDialog.onFalse();
          setSelectedSubject(null);
        }}
        title="Publish"
        content="Are you sure want to Publish Subject ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              confirmStatusChange();
            }}
          >
            Publish
          </Button>
        }
      />

      {/* View subject details dialog */}
      <CustomDialog
        title={selectedSubject?.subjectName}
        open={showSubjectDialog.value}
        handleClose={() => {
          showSubjectDialog.onFalse();
          setSelectedSubject(null);
        }}
        maxWidth="md"
      >
        <ViewSubject subject={selectedSubject} />
      </CustomDialog>
    </Box>
  );
};

export default Subject;
