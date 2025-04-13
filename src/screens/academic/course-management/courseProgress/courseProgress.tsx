'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
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
import courseProgressTableData from 'src/json/academic/syllabus/courseProgressTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CourseCardsGrid from './components/courseCardsGrid';

import type { ICourse } from './type';

const CourseProgress = (props: TabComponentType) => {
  const [courses, setCourses] = useState<ICourse[]>(courseProgressTableData);
  // State to store the selected course details
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  // Props destructuring for search parameters
  const { searchParams, setSearchParams } = props;
  // Dialog state for updating progress
  const updateProgressDialog = useBoolean();
  // Handler for when a course card is selected
  const handleCardDetails = (course: ICourse) => {
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
      <CourseCardsGrid courses={courses} handleCardDetails={handleCardDetails} />

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
