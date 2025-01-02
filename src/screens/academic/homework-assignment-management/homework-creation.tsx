import type { Dayjs } from 'dayjs';
import type { Division } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { PDFViewer } from '@react-pdf/renderer';
import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Button,
  Switch,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
  RadioGroup,
  Typography,
  ListItemText,
  ToggleButton,
  DialogActions,
  DialogContent,
  FormControlLabel,
  DialogContentText,
  ToggleButtonGroup,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CertificateDocument } from 'src/templates/student-certificates/bonofied-certificate-1';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { dummyData, type StudentGrade } from '../gradebook-performance-tracking/gradebook';

interface Assignment {
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

  // Assignment-Specific Fields
  assignmentType?: string;
  evaluationCriteria?: string;
  assignedResources?: string;
  customRubric?: string;
}

const assignmentInitialValues: Assignment = {
  title: '',
  description: '',
  class: '',
  division: [],
  subject: '',
  submissionType: '',
  dueDate: null,
  dueTime: null,
  attachments: [],
  createdBy: '', // Would typically be auto-populated from logged-in user
  status: 'draft',
  // Optional fields
  topic: '',
  homeworkType: '',
  isDailyTask: false,
  parentAcknowledgement: false,
  isRecurring: false,
  recurringFrequency: '',

  assignmentType: '',
  evaluationCriteria: '',
  assignedResources: '',
  customRubric: '',
};

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
    endDate: dayjs('2024-12-08'),
  },
];

const HomeworkCreation = (props: TabComponentType) => {
  const [view, setView] = useState('homework');
  // const [publishStatus, setPublishStatus] = useState<{ [key: number]: boolean }>({});
  const dialog = useBoolean();
  const confirmDialog = useBoolean();
  const submissionDialog = useBoolean();

  const [assignmentData, setAssignmentData] = useState<Assignment[]>(initialData);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  console.log('assignemnt data---', assignmentData);

  const handleSwitchChange = (assignment: Assignment) => {
    console.log('handle switch change --', assignment);

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
    console.log('handleConfirmStatusChange---');

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
    console.log('handle submit calls===', values, status);
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

  const homeworkColumns = [
    { id: 'class', label: 'Class' },
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
    { id: 'subject', label: 'Subject' },
    { id: 'topic', label: 'Topic' },
    { id: 'homeworkType', label: 'Homework Type' },
    { id: 'title', label: 'Homework Title' },
    { id: 'description', label: 'Homework Description' },
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
      id: 'dueTime',
      label: 'Time',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('HH:mm') : '-'}
        </Typography>
      ),
    },
    {
      id: 'isDailyTask',
      label: 'Daily Task',
      render: (value: any, row: any) =>
        value ? (
          <Iconify icon="healthicons:yes" sx={{ color: 'green' }} />
        ) : (
          <Iconify icon="healthicons:no" sx={{ color: 'red' }} />
        ),
    },
    { id: 'dayOfSubmission', label: 'Day of Submission' },
    {
      id: 'endDate',
      label: 'End Date',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('DD MMM YYYY') : '-'}
        </Typography>
      ),
    },
    { id: 'submissionType', label: 'Submission Type' },

    {
      id: 'status',
      label: 'Publish',
      render(value: any, row: any) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              size="small"
              checked={row.status === 'publish'}
              onChange={() => handleSwitchChange(row as Assignment)}
              inputProps={{ 'aria-label': 'Toggle view' }}
            />
          </Box>
        );
      },
    },
    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            placement="right-top"
            actions={() => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    submissionDialog.onTrue();
                  }}
                >
                  <Iconify icon="mdi:eye" />
                  <ListItemText>View Submission</ListItemText>
                </MenuItem>
                <MenuItem>
                  <Iconify icon="solar:pen-bold" />
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  // Columns for Assignment view
  const assignmentColumns = [
    { id: 'class', label: 'Class' },
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
    { id: 'subject', label: 'Subject' },
    { id: 'title', label: 'Assignment Title' },
    { id: 'description', label: 'Assignment Description' },
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
      id: 'dueTime',
      label: 'Time',
      render: (value: any, row: any) => (
        <Typography fontSize="12px" gutterBottom>
          {value ? dayjs(value).format('HH:mm') : '-'}
        </Typography>
      ),
    },
    { id: 'submissionType', label: 'Submission Type' },
    { id: 'assignmentType', label: 'Assignment Type' },
    { id: 'topic', label: 'Topic' },
    { id: 'assignedResources', label: 'Assigned Resources' },
    { id: 'evaluationCriteria', label: 'Evaluation Criteria' },
    { id: 'customRubric', label: 'Custom Rubric' },
    {
      id: 'status',
      label: 'Publish',
      render(value: any, row: any) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              size="small"
              checked={row.status === 'publish'}
              onChange={() => handleSwitchChange(row as Assignment)}
              inputProps={{ 'aria-label': 'Toggle view' }}
            />
          </Box>
        );
      },
    },
    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            placement="right-top"
            actions={() => (
              <MenuList>
                <MenuItem>
                  <Iconify icon="solar:pen-bold" />
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  // Filter data based on view
  const filteredData =
    view === 'homework'
      ? assignmentData.filter((assignment) => assignment.homeworkType)
      : assignmentData.filter((assignment) => assignment.assignmentType);

  return (
    <Box>
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
        <Button variant="contained" startIcon={<Add />} onClick={dialog.onTrue}>
          Create {view === 'homework' ? 'Homework' : 'Assignment'}
        </Button>
      </Box>

      <CustomizableTable
        columns={view === 'homework' ? homeworkColumns : assignmentColumns}
        data={filteredData}
      />

      <CustomDialog
        title={view === 'homework' ? 'Create Homework' : 'Create Assignment'}
        open={dialog.value}
        handleClose={dialog.onFalse}
        maxWidth="sm"
      >
        <HomeworkAssignmentCreationForm onsubmit={handleSubmit} view={view} />
      </CustomDialog>
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

interface HomeWorkCreationFormProps {
  onsubmit: (values: Assignment, status: 'draft' | 'publish') => void;
  view: string;
}

const HomeworkAssignmentCreationForm: React.FC<HomeWorkCreationFormProps> = ({
  onsubmit,
  view,
}) => {
  const [assignmentType, setAssignmentType] = useState<'homework' | 'assignment'>('homework');
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [rubricType, setRubricType] = useState<'predefined' | 'custom'>('predefined');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: assignmentInitialValues,
    onSubmit: (values) => {
      console.log('Form Submitted:', values);
      // Implement submission logic
    },
  });

  const handleFileUpload = (files: File[]) => {
    formik.setFieldValue('attachments', files);
  };

  return (
    <Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={2}>
            {/* Assignment Type Selection */}
            {/* <Grid item xs={12}>
              <RadioGroup
                row
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value as 'homework' | 'assignment')}
              >
                <FormControlLabel value="homework" control={<Radio />} label="Homework" />
                <FormControlLabel value="assignment" control={<Radio />} label="Assignment" />
              </RadioGroup>
            </Grid> */}

            {/* Common Fields */}
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={classes}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass = classData?.items?.find((i: any) => i.id === val);
                  formik.setFieldValue('class', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Division"
                disabled={!formik.values.class}
                labelKey="name"
                valueKey="id"
                multiple
                options={divisionOptions}
                value={division}
                onChange={(val: any[]) => {
                  const selectedDivisions = divisionOptions
                    .filter((i) => val.includes(i.id))
                    .map((div) => div.name);
                  formik.setFieldValue('division', selectedDivisions);
                  setDivision(val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Mathematics' },
                  { value: 'science', label: 'Science' },
                  { value: 'history', label: 'History' },
                  { value: 'english', label: 'English' },
                ]}
                value={formik.values.subject}
                onChange={(val) => formik.setFieldValue('subject', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
            {view === 'homework' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Topic/Chapter"
                    name="topic"
                    value={formik.values.topic}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    label="Homework Type"
                    options={[
                      { value: 'practice', label: 'Practice Questions' },
                      { value: 'reading', label: 'Reading Material' },
                      { value: 'revision', label: 'Revision' },
                    ]}
                    value={formik.values.homeworkType || ''}
                    onChange={(val) => formik.setFieldValue('homeworkType', val)}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>
              </>
            )}

            {view === 'assignment' && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Assignment Type"
                  options={[
                    { value: 'research', label: 'Research-Based' },
                    { value: 'practical', label: 'Practical' },
                    { value: 'group_work', label: 'Group Work' },
                  ]}
                  value={formik.values.assignmentType || ''}
                  onChange={(val) => formik.setFieldValue('assignmentType', val)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                size="small"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            {view === 'assignment' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Rubric Selection
                  </Typography>
                  <RadioGroup
                    row
                    value={rubricType}
                    onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
                  >
                    <FormControlLabel
                      value="predefined"
                      control={<Radio />}
                      label="Predefined Rubric"
                    />
                    <FormControlLabel value="custom" control={<Radio />} label="Custom Rubric" />
                  </RadioGroup>
                </Grid>
                {rubricType === 'predefined' ? (
                  <Grid item xs={12}>
                    <UploadBox
                      onDrop={(acceptedFiles) => {
                        formik.setFieldValue('rubricAttachment', acceptedFiles);
                      }}
                      placeholder={
                        <Box
                          sx={{
                            gap: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.disabled',
                            flexDirection: 'column',
                          }}
                        >
                          <Iconify icon="eva:cloud-upload-fill" width={40} />
                          <Typography variant="body2">Upload Rubric Document</Typography>
                        </Box>
                      }
                      sx={{
                        py: 2.5,
                        width: '100%',
                        height: 'auto',
                        borderRadius: 1.5,
                      }}
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Custom Rubric"
                      name="customRubric"
                      value={formik.values.customRubric}
                      onChange={formik.handleChange}
                      placeholder="Enter your custom rubric details here..."
                      variant="outlined"
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            {/* Homework-Specific Fields */}

            {/* Assignment-Specific Fields */}

            {/* Submission Details */}
            {view === 'homework' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.isDailyTask}
                      onChange={(e) => formik.setFieldValue('isDailyTask', e.target.checked)}
                    />
                  }
                  label="Daily Task"
                />
              </Grid>
            )}

            {formik.values.isDailyTask && (
              <>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    label="Select Day of Submission"
                    options={[{ value: 'nextDay', label: 'NextDay' }]}
                    value={formik.values.dayOfSubmission || ''}
                    onChange={(val) => formik.setFieldValue('dayOfSubmission', val)}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    name="endDate"
                    label="Select End Date"
                    value={formik.values.endDate}
                    onChange={(date) => formik.setFieldValue('endDate', date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.endDate && Boolean(formik.errors.endDate),
                        helperText: formik.touched.endDate && formik.errors.endDate,
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            {!formik.values.isDailyTask && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Due Date"
                  value={formik.values.dueDate}
                  onChange={(date) => formik.setFieldValue('dueDate', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                      helperText: formik.touched.dueDate && formik.errors.dueDate,
                    },
                  }}
                />
              </Grid>
            )}

            {!formik.values.isDailyTask && (
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Due Time"
                  value={formik.values.dueTime}
                  onChange={(time) => formik.setFieldValue('dueTime', time)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.dueTime && Boolean(formik.errors.dueTime),
                      helperText: formik.touched.dueTime && formik.errors.dueTime,
                    },
                  }}
                />
              </Grid>
            )}

            {/* Submission Type */}
            <Grid item xs={12}>
              <RadioGroup
                row
                name="submissionType"
                value={formik.values.submissionType}
                onChange={formik.handleChange}
              >
                <FormControlLabel value="online_text" control={<Radio />} label="Online Text" />
                <FormControlLabel value="file_upload" control={<Radio />} label="File Upload" />
                <FormControlLabel
                  value="in_person"
                  control={<Radio />}
                  label="In-Person Submission"
                />
              </RadioGroup>
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Scrollbar>

      {/* Action Buttons */}
      <DialogActions>
        <Button
          variant="contained"
          color="warning"
          onClick={() => formik.setFieldValue('status', 'draft')}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => formik.setFieldValue('status', 'published')}
        >
          Publish
        </Button>
      </DialogActions>
    </Box>
  );
};

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

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:pencil" />}
          disabled={selectedStudents.length === 0}
          onClick={bulkGradeDialog.onTrue}
        >
          Bulk Grade ({selectedStudents.length} selected)
        </Button>
      </Box>

      <Scrollbar sx={{ p: 2, height: '500px' }}>
        <CustomizableTable
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
            { id: 'studentName', label: 'Student Name' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'subject', label: 'Subject' },
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
            { id: 'weightedAverage', label: 'Weighted Average' },
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
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={() => (
                      <MenuList>
                        {row.status === 'Submitted' && (
                          <MenuItem
                            onClick={() => {
                              viewSubmissionDialog.onTrue();
                              setSelectedStudent(row);
                            }}
                          >
                            {' '}
                            <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                            View Submission
                          </MenuItem>
                        )}

                        {(row.status === 'Pending' || row.status === 'Overdue') && (
                          <MenuItem onClick={() => {}}>
                            {' '}
                            <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
                            Send Reminder
                          </MenuItem>
                        )}
                        {/* {row.grade === 'Assign Grade' ? (
                      <MenuItem>
                        <Iconify
                          icon="mingcute:notification-fill"
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Remind To Teacher
                      </MenuItem>
                    ) : (
                      <MenuItem>
                        <Iconify
                          icon="material-symbols:upload"
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Upload to Student
                      </MenuItem>
                    )} */}
                        {/* <MenuItem
                      onClick={() => {
                        viewResultDialog.onTrue();
                        setSelectedStudent(row);
                      }}
                    >
                      {' '}
                      <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                      View Result
                    </MenuItem> */}

                        {/* <MenuItem
                      onClick={() => {
                        viewProfile.onTrue();
                      }}
                    >
                      {' '}
                      <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                      View Profile
                    </MenuItem> */}
                      </MenuList>
                    )}
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
      </Scrollbar>
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
