import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import homeworkTableData from 'src/json/academic/homeworkAssignment/homework-table-data.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import HomeworkForm from './homeworkForm';
import HomeworkTable from './homeworkTable';
import ViewHomeworkDetails from './viewHomeworkDetails';
import { StudentSubmissions } from '../studentSubmission/homeworkStudentSubmission';

import type { IHomework, IHomeworkDetail } from '../type';

const HomeworkCreation = ({ addHomeworkDialog }: any) => {
  // Dialog state for adding disciplinary incidents
  // const addHomeworkDialog = useBoolean();
  // Dialog state for deleting homework assignments
  const deleteHomeworkDialog = useBoolean();
  // Dialog state for publishing homework assignments
  const publishHomeworkDialog = useBoolean();
  // Dialog state for viewing homework assignment details
  const viewHomeworkDetailDialog = useBoolean();
  // Dialog state for viewing homework submissions from students
  const viewHomeworkSubmissionDialog = useBoolean();
  // State to store all organizations/stages from the selected medium
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

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClass(allClasses[0]?.name || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.name === classes)?.divisions?.[0]?.name || '');
  }, [allClass, classes]);

  // Controls form visibility
  const [open, setOpen] = useState(false);
  // Breadcrumb navigation links based on form state
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to track the currently selected homework assignment for editing
  const [selectedHomework, setSelectedHomework] = useState<IHomework | null>(null);
  const [viewHomework, setViewHomework] = useState<IHomeworkDetail | null>(null);

  // State to store the list of homework/subject assignments
  const [homeworkData, setHomeworkData] = useState<IHomework[]>(homeworkTableData);
  // Redux dispatch
  const dispatch = useDispatch();

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setOpen(false);
        setSelectedHomework(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust delay as per your Dialog transition timing
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addHomeworkDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addHomeworkDialog.onFalse();
      resetState();
    }
  };

  return (
    <>
      <Box
        display="flex"
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 1,
          mb: 2,
          p: 1,
          gap: 2,
        }}
      >
        {' '}
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="name"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="name"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
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
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!division}
        />
        <DatePicker
          label="Homework Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          name="date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
          sx={{ maxWidth: '250px' }}
        />
      </Box>

      <CustomDialog
        open={addHomeworkDialog.value}
        handleClose={() => {
          addHomeworkDialog.onFalse();
          setTimeout(() => {
            setSelectedHomework(null);
          }, 200); // Delay should match your dialog transition (usually 200–300ms)
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedHomework ? 'Update Homework' : 'Add Homework'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedHomework
                  ? 'You can update the homework details including title, description and other information'
                  : 'You can create a new homework by entering the title, description and other required details'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <HomeworkForm
          classes={classes}
          subject={subject}
          dialog={addHomeworkDialog}
          onClose={handleClose}
          editData={selectedHomework}
        />
      </CustomDialog>

      <HomeworkTable
        homeworkData={homeworkData || []}
        selectedDivision={division}
        setOpen={setOpen}
        dialog={addHomeworkDialog}
        handleSwitchChange={(row) => {
          setSelectedHomework(row);
          publishHomeworkDialog.onTrue();
        }}
        onEditDetails={(row) => {
          setSelectedHomework(row);
          addHomeworkDialog.onTrue();
          setOpen(true);
        }}
        onDeleteDetails={(row) => {
          setSelectedHomework(row);
          deleteHomeworkDialog.onTrue();
        }}
        onViewDetails={(row) => {
          viewHomeworkDetailDialog.onTrue();
          setSelectedHomework(row);
        }}
        onViewSubmission={(row) => {
          viewHomeworkSubmissionDialog.onTrue();
          setViewHomework(row);
        }}
      />

      <ConfirmDialog
        open={deleteHomeworkDialog.value}
        onClose={() => {
          setSelectedHomework(null);
          deleteHomeworkDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to Delete Homework <strong>{selectedHomework?.title}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            color="error"
            onClick={() => {
              deleteHomeworkDialog.onFalse();
              shikshaMitraToast.success({
                message: `Homework Deleted successfully for ${selectedHomework?.subject}!`,
              });
            }}
            size="small"
          >
            Yes
          </Button>
        }
      />

      <ConfirmDialog
        open={publishHomeworkDialog.value}
        onClose={() => {
          publishHomeworkDialog.onFalse();
          setSelectedHomework(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to Publish Homework <strong>{selectedHomework?.title}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              publishHomeworkDialog.onFalse();
              shikshaMitraToast.success({
                message: `Homework Published successfully for ${selectedHomework?.subject}!`,
              });
            }}
            size="small"
          >
            Publish
          </Button>
        }
      />

      {/* View subject details dialog */}
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Homework Details</Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title="View complete details of the homework including title, description, due date, submission status and other information"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewHomeworkDetailDialog.value}
        handleClose={() => {
          viewHomeworkDetailDialog.onFalse();
          setSelectedHomework(null);
        }}
        maxWidth="md"
      >
        <ViewHomeworkDetails homework={selectedHomework} />
      </CustomDialog>

      <CustomDialog
        title={selectedHomework?.title || 'Homework Details'}
        open={viewHomeworkSubmissionDialog.value}
        handleClose={() => {
          viewHomeworkSubmissionDialog.onFalse();
          setSelectedHomework(null);
        }}
        maxWidth="lg"
      >
        <Box sx={{ p: 2 }}>
          <StudentSubmissions selectedHomework={selectedHomework} />
        </Box>
      </CustomDialog>
    </>
  );
};

export default HomeworkCreation;
