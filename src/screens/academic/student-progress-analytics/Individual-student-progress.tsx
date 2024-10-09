import React from 'react';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { Search, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Box,
  Card,
  Grid,
  Paper,
  styled,
  Avatar,
  useTheme,
  TextField,
  Typography,
  CardContent,
  InputAdornment,
} from '@mui/material';

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

const IndividualStudentProgress = ({ student = dummyStudent }: any) => {
  const theme = useTheme(); // Get the current theme

  // Conditional card background color based on the theme mode (light/dark)
  const cardBgColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100];
  const textColor =
    theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary;
  return (
    <StyledPaper>
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            placeholder="search for individual students by name"
            label="Student"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: '350px', width: '100%' }}
          />
          &nbsp;
          <CustomSelect
            label="class"
            options={[
              { value: '1', label: 'Class 1' },
              { value: '2', label: 'Class 2' },
              { value: '3', label: 'Class 3' },
              { value: '4', label: 'Class 4' },
              { value: '5', label: 'Class 5' },
            ]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
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
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
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
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Progress Over Time</Typography>
            </Box>
            <PerformanceOverTime
              id="demo__4"
              //   title="Performance Over Time"
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Day', 'Week', 'Month', 'Year'],
                series: [
                  {
                    name: '',
                    data: [10, 41, 35, 51],
                  },
                ],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
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
                Assignments List
              </Typography>
              <Typography style={{ color: textColor }}>Assignment Name: XYZ</Typography>
              <Typography style={{ color: textColor }}>Status: Completed</Typography>
              <Typography style={{ color: textColor }}>Teacher Feedback: Excellence</Typography>
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
                Exams List
              </Typography>
              <Typography style={{ color: textColor }}>Exam Name: XYZ</Typography>
              <Typography style={{ color: textColor }}>Status: Completed</Typography>
              <Typography style={{ color: textColor }}>Teacher Feedback: Excellence</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics & Insights */}
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={6}>
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
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default IndividualStudentProgress;
