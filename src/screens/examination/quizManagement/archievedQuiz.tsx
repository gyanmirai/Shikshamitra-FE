import React, { useState, useCallback } from 'react';

import { color } from '@mui/system';
import {
  Box,
  Chip,
  Grid,
  Card,
  alpha,
  Button,
  MenuItem,
  MenuList,
  useTheme,
  Typography,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';
import { TopPerformer } from 'src/screens/student/enrollment/entrance-exam/dashboard';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const tableInitialData = [
  {
    class: '10',
    division: ['A', 'B'],
    subject: 'Mathematics',
    quizTitle: 'Algebra Basics',
    createdAt: '2024-12-01',
    quizDate: '2024-12-15',
    quizTime: '10:00 AM',
    totalMarks: 100,
    passingMarks: 40,
    grade: 'A',
    id: '1', // Unique identifier for the row
    status: 'Pending', // Status of the quiz
  },
  {
    class: '9',
    division: ['B', 'C'],
    subject: 'Science',
    quizTitle: 'Physics Quiz',
    createdAt: '2024-12-05',
    quizDate: '2024-12-20',
    quizTime: '11:00 AM',
    totalMarks: 50,
    passingMarks: 20,
    grade: 'B',
    id: '2',
    status: 'Completed',
  },
  {
    class: '8',
    division: ['C', 'D', 'E'],
    subject: 'English',
    quizTitle: 'Grammar Test',
    createdAt: '2024-12-08',
    quizDate: '2024-12-25',
    quizTime: '12:00 PM',
    totalMarks: 30,
    passingMarks: 15,
    grade: 'C',
    id: '3',
    status: 'Pending',
  },
  {
    class: '7',
    division: ['D', 'E'],
    subject: 'History',
    quizTitle: 'World Wars',
    createdAt: '2024-12-10',
    quizDate: '2024-12-30',
    quizTime: '09:00 AM',
    totalMarks: 70,
    passingMarks: 35,
    grade: 'B',
    id: '4',
    status: 'Pending',
  },
];

const ArchievedQuiz = () => {
  const [archivedTableData, setArchivedTableData] = useState(tableInitialData);
  const viewSubmissionDialog = useBoolean();
  const viewAnalyticsDialog = useBoolean();

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'Completed' && (
            <>
              <MenuItem
                onClick={() => {
                  viewAnalyticsDialog.onTrue();
                  pop.onClose();
                }}
              >
                <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                View Analytics
              </MenuItem>
              <MenuItem
                onClick={() => {
                  //   submissionDialog.onTrue();
                }}
              >
                <Iconify icon="material-symbols:upload" sx={{ height: '16px', width: '16px' }} />
                Publish Result
              </MenuItem>
            </>
          )}

          {(row.status === 'Pending' || row.status === 'Completed') && (
            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
                pop.onClose();
              }}
            >
              <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
              View Submission
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewAnalyticsDialog, viewSubmissionDialog]
  );

  return (
    <Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          {
            id: 'division',
            label: 'Division',
            render(value, row) {
              return (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {value.length
                    ? value.map((audience: string) => (
                        <Chip key={audience} label={audience} size="small" variant="outlined" />
                      ))
                    : '-'}
                </Box>
              );
            },
          },
          { id: 'subject', label: 'Subject' },
          { id: 'quizTitle', label: 'Quiz Title', minWidth: '130px', align: 'left' },
          { id: 'createdAt', label: 'Created At', minWidth: '130px', align: 'left' },
          { id: 'quizDate', label: 'Quiz Date', minWidth: '130px', align: 'left' },
          { id: 'quizTime', label: 'Quiz Time', minWidth: '130px', align: 'left' },
          { id: 'totalMakrs', label: 'Total Marks', minWidth: '130px', align: 'left' },
          { id: 'passingMarks', label: 'Passing Marks', minWidth: '150px', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Label
                  color={
                    value === 'Pending' ? 'warning' : value === 'Completed' ? 'primary' : 'default'
                  }
                >
                  {value}
                </Label>
              </Box>
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
                />
              );
            },
          },
        ]}
        data={archivedTableData}
      />
      <CustomDialog
        title="View Student Submission"
        open={viewSubmissionDialog.value}
        handleClose={viewSubmissionDialog.onFalse}
        maxWidth="md"
      >
        <StudentSubmissions />
      </CustomDialog>

      <CustomDialog
        title="View Student Submission"
        open={viewAnalyticsDialog.value}
        handleClose={viewAnalyticsDialog.onFalse}
        maxWidth="md"
      >
        <ViewAnalysis />
      </CustomDialog>
    </Box>
  );
};

export default ArchievedQuiz;

const studentTableInitialData = [
  {
    id: 1,
    studentName: 'John Doe',
    subject: 'Mathematics',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: 85,
    status: 'Pass',
    noOfAttempts: 1,
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    subject: 'Science',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: 35,
    status: 'Fail',
    noOfAttempts: 2,
  },
  {
    id: 3,
    studentName: 'Alice Johnson',
    subject: 'History',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: '',
    status: 'Pending',
    noOfAttempts: 1,
  },
  {
    id: 4,
    studentName: 'Bob Brown',
    subject: 'Geography',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: '',
    status: 'Pending',
    noOfAttempts: 1,
  },
  {
    id: 5,
    studentName: 'Eve Davis',
    subject: 'English',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: 70,
    status: 'Pass',
    noOfAttempts: 1,
  },
  {
    id: 6,
    studentName: 'Chris Wilson',
    subject: 'Biology',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: 45,
    status: 'Fail',
    noOfAttempts: 3,
  },
  {
    id: 7,
    studentName: 'Laura Adams',
    subject: 'Chemistry',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: '',
    status: 'Pending',
    noOfAttempts: 1,
  },
];

export const StudentSubmissions = () => {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any[]>(studentTableInitialData);
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
      {/* <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:pencil" />}
          disabled={selectedStudents.length === 0}
          onClick={bulkGradeDialog.onTrue}
        >
          Bulk Grade ({selectedStudents.length} selected)
        </Button>
      </Box> */}

      <Scrollbar sx={{ p: 2, height: '500px' }}>
        <CustomizableTable
          columns={[
            // {
            //   id: 'select',
            //   label: 'Select',
            //   render: (value, row: any) => (
            //     <Checkbox
            //       checked={selectedStudents.includes(row.id)}
            //       onChange={() => handleSelectStudent(row.id)}
            //     />
            //   ),
            // },
            { id: 'studentName', label: 'Student Name' },
            { id: 'noOfAttempts', label: 'No Of Attempts' },
            { id: 'totalMarks', label: 'Total Marks' },
            { id: 'passingMarks', label: 'Passing Marks' },
            {
              id: 'scoringMarks',
              label: 'Scoring Marks',
              render: (value, row) =>
                value ? <Typography variant="caption">{value}</Typography> : '-',
            },
            {
              id: 'status',
              label: 'Status',
              render: (value, row) => (
                <Label
                  color={
                    value === 'Pass'
                      ? 'primary'
                      : value === 'Fail'
                        ? 'error'
                        : value === 'Pending'
                          ? 'warning'
                          : 'error'
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
                        {row.status === 'Pending' && (
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

                        {(row.status === 'Fail' || row.status === 'Pass') && (
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

        {/* <CustomDialog
          open={viewSubmissionDialog.value}
          handleClose={handleCloseDialog}
          title="Assign Grade"
          maxWidth="md"
        >
          <AssignGrade data={selectedStudent} onSubmit={handleSingleGradeAssignment} />
        </CustomDialog> */}

        {/* <CustomDialog
          open={bulkGradeDialog.value}
          handleClose={bulkGradeDialog.onFalse}
          title={`Assign Grade to ${selectedStudents.length} Students`}
          maxWidth="md"
        >
          <AssignGrade onSubmit={handleBulkGradeAssignment} />
        </CustomDialog> */}
      </Scrollbar>
    </Box>
  );
};

const ViewAnalysis = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Math Quiz</Typography>
        <Box display="flex" gap={2}>
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            onClick={() => {
              // addAnounsmentDialog.onTrue();
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>
      <Scrollbar sx={{ p: 2, height: '500px' }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                ...bgGradient({
                  color: `135deg, ${varAlpha(theme.vars.palette.secondary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.48)}`,
                }),
                p: 3,
                boxShadow: 'none',
                position: 'relative',
                color: `${color}.darker`,
                backgroundColor: 'common.white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography
                  component="span"
                  sx={{ fontSize: '18px', fontWeight: '600' }}
                  gutterBottom
                >
                  Total Attempts
                </Typography>
              </Box>
              <Box display="flex" alignItems="flex-start" mt={2}>
                <Typography variant="h4" gutterBottom>
                  56
                </Typography>
              </Box>

              <SvgColor
                src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
                sx={{
                  top: 0,
                  left: -20,
                  width: 240,
                  zIndex: -1,
                  height: 240,
                  opacity: 0.24,
                  position: 'absolute',
                  color: `${color}.main`,
                }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                ...bgGradient({
                  color: `135deg, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.48)}`,
                }),
                p: 3,
                boxShadow: 'none',
                position: 'relative',
                color: `${color}.darker`,
                backgroundColor: 'common.white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography
                  component="span"
                  sx={{ fontSize: '18px', fontWeight: '600' }}
                  gutterBottom
                >
                  Average Score
                </Typography>
              </Box>
              <Box display="flex" alignItems="flex-start" mt={2}>
                <Typography variant="h4" gutterBottom>
                  56
                </Typography>
              </Box>

              <SvgColor
                src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
                sx={{
                  top: 0,
                  left: -20,
                  width: 240,
                  zIndex: -1,
                  height: 240,
                  opacity: 0.24,
                  position: 'absolute',
                  color: `${color}.main`,
                }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                ...bgGradient({
                  color: `135deg, ${varAlpha(theme.vars.palette.warning.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.48)}`,
                }),
                p: 3,
                boxShadow: 'none',
                position: 'relative',
                color: `${color}.darker`,
                backgroundColor: 'common.white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography
                  component="span"
                  sx={{ fontSize: '18px', fontWeight: '600' }}
                  gutterBottom
                >
                  Passing Ratio
                </Typography>
              </Box>
              <Box display="flex" alignItems="flex-start" mt={2}>
                <Typography variant="h4" gutterBottom>
                  73%
                </Typography>
              </Box>

              <SvgColor
                src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
                sx={{
                  top: 0,
                  left: -20,
                  width: 240,
                  zIndex: -1,
                  height: 240,
                  opacity: 0.24,
                  position: 'absolute',
                  color: `${color}.main`,
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={1} mt={0.5}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...bgGradient({
                  color: `135deg, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.48)}`,
                }),
                p: 3,
                boxShadow: 'none',
                position: 'relative',
                color: `${color}.darker`,
                backgroundColor: 'common.white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography
                  component="span"
                  sx={{ fontSize: '18px', fontWeight: '600' }}
                  gutterBottom
                >
                  Avg Completion Rate
                </Typography>
              </Box>
              <Box display="flex" alignItems="flex-start" mt={2}>
                <Typography variant="h4" gutterBottom>
                  15m
                </Typography>
              </Box>

              <SvgColor
                src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
                sx={{
                  top: 0,
                  left: -20,
                  width: 240,
                  zIndex: -1,
                  height: 240,
                  opacity: 0.24,
                  position: 'absolute',
                  color: `${color}.main`,
                }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...bgGradient({
                  color: `135deg, ${varAlpha(theme.vars.palette.secondary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.48)}`,
                }),
                p: 3,
                boxShadow: 'none',
                position: 'relative',
                color: `${color}.darker`,
                backgroundColor: 'common.white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography
                  component="span"
                  sx={{ fontSize: '18px', fontWeight: '600' }}
                  gutterBottom
                >
                  Difficulty Rating
                </Typography>
              </Box>
              <Box display="flex" alignItems="flex-start" mt={2}>
                <Typography variant="h4" gutterBottom>
                  3.5/5
                </Typography>
              </Box>

              <SvgColor
                src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
                sx={{
                  top: 0,
                  left: -20,
                  width: 240,
                  zIndex: -1,
                  height: 240,
                  opacity: 0.24,
                  position: 'absolute',
                  color: `${color}.main`,
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={12}>
            <AnalyticsWebsiteVisits
              title="Question Performance Analysis"
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9'],
                series: [
                  { name: 'Correct', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  { name: 'Incorrect', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                  { name: 'Skipped', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
                ],
                colors: [
                  alpha(theme.palette.primary.dark, 0.8),
                  alpha(theme.palette.warning.main, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
              }}
              sx={{ height: '100%' }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
              <PerformanceOverTime
                id="demo__4"
                title="Time Distribution Analysis"
                //   subheader="(+43%) than last year"
                chart={{
                  categories: ['0-5min', '5-10min', '10-15min', '15-20min', '20-25min'],
                  series: [
                    {
                      name: 'Students',
                      data: [5, 10, 4, 12, 2],
                    },
                  ],
                  options: {
                    legend: {
                      show: true,
                      position: 'top',
                    },
                  },
                }}
                sx={{ height: '100%', boxShadow: 'none' }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Score Distribution</Typography>
              </Box>
              <AnalyticsCurrentVisits
                title=""
                chart={{
                  series: [
                    { label: '2-8', value: 44 },
                    { label: '8-15', value: 55 },
                    { label: '15-25', value: 41 },
                  ],
                  options: {
                    chart: {
                      toolbar: {
                        show: true,
                        offsetX: 0,
                        offsetY: 0,
                        tools: {
                          download: true,
                          selection: false,
                          zoom: false,
                          zoomin: false,
                          zoomout: false,
                          pan: false,

                          customIcons: [],
                        },
                      },
                    },
                  },
                }}
                sx={{ height: '100%', boxShadow: 'none' }}
              />
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <TopPerformer
              title="Top Performer"
              sx={{ height: '100%' }}
              list={[
                {
                  id: '1',
                  name: 'Jayvion Simon',
                  avatarUrl: '/static/images/avatars/avatar_1.png',
                  totalMarks: 0,
                },
                {
                  id: '2',
                  name: 'Lucian Obrien',
                  avatarUrl: '/static/images/avatars/avatar_2.png',
                  totalMarks: 0,
                },
                {
                  id: '3',
                  name: 'Deja Bredy',
                  avatarUrl: '/static/images/avatars/avatar_3.png',
                  totalMarks: 0,
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopPerformer
              title="Bottom Performer"
              sx={{ height: '100%' }}
              list={[
                {
                  id: '1',
                  name: 'Jayvion Simon',
                  avatarUrl: '/static/images/avatars/avatar_1.png',
                  totalMarks: 0,
                },
                {
                  id: '2',
                  name: 'Lucian Obrien',
                  avatarUrl: '/static/images/avatars/avatar_2.png',
                  totalMarks: 0,
                },
                {
                  id: '3',
                  name: 'Deja Bredy',
                  avatarUrl: '/static/images/avatars/avatar_3.png',
                  totalMarks: 0,
                },
              ]}
            />
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};
