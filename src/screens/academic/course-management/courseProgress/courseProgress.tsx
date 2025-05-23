'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import courseProgressTableData from 'src/json/academic/syllabus/courseProgressTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import CourseCardsGrid from './components/courseCardsGrid';

import type { ICourse, IUpdateProgressProps } from './type';

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
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

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
          <Iconify icon={GlobalIcons.bell} />
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
          <Iconify icon={GlobalIcons.edit} />
          Update Progress
        </MenuItem>
      </MenuList>
    ),
    [updateProgressDialog]
  );

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      updateProgressDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      updateProgressDialog.onFalse();
    }
  };

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
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <CustomSelect
          label="Class"
          name="class"
          isLoading={isLoading}
          options={classData?.items || []}
          valueKey="id"
          labelKey="name"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          value={classes}
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
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
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
            searchFieldProps={{
              placeholder: 'Search by Chapter Name, Teacher Name, Progress...',
              label: 'Search by Chapter Name, Teacher Name, Progress...',
              sx: {
                maxWidth: '450px',
                width: '100%',
              },
            }}
            tableId="course-progress-table"
            noDataText={<>No Chapters Found For This Course Found </>}
            columns={[
              { id: 'chapterName', label: 'Chapter Name', align: 'left' },
              { id: 'teacherName', label: 'Teacher Name', align: 'left' },
              {
                id: 'progress',
                label: 'Progress',
                align: 'center',
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
                filterType: 'date',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD-MM-YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'actions',
                label: 'Actions',
                minWidth: 50,
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
          />{' '}
        </Box>
      )}
      {/* Dialog for updating progress */}
      <CustomDialog
        open={updateProgressDialog.value}
        handleClose={() => {
          updateProgressDialog.onFalse();
        }}
        title="Update Progress"
      >
        <UpdateProgress onClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default CourseProgress;

const UpdateProgress: React.FC<IUpdateProgressProps> = ({ onClose }: IUpdateProgressProps) => {
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
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box component="form" onSubmit={formik.handleSubmit} p={2}>
        <ShakingTextField
          error={!!(formik.touched.completePercentage && formik.errors.completePercentage) || false}
        >
          <TextField
            fullWidth
            id="completePercentage"
            name="completePercentage"
            label="Add Approax Percentage"
            placeholder="Enter Add Approax Percentage"
            value={formik.values.completePercentage}
            onChange={formik.handleChange}
            error={formik.touched.completePercentage && Boolean(formik.errors.completePercentage)}
            // @ts-ignore
            helperText={formik.touched.completePercentage && formik.errors.completePercentage}
            size="small"
          />
        </ShakingTextField>
        <DialogActions sx={{ flexShrink: 0, p: 2 }}>
          <CancelButton
            onClick={() => {
              onClose(null, false);
            }}
          />
          <SubmitButton onClick={() => {}} />
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};
