'use client';

import type { Dayjs } from 'dayjs';
import type { Column } from 'src/components/customizabaleTable';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { PDFViewer } from '@react-pdf/renderer';
import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Chip,
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
  subject: string;
  submissionType: string;
  dueDate: Dayjs | null;
  dueTime: Dayjs | null;
  attachments: File[];
  createdBy: string;
  status: string;
  // Homework-Specific Fields
  topic?: string;
  homeworkType?: string;
  isDailyTask?: boolean;
  parentAcknowledgement?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: string;
  dayOfSubmission?: string;
  endDate?: Dayjs | null;
  scheduleDate?: Dayjs | null;
  // Assignment-Specific Fields
  assignmentType?: string;
  evaluationCriteria?: string;
  assignedResources?: string;
  customRubric?: string;
  isScheduled: boolean;
}

const initialData: Assignment[] = [
  {
    class: '10',
    division: ['A'],
    title: 'Math Practice Problems',
    subject: 'Mathematics',
    description: 'Solve problems from Chapter 5 on Linear Equations.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    status: 'draft',
    topic: 'Linear Equations',
    homeworkType: 'Practice Questions', // Homework-specific field
    isDailyTask: true,
    parentAcknowledgement: true,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'Workbook Page 32-34',
    evaluationCriteria: '', // Not applicable for homework
    customRubric: '', // Not applicable for homework
    assignmentType: '',
    attachments: [],
    createdBy: '',
    endDate: dayjs('2024-12-10'),
    isScheduled: false,
  },
  {
    class: '9',
    division: ['B'],
    title: 'Science Project',
    subject: 'Science',
    description: 'Prepare a working model of the solar system.',
    dueDate: dayjs('2024-12-15'),
    dueTime: dayjs('23:59'),
    submissionType: 'In-Person',
    status: 'publish',
    topic: 'Solar System',
    assignmentType: 'Project Work', // Assignment-specific field
    isDailyTask: false,
    parentAcknowledgement: false,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'Chapter 7: The Solar System',
    evaluationCriteria: 'Model Design, Explanation, Creativity', // Assignment-specific field
    customRubric: 'Include all 8 planets with labels.', // Assignment-specific field
    homeworkType: '',
    attachments: [],
    createdBy: '',
    isScheduled: false,
  },
  {
    class: '8',
    division: ['C'],
    title: 'History Essay',
    subject: 'History',
    description: 'Write an essay on the causes and effects of World War II.',
    dueDate: dayjs('2024-12-20'),
    dueTime: dayjs('23:59'),
    submissionType: 'Online',
    status: 'draft',
    topic: 'World War II',
    assignmentType: 'Essay Writing', // Assignment-specific field
    isDailyTask: false,
    parentAcknowledgement: true,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'History Textbook Chapter 10',
    evaluationCriteria: 'Content, Structure, Grammar, and Relevance', // Assignment-specific field
    customRubric: 'Include at least 3 major causes and their effects.', // Assignment-specific field
    homeworkType: '',
    attachments: [],
    createdBy: '',
    isScheduled: false,
  },
  {
    class: '7',
    division: ['D'],
    title: 'Geography Map Work',
    subject: 'Geography',
    description: 'Mark and label the major rivers of India on the map.',
    dueDate: dayjs('2024-12-12'),
    dueTime: dayjs('18:00'),
    submissionType: 'In-Person',
    status: 'draft',
    topic: 'Indian Rivers',
    homeworkType: 'Map Work', // Homework-specific field
    isDailyTask: false,
    parentAcknowledgement: false,
    isRecurring: false,
    recurringFrequency: '',
    assignedResources: 'Map and Atlas',
    evaluationCriteria: '', // Not applicable for homework
    customRubric: '', // Not applicable for homework
    assignmentType: '',
    attachments: [],
    createdBy: '',
    isScheduled: false,
  },
  {
    class: '6',
    division: ['E'],
    title: 'English Reading Task',
    subject: 'English',
    description: 'Read and summarize Chapter 3 of your textbook.',
    dueDate: null,
    dueTime: null,
    submissionType: 'Online',
    status: 'publish',
    topic: 'Reading Comprehension',
    homeworkType: 'Summary Writing', // Homework-specific field
    isDailyTask: true,
    parentAcknowledgement: true,
    isRecurring: true,
    recurringFrequency: 'Weekly',
    assignedResources: 'Textbook Chapter 3',
    evaluationCriteria: '', // Not applicable for homework
    customRubric: '', // Not applicable for homework
    assignmentType: '',
    attachments: [],
    createdBy: '',
    endDate: null,
    isScheduled: false,
  },
];

const HomeworkCreation = (props: TabComponentType) => {
  const [view, setView] = useState('homework');
  const [open, setOpen] = useState(false);
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

  const homeworkColumns: Column[] = [
    {
      id: 'class',
      label: 'Class',
    },
    {
      id: 'division',
      label: 'Division',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {value?.map((audience: string) => (
            <Chip key={audience} label={audience} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      id: 'subject',
      label: 'Subject',
    },
    {
      id: 'title',
      label: 'Homework Title',
      minWidth: 170,
      align: 'left',
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      align: 'left',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Publish',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
      id: 'class',
      label: 'Class',
    },
    {
      id: 'division',
      label: 'Division',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {value?.map((audience: string) => (
            <Chip key={audience} label={audience} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      id: 'subject',
      label: 'Subject',
    },
    {
      id: 'title',
      label: 'Assignment Title',
      minWidth: 200,
      align: 'left',
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Publish',
      render: (value: any, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
      label: 'Action',
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
              <Typography variant="subtitle2">Homework</Typography>
            </ToggleButton>
            <ToggleButton value="assignment">
              <Typography variant="subtitle2">Assignment</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {!open && (
        <CustomizableTable
          tableId="homework-assignment-management"
          columns={view === 'homework' ? homeworkColumns : assignmentColumns}
          data={filteredData}
        />
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
    []
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
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    viewSubmissionDialog.onTrue();
                    setSelectedStudent(row);
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
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <PDFViewer width="100%" height="600">
            <CertificateDocument />
          </PDFViewer>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
