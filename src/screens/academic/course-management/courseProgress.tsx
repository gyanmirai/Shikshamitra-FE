'use client';

import type { Dayjs } from 'dayjs';
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
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AppWidget } from './courseManagement';

interface CourseDetail {
  chapterName: string;
  teacherName: string;
  progress: number;
  pending: number;
  timeLine: Dayjs | null;
}

interface Course {
  id: number;
  name: string;
  progress: number;
  details: CourseDetail[];
}

const courses: Course[] = [
  {
    id: 1,
    name: 'Math Course',
    progress: 75,
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { searchParams, setSearchParams } = props;
  const updateProgressDialog = useBoolean();
  const handleCardDetails = (course: Course) => {
    setSelectedCourse(course);
  };

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [classes, setClasses] = useState('');
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setClasses(firstClass.id);
        setDivisionOptions(firstClass?.divisions || []);
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes]);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem onClick={() => {}}>
          {' '}
          <Iconify icon="mdi:bell" />
          Reminder
        </MenuItem>
        <MenuItem onClick={() => {}}>
          {' '}
          <Iconify icon="mdi:tick" />
          Mark As Complete
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log('updateProgressDialog ---onclick');
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
      <CustomBreadcrumbs
        heading="Course Progress"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Course Management' },
          { name: 'Course Progress' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
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
      <Grid container spacing={2} marginTop={2} marginBottom={4}>
        {courses.map((course) => (
          <Grid item xs={12} md={2}>
            <Card
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                border:
                  selectedCourse?.id === course.id
                    ? '2px solid #1a1a1a' // Darker border when selected
                    : '1px solid #e0e0e0', // Initial light border
                transition: 'all 0.2s ease',
                boxShadow:
                  selectedCourse?.id === course.id ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : 'none',
                '&:hover': {
                  borderColor: '#757575', // Medium gray for hover state
                },
                cursor: 'pointer',
              }}
              onClick={() => {
                handleCardDetails(course);
              }}
            >
              <AppWidget
                title={course.name}
                icon="solar:user-rounded-bold"
                chart={{ series: course.progress }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedCourse && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {selectedCourse.name} Details
          </Typography>
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
  console.log('update progress called');

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
      console.log('Submitting:', values);
      // Add submission logic here
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
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
