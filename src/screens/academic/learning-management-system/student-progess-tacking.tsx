'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useState, useCallback } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { School, AssignmentTurnedIn } from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Grid,
  alpha,
  Avatar,
  MenuList,
  MenuItem,
  useTheme,
  Typography,
  LinearProgress,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const StudentProgressTracking = (props: TabComponentType) => {
  const dialog = useBoolean();
  const theme = useTheme();

  const handleRowClick = () => {
    dialog.onTrue();
  };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Progress Tracking"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Learning Management System' },
          { name: 'Student Progress Tracking' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Typography variant="h6">Progress Dashboard</Typography>
      <Box display="flex" gap={2} mt={2}>
        <CustomSelect
          options={[]}
          value=""
          label="Class"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          size="small"
        />
        <CustomSelect
          options={[]}
          value=""
          label="Division"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          size="small"
        />
        <CustomSelect
          options={[]}
          value=""
          label="Student"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          size="small"
        />
        {/* <DatePicker
          label="Start Date"
          format="DD-MM-YYYY"
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        <DatePicker
          label="End Date"
          format="DD-MM-YYYY"
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        /> */}
      </Box>
      {/* <Box sx={{ mt: 2 }}>
        <TextField
          placeholder="Search student..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box> */}

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={6}>
          <AppCurrentDownload
            title="Attendance Overview"
            chart={{
              series: [
                { label: 'Present', value: 50 },
                { label: 'Absent', value: 30 },
              ],
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AnalyticsWebsiteVisits
            title="Student Performance Levels"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Exam', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Quiz', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              p: 3,
              backgroundColor: (them) => (them.palette.mode === 'dark' ? '#1a2027' : '#e6f7ff'),
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Iconify icon="ph:exam" height={27} width={27} />
              <Typography variant="h6">Completed Exams</Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ mt: 1, textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}
            >
              25
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              p: 3,
              backgroundColor: (them) => (them.palette.mode === 'dark' ? '#1a2027' : '#e6ffe6'),
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Iconify icon="fluent:quiz-new-20-regular" height={27} width={27} />
              <Typography variant="h6">Completed Quiz</Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ mt: 1, textAlign: 'center', color: '#008000', fontWeight: 'bold' }}
            >
              14
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              p: 3,
              backgroundColor: (them) => (them.palette.mode === 'dark' ? '#1a2027' : '#fff0f0'),
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Iconify icon="mdi:assignment" height={27} width={27} />
              <Typography variant="h6">Completed Assignments</Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ mt: 1, textAlign: 'center', color: '#d32f2f', fontWeight: 'bold' }}
            >
              92
            </Typography>
          </Card>
        </Grid>
      </Grid>
      <Grid container mt={2}>
        <Grid item xs={12}>
          <Box sx={{ width: '100%', margin: 'auto' }}>
            <RenderTabs />
          </Box>
        </Grid>
      </Grid>

      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Detailed Student View">
        <DetailedStudentView />
      </CustomDialog>
    </Box>
  );
};

export default StudentProgressTracking;

const DetailedStudentView = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 3,
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'),
      borderRadius: 2,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Avatar
      alt="Student Name"
      src="/path-to-student-image.jpg"
      sx={{
        width: 120,
        height: 120,
        border: (theme) => `3px solid ${theme.palette.primary.main}`,
        marginBottom: 2,
      }}
    />
    <Typography variant="h4" fontWeight="bold" sx={{ marginBottom: 1 }}>
      John Doe
    </Typography>
    <Typography
      variant="h5"
      sx={{
        color: '#4caf50',
        fontWeight: 'bold',
        marginBottom: 3,
      }}
    >
      A+
    </Typography>
    <Grid2 container spacing={3} sx={{ width: '100%', maxWidth: 400 }}>
      <Grid2 xs={6}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#424242' : 'white'),
            padding: 2,
            borderRadius: 1,
          }}
        >
          <School
            sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, marginBottom: 1 }}
          />
          <Typography variant="subtitle1" color="textSecondary">
            Average Grade
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            95%
          </Typography>
        </Box>
      </Grid2>
      <Grid2 xs={6}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#424242' : 'white'),
            padding: 2,
            borderRadius: 1,
          }}
        >
          <AssignmentTurnedIn
            sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, marginBottom: 1 }}
          />
          <Typography variant="subtitle1" color="textSecondary">
            Assignments Completed
          </Typography>
          <Box sx={{ width: '100%', marginTop: 1 }}>
            <LinearProgress
              variant="determinate"
              value={80}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#555' : '#e0e0e0'),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50',
                },
              }}
            />
            <Typography variant="body2" sx={{ textAlign: 'center', marginTop: 0.5 }}>
              80%
            </Typography>
          </Box>
        </Box>
      </Grid2>
    </Grid2>
  </Box>
);

const TABS = [
  {
    value: 'assignment',
    label: 'Assignment',
    component: () => <Assignments />,
  },
  {
    value: 'learningMaterial',
    label: 'Learning Material',
    component: () => <LearningMaterial />,
  },
  {
    value: 'quizzes',
    label: 'Quizzes ',
    component: () => <Quizzes />,
  },
  {
    value: 'Assessments',
    label: 'Assessments',
    component: () => <Assessments />,
  },
  // {
  //   value: 'overallGrades',
  //   label: 'Overall Grades',
  //   component: () => <OverallGrades />,
  // },
];

const RenderTabs = () => {
  const tabs = useTabs('assignment');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <>
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </>
  );
};

const Assignments = () => {
  const uploadAssignmentDialog = useBoolean();
  const [subject, setSubject] = useState('');
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              uploadAssignmentDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:upload" />
            Upload Assignment
          </MenuItem>
        </MenuList>
      </>
    ),
    [uploadAssignmentDialog]
  );
  return (
    <Box>
      <CustomSelect
        label="Course/Subject"
        options={[
          {
            value: 'Math',
            label: 'Math',
          },
          {
            value: 'English',
            label: 'English',
          },
        ]}
        value={subject}
        onChange={(val) => {
          setSubject(val as string);
        }}
        formControlProps={{ sx: { minWidth: 200 } }}
      />
      <CustomizableTable
        tableId="assignment-table"
        columns={[
          { id: 'subjectName', label: 'Subject Name', minWidth: '150px', align: 'left' },
          { id: 'assignmentType', label: 'Assignment Type', minWidth: '170px', align: 'left' },
          { id: 'assignmentName', label: 'Assignment Name', minWidth: '180px', align: 'left' },
          { id: 'assignedTeacher', label: 'Assigned Teacher', minWidth: '180px', align: 'left' },
          { id: 'dueDate', label: 'Due Date', minWidth: '130px', align: 'left' },
          { id: 'completionDate', label: 'Completion Date', minWidth: '180px', align: 'left' },
          {
            id: 'gradeFeedback',
            label: 'Grade & Feedback',
            minWidth: '180px',
            align: 'left',
            render(value, row) {
              return (
                <>
                  {value.grade && value.feedback ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Label
                        color={
                          value?.grade === 'A'
                            ? 'success'
                            : value?.grade === 'B'
                              ? 'success'
                              : value?.grade === 'C'
                                ? 'warning'
                                : 'error'
                        }
                      >
                        {value?.grade}
                      </Label>
                      <Typography variant="caption" sx={{ opacity: 0.84 }}>
                        {value?.feedback}
                      </Typography>
                    </Box>
                  ) : (
                    '-'
                  )}
                </>
              );
            },
          },
          {
            id: 'submissionStatus',
            label: 'Submission Status',
            minWidth: '180px',
            align: 'left',
            render(value, row) {
              return (
                <Label
                  color={
                    value === 'Submitted' ? 'success' : value === 'Pending' ? 'warning' : 'error'
                  }
                >
                  {value}
                </Label>
              );
            },
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
                />
              );
            },
          },
        ]}
        data={[
          {
            subjectName: 'Math',
            assignmentType: 'Homework',
            assignmentName: 'Algebra Basics',
            assignedTeacher: 'Mr. Smith',
            dueDate: '01-01-2024',
            completionDate: '01-01-2024',
            gradeFeedback: {
              grade: 'A',
              feedback: 'Excellent',
            },
            submissionStatus: 'Submitted',
          },
          {
            subjectName: 'Science',
            assignmentType: 'Lab Report',
            assignmentName: 'Chemical Reactions',
            assignedTeacher: 'Dr. Johnson',
            dueDate: '01-01-2024',
            gradeFeedback: {
              grade: '',
              feedback: '',
            },
            submissionStatus: 'Pending',
          },
          {
            subjectName: 'English',
            assignmentType: 'Essay',
            assignmentName: 'Shakespeare Analysis',
            assignedTeacher: 'Ms. Williams',
            dueDate: '01-01-2024',
            gradeFeedback: {
              grade: '',
              feedback: '',
            },
            submissionStatus: 'Overdue',
          },
          {
            subjectName: 'Math',
            assignmentType: 'Project',
            assignmentName: 'Geometry Tutorials',
            assignedTeacher: 'Mr. Smith',
            dueDate: '01-01-2024',
            completionDate: '01-01-2024',
            gradeFeedback: {
              grade: 'A',
              feedback: 'Excellent',
            },
            submissionStatus: 'Submitted',
          },
        ]}
      />
    </Box>
  );
};

const Assessments = () => {
  const uploadAssessmentDialog = useBoolean();
  const [subject, setSubject] = useState('');
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              uploadAssessmentDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:upload" />
            Upload Assessment
          </MenuItem>
        </MenuList>
      </>
    ),
    [uploadAssessmentDialog]
  );

  return (
    <Box>
      <CustomSelect
        label="Course/Subject"
        options={[
          {
            value: 'Math',
            label: 'Math',
          },
          {
            value: 'English',
            label: 'English',
          },
        ]}
        value={subject}
        onChange={(val) => {
          setSubject(val as string);
        }}
        formControlProps={{ sx: { minWidth: 200 } }}
      />
      <CustomizableTable
        tableId="assessment-table"
        columns={[
          { id: 'subjectName', label: 'Subject Name', minWidth: '150px', align: 'left' },
          { id: 'assessmentType', label: 'Assessment Type', minWidth: '170px', align: 'left' },
          { id: 'assessmentName', label: 'Assessment Name', minWidth: '170px', align: 'left' },
          { id: 'assignedTeacher', label: 'Assigned Teacher', minWidth: '170px', align: 'left' },
          { id: 'dueDate', label: 'Due Date', minWidth: '130px', align: 'left' },
          { id: 'completionDate', label: 'Completion Date', minWidth: '170px', align: 'left' },
          {
            id: 'gradeFeedback',
            label: 'Grade & Feedback',
            minWidth: '170px',
            align: 'left',
            render(value, row) {
              return (
                <>
                  {value.grade && value.feedback ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Label
                        color={
                          value?.grade === 'A'
                            ? 'success'
                            : value?.grade === 'B'
                              ? 'success'
                              : value?.grade === 'C'
                                ? 'warning'
                                : 'error'
                        }
                      >
                        {value?.grade}
                      </Label>
                      <Typography variant="caption" sx={{ opacity: 0.84 }}>
                        {value?.feedback}
                      </Typography>
                    </Box>
                  ) : (
                    '-'
                  )}
                </>
              );
            },
          },
          {
            id: 'submissionStatus',
            label: 'Submission Status',
            minWidth: '170px',
            align: 'left',
            render(value, row) {
              return (
                <Label
                  color={
                    value === 'Submitted' ? 'success' : value === 'Pending' ? 'warning' : 'error'
                  }
                >
                  {value}
                </Label>
              );
            },
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
                />
              );
            },
          },
        ]}
        data={[
          {
            subjectName: 'Math',
            assessmentType: 'Homework',
            assessmentName: 'Algebra Basics',
            assignedTeacher: 'Mr. Smith',
            dueDate: '01-01-2024',
            completionDate: '01-01-2024',
            gradeFeedback: {
              grade: 'A',
              feedback: 'Excellent',
            },
            submissionStatus: 'Submitted',
          },
          {
            subjectName: 'Science',
            assessmentType: 'Lab Report',
            assessmentName: 'Chemical Reactions',
            assignedTeacher: 'Dr. Johnson',
            dueDate: '01-01-2024',
            gradeFeedback: {
              grade: '',
              feedback: '',
            },
            submissionStatus: 'Pending',
          },
          {
            subjectName: 'English',
            assessmentType: 'Essay',
            assessmentName: 'Shakespeare Analysis',
            assignedTeacher: 'Ms. Williams',
            dueDate: '01-01-2024',
            gradeFeedback: {
              grade: '',
              feedback: '',
            },
            submissionStatus: 'Overdue',
          },
          {
            subjectName: 'Math',
            assessmentType: 'Project',
            assessmentName: 'Geometry Tutorials',
            assignedTeacher: 'Mr. Smith',
            dueDate: '01-01-2024',
            completionDate: '01-01-2024',
            gradeFeedback: {
              grade: 'A',
              feedback: 'Excellent',
            },
            submissionStatus: 'Submitted',
          },
        ]}
      />
    </Box>
  );
};

const LearningMaterial = () => {
  const [subject, setSubject] = useState('');
  const viewLearningMaterial = useBoolean();
  return (
    <Box>
      <CustomSelect
        label="Course/Subject"
        options={[
          {
            value: 'Math',
            label: 'Math',
          },
          {
            value: 'English',
            label: 'English',
          },
        ]}
        value={subject}
        onChange={(val) => {
          setSubject(val as string);
        }}
        formControlProps={{ sx: { minWidth: 200 } }}
      />
      <CustomizableTable
        tableId="learning-material-table"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'resourceType', label: 'Resource Type' },
          { id: 'uploadedDate', label: 'Uploaded Date' },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => {
                    viewLearningMaterial.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={[
          {
            resourceName: 'Algebra Basics',
            resourceType: 'PDF',
            uploadedDate: '2024-01-10',
          },
          {
            resourceName: 'Science Experiments',
            resourceType: 'Video',
            uploadedDate: '2024-01-11',
          },
          {
            resourceName: 'Shakespeare Analysis',
            resourceType: 'Document',
            uploadedDate: '2024-01-12',
          },
          {
            resourceName: 'Geometry Tutorials',
            resourceType: 'Image',
            uploadedDate: '2024-01-13',
          },
        ]}
      />
    </Box>
  );
};

const Quizzes = () => (
  <CustomizableTable
    tableId="quiz-table"
    columns={[
      { id: 'quizName', label: 'Quiz Name' },
      { id: 'attempts', label: 'Attempts' },
      { id: 'gradeImpact', label: 'Grade Impact' },
      { id: 'score', label: 'Score' },
    ]}
    data={[]}
  />
);

const Assessmentts = () => {};

const OverallGrades = () => (
  <Grid2 container spacing={3}>
    <Grid2 xs={12} md={6}>
      <AppCurrentDownload
        title="Grade breakdown"
        chart={{
          series: [
            { label: 'Assignments', value: 12244 },
            { label: 'Participation', value: 53345 },
            { label: 'Quizzes', value: 44313 },
          ],
        }}
      />
    </Grid2>
  </Grid2>
);
