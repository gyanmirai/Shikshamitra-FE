import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import assignmentTableData from 'src/json/academic/homeworkAssignment/assignment-table-data.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import AssignmentForm from './components/assignmentForm';
import AssignmentTable from './components/assignmentTable';
import ViewAssignmentDetails from './assignmentDetail/assignmentDetail';
import { StudentSubmissions } from './studentSubmission/studentSubmission';

import type { IAssignment } from './type';

const AssignmentCreation = (props: TabComponentType) => {
  // Dialog state for add/edit assignment form
  const addAssignmentDialog = useBoolean();
  // Dialog state for delete assignment confirmation
  const deleteAssignmentDialog = useBoolean();
  // Dialog state for publish assignment confirmation
  const publishAssignmentDialog = useBoolean();
  // Dialog state for viewing student assignment submissions
  const viewAssignmentSubmissionDialog = useBoolean();
  // Dialog state for viewing assignment details
  const viewAssignmentDetails = useBoolean();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to store currently selected assignment for edit/delete/publish
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignment | null>(null);
  // State to store list of all assignments
  const [assignmentData, setAssignmentData] = useState<IAssignment[]>(assignmentTableData);
  // Redux dispatch function
  const dispatch = useDispatch();
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [subject, setSubject] = useState('');
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // State to store and update the selected date using dayjs
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);
  console.log('medium ----', medium);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClass(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  /**
   * Handles dialog close with confirmation if there are unsaved changes
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      setSelectedAssignment(null);
      addAssignmentDialog.onFalse();
    } else if (!isChanges) {
      setSelectedAssignment(null);
      addAssignmentDialog.onFalse();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" gap={2} justifyContent="space-between" mb={2}>
        <Box display="flex" gap={2}>
          <CustomSelect
            options={allClass}
            label="Class"
            value={classes}
            onChange={(val) => setClass(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
          />
          <CustomSelect
            options={allDivision}
            label="Division"
            value={division}
            onChange={(val) => setDivision(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            disabled={!classes}
          />
          <CustomSelect
            options={[
              { id: '1', name: 'Mathematics' },
              { id: '2', name: 'Science' },
              { id: '3', name: 'English' },
              { id: '4', name: 'History' },
              { id: '5', name: 'Geography' },
              { id: '6', name: 'Physics' },
              { id: '7', name: 'Chemistry' },
              { id: '8', name: 'Biology' },
            ]}
            label="Subject"
            value={subject}
            onChange={(val) => setSubject(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            disabled={!division}
          />
          <DatePicker
            label="Assignment Date"
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            name="date"
            value={date}
            onChange={(val) => {
              setDate(val);
            }}
            format="DD/MM/YYYY"
            sx={{ minWidth: '250px' }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={addAssignmentDialog.onTrue}
            startIcon={<Add />}
            size="small"
            disabled={!date || dayjs(date).isBefore(dayjs().startOf('day'))}
          >
            Assignment
          </Button>
        </Box>
      </Box>

      <CustomDialog
        open={addAssignmentDialog.value}
        handleClose={() => {
          addAssignmentDialog.onFalse();
          setSelectedAssignment(null);
        }}
        title={selectedAssignment ? 'Edit Assignment' : 'Add Assignment'}
        maxWidth="md"
      >
        <AssignmentForm
          classes={classes}
          dialog={addAssignmentDialog}
          onClose={() => {
            handleClose(null, false);
          }}
          editData={selectedAssignment}
        />
      </CustomDialog>

      <AssignmentTable
        data={assignmentData || []}
        dialog={addAssignmentDialog}
        onSwitchToggle={(row) => {
          setSelectedAssignment(row);
          publishAssignmentDialog.onTrue();
        }}
        onEdit={(row) => {
          setSelectedAssignment(row);
          addAssignmentDialog.onTrue();
        }}
        onDelete={(row) => {
          setSelectedAssignment(row);
          deleteAssignmentDialog.onTrue();
        }}
        onView={(row) => {
          viewAssignmentDetails.onTrue();
          setSelectedAssignment(row);
        }}
        onViewSubmission={(row) => {
          viewAssignmentSubmissionDialog.onTrue();
          setSelectedAssignment(row);
        }}
      />

      <ConfirmDialog
        open={deleteAssignmentDialog.value}
        onClose={() => {
          setSelectedAssignment(null);
          deleteAssignmentDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure want to Delete Assignment ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            color="error"
            onClick={() => {}}
          >
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={publishAssignmentDialog.value}
        onClose={() => {
          publishAssignmentDialog.onFalse();
          setSelectedAssignment(null);
        }}
        title="Publish"
        content="Are you sure want to Publish Assignment ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {}}
          >
            Publish
          </Button>
        }
      />

      <CustomDialog
        title={selectedAssignment?.title || 'Assignment Submission'}
        open={viewAssignmentSubmissionDialog.value}
        handleClose={() => {
          viewAssignmentSubmissionDialog.onFalse();
          setSelectedAssignment(null);
        }}
        maxWidth="md"
      >
        <Box sx={{ p: 2 }}>
          <StudentSubmissions selectedAssignment={selectedAssignment} />
        </Box>
      </CustomDialog>

      <CustomDialog
        title={selectedAssignment?.title || 'Assignment Details'}
        open={viewAssignmentDetails.value}
        handleClose={() => {
          viewAssignmentDetails.onFalse();
          setSelectedAssignment(null);
        }}
        maxWidth="md"
      >
        <ViewAssignmentDetails assignment={selectedAssignment} />
      </CustomDialog>
    </Box>
  );
};

export default AssignmentCreation;
