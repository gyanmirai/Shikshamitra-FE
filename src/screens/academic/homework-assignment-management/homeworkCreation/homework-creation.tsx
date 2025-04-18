'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { IColumn } from 'src/components/customizabaleTable/type';

import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Button,
  Switch,
  MenuList,
  MenuItem,
  Checkbox,
  Typography,
  ToggleButton,
  DialogActions,
  DialogContent,
  DialogContentText,
  ToggleButtonGroup,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AssignGrade from './component/assignGradeForm';
import HomeworkAssignmentCreationForm from './component/homeworkCreateDialog';

import type { IHomeworkAssignment, IStudentSubmissionsProps } from './type';
import type { TStudentGrade } from '../../gradebook-performance-tracking/gradebook/gradebook';

export const initialData: IHomeworkAssignment[] = [
  {
    class: '10',
    division: ['A'],
    title: 'Math Practice Problems',
    subjects: ['Mathematics'],
    description: 'Solve problems from Chapter 5 on Linear Equations.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    status: 'draft',
    chapters: ['Linear Equations'],
    homeworkType: 'Practice Questions',
    isDailyTask: true,
    parentAcknowledgement: true,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'Workbook Page 32-34',
    evaluationCriteria: '',
    rubric: '',
    rubricRequired: false,
    assignmentType: '',
    attachments: [],
    createdBy: '',
    endDate: dayjs('2024-12-10'),
    isScheduled: false,
    todaysDate: dayjs('2025-03-07'),
  },
  {
    class: '9',
    division: ['B'],
    title: 'Science Project',
    subjects: ['Science'],
    description: 'Prepare a working model of the solar system.',
    dueDate: dayjs('2024-12-15'),
    dueTime: dayjs('23:59'),
    submissionType: 'In-Person',
    status: 'publish',
    chapters: ['Solar System'],
    assignmentType: 'Project Work',
    isDailyTask: false,
    parentAcknowledgement: false,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'Chapter 7: The Solar System',
    evaluationCriteria: 'Model Design, Explanation, Creativity',
    rubric: 'Include all 8 planets with labels.',
    rubricRequired: true,
    homeworkType: '',
    attachments: [],
    createdBy: '',
    isScheduled: false,
    todaysDate: dayjs('2025-03-07'),
  },
  {
    class: '8',
    division: ['C'],
    title: 'History Essay',
    subjects: ['History'],
    description: 'Write an essay on the causes and effects of World War II.',
    dueDate: dayjs('2024-12-20'),
    dueTime: dayjs('23:59'),
    submissionType: 'Online',
    status: 'draft',
    chapters: ['World War II'],
    assignmentType: 'Essay Writing',
    isDailyTask: false,
    parentAcknowledgement: true,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'History Textbook Chapter 10',
    evaluationCriteria: 'Content, Structure, Grammar, and Relevance',
    rubric: 'Include at least 3 major causes and their effects.',
    rubricRequired: true,
    homeworkType: '',
    attachments: [],
    createdBy: '',
    isScheduled: false,
    todaysDate: dayjs('2025-03-07'),
  },
  {
    class: '7',
    division: ['D'],
    title: 'Geography Map Work',
    subjects: ['Geography'],
    description: 'Mark and label the major rivers of India on the map.',
    dueDate: dayjs('2024-12-12'),
    dueTime: dayjs('18:00'),
    submissionType: 'In-Person',
    status: 'draft',
    chapters: ['Indian Rivers'],
    homeworkType: 'Map Work',
    isDailyTask: false,
    parentAcknowledgement: false,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'Map and Atlas',
    evaluationCriteria: '',
    rubric: '',
    rubricRequired: false,
    assignmentType: '',
    attachments: [],
    createdBy: '',
    isScheduled: false,
    todaysDate: dayjs('2025-03-07'),
  },
  {
    class: '6',
    division: ['E'],
    title: 'English Reading Task',
    subjects: ['English'],
    description: 'Read and summarize Chapter 3 of your textbook.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    status: 'publish',
    chapters: ['Reading Comprehension'],
    homeworkType: 'Summary Writing',
    isDailyTask: true,
    parentAcknowledgement: true,
    isRecurring: true,
    recurringFrequency: 'Weekly',
    assignedResources: 'Textbook Chapter 3',
    evaluationCriteria: '',
    rubric: '',
    rubricRequired: false,
    assignmentType: '',
    attachments: [],
    createdBy: '',
    endDate: null,
    isScheduled: false,
    todaysDate: dayjs('2025-03-07'),
  },
];

const HomeworkCreation = (props: TabComponentType) => {
  // View state for toggling between homework and assignment views
  const [view, setView] = useState('homework');
  // State for managing dialog/modal open/close
  const [open, setOpen] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // Selected class state
  const [classes, setClasses] = useState<string>('');
  // Selected subject state
  const [subject, setSubject] = useState<string>('');
  // Selected division state
  const [division, setDivision] = useState<string>('');
  // Date state for homework
  const [homeworkDate, setHomeworkDate] = useState<Dayjs | null>(null);
  // Date state for assignment
  const [assignmentDate, setAssignmentDate] = useState<Dayjs | null>(null);
  // Available division options for the selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  // const [publishStatus, setPublishStatus] = useState<{ [key: number]: boolean }>({});
  const dialog = useBoolean();
  // Dialog state for confirmation modal
  const confirmDialog = useBoolean();
  // Dialog state for submission modal
  const submissionDialog = useBoolean();

  // State to store and manage assignment data with initial mock data
  const [assignmentData, setAssignmentData] = useState<IHomeworkAssignment[]>(initialData);
  // State to track currently selected assignment for operations
  const [selectedAssignment, setSelectedAssignment] = useState<IHomeworkAssignment | null>(null);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setOpen(false);
    }
  };
  /**
   * Handles the status switch change for an assignment
   * If the assignment is in draft status, shows confirmation dialog before publishing
   * If the assignment is published, directly changes status back to draft
   * @param assignment - The assignment object to update
   */
  const handleSwitchChange = (assignment: IHomeworkAssignment) => {
    if (assignment.status === 'draft') {
      setSelectedAssignment(assignment);
      confirmDialog.onTrue();
    } else {
      const updatedAssignments = assignmentData.map((item) =>
        item.title === assignment.title ? { ...item, status: 'draft' } : item
      );
      setAssignmentData(updatedAssignments);
    }
  };

  /**
   * Handles the confirmation of status change for an assignment
   * Updates the status of the selected assignment to 'publish'
   * Resets the confirmation dialog and selected assignment state
   */
  const handleConfirmStatusChange = () => {
    if (selectedAssignment) {
      const updatedAssignments = assignmentData.map((item) =>
        item.title === selectedAssignment.title ? { ...item, status: 'publish' } : item
      );
      setAssignmentData(updatedAssignments);
    }
    confirmDialog.onFalse();
    setSelectedAssignment(null);
  };

  /**
   * Handles the submission of a new assignment
   * @param values - The assignment values from the form
   * @param status - The status of the assignment ('draft' or 'publish')
   * Updates the assignment data with new values including formatted dates
   * Closes the dialog after submission
   */
  const handleSubmit = (values: IHomeworkAssignment, status: 'draft' | 'publish') => {
    const updatedValues = {
      ...values,
      status,
      dueDate: values.dueDate ? dayjs(values.dueDate) : null,
      time: values.dueTime ? dayjs(`${values.dueDate} ${values.dueTime}`) : null,
    };
    setAssignmentData([...assignmentData, updatedValues]);
    dialog.onFalse();
  };

  /**
   * Handles the change of view in the UI
   * @param event - The mouse event that triggered the change
   * @param newView - The new view to be set
   * Only updates the view if a new value is provided
   */
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setView(newView);
      }
    },
    []
  );
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'publish' && (
            <MenuItem
              onClick={() => {
                // viewSubmissionDialog.onTrue();
              }}
            >
              {' '}
              <Iconify icon="mdi:upload" sx={{ height: '16px', width: '16px' }} />
              Submit
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    []
  );

  // Columns for Homework view

  const homeworkColumns: IColumn[] = [
    {
      id: 'title',
      label: 'Homework Title',
      minWidth: '200px',
      align: 'left',
      filterType: 'string',
    },
    {
      id: 'homeworkType',
      label: 'Homework Type',
      minWidth: '200px',
      align: 'left',
      filterType: 'string',
    },
    {
      id: 'todaysDate',
      label: 'Creation Date',
      minWidth: '200px',
      align: 'left',
      filterType: 'date',
      render: (value) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: '200px',
      align: 'left',
      filterType: 'date',
      render: (value) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueTime',
      label: 'Due Time',
      minWidth: '200px',
      align: 'left',
      filterType: 'date',
      render: (value) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('HH:MM') : '-'}
        </Typography>
      ),
    },
    {
      id: 'submissionType',
      label: 'Submission Type',
      minWidth: '200px',
      align: 'left',
      filterType: 'string',
    },
    {
      id: 'status',
      label: 'Publish',
      minWidth: '200px',
      align: 'left',
      filterType: 'enum',
      enumOptions: PublishUnpublishStatusOptions,
      render: (value: PublishUnpublishStatusType, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            size="small"
            checked={value === PublishUnpublishStatusType.Publish}
            onChange={() => handleSwitchChange(row as IHomeworkAssignment)}
          />
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      isSort: false,
      isFilter: false,
      sticky: true,
      minWidth: 100,
      align: 'left',
      render: (value, row) => (
        <ThreeDotsActions
          placement="right-top"
          showViewIcon
          showEditIcon
          showThreeDots={false}
          handleEditClick={() => {}}
          handleViewClick={() => {
            submissionDialog.onTrue();
          }}
        />
      ),
    },
  ];
  // Columns for Assignment view
  const assignmentColumns: IColumn[] = [
    {
      id: 'title',
      label: 'Assignment Title',
      minWidth: '200px',
      align: 'left',
      filterType: 'string',
    },
    {
      id: 'assignmentType',
      label: 'Assignment Type',
      minWidth: '200px',
      align: 'left',
      filterType: 'string',
    },
    {
      id: 'todaysDate',
      label: 'Creation Date',
      minWidth: '200px',
      align: 'left',
      filterType: 'date',
      render: (value, row) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: '200px',
      align: 'left',
      filterType: 'date',
      render: (value, row) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'dueTime',
      label: 'Due Time',
      minWidth: '200px',
      align: 'left',
      filterType: 'date',
      render: (value, row) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('HH:MM') : '-'}
        </Typography>
      ),
    },
    {
      id: 'submissionType',
      label: 'Submission Type',
      minWidth: '200px',
      align: 'left',
      filterType: 'string',
    },
    {
      id: 'status',
      label: 'Publish',
      minWidth: '200px',
      align: 'left',
      filterType: 'enum',
      enumOptions: PublishUnpublishStatusOptions,
      render: (value: PublishUnpublishStatusType, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            size="small"
            checked={value === PublishUnpublishStatusType.Publish}
            onChange={() => handleSwitchChange(row as IHomeworkAssignment)}
          />
        </Box>
      ),
    },
    {
      id: 'rubric',
      label: 'View Rubric',
      minWidth: '200px',
      align: 'left',
      render: (value, row) => <Iconify icon="mdi:eye" width="16px" height="16px" sx={{ ml: 7 }} />,
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 100,
      sticky: true,
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (value, row) => (
        <ThreeDotsActions
          actions={(prop) => actions({ ...prop, row })}
          placement="right-top"
          showViewIcon
          showEditIcon
          handleEditClick={() => {}}
          handleViewClick={() => {
            submissionDialog.onTrue();
          }}
        />
      ),
    },
  ];

  // Filter data based on view
  const filteredData =
    view === 'homework'
      ? assignmentData.filter((assignment) => assignment.homeworkType)
      : assignmentData.filter((assignment) => assignment.assignmentType);

  // Define navigation links based on form state and view type
  const links = open
    ? [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Homework And Assignment', href: 'academic/homeworkDashboard' },
        { name: view === 'homework' ? 'Homework Form' : 'Assignment Form' },
      ]
    : [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Homework And Assignment', href: 'academic/homeworkDashboard' },
        { name: view === 'homework' ? 'Homework Creation' : 'Assignment Creation' },
      ];

  // Description text for homework section based on form state
  const homeworkDesc = open
    ? 'Create a new homework by providing details such as title, description, submission date, and attachments.'
    : 'View all created homework assignments with complete details, including title, description, submission date, and attached files.';

  // Description text for assignment section based on form state
  const assignmentDesc = open
    ? 'Create a new assignment by specifying the title, detailed description, deadline, and any relevant attachments.'
    : 'View all created assignments with comprehensive details, including title, description, deadline, and attached files.';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={view === 'homework' ? 'Homework Creation' : 'Assignment Creation'}
        description={view === 'homework' ? homeworkDesc : assignmentDesc}
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          open ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => handleClose(null, false)}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => {
                dialog.onTrue();
                setOpen(true);
              }}
            >
              {view === 'homework' ? 'Homework' : 'Assignment'}
            </Button>
          )
        }
      />
      {!open && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={handleChangeView}
            sx={{
              '& .Mui-selected': {
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'black',
                },
              },
            }}
          >
            <ToggleButton value="homework">
              <Iconify icon="mdi:book-open-page-variant" mr={1} />
              <Typography variant="subtitle2">Homework</Typography>
            </ToggleButton>
            <ToggleButton value="assignment">
              <Iconify icon="mdi:assignment" mr={1} />
              <Typography variant="subtitle2">Assignment</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {!open && (
        <>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 2 }}>
            <CustomSelect
              label="Class"
              name="class"
              isLoading={isLoading}
              options={classData?.items || []}
              valueKey="id"
              labelKey="name"
              formControlProps={{ sx: { width: '150px' } }}
              value={classes}
              onChange={(value) => {
                const selectedClass: Standards = classData.items.find(
                  (i: Standards) => i.id === value
                );
                setClasses(value as string);
                setDivisionOptions(selectedClass?.divisions || []);
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
                sx: { width: '100%', maxWidth: '150px' },
              }}
            />
            <CustomSelect
              label="Subject"
              disabled={!division}
              options={[]}
              value={subject}
              onChange={(val) => {
                setSubject(val as string);
              }}
              formControlProps={{
                sx: { width: '100%', maxWidth: '150px' },
              }}
            />
            {view === 'homework' ? (
              <DatePicker
                label="Homework Date"
                name="homeworkDate"
                value={homeworkDate}
                format="DD/MM/YYYY"
                onChange={(val) => {
                  setHomeworkDate(val);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            ) : (
              <DatePicker
                label="Assignment Date"
                name="assignmentDate"
                value={assignmentDate}
                format="DD/MM/YYYY"
                onChange={(val) => {
                  setAssignmentDate(val);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            )}
          </Box>
          <CustomizableTable
            tableId="homework-assignment-management"
            searchFieldProps={{
              placeholder: 'Search by Title, Type , Creation Date...',
              label: 'Search by Title, Type, Creation Date...',
            }}
            noDataText={
              <>
                {view === 'homework' ? 'No Homework Created' : 'No Assignment Created'}
                <Box
                  onClick={() => {
                    dialog.onTrue();
                    setOpen(true);
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {view === 'homework' ? 'Create Homework' : 'Create Assignment'}
                </Box>
              </>
            }
            columns={view === 'homework' ? homeworkColumns : assignmentColumns}
            data={filteredData}
          />
        </>
      )}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <HomeworkAssignmentCreationForm
            onClose={handleClose}
            onsubmit={handleSubmit}
            view={view}
          />
        </Card>
      )}

      <CustomDialog
        title="Confirm Publication"
        open={confirmDialog.value}
        handleClose={confirmDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to publish Assignment ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="View Student Submission"
        open={submissionDialog.value}
        handleClose={submissionDialog.onFalse}
        maxWidth="md"
      >
        <StudentSubmissions />
      </CustomDialog>
    </Box>
  );
};

export default HomeworkCreation;

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedStudents,
  handleBulkUpdate,
  tableData,
  setTableData,
}) => {
  // State to track the currently selected student for individual grading
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>();

  // Dialog control for sending instant notifications
  const sendInstantNotificationDialogValue = useBoolean();
  // Dialog control for single student grade assignment
  const dialog = useBoolean();

  // Dialog control for viewing student submission details
  const viewSubmissionDialog = useBoolean();

  /**
   * Handles assigning grade and feedback to a single selected student
   * @param values Object containing the grade and feedback to assign
   */
  const handleSingleGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData?.((prevData) =>
      prevData.map((student) =>
        student.id === selectedStudent?.id
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    dialog.onFalse();
    setSelectedStudent(null);
  };

  /**
   * Handles closing the view submission dialog and resetting the selected student
   */
  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewSubmissionDialog.onFalse();
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'Submitted' && (
            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow" sx={{ height: '16px', width: '16px' }} />
              Assign Grade
            </MenuItem>
          )}
          {(row.status === 'Pending' || row.status === 'Overdue') && (
            <MenuItem onClick={() => {}}>
              {' '}
              <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
              Send Reminder
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewSubmissionDialog]
  );

  /**
   * Handler for sending notifications
   * Opens the instant notification dialog if it's not already open
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents?.length !== 0}
        tableId="student-submissions"
        searchFieldProps={{
          placeholder: 'Search by Student Name, Assignments, Subject, Submission Date...',
          label: 'Search by Student Name, Assignments, Subject, Submission Date...',
        }}
        noDataText={<>No Submission Data Found Select Above Dropdown Data </>}
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={!!tableData?.length && selectedStudents?.length === tableData?.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleBulkUpdate?.(tableData || []);
                    } else {
                      handleBulkUpdate?.([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              return (
                <Checkbox
                  checked={!!selectedStudents?.some((i: TStudentGrade) => i.id === row.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleBulkUpdate?.([...(selectedStudents || []), row as TStudentGrade]);
                    } else {
                      handleBulkUpdate?.(
                        (selectedStudents || []).filter((i: any) => i.id !== row.id)
                      );
                    }
                  }}
                />
              );
            },
          },
          { id: 'studentName', label: 'Student Name', minWidth: '180px', align: 'left' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'subject', label: 'Subject' },
          {
            id: 'submissionDate',
            label: 'Submission Date',
            minWidth: '180px',
            align: 'left',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'grade',
            label: 'Grade',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          {
            id: 'feedback',
            label: 'Feedback',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          { id: 'weightedAverage', label: 'Weighted Average', minWidth: '180px', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            render: (value, row) => (
              <Label
                color={
                  value === 'Submitted'
                    ? 'primary'
                    : value === 'Pending'
                      ? 'warning'
                      : value === 'Overdue'
                        ? 'error'
                        : 'default'
                }
              >
                {value}
              </Label>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            minWidth: 100,
            isSort: false,
            isFilter: false,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    // viewSubmissionDialog.onTrue();
                    // setSelectedStudent(row);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={handleCloseDialog}
        title="Assign Grade"
        maxWidth="md"
      >
        <AssignGrade data={selectedStudent} onSubmit={handleSingleGradeAssignment} />
      </CustomDialog>
    </Box>
  );
};
