'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Card, Button, DialogActions, DialogContent, DialogContentText } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import subjectData from 'src/json/academic/curriculum/subjectTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectTable from './component/subjectTable';
import SubjectForm from './component/subjectFormComponent';
import { ViewSubject } from './component/viewSubjectComponent';

import type { ISubject } from './component/type';

const Subject = (props: TabComponentType) => {
  // State to manage subject table data and filtered data
  const [subjectTableData, setSubjectTableData] = useState<ISubject[]>(subjectData);
  const [filteredData, setFilteredData] = useState<ISubject[]>([]);

  // Query hook to fetch class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // URL search parameter state for form visibility
  const addSubjectDialog = useBoolean();
  // Dialog control states using boolean hooks
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();
  const addBulkDialog = useBoolean();
  const [classes, setClasses] = useState('');

  // State for managing selected subject and edit mode
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // State to track pending status changes for subjects
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  // Filter and update subject data based on selected class
  useEffect(() => {
    if (classData?.items?.length) {
      // Set default class if none selected
      if (!classes) {
        const firstClass = classData.items[0];
        setClasses(firstClass?.id);
      }
      // Find selected class and filter subjects
      const selectedClass = classData.items.find((c: any) => c.id === classes);
      if (selectedClass) {
        const filtered = subjectTableData.filter((item) => item.className === selectedClass?.name);
        setFilteredData(filtered);
      }
    }
  }, [classData, subjectTableData, classes]);

  // Handle subject status toggle between Publish/Unpublish
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  // Handle form submission for creating/updating subjects
  const handleSubmit = (values: ISubject) => {
    if (isEdit) {
      // Update existing subject
      setSubjectTableData(
        subjectTableData.map((subject) => (subject.id === values.id ? values : subject))
      );
    } else {
      // Add new subject
      setSubjectTableData([...subjectTableData, values]);
    }
    addSubjectDialog.onFalse();
    setIsEdit(false);
    setSelectedSubject(null);
  };

  // Open dialog to view subject details
  const handleViewSubject = (subject: ISubject) => {
    setSelectedSubject(subject);
    showSubjectDialog.onTrue();
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
        { name: 'Curriculum', href: '/academic/curriculum-management' },
        { name: 'Subject' },
        { name: 'Subject Form' },
      ]
    : [
        // Links when viewing subject list
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Curriculum', href: '/academic/curriculum-management' },
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
                ? handleCloseDialog
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
            <SubjectForm
              onSubmit={handleSubmit}
              onClose={handleCloseDialog}
              data={selectedSubject}
              isEdit={isEdit}
            />{' '}
          </Card>
        </>
      ) : (
        <>
          {/* Class selection dropdown */}
          <CustomSelect
            label="Class"
            name="class"
            isLoading={isLoading}
            options={classData?.items || []}
            valueKey="id"
            labelKey="name"
            formControlProps={{ sx: { width: '150px', mb: 2 } }}
            value={classes}
            onChange={(value) => {
              setClasses(value as string);
            }}
          />
          {/* Subject table displayed when class is selected */}
          {classes && (
            <SubjectTable
              addSubjectDialog={addSubjectDialog}
              data={filteredData}
              editData={selectedSubject}
              setEditData={setSelectedSubject}
              subjectTableData={subjectTableData}
              onView={handleViewSubject}
              onEdit={(row: ISubject) => {
                setSelectedSubject(row);
                setIsEdit(true);
                addSubjectDialog.onTrue();
              }}
              onDelete={(row: ISubject) => {
                setSelectedSubject(row);
                deleteConfirmDialog.onTrue();
              }}
              onToggleStatus={handleStatusChange}
            />
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirmDialog.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure want to delete?"
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
      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Subject?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      {/* View subject details dialog */}
      <CustomDialog
        title="Subject Details"
        open={showSubjectDialog.value}
        handleClose={() => {
          showSubjectDialog.onFalse();
          setSelectedSubject(null);
        }}
        maxWidth="sm"
      >
        <ViewSubject subject={selectedSubject} />
      </CustomDialog>
    </Box>
  );
};

export default Subject;
