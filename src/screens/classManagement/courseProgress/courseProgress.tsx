'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { sliderClasses } from '@mui/material/Slider';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import { ComponentBlock } from 'src/components/component-block';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  Box,
  Card,
  Grid,
  Slider,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  useGetSubjectsQuery,
  useGetChaptersProgressQuery,
  useUpdateChapterProgressMutation,
} from 'src/redux/classManagementApi/subjectProgressManageApi/subjectProgressManageApi';

import CourseCardsGrid from './components/courseCardsGrid';
import ViewChapterLogs from './components/viewChapterLogs';

import type { ICourse, ICourseDetail, IUpdateProgressProps } from './type';

const EndToolTip = () => (
  <CustomTooltip
    sx={{ textAlign: 'left' }}
    arrow
    title={
      <Box display="flex" flexDirection="column" gap={0.5}>
        {/* Map through color indicators and their meanings */}
        {[
          { label: 'Red', color: 'error.main', text: 'Due within 7 days' },
          { label: 'Yellow', color: 'warning.main', text: 'Due within 30 days' },
          { label: 'Green', color: 'success.main', text: 'Due after 30 days' },
          {
            label: 'Black',
            color: 'text.primary',
            text: 'Completed Successfully',
          },
        ].map(({ label, color, text }) => (
          <Box key={label} display="flex">
            <Box component="span" sx={{ color, minWidth: 50, fontWeight: 500 }}>
              {label} :
            </Box>
            <Typography variant="caption">{text}</Typography>
          </Box>
        ))}
      </Box>
    }
  >
    <Iconify icon="eva:info-outline" width={20} position="relative" sx={{ pt: 0.7 }} />
  </CustomTooltip>
);

const CourseProgressComponent = ({
  courseData,
  isAction = true,
  selectedClass,
  selectedDivision,
  layout = 'horizontal',
}: any) => {
  const isVertical = layout === 'vertical';
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

  const isApiActive = !!(selectedClass && selectedDivision && (currentMedium as Medium)?.id);

  const {
    data: subjectData,
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectsQuery,
    params: {
      academicMediumId: (currentMedium as Medium)?.id,
      classId: selectedClass,
      divisionId: selectedDivision,
    },
    options: {
      skip: !isApiActive,
    },
  });

  const courses = useMemo<ICourse[]>(() => {
    // When the API is not active (student/HR profile view), use the courseData prop directly
    if (!isApiActive) return courseData || [];

    const raw: any[] =
      subjectData?.data?.items ??
      subjectData?.items ??
      subjectData?.records ??
      (Array.isArray(subjectData) ? subjectData : []);

    const seen = new Set<string>();
    return raw
      .map((s: any) => ({
        id: s.id ?? s.subjectId,
        name: s.subjectName ?? s.name ?? '',
        color: s.color ?? '#1976d2',
        progress: s.progress ?? 0,
        completedChapter: s.completedChapter ?? 0,
        totalChapter: s.totalChapter ?? 0,
        details: s.details ?? [],
      }))
      .filter((course) => {
        const key = String(course.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [subjectData, courseData, isApiActive]);

  // State to store the selected course details
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  // Dedicated string ID so the chapters query gets a stable, clean param on every subject click
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Reset selection whenever class or division changes to avoid stale chapter data
  useEffect(() => {
    setSelectedCourse(null);
    setSelectedSubjectId('');
  }, [selectedClass, selectedDivision]);

  const { data: chaptersData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersProgressQuery,
    params: {
      academicMediumId: (currentMedium as Medium)?.id,
      classId: selectedClass,
      divisionId: selectedDivision,
      subjectId: selectedSubjectId,
    },
    options: {
      skip: !isApiActive || !selectedSubjectId,
    },
  });

  useEffect(() => {
    if (!chaptersData) return;

    const raw: any[] =
      chaptersData?.data?.items ??
      chaptersData?.items ??
      chaptersData?.records ??
      (Array.isArray(chaptersData) ? chaptersData : []);

    setSelectedCourse((prev) => (prev ? { ...prev, details: raw } : null));
  }, [chaptersData]);

  // Dialog state for updating progress
  const updateProgressDialog = useBoolean();
  // Handler for when a course card is selected
  const handleCardDetails = (course: ICourse) => {
    setSelectedCourse(course);
    setSelectedSubjectId(course.id ? String(course.id) : '');
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
            setSelectedChapter(row);
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

  /**
   * Handles closing of the update progress dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Close dialog if either:
    // 1. Form was submitted successfully
    // 2. There are unsaved changes and user confirms leaving
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      updateProgressDialog.onFalse();
      dispatch(setIsChanges(false));
    }
    // Close dialog if there are no unsaved changes
    else if (!isChanges) {
      updateProgressDialog.onFalse();
    }
  };

  /**
   * Renders a tooltip component showing color-coded deadline indicators
   * Used to explain the meaning of different colors in the timeline
   */

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Grid
        container
        spacing={isVertical ? 3 : 1}
        direction={isVertical ? 'column' : 'row'}
        sx={{
          mt: 0,
          flexGrow: 1,
          display: 'flex',
          height: isVertical ? 'auto' : '100%',
          minHeight: '0',
        }}
      >
        {/* Left Section – Course Cards */}
        <Grid
          size={{ xs: 12, md: isVertical ? 12 : 3 }}
          sx={{ height: isVertical ? 'auto' : '100%' }}
        >
          {isVertical ? (
            <Box>
              <CourseCardsGrid
                key={`${selectedClass}-${selectedDivision}`}
                courses={courses}
                handleCardDetails={handleCardDetails}
                layout={layout}
                isLoading={isSubjectsLoading || isSubjectsFetching}
              />
            </Box>
          ) : (
            <Card
              sx={{
                height: '100%',
                p: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CourseCardsGrid
                key={`${selectedClass}-${selectedDivision}`}
                courses={courses}
                handleCardDetails={handleCardDetails}
                layout={layout}
                isLoading={isSubjectsLoading || isSubjectsFetching}
              />
            </Card>
          )}
        </Grid>

        {/* Right Section – Chapter Details */}
        <Grid
          size={{ xs: 12, md: isVertical ? 12 : 9 }}
          sx={{ height: isVertical ? 'auto' : '100%' }}
        >
          <Card sx={{ p: 2, height: isVertical ? 'auto' : '100%', overflow: 'hidden' }}>
            <Scrollbar sx={{ height: '100%' }}>
              {selectedCourse ? (
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SubjectColorIndicator color={selectedCourse.color} />
                    <Typography variant="h6" fontWeight={700}>
                      {selectedCourse.name} Details
                    </Typography>
                  </Box>
                  {isAction ? (
                    <CustomizableTable
                      tableId="course-progress-table"
                      noDataText={<>No Chapters Found For This Course Found </>}
                      columns={[
                        {
                          id: 'chapterNumber',
                          label: 'Chapter No.',
                          align: 'left',
                          minWidth: 120,
                          filterType: 'number',
                        },
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
                          renderColumn: () => <EndToolTip />,
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
                          minWidth: 50,
                          align: 'left',
                          sticky: true,
                          isSort: false,
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
                      serverSide
                      onServerSort={(column, sortData) => {
                        setQuery((prev) => ({
                          ...prev,
                          sorting: sortQueryString(sortData),
                        }));
                      }}
                      onServerPagination={(page: number, rowsPerPage: number) => {
                        setQuery((prev) => ({
                          ...prev,
                          skipCount: page * rowsPerPage,
                          maxResultCount: rowsPerPage,
                        }));
                      }}
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
                          label: 'End Date',
                          minWidth: 170,
                          align: 'left',
                          filterType: 'date',
                          renderColumn: () => <EndToolTip />,
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
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 200,
                    color: 'text.disabled',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="body2">Select a subject to view chapter details</Typography>
                </Box>
              )}
            </Scrollbar>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      {/* Update Progress Dialog */}
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
        <UpdateProgress
          onClose={handleClose}
          selectedChapter={selectedChapter}
          subjectId={String(selectedCourse?.id)}
        />
      </CustomDialog>

      {/* View Logs Dialog */}
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
        <ViewChapterLogs
          onClose={handleClose}
          selectedChapter={selectedChapter}
          divisionId={selectedDivision}
        />
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

const UpdateProgress: React.FC<IUpdateProgressProps> = ({
  onClose,
  selectedChapter,
  subjectId,
}: IUpdateProgressProps) => {
  const [updateChapterProgress, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChapterProgressMutation,
  });

  const formik = useFormik({
    initialValues: {
      completePercentage: selectedChapter?.progress || 0, // Adjusted field name to match the input ID
      description: '',
    },
    validationSchema: Yup.object({
      completePercentage: Yup.number()
        .min(0, 'Percentage cannot be negative')
        .max(100, 'Percentage cannot exceed 100')
        .required('Complete Percentage is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (!selectedChapter) return;

        const payload = {
          chapterId: (selectedChapter as any).id || (selectedChapter as any).chapterId,
          data: {
            progress: values.completePercentage,
            description: values.description,
            subjectId,
          },
        };

        await updateChapterProgress(payload).unwrap();

        shikshaMitraToast.success({ message: 'Progress updated successfully' });
        onClose(null, true);
      } catch (error) {
        console.error('Failed to update progress', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <ShakingTextField
          error={!!(formik.touched.completePercentage && formik.errors.completePercentage) || false}
        >
          <ComponentBlock sx={{ mb: 2 }}>
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
      </DialogScrollContent>
      <DialogActions sx={{ flexShrink: 0, p: 2 }}>
        <CancelButton
          onClick={() => {
            onClose(null, false);
          }}
        />
        <LoadingButton
          onClick={(e: any) => formik.handleSubmit(e)}
          loading={isUpdateLoading}
          variant="contained"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.edit} />}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
