'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';
import type {
  ICourse,
  ICourseDetail,
  IUpdateProgressProps,
} from 'src/screens/academic/course-management/courseProgress/type';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Slider,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  sliderClasses,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import courseProgressTableData from 'src/json/academic/syllabus/employee-course-data.json';
import CourseCardsGrid from 'src/screens/academic/course-management/courseProgress/components/courseCardsGrid';
import ViewChapterLogs from 'src/screens/academic/course-management/courseProgress/components/viewChapterLogs';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { ComponentBlock } from 'src/components/component-block';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const CourseProgress = () => {
  const [courses, setCourses] = useState<ICourse[]>(courseProgressTableData);
  // State to store the selected course details
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  // Dialog state for updating progress
  const updateProgressDialog = useBoolean();
  // Handler for when a course card is selected
  const handleCardDetails = (course: ICourse) => {
    setSelectedCourse(course);
  };
  const [selectedChapter, setSelectedChapter] = useState<ICourseDetail | null>(null);
  // Get isChanges state from Redux store to track if there are unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get dispatch function to dispatch Redux actions
  const dispatch = useDispatch();

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  const viewLogsDialog = useBoolean();
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes, setDivision]);

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
        <MenuItem
          onClick={() => {
            viewLogsDialog.onTrue();
            setSelectedChapter(row);
            pop.onClose();
          }}
        >
          {' '}
          <Iconify icon={GlobalIcons.eye} />
          View Logs
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
    [updateProgressDialog, viewLogsDialog]
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
      {/* Class and Division selection filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClasses(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
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
            noDataText={<>No Chapters Found For This Course Found </>}
            columns={[
              { id: 'chapterName', label: 'Chapter Name', align: 'left' },

              {
                id: 'timeLine',
                label: 'Deadline',
                align: 'left',
                filterType: 'date',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD-MM-YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'progress',
                label: 'Progress',
                align: 'left',
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
              // {
              //   id: 'actions',
              //   label: 'Action',
              //   minWidth: 50,
              //   align: 'left',
              //   sticky: true,
              //   isFilter: false,
              //   render(value: any, row: any) {
              //     return (
              //       <ThreeDotsActions
              //         actions={(prop) => actions({ ...prop, row })}
              //         placement="right-top"
              //       />
              //     );
              //   },
              // },
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

      <CustomDialog
        open={viewLogsDialog.value}
        handleClose={() => {
          viewLogsDialog.onFalse();
        }}
        maxWidth="sm"
        title={`${selectedChapter?.chapterName} Logs`}
      >
        <ViewChapterLogs onClose={handleClose} selectedChapter={selectedChapter} />
      </CustomDialog>
    </Box>
  );
};

export default CourseProgress;

const marks = [
  { value: 0, label: '0' },
  { value: 20, label: '20' },
  { value: 37, label: '40' },
  { value: 100, label: '100' },
];

const UpdateProgress: React.FC<IUpdateProgressProps> = ({ onClose }: IUpdateProgressProps) => {
  const formik = useFormik({
    initialValues: {
      completePercentage: 0, // Adjusted field name to match the input ID
      description: '',
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
      <Box component="form" flexDirection="column" onSubmit={formik.handleSubmit} p={2} gap={3}>
        <ShakingTextField
          error={!!(formik.touched.completePercentage && formik.errors.completePercentage) || false}
        >
          <ComponentBlock>
            <Slider
              defaultValue={20}
              onChange={(event, value) => {
                formik.setFieldValue('completePercentage', value);
              }}
              getAriaValueText={(value) => `${value}%`}
              step={10}
              valueLabelDisplay="auto"
              marks={marks}
              sx={{ [`& .${sliderClasses.mark}[data-index="3"]`]: { display: 'none' } }}
            />
          </ComponentBlock>
        </ShakingTextField>

        <TextField
          fullWidth
          multiline
          rows={4}
          name="description"
          label="Description"
          placeholder="Enter description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={!!(formik.touched.description && formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />

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
