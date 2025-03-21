'use client';

import type { Dayjs } from 'dayjs';
import type { Division, Standards } from 'src/types/school';
import type { Column } from 'src/components/customizabaleTable';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { PDFViewer } from '@react-pdf/renderer';
import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Button,
  Switch,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
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
import { CertificateDocument } from 'src/templates/student-certificates/bonofied-certificate-1';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkAssignmentCreationForm from './component/homeworkCreateDialog';
import { dummyData } from '../../gradebook-performance-tracking/gradebook/gradebook';

import type { StudentGrade } from '../../gradebook-performance-tracking/gradebook/gradebook';

export interface Assignment {
  title: string;
  description: string;
  class: string;
  division: string[];
  subjects: string[];
  submissionType: string;
  dueDate: Dayjs | null;
  dueTime: Dayjs | null;
  attachments: File[];
  createdBy: string;
  status: string;
  // Homework-Specific Fields
  chapters?: string[];
  homeworkType?: string;
  isDailyTask?: boolean;
  parentAcknowledgement?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: string;
  todaysDate?: Dayjs | null;
  dayOfSubmission?: string;
  endDate?: Dayjs | null;
  scheduleDate?: Dayjs | null;
  // Assignment-Specific Fields
  assignmentType?: string;
  evaluationCriteria?: string;
  assignedResources?: string;
  rubricRequired?: boolean;
  rubric?: string;
  isScheduled: boolean;
}

export const initialData: Assignment[] = [
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
  const [view, setView] = useState('homework');
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [homeworkDate, setHomeworkDate] = useState<Dayjs | null>(null);
  const [assignmentDate, setAssignmentDate] = useState<Dayjs | null>(null);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  // const [publishStatus, setPublishStatus] = useState<{ [key: number]: boolean }>({});
  const dialog = useBoolean();
  const confirmDialog = useBoolean();
  const submissionDialog = useBoolean();

  const [assignmentData, setAssignmentData] = useState<Assignment[]>(initialData);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const handleSwitchChange = (assignment: Assignment) => {
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

  const handleSubmit = (values: Assignment, status: 'draft' | 'publish') => {
    const updatedValues = {
      ...values,
      status,
      dueDate: values.dueDate ? dayjs(values.dueDate) : null,
      time: values.dueTime ? dayjs(`${values.dueDate} ${values.dueTime}`) : null,
    };
    setAssignmentData([...assignmentData, updatedValues]);
    dialog.onFalse();
  };

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

  const homeworkColumns: Column[] = [
    {
      id: 'title',
      label: 'Homework Title',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'homeworkType',
      label: 'Homework Type',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'todaysDate',
      label: 'Creation Date',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
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
      render: (value: any, row: any) => (
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
      render: (value: any, row: any) => (
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
    },
    {
      id: 'status',
      label: 'Publish',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 8 }}>
          <Switch
            size="small"
            checked={row.status === 'publish'}
            onChange={() => handleSwitchChange(row as Assignment)}
            inputProps={{ 'aria-label': 'Toggle view' }}
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
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
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
  const assignmentColumns: Column[] = [
    {
      id: 'title',
      label: 'Assignment Title',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'assignmentType',
      label: 'Assignment Type',
      minWidth: '200px',
      align: 'left',
    },
    {
      id: 'todaysDate',
      label: 'Creation Date',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
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
      render: (value: any, row: any) => (
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
      render: (value: any, row: any) => (
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
    },
    {
      id: 'status',
      label: 'Publish',
      minWidth: '200px',
      align: 'left',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 8 }}>
          <Switch
            size="small"
            checked={row.status === 'publish'}
            onChange={() => handleSwitchChange(row as Assignment)}
            inputProps={{ 'aria-label': 'Toggle view' }}
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
      minWidth: '200px',
      sticky: true,
      align: 'left',
      isSort: false,
      isFilter: false,
      render: (value: any, row: any) => (
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

  return (
    <Box>
      <CustomBreadcrumbs
        heading={view === 'homework' ? 'Homework Creation' : 'Assignment Creation'}
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Homework And Assignment' },
          { name: view === 'homework' ? 'Homework Creation' : 'Assignment Creation' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          open ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => {
                dialog.onFalse();
                setOpen(false);
              }}
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
            columns={view === 'homework' ? homeworkColumns : assignmentColumns}
            data={filteredData}
          />
        </>
      )}

      {open && (
        <Card>
          <HomeworkAssignmentCreationForm onsubmit={handleSubmit} view={view} />
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

export const StudentSubmissions = () => {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [tableData, setTableData] = useState<StudentGrade[]>(dummyData);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const dialog = useBoolean();
  const viewSubmissionDialog = useBoolean();
  const bulkGradeDialog = useBoolean();

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleBulkGradeAssignment = (values: { grade: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        selectedStudents.includes(student.id) ? { ...student, grade: values.grade } : student
      )
    );
    bulkGradeDialog.onFalse();
    setSelectedStudents([]);
  };

  const handleSingleGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        student.id === selectedStudent?.id
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    dialog.onFalse();
    setSelectedStudent(null);
  };

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:pencil" />}
          disabled={selectedStudents.length === 0}
          onClick={bulkGradeDialog.onTrue}
        >
          Bulk Grade ({selectedStudents.length} selected)
        </Button>
      </Box>
      <CustomizableTable
        tableId="student-submissions"
        columns={[
          {
            id: 'select',
            label: 'Select',
            render: (value, row: any) => (
              <Checkbox
                checked={selectedStudents.includes(row.id)}
                onChange={() => handleSelectStudent(row.id)}
              />
            ),
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
        data={tableData}
      />

      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={handleCloseDialog}
        title="Assign Grade"
        maxWidth="md"
      >
        <AssignGrade data={selectedStudent} onSubmit={handleSingleGradeAssignment} />
      </CustomDialog>

      <CustomDialog
        open={bulkGradeDialog.value}
        handleClose={bulkGradeDialog.onFalse}
        title={`Assign Grade to ${selectedStudents.length} Students`}
        maxWidth="md"
      >
        <AssignGrade onSubmit={handleBulkGradeAssignment} />
      </CustomDialog>
    </Box>
  );
};

interface AssignGradeProps {
  data?: any;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}

const AssignGrade: React.FC<AssignGradeProps> = ({ data, onSubmit }: AssignGradeProps) => {
  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      feedback: data?.feedback || '',
    },
    onSubmit(values) {
      console.log('values in component ---', values);

      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '70vh' }}>
          <PDFViewer width="100%" height="600">
            <CertificateDocument />
          </PDFViewer>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A', label: 'A' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B', label: 'B' },
                  { value: 'B-', label: 'B-' },
                  { value: 'C+', label: 'C+' },
                  { value: 'C', label: 'C' },
                  { value: 'C-', label: 'C-' },
                  { value: 'D', label: 'D' },
                  { value: 'F', label: 'F' },
                ]}
                label="Grade"
                name="grade"
                value={formik.values.grade}
                onChange={(val) => {
                  formik.setFieldValue('grade', val);
                }}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Detailed Feedback"
                multiline
                rows={3}
                fullWidth
                name="feedback"
                value={formik.values.feedback}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
