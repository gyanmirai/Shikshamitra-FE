import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box, Card, Grid, MenuList, MenuItem, Typography } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { AppWidget } from './courseManagement';

interface CourseDetail {
  studentName: string;
  unitsCompleted: string;
  pendingAssessments: number;
  averageGrade: string;
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
        studentName: 'John Doe',
        unitsCompleted: '5/8 Units',
        pendingAssessments: 2,
        averageGrade: 'B+',
      },
      {
        studentName: 'Jane Smith',
        unitsCompleted: '6/8 Units',
        pendingAssessments: 1,
        averageGrade: 'A-',
      },
      {
        studentName: 'Mike Johnson',
        unitsCompleted: '4/8 Units',
        pendingAssessments: 3,
        averageGrade: 'B',
      },
    ],
  },
  {
    id: 2,
    name: 'Science Course',
    progress: 86.6,
    details: [
      {
        studentName: 'Emily Brown',
        unitsCompleted: '7/8 Units',
        pendingAssessments: 1,
        averageGrade: 'A',
      },
      {
        studentName: 'David Lee',
        unitsCompleted: '6/8 Units',
        pendingAssessments: 2,
        averageGrade: 'B+',
      },
      {
        studentName: 'Sarah Wilson',
        unitsCompleted: '5/8 Units',
        pendingAssessments: 2,
        averageGrade: 'B',
      },
    ],
  },
  {
    id: 3,
    name: 'English Course',
    progress: 75,
    details: [
      {
        studentName: 'Tom Harris',
        unitsCompleted: '5/8 Units',
        pendingAssessments: 2,
        averageGrade: 'B+',
      },
      {
        studentName: 'Lisa Chen',
        unitsCompleted: '6/8 Units',
        pendingAssessments: 1,
        averageGrade: 'A-',
      },
      {
        studentName: 'Alex Taylor',
        unitsCompleted: '4/8 Units',
        pendingAssessments: 3,
        averageGrade: 'B-',
      },
    ],
  },
  {
    id: 4,
    name: 'Gujarati Course',
    progress: 86.6,
    details: [
      {
        studentName: 'Raj Patel',
        unitsCompleted: '7/8 Units',
        pendingAssessments: 1,
        averageGrade: 'A',
      },
      {
        studentName: 'Priya Shah',
        unitsCompleted: '6/8 Units',
        pendingAssessments: 2,
        averageGrade: 'B+',
      },
      {
        studentName: 'Amit Desai',
        unitsCompleted: '5/8 Units',
        pendingAssessments: 2,
        averageGrade: 'B',
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

  return (
    <Box>
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
          <Grid item xs={12} md={3}>
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
                { id: 'studentName', label: 'Student Name' },
                { id: 'unitsCompleted', label: 'Units Completed' },
                { id: 'pendingAssessments', label: 'Pending Assessments' },
                { id: 'averageGrade', label: 'Average Grade' },
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
