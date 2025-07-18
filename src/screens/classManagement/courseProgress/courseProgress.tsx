'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

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

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import CustomTooltip from 'src/components/custom-tooltip';
import { ComponentBlock } from 'src/components/component-block';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import CourseCardsGrid from './components/courseCardsGrid';
import ViewChapterLogs from './components/viewChapterLogs';

import type { ICourse, ICourseDetail, IUpdateProgressProps } from './type';

const CourseProgressComponent = ({ courseData, isAction = true }: any) => {
  const [courses, setCourses] = useState<any[]>(courseData);

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

  const viewLogsDialog = useBoolean();
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state

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
      {/* Grid of course cards showing progress */}
      <CourseCardsGrid courses={courses} handleCardDetails={handleCardDetails} />

      {selectedCourse && (
        <>
          <Typography variant="h6" gutterBottom>
            {selectedCourse.name} Details
          </Typography>
          {isAction ? (
            <CustomizableTable
              tableId="course-progress-table"
              noDataText={<>No Chapters Found For This Course Found </>}
              columns={[
                { id: 'chapterNumber', label: 'Chapter No.', align: 'left', minWidth: 120 },
                { id: 'chapterName', label: 'Chapter Name', align: 'left', minWidth: 260 },
                {
                  id: 'startDate',
                  label: 'Start Date',
                  align: 'left',
                  filterType: 'date',
                  minWidth: 170,
                },
                {
                  id: 'timeLine',
                  label: 'End Date',
                  minWidth: 170,
                  align: 'left',
                  filterType: 'date',
                  renderColumn: () => (
                    <CustomTooltip
                      arrow
                      title={
                        <Box display="flex" flexDirection="column">
                          <Typography variant="caption">
                            <Box component="span" color="error.main">
                              Red:{' '}
                            </Box>
                            <Box component="span">Due within 7 days</Box>
                          </Typography>
                          <Typography variant="caption">
                            <Box component="span" color="warning.main">
                              Yellow:{' '}
                            </Box>
                            <Box component="span">Due within 30 days</Box>
                          </Typography>
                          <Typography variant="caption">
                            <Box component="span" color="success.main">
                              Green:{' '}
                            </Box>
                            <Box component="span">Due after 30 days</Box>
                          </Typography>
                          <Typography variant="caption">
                            <Box component="span">Black: </Box>
                            <Box component="span">Completed Successfully</Box>
                          </Typography>
                        </Box>
                      }
                    >
                      <Iconify icon="eva:info-outline" width={16} position="relative" />
                    </CustomTooltip>
                  ),
                  render(value, row) {
                    const [day, month, year] = value.split('-');
                    const endDate = new Date(`${year}-${month}-${day}`);
                    const today = new Date();
                    endDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    const diffDays = Math.ceil(
                      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    // If progress is 100%, use normal text color
                    if (row.progress === 100) {
                      return (
                        <Typography variant="caption" fontSize="13px">
                          {value}
                        </Typography>
                      );
                    }

                    let color = 'text.secondary';

                    if (diffDays <= 7) {
                      color = 'error.main'; // red
                    } else if (diffDays <= 30) {
                      color = 'warning.main'; // yellow
                    } else {
                      color = 'success.main'; // green
                    }
                    return (
                      <Typography variant="caption" fontSize="13px" sx={{ color }}>
                        {value}
                      </Typography>
                    );
                  },
                },
                {
                  id: 'progress',
                  label: 'Progress',
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
                  id: 'actions',
                  label: 'Actions',
                  minWidth: 40,
                  align: 'left',
                  sticky: true,
                  isFilter: false,
                  render(value: any, row: any) {
                    return (
                      <ThreeDotsActions
                        actions={(prop) => actions({ ...prop, row })}
                        placement="right-center"
                      />
                    );
                  },
                },
              ]}
              data={selectedCourse.details}
            />
          ) : (
            <CustomizableTable
              tableId="course-progress-table"
              noDataText={<>No Chapters Found For This Course Found </>}
              columns={[
                { id: 'chapterNumber', label: 'Chapter No.', align: 'left', minWidth: 120 },
                { id: 'chapterName', label: 'Chapter Name', align: 'left', minWidth: 260 },
                {
                  id: 'startDate',
                  label: 'Start Date',
                  align: 'left',
                  filterType: 'date',
                  minWidth: 170,
                },
                {
                  id: 'timeLine',
                  label: '',
                  minWidth: 170,
                  align: 'left',
                  filterType: 'date',
                  renderColumn: () => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      End Date
                      <CustomTooltip
                        arrow
                        title={
                          <Box display="flex" flexDirection="column">
                            <Typography variant="caption">
                              <Box component="span" color="error.main">
                                Red :{' '}
                              </Box>
                              <Box component="span">Due within 7 days</Box>
                            </Typography>

                            <Typography variant="caption">
                              <Box component="span" color="warning.main">
                                Yellow :{' '}
                              </Box>
                              <Box component="span">Due within 30 days</Box>
                            </Typography>

                            <Typography variant="caption">
                              <Box component="span" color="success.main">
                                Green :{' '}
                              </Box>
                              <Box component="span">Due after 30 days</Box>
                            </Typography>

                            <Typography variant="caption">
                              <Box component="span">Black : </Box>
                              <Box component="span">Completed Successfully</Box>
                            </Typography>
                          </Box>
                        }
                      >
                        <Iconify icon="eva:info-outline" width={16} />
                      </CustomTooltip>
                    </Box>
                  ),
                  render(value, row) {
                    const [day, month, year] = value.split('-');
                    const endDate = new Date(`${year}-${month}-${day}`);
                    const today = new Date();
                    endDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    const diffDays = Math.ceil(
                      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    // If progress is 100%, use normal text color
                    if (row.progress === 100) {
                      return (
                        <Typography variant="caption" fontSize="13px">
                          {value}
                        </Typography>
                      );
                    }

                    let color = 'text.secondary';

                    if (diffDays <= 7) {
                      color = 'error.main'; // red
                    } else if (diffDays <= 30) {
                      color = 'warning.main'; // yellow
                    } else {
                      color = 'success.main'; // green
                    }
                    return (
                      <Typography variant="caption" fontSize="13px" sx={{ color }}>
                        {value}
                      </Typography>
                    );
                  },
                },
                {
                  id: 'progress',
                  label: 'Progress',
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
              ]}
              data={selectedCourse.details}
            />
          )}
        </>
      )}
      {/* Dialog for updating progress */}
      <CustomDialog
        open={updateProgressDialog.value}
        handleClose={() => {
          updateProgressDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Update Progress (%)</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Update the completion percentage and add notes about the progress made in this chapter"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <UpdateProgress onClose={handleClose} />
      </CustomDialog>

      <CustomDialog
        open={viewLogsDialog.value}
        handleClose={() => {
          viewLogsDialog.onFalse();
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{selectedChapter?.chapterName} Logs</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View the history of progress updates and changes made to this chapter's completion status"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ViewChapterLogs onClose={handleClose} selectedChapter={selectedChapter} />
      </CustomDialog>
    </Box>
  );
};

export default CourseProgressComponent;

const marks = [
  { value: 0, label: '0' },
  { value: 20, label: '20' },
  { value: 40, label: '40' },
  { value: 60, label: '60' },
  { value: 80, label: '80' },
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
      <Box component="form" flexDirection="column" onSubmit={formik.handleSubmit} gap={3} p={2}>
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
              step={1}
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
          // placeholder="Enter description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={!!(formik.touched.description && formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />
      </Box>
      <DialogActions sx={{ flexShrink: 0, p: 2 }}>
        <CancelButton
          onClick={() => {
            onClose(null, false);
          }}
        />
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </BackPopUpChecked>
  );
};
