import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Box,
  Card,
  Grid,
  Paper,
  styled,
  Avatar,
  Tooltip,
  useTheme,
  Typography,
  CardContent,
} from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import { PerformanceOverTime } from '../gradebook-performance-tracking/progress-report';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),

  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  background: theme.palette.background.default,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  margin: '0 auto',
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1),
}));

const dummyStudent = {
  avatarUrl: 'https://example.com/avatar.jpg',
  name: 'John Doe',
  grade: '10',
  attendance: {
    presentDays: 85,
    absentDays: 5,
  },
  behavior: {
    score: 90,
    participationLevel: 'High',
  },
};

const IndividualStudentProgress = (props: TabComponentType, { student = dummyStudent }: any) => {
  const theme = useTheme(); // Get the current theme
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const cardBgColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100];
  const textColor =
    theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary;

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
  }, [classData, classes, setSearchParams]);
  // Conditional card background color based on the theme mode (light/dark)

  return (
    <StyledPaper>
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              // formik.setFieldValue('class', selectedClass?.name || '');
              setSearchParams?.({
                classId: val as string,
              });
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes}
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />{' '}
          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
              // formik.setFieldValue('division', selectedDivision?.name || '');
              setDivision(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />{' '}
          <CustomSelect
            label="Select Student"
            options={[
              { value: 'student1', label: 'Student 1' },
              { value: 'student2', label: 'Student 2' },
              { value: 'student3', label: 'Student 3' },
            ]}
            value={selectedStudent}
            isSearch
            onChange={(val) => {
              setSelectedStudent(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />
        </Grid>
        <Grid item xs={12} textAlign="center">
          <StyledAvatar src={student.avatarUrl} alt={student.name} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
            {student.name}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Grade {student.grade}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <SectionTitle variant="h5">Attendance</SectionTitle>
          <StatItem>
            <CheckCircleOutlineIcon color="primary" />
            <StatLabel>Present Days:</StatLabel>
            <StatValue>{student.attendance.presentDays}</StatValue>
          </StatItem>
          <StatItem>
            <CheckCircleOutlineIcon color="error" />
            <StatLabel>Absent Days:</StatLabel>
            <StatValue>{student.attendance.absentDays}</StatValue>
          </StatItem>
        </Grid>

        <Grid item xs={12} sm={6}>
          <SectionTitle variant="h5">Behavior & Participation</SectionTitle>
          <StatItem>
            <StarOutlineIcon color="primary" />
            <StatLabel>Behavior Score:</StatLabel>
            <StatValue>{student.behavior.score}</StatValue>
          </StatItem>
          <StatItem>
            <StarOutlineIcon color="primary" />
            <StatLabel>Participation Level:</StatLabel>
            <StatValue>{student.behavior.participationLevel}</StatValue>
          </StatItem>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Performance by Subject</Typography>
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              chart={{
                categories: ['Math', 'Science', 'History', 'ENG', 'May'],
                series: [{ name: '', data: [43, 33, 22, 37, 67] }],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Progress Over Time</Typography>
            </Box>
            <PerformanceOverTime
              id="demo__4"
              //   title="Performance Over Time"
              //   subheader="(+43%) than last year"
              chart={{
                categories: [
                  'Jan',
                  'Feb',
                  'March',
                  'Apr',
                  'May',
                  'June',
                  'July',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                series: [
                  {
                    name: '',
                    data: [5, 8, 15, 20, 23, 30, 35, 41, 48, 60, 65, 71],
                  },
                ],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <AssignmentsList />
        </Grid>
        <Grid item xs={12} md={6}>
          <ExamsList />
        </Grid>

        {/* Analytics & Insights */}
        {/* <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: cardBgColor,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <ArrowUpward sx={{ color: 'green', marginRight: 1 }} />
                <Typography variant="h6" gutterBottom style={{ color: textColor }}>
                  Improvement Trends
                </Typography>
              </Box>
              <Typography color="green">+15% in Math since last term</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: cardBgColor,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <ArrowDownward sx={{ color: 'red', marginRight: 1 }} />
                <Typography variant="h6" gutterBottom style={{ color: textColor }}>
                  Areas for Improvement
                </Typography>
              </Box>
              <Typography color="red">Struggling in Science: -10% since last quiz</Typography>
              <Typography color="red">Incomplete assignments</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: cardBgColor,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom style={{ color: textColor }}>
                Personalized Recommendations
              </Typography>
              <Typography style={{ color: textColor }}>• Attend extra Math classes</Typography>
              <Typography style={{ color: textColor }}>• Submit assignments on time</Typography>
              <Typography style={{ color: textColor }}>
                • Participate in group discussions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Teacher Feedback & Parent-Teacher Interaction */}
        {/* <Grid item xs={12} md={6}>
          <Card
            sx={{
              backgroundColor: cardBgColor,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom style={{ color: textColor }}>
                Teacher Feedback
              </Typography>
              <Typography style={{ color: textColor }}>Teacher Name</Typography>
              <Typography style={{ color: textColor }}>Date of Comment: 01-01-2024</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Feedback comments will appear here..."
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              backgroundColor: cardBgColor,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom style={{ color: textColor }}>
                Parent-Teacher Interaction Log
              </Typography>
              <Typography style={{ color: textColor }}>Date: 01-01-2024</Typography>
              <Typography style={{ color: textColor }}>
                Discussed recent improvement in Science
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Parent/Teacher comments will appear here.."
              />
            </CardContent>
          </Card>
        </Grid>  */}
      </Grid>
    </StyledPaper>
  );
};

export default IndividualStudentProgress;

type AssignmentStatus = 'pending' | 'submitted' | 'overdue' | 'in-progress';

interface Assignment {
  name: string;
  subject: string;
  status: AssignmentStatus;
  dueDate: string;
}

const subjects = [
  {
    name: 'Mathematics',
    assignments: [
      {
        name: 'Algebra Worksheet',
        subject: 'Mathematics',
        status: 'pending',
        dueDate: '2024-02-15',
      },
      {
        name: 'Geometry Problem Set',
        subject: 'Mathematics',
        status: 'submitted',
        dueDate: '2024-02-10',
      },
    ],
  },
  {
    name: 'Science',
    assignments: [
      {
        name: 'Biology Lab Report',
        subject: 'Science',
        status: 'in-progress',
        dueDate: '2024-02-20',
      },
      {
        name: 'Chemistry Experiment',
        subject: 'Science',
        status: 'overdue',
        dueDate: '2024-02-05',
      },
    ],
  },
  {
    name: 'English',
    assignments: [
      { name: 'Essay Writing', subject: 'English', status: 'submitted', dueDate: '2024-02-12' },
    ],
  },
];

// Helper function to get status color
const getAssignmentColor = (status: string) => {
  const statusColors = {
    pending: '#FFA500', // orange
    submitted: '#2E8B57', // green
    overdue: '#DC143C', // red
    'in-progress': '#4169E1', // royal blue
  };
  return statusColors[status];
};

const AssignmentsList = () => {
  const [hoveredAssignment, setHoveredAssignment] = useState<Assignment | null>(null);
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
        height: '100%',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="subtitle1">Assignments List</Typography>
        </Box>
        <Box>
          <Scrollbar sx={{ height: '200px' }}>
            {subjects.map((subject, subjectIndex) => (
              <Box key={subjectIndex} mb={2}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  {subject.name}
                </Typography>
                {subject.assignments.map((assignment, assignmentIndex) => (
                  <Tooltip
                    key={assignmentIndex}
                    title={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: getAssignmentColor(assignment.status),
                            fontWeight: 'bold',
                          }}
                        >
                          Status: {assignment.status.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">Due Date: {assignment.dueDate}</Typography>
                      </Box>
                    }
                    placement="right"
                    arrow
                  >
                    <Card
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        borderLeft: `4px solid ${getAssignmentColor(assignment.status)}`,
                        '&:hover': {
                          boxShadow: theme.shadows[3],
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: theme.spacing(1.5, 2),
                        }}
                      >
                        <Typography variant="body2">{assignment.name}</Typography>
                      </CardContent>
                    </Card>
                  </Tooltip>
                ))}
              </Box>
            ))}
          </Scrollbar>
        </Box>
      </CardContent>
    </Card>
  );
};

type ExamStatus = 'Completed' | 'Upcoming' | 'In Progress';

interface Exam {
  name: string;
  status: ExamStatus;
  date: string;
  subject: string;
  teacherFeedback?: string;
}

// Sample exam data
const examsData: Exam[] = [
  {
    name: 'Midterm Mathematics',
    status: 'Completed',
    date: '2024-02-15',
    subject: 'Mathematics',
    teacherFeedback: 'Excellent performance',
  },
  {
    name: 'Science Practical',
    status: 'In Progress',
    date: '2024-02-20',
    subject: 'Science',
  },
  {
    name: 'English Literature Quiz',
    status: 'Upcoming',
    date: '2024-03-01',
    subject: 'English',
  },
];

// Helper function to get status color
const getExamColor = (status: string) => {
  const statusColors = {
    Completed: '#2E8B57', // green
    Upcoming: '#FFA500', // orange
    'In Progress': '#4169E1', // royal blue
  };
  return statusColors[status];
};

const ExamsList = () => {
  const theme = useTheme();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  return (
    <Card
      sx={{
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
        height: '100%',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Exams List
          </Typography>
        </Box>
        <Box>
          <Scrollbar sx={{ height: '200px' }}>
            {examsData.map((exam, index) => (
              <Tooltip
                key={index}
                title={
                  <Box>
                    <Typography variant="body2">
                      <strong>Date:</strong> {exam.date}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: getExamColor(exam.status),
                        fontWeight: 'bold',
                      }}
                    >
                      Status: {exam.status}
                    </Typography>
                    {exam.teacherFeedback && (
                      <Typography variant="body2">
                        <strong>Teacher Feedback:</strong> {exam.teacherFeedback}
                      </Typography>
                    )}
                  </Box>
                }
                placement="right"
                arrow
              >
                <Card
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderLeft: `4px solid ${getExamColor(exam.status)}`,
                    '&:hover': {
                      boxShadow: theme.shadows[3],
                    },
                  }}
                  onClick={() => setSelectedExam(exam)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: theme.spacing(1.5, 2),
                    }}
                  >
                    <Box>
                      <Typography variant="body2">{exam.name}</Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: getExamColor(exam.status),
                        fontWeight: 'bold',
                      }}
                    >
                      {exam.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            ))}
          </Scrollbar>
        </Box>

        {/* Optional: Detailed View Modal or Card */}
        {selectedExam && (
          <Card
            sx={{
              mt: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedExam.name} Details
              </Typography>
              <Typography variant="body1">
                <strong>Subject:</strong> {selectedExam.subject}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong> {selectedExam.date}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: getExamColor(selectedExam.status),
                  fontWeight: 'bold',
                }}
              >
                Status: {selectedExam.status}
              </Typography>
              {selectedExam.teacherFeedback && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Teacher Feedback:</strong> {selectedExam.teacherFeedback}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
