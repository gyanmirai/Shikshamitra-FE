'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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
  const [filteredData, setFilteredData] = useState<ISubjectFormValues[]>([]);

  // Query hook to fetch class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // URL search parameter state for form visibility
  const addSubjectDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteConfirmDialog = useBoolean();
  // Dialog control for publish/unpublish confirmation
  const confirmPublishDialog = useBoolean();
  // Dialog control for viewing subject details
  const showSubjectDialog = useBoolean();
  // State to store selected class value
  const [classes, setClasses] = useState('');

  // State for managing selected subject and edit mode
  const [selectedSubject, setSelectedSubject] = useState<ISubjectFormValues | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
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
  // Define breadcrumb navigation links based on whether form is active
  const links = addSubjectDialog.value
    ? [
        // Links when form is open
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Curriculum' },
        { name: 'Subject' },
        { name: 'Subject Form' },
      ]
    : [
        // Links when viewing subject list
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Curriculum' },
        { name: 'Subject' },
      ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      <CustomBreadcrumbs
        heading="Subject"
        description={
          addSubjectDialog.value
            ? 'Create or update subject details, including the name, code, and associated curriculum. Manage subjects efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize your academic subjects efficiently. View the list of subjects, add new subjects, update existing ones, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={addSubjectDialog.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
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
            {addSubjectDialog.value ? 'Back' : 'Subject'}
          </Button>
        }
      />
      {/* Conditional rendering based on form state */}
      {addSubjectDialog.value ? (
        <>
          {/* Subject form card for creating/editing subjects */}
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <SubjectForm onClose={handleClose} data={selectedSubject} isEdit={isEdit} />{' '}
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
              isLoading={isLoading}
              options={classData?.items || []}
              valueKey="id"
              labelKey="name"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              value={classes}
              onChange={(value) => {
                setClasses(value as string);
              }}
            />
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
        content="Are you sure want to Delete Subject ?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete();
            }}
          >
            Delete
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
        title="Confirm Publication"
        content="Are you sure want to Publish Subject ?"
        action={
          <Button
            variant="contained"
            color="error"
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
        title="Subject Details"
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
