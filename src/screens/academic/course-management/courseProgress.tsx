'use client';

import type { Dayjs } from 'dayjs';
import type { ChartOptions } from 'src/components/chart';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  alpha,
  Button,
  MenuList,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import CustomDialog from 'src/components/customDialog';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Interface representing details of a course chapter
interface CourseDetail {
  chapterName: string; // Name of the chapter
  teacherName: string; // Name of the teacher assigned to the chapter
  progress: number; // Progress percentage completed for the chapter
  pending: number; // Remaining percentage to be completed
  timeLine: Dayjs | null; // Timeline/deadline for the chapter completion
}

// Interface representing a course with its details
interface Course {
  id: number; // Unique identifier for the course
  name: string; // Name of the course
  progress: number; // Overall progress percentage of the course
  details: CourseDetail[]; // Array of chapter details for the course
  completedChapter: number; // Number of chapters completed
  totalChapter: number; // Number of chapters pending
  color: string; // Color of the course
}

const courses: Course[] = [
  {
    id: 1,
    name: 'Math Course',
    progress: 75,
    completedChapter: 6,
    totalChapter: 10,
    color: '#007F63', // green
    details: [
      {
        chapterName: 'Algebra Basics',
        teacherName: 'John Doe',
        progress: 60,
        pending: 40,
        timeLine: dayjs('2024-10-28'),
      },
      {
        chapterName: 'Geometry Foundations',
        teacherName: 'Jane Smith',
        progress: 80,
        pending: 20,
        timeLine: dayjs('2024-11-05'),
      },
    ],
  },
  {
    id: 2,
    name: 'Science Course',
    progress: 86.6,
    completedChapter: 10,
    totalChapter: 20,
    color: '#006BA6', // blue
    details: [
      {
        chapterName: 'Physics Introduction',
        teacherName: 'Emily Brown',
        progress: 70,
        pending: 30,
        timeLine: dayjs('2024-11-10'),
      },
      {
        chapterName: 'Chemistry Basics',
        teacherName: 'David Lee',
        progress: 90,
        pending: 10,
        timeLine: dayjs('2024-11-15'),
      },
    ],
  },
  {
    id: 3,
    name: 'English Course',
    progress: 75,
    completedChapter: 10,
    totalChapter: 20,
    color: '#8E44AD', // purple
    details: [
      {
        chapterName: 'Grammar Essentials',
        teacherName: 'Tom Harris',
        progress: 55,
        pending: 45,
        timeLine: dayjs('2024-10-20'),
      },
      {
        chapterName: 'Writing Skills',
        teacherName: 'Lisa Chen',
        progress: 75,
        pending: 25,
        timeLine: dayjs('2024-10-30'),
      },
    ],
  },
  {
    id: 4,
    name: 'Gujarati Course',
    progress: 86.6,
    completedChapter: 10,
    totalChapter: 20,
    color: '#D35400', // orange
    details: [
      {
        chapterName: 'Alphabet and Basics',
        teacherName: 'Raj Patel',
        progress: 88,
        pending: 12,
        timeLine: dayjs('2024-11-01'),
      },
      {
        chapterName: 'Reading Comprehension',
        teacherName: 'Priya Shah',
        progress: 85,
        pending: 15,
        timeLine: dayjs('2024-11-10'),
      },
    ],
  },
];

const CourseProgress = (props: TabComponentType) => {
  // State to store the selected course details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // Props destructuring for search parameters
  const { searchParams, setSearchParams } = props;
  // Dialog state for updating progress
  const updateProgressDialog = useBoolean();
  // Handler for when a course card is selected
  const handleCardDetails = (course: Course) => {
    setSelectedCourse(course);
  };

  // Fetch class data using custom hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // States for managing class and division selection
  const [classes, setClasses] = useState('');
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Effect to handle class and division selection logic
  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        // If a class is selected, find the selected class and update division options
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        // If no class is selected, default to first class and its divisions
        const firstClass = classData.items[0];
        setClasses(firstClass.id);
        setDivisionOptions(firstClass?.divisions || []);
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes]);

  // Callback function to render action menu items
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {/* Reminder action item */}
        <MenuItem onClick={() => {}}>
          {' '}
          <Iconify icon="mdi:bell" />
          Reminder
        </MenuItem>
        {/* Mark as complete action item */}
        <MenuItem onClick={() => {}}>
          {' '}
          <Iconify icon="mdi:tick" />
          Mark As Complete
        </MenuItem>
        {/* Update progress action item */}
        <MenuItem
          onClick={() => {
            updateProgressDialog.onTrue();
            pop.onClose();
          }}
        >
          {' '}
          <Iconify icon="solar:pen-bold" />
          Update Progress
        </MenuItem>
      </MenuList>
    ),
    [updateProgressDialog]
  );

  return (
    <Box>
      {/* Custom breadcrumbs navigation component */}
      <CustomBreadcrumbs
        heading="Syllabus Progress"
        description="Track the progress of each subject and its chapters in real-time. Monitor completed and pending chapters, and analyze progress to ensure curriculum coverage and effective learning."
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Syllabus', href: '/academic/courseSubjects' },
          { name: 'Syllabus Progress' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      {/* Class and Division selection filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          name="class"
          isLoading={isLoading}
          options={classData?.items || []}
          valueKey="id"
          labelKey="name"
          formControlProps={{ sx: { width: '150px' } }}
          value={searchParams?.classId || ''}
          onChange={(value) => {
            setClasses(value as string);
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
      </Box>
      {/* Grid of course cards showing progress */}
      <Grid container spacing={2} marginTop={2} marginBottom={4}>
        {courses.map((course) => (
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                '&:hover': {
                  transform: 'scale(1.05)', // zoom in
                  zIndex: 2,
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)', // subtle elevation
                },
                cursor: 'pointer',
              }}
              onClick={() => {
                handleCardDetails(course);
              }}
            >
              <AppWidget
                title={course.name}
                color={course.color}
                icon="solar:user-rounded-bold"
                chart={{ series: course.progress }}
                completedChapter={course.completedChapter}
                totalChapter={course.totalChapter}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Selected course details section */}
      {selectedCourse && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {selectedCourse.name} Details
          </Typography>
          {/* Table showing chapter-wise progress details */}
          <CustomizableTable
            tableId="course-progress-table"
            columns={[
              { id: 'chapterName', label: 'Chapter Name', minWidth: '200px', align: 'left' },
              { id: 'teacherName', label: 'Teacher Name', minWidth: '200px', align: 'left' },
              {
                id: 'progress',
                label: 'Progress',
                align: 'center',
                minWidth: '200px',
                filterType: 'number',
                render(value, row) {
                  return (
                    // Circular progress indicator with percentage
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress variant="determinate" value={value} />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ color: 'text.secondary' }}
                        >
                          {value}%
                        </Typography>
                      </Box>
                    </Box>
                  );
                },
              },
              {
                id: 'timeLine',
                label: 'Timeline',
                align: 'left',
                minWidth: '200px',
                filterType: 'date',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'actions',
                label: 'Actions',
                minWidth: '200px',
                align: 'left',
                sticky: true,
                isFilter: false,
                render(value: any, row: any) {
                  return (
                    <ThreeDotsActions
                      actions={(prop) => actions({ ...prop, row })}
                      placement="right-top"
                    />
                  );
                },
              },
            ]}
            data={selectedCourse.details}
          />
        </Box>
      )}
      {/* Dialog for updating progress */}
      <CustomDialog
        open={updateProgressDialog.value}
        handleClose={updateProgressDialog.onFalse}
        title="Update Progress"
      >
        <UpdateProgress />
      </CustomDialog>
    </Box>
  );
};

export default CourseProgress;

const UpdateProgress = () => {
  const formik = useFormik({
    initialValues: {
      completePercentage: '', // Adjusted field name to match the input ID
    },
    validationSchema: Yup.object({
      completePercentage: Yup.number()
        .min(0, 'Percentage cannot be negative')
        .max(100, 'Percentage cannot exceed 100')
        .required('Complete Percentage is required'),
    }),
    onSubmit: (values) => {
      // Add submission logic here
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
      <ShakingTextField
        error={!!(formik.touched.completePercentage && formik.errors.completePercentage) || false}
      >
        <TextField
          fullWidth
          id="completePercentage"
          name="completePercentage"
          label="Add Approax Percentage"
          value={formik.values.completePercentage}
          onChange={formik.handleChange}
          error={formik.touched.completePercentage && Boolean(formik.errors.completePercentage)}
          // @ts-ignore
          helperText={formik.touched.completePercentage && formik.errors.completePercentage}
          size="small"
        />
      </ShakingTextField>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={() => {}}>
          Cancel
        </Button>
        <LoadingButton
          // loading={isLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

interface AppWidgetProps {
  title: string;
  total?: number;
  color: string;
  icon: string;
  totalChapter: number;
  completedChapter: number;
  chart: {
    colors?: string[];
    series: number;
    options?: ChartOptions;
  };
}

export const AppWidget: React.FC<AppWidgetProps> = ({
  title,
  total,
  color,
  icon,
  chart,
  totalChapter,
  completedChapter,
}) => {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.light, theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'solid',
      colors: chartColors,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color: 'white',
            fontSize: theme.typography.subtitle2.fontSize as string,
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: color, // rich green background
        color: 'common.white',
        width: '100%',
        minHeight: 120,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Circular Progress Chart */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          color: 'white',
        }}
      >
        <Chart
          type="radialBar"
          series={[chart.series]}
          options={chartOptions}
          width={80}
          height={80}
        />
      </Box>

      {/* Background SVG */}
      <SvgColor
        src="/assets/background/shape-circle-3.svg"
        sx={{
          width: 180,
          height: 180,
          position: 'absolute',
          opacity: 0.06,
          right: 0,
          top: 0,
          zIndex: 0,
        }}
      />

      {/* Textual Content */}
      <Box sx={{ ml: 2, zIndex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'common.white' }}>
          {completedChapter}/{totalChapter}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            mt: 0.5,
            color: alpha('#ffffff', 0.8),
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};
