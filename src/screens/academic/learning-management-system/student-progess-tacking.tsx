import { DatePicker } from '@mui/x-date-pickers';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Quiz, School, Assignment, PendingActions, AssignmentTurnedIn } from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Avatar,
  TextField,
  Typography,
  InputAdornment,
  LinearProgress,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { AppAreaInstalled } from 'src/screens/hr/dashboard/app-area-installed';
import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const StudentProgressTracking = () => {
  const dialog = useBoolean();
  const handleRowClick = () => {
    dialog.onTrue();
  };
  return (
    <Box>
      <Typography variant="h4">Progress Dashboard</Typography>
      <Box display="flex" gap={2} mt={2}>
        <CustomSelect
          options={[]}
          value=""
          label="Select Class"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          size="small"
        />
        <CustomSelect
          options={[]}
          value=""
          label="Select SUbject"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          size="small"
        />
        <DatePicker label="Start Date" format="DD-MM-YYYY" />
        <DatePicker label="End Date" format="DD-MM-YYYY" />
      </Box>
      <Box sx={{ mt: 2 }}>
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
      </Box>

      <Grid2 container spacing={2} mt={2}>
        <Grid2 xs={12} sm={6} md={4}>
          <AppCurrentDownload
            title="Completion Rates"
            chart={{
              series: [
                { label: 'Assignments', value: 12244 },
                { label: 'Videos', value: 53345 },
                { label: 'Quizzes', value: 44313 },
              ],
            }}
          />
        </Grid2>
        <Grid2 xs={12} sm={6} md={4}>
          <AppAreaInstalled
            title="Performance Distribution"
            subheader="(+43%) than last year"
            selectSeries="class1"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  name: 'class1',
                  data: [
                    { name: 'quiz scores', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'other scores', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  ],
                },
                {
                  name: 'class2',
                  data: [
                    { name: 'quiz scores', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                    { name: 'other scores', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                  ],
                },
                {
                  name: 'Class3',
                  data: [
                    { name: 'quiz scores', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                    { name: 'other scores', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                  ],
                },
              ],
            }}
          />
        </Grid2>
        <Grid2 xs={12} sm={6} md={4}>
          <AnalyticsWebsiteVisits
            title="Engagement Levels"
            chart={{
              categories: ['assignments', 'videos', 'quizzes'],
              series: [{ name: '', data: [43, 33, 22] }],
            }}
            sx={{ boxShadow: 'var(--shadows-2)', height: '100%' }}
          />
        </Grid2>
        <Grid2 xs={12}>
          <Typography variant="h4">Quick Stats</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Card
              sx={{
                width: '30%',
                p: 3,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a2027' : '#e6f7ff'),
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Total Assignments Completed</Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ mt: 1, textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}
              >
                25
              </Typography>
            </Card>

            <Card
              sx={{
                width: '30%',
                p: 3,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a2027' : '#e6ffe6'),
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Quiz sx={{ mr: 1, color: '#2e7d32' }} />
                <Typography variant="h6">Average Quiz Score</Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ mt: 1, textAlign: 'center', color: '#2e7d32', fontWeight: 'bold' }}
              >
                85%
              </Typography>
              <Box sx={{ mt: 2, backgroundColor: '#c8e6c9', borderRadius: '10px', height: '10px' }}>
                <Box
                  sx={{
                    width: '85%',
                    height: '100%',
                    backgroundColor: '#4caf50',
                    borderRadius: '10px',
                  }}
                />
              </Box>
            </Card>

            <Card
              sx={{
                width: '30%',
                p: 3,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a2027' : '#fff0f0'),
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PendingActions sx={{ mr: 1, color: '#d32f2f' }} />
                <Typography variant="h6">Pending Assignments</Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ mt: 1, textAlign: 'center', color: '#d32f2f', fontWeight: 'bold' }}
              >
                92
              </Typography>
            </Card>
          </Box>
        </Grid2>
        <Grid2 xs={12}>
          <Typography variant="h4">Class Overview</Typography>
          <CustomizableTable
            columns={[
              { id: 'studentName', label: 'Student Name' },
              { id: 'overallProgress', label: 'Overall Progress' },
              { id: 'quizScores', label: 'Quiz Scores' },
              { id: 'averageGrade', label: 'Average Grade' },
              { id: 'assignmentStatus', label: 'Assignment Status' },
            ]}
            data={[
              {
                studentName: 'John Doe',
                overallProgress: '75%',
                quizScores: '82%',
                averageGrade: 'B+',
                assignmentStatus: 'Pending',
              },
              {
                studentName: 'Jane Smith',
                overallProgress: '88%',
                quizScores: '90%',
                averageGrade: 'A-',
                assignmentStatus: 'Completed',
              },
              {
                studentName: 'Mike Johnson',
                overallProgress: '62%',
                quizScores: '71%',
                averageGrade: 'C',
                assignmentStatus: 'Pending',
              },
              {
                studentName: 'Emily Brown',
                overallProgress: '95%',
                quizScores: '98%',
                averageGrade: 'A+',
                assignmentStatus: 'Completed',
              },
              {
                studentName: 'Alex Wilson',
                overallProgress: '80%',
                quizScores: '85%',
                averageGrade: 'B',
                assignmentStatus: 'Pending',
              },
            ]}
            handleRowClick={handleRowClick}
          />
        </Grid2>
        <Grid2 xs={12}>
          <Box sx={{ maxWidth: '90%', width: '100%', margin: 'auto' }}>
            <RenderTabs />
          </Box>
        </Grid2>
      </Grid2>

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
    value: 'quizzesAndAssessments',
    label: 'Quizzes & Assessments',
    component: () => <QuizzesAndAssessments />,
  },

  {
    value: 'overallGrades',
    label: 'Overall Grades',
    component: () => <OverallGrades />,
  },
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

const Assignments = () => (
  <CustomizableTable
    columns={[
      { id: 'assignmentName', label: 'Assignment Name' },
      { id: 'completionDate', label: 'Completion Date' },
      { id: 'gradeFeedback', label: 'Grade & Feedback' },
      { id: 'submissionStatus', label: 'Submission Status' },
      { id: 'actions', label: 'Actions' },
    ]}
    data={[]}
  />
);

const LearningMaterial = () => (
  <Grid2 container spacing={3}>
    <Grid2 xs={12} md={6}>
      <AnalyticsWebsiteVisits
        title="Time spent on different learning materials"
        chart={{
          categories: ['videos', 'PDFs', 'interactive content'],
          series: [{ name: '', data: [43, 33, 22] }],
        }}
        sx={{ boxShadow: 'var(--shadows-2)', height: '100%' }}
      />
    </Grid2>
    <Grid2 xs={12} md={6}>
      <AppCurrentDownload
        title="percentage of each material within the course"
        chart={{
          series: [
            { label: 'Assignments', value: 12244 },
            { label: 'Videos', value: 53345 },
            { label: 'Quizzes', value: 44313 },
          ],
        }}
      />
    </Grid2>
  </Grid2>
);

const QuizzesAndAssessments = () => (
  <CustomizableTable
    columns={[
      { id: 'quizName', label: 'Quiz Name' },
      { id: 'attempts', label: 'Attempts' },
      { id: 'gradeImpact', label: 'Grade Impact' },
      { id: 'score', label: 'Score' },
    ]}
    data={[]}
  />
);

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
