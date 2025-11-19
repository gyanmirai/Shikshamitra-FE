'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Button, MenuList, MenuItem } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import assessmnentData from 'src/json/academic/examination/assessmentData.json';

import AddNewAssessment from './assessmentForm';
import StudentSubmissions from './studentSubmission';
import AssessmentManagementTable from './assessmentManagementTable';

import type { IAssessment } from './type';

const AssessmentManagement = (props: TabComponentType) => {
  // Store assessment data array
  const [assessmentData, setAssessmentData] = useState<IAssessment[]>(assessmnentData);
  // Search parameters from props
  const { searchParams, setSearchParams } = props;
  // Currently selected assessment for editing/viewing
  const [selectedAssessment, setSelectedAssessment] = useState<IAssessment | null>(null);
  // Flag to determine if in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Selected class ID from search params
  const classes = searchParams?.classId ? searchParams?.classId : '';

  const [open, setOpen] = useState(false);

  // Dialog state for submission view
  const submissionDialog = useBoolean();
  // Dialog state for publish confirmation
  const confirmPublishDialog = useBoolean();

  // Selected division ID
  const [division, setDivision] = useState('');
  // Available division options for selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // Query hook for fetching class data
  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const deleteDialog = useBoolean();

  // Temporary storage for pending status changes
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string;
    value: boolean;
  } | null>(null);

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData?.items, classes, setSearchParams]);

  // Function to handle closing of dialog/modal
  // Resets form state, edit mode, selected assessment and closes all dialogs
  const handleCloseDialog = () => {
    setOpen(false); // Close the dialog/modal
    setIsEdit(false); // Disable edit mode
    setSelectedAssessment(null); // Clear selected assessment
    confirmPublishDialog.onFalse(); // Close publish confirmation dialog
    submissionDialog.onFalse(); // Close submission dialog
    deleteDialog.onFalse(); // Close delete confirmation dialog
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedAssessment(null);
    } else if (!isChanges) {
      setOpen(false);
      setSelectedAssessment(null);
    }
  };
  /**
   * Handles form submission for assessment data
   * @param values - Assessment form values to be submitted
   */
  const handleSubmit = (values: IAssessment) => {
    if (isEdit) {
      // Update existing assessment if in edit mode
      setAssessmentData((prevSubject) =>
        assessmentData.map((assessment) => (assessment.id === values.id ? values : assessment))
      );
    } else {
      // Add new assessment if not in edit mode
      setAssessmentData([...assessmentData, values]);
    }
    handleCloseDialog();
  };

  /**
   * Confirms and applies a pending status change for an assessment
   * Updates the assessment data by setting the publish status to the new value
   * Closes the confirmation dialog and resets the pending change
   */
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, value } = pendingStatusChange;
      setAssessmentData((prevSubject) =>
        prevSubject.map((assessment) =>
          assessment.id === id ? { ...assessment, publish: value } : assessment
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  /**
   * Deletes an assessment from the assessment data by filtering out the item with matching id
   * @param id - The unique identifier of the assessment to delete
   */
  const handleDelete = (id: string | undefined) => {
    setAssessmentData((prevData) => prevData.filter((item) => item.id !== id));
    handleCloseDialog();
  };

  const links = open
    ? [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Assessment' },
        { name: 'Assessment Form' },
      ]
    : [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Assessment' },
      ];

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {(row.status === 'Pending' || row.status === 'Under Review') && (
          <MenuItem onClick={() => submissionDialog.onTrue()}>
            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
            Enter Marks
          </MenuItem>
        )}
        {row.status === 'Completed' && (
          <MenuItem onClick={() => {}}>
            <Iconify icon="material-symbols:upload" sx={{ height: '16px', width: '16px' }} />
            Publish Result
          </MenuItem>
        )}
      </MenuList>
    ),
    [submissionDialog]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={2}>
      <CustomBreadcrumbs
        heading="Assessment"
        description={
          open
            ? 'Create or update exam details, including the exam title, date, duration, and assigned subjects. Easily manage exam schedules and make adjustments as needed.'
            : 'Manage all scheduled exams with complete details—subjects, timings. Add, edit, or delete exams as required.'
        }
        links={links}
        sx={{ mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => handleClose(null, false)
                : () => {
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Assessment'}
          </Button>
        }
      />
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddNewAssessment
            onClose={handleClose}
            data={selectedAssessment}
            onSubmit={handleSubmit}
            isEdit={isEdit}
          />
        </Card>
      ) : (
        <>
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Box display="flex" gap={2}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  setSearchParams?.({
                    classId: val as string,
                  });
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                value={classes}
                formControlProps={{
                  sx: { width: '100%', minWidth: '180px' },
                }}
              />
              <CustomSelect
                label="Division"
                disabled={!classes}
                labelKey="name"
                valueKey="id"
                options={divisionOptions}
                value={division}
                onChange={(val) => {
                  setDivision(val as string);
                }}
                formControlProps={{
                  sx: { width: '100%', minWidth: '180px' },
                }}
              />
            </Box>
          </Box>
          <AssessmentManagementTable
            openDialog={open}
            setOpenDialog={setOpen}
            editData={selectedAssessment}
            setEditData={setSelectedAssessment}
            actions={(prop) => actions({ ...prop, row: prop.row }) as any}
            data={assessmentData}
            onEdit={(assessment) => {
              setOpen(true);
              setIsEdit(true);
              setSelectedAssessment(assessment);
            }}
            onDelete={(assessment) => {
              deleteDialog.onTrue();
              setSelectedAssessment(assessment);
            }}
            onTogglePublish={(id, value) => {
              setPendingStatusChange({ id, value });
              confirmPublishDialog.onTrue();
            }}
          />
        </>
      )}

      <CustomDialog
        title="View Student Submission"
        open={submissionDialog.value}
        handleClose={submissionDialog.onFalse}
        maxWidth="md"
      >
        <StudentSubmissions />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(selectedAssessment?.id);
            }}
          >
            Yes
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmPublishDialog.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure want to publish?"
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
    </Box>
  );
};

export default AssessmentManagement;
