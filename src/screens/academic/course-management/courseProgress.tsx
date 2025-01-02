'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';

import { Box, Card, Grid, MenuList, MenuItem, Typography, CircularProgress } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
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

  const handleCardDetails = (course: Course) => {
    setSelectedCourse(course);
  };

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (!searchParams?.classId) {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
      }
    }
  }, [classData?.items, searchParams?.classId, setSearchParams]);

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
      <CustomSelect
        label="Class"
        name="class"
        isLoading={isLoading}
        options={classData?.items || []}
        valueKey="id"
        labelKey="name"
        formControlProps={{ sx: { width: '200px' } }}
        value={searchParams?.classId || ''}
        onChange={(value) => {
          setSearchParams?.({
            classId: value as string,
          });
        }}
      />
      <Grid container spacing={2} marginTop={2}>
        {courses.map((course) => (
          <Grid item xs={12} md={2}>
            <Card
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                border:
                  selectedCourse?.id === course.id ? '2px solid black' : '1px solid transparent',
                transition: 'border 0.2s ease',
                // Optional: add shadow effect when selected
                boxShadow: selectedCourse?.id === course.id ? '0 0 0 2px rgba(0, 0, 0, 0)' : 'none',
                '&:hover': {
                  borderColor: 'gray', // lighter blue for hover state
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
        {selectedCourse && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {selectedCourse.name} Details
            </Typography>
            <CustomizableTable
              columns={[
                { id: 'chapterName', label: 'Chapter Name' },
                { id: 'teacherName', label: 'Teacher Name' },
                {
                  id: 'progress',
                  label: 'Progress',
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
                  id: 'pending',
                  label: 'Pending',
                  render(value, row) {
                    return (
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress color="error" variant="determinate" value={value} />
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
                  render: (value, row) => (
                    <Typography fontSize="12px" gutterBottom>
                      {dayjs(value).format('DD MMM YYYY')}
                    </Typography>
                  ),
                },
                {
                  id: 'action',
                  label: 'Action',
                  render(value: any, row: any) {
                    return (
                      <ThreeDotsActions
                        actions={({ popover }: any) => (
                          <MenuList>
                            <Iconify icon="mdi:bell" sx={{ mr: 2 }} />
                            <MenuItem onClick={() => {}}>Send Reminder</MenuItem>
                          </MenuList>
                        )}
                      />
                    );
                  },
                },
              ]}
              data={selectedCourse.details}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CourseProgress;
