'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Label } from 'src/components/label';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Slider,
  MenuList,
  MenuItem,
  TextField,
  Accordion,
  Typography,
  LinearProgress,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  useGetSubjectsQuery,
  useGetChaptersProgressQuery,
  useUpdateChapterProgressMutation,
  useGetEmployeeSubjectsProgressQuery,
} from 'src/redux/classManagementApi/subjectProgressManageApi/subjectProgressManageApi';

import CourseCardsGrid from './components/courseCardsGrid';
import ViewChapterLogs from './components/viewChapterLogs';

import type { ICourse, ICourseDetail, IUpdateProgressProps } from './type';

const EndToolTip = () => (
  <CustomTooltip
    sx={{ textAlign: 'left' }}
    arrow
    title={
      <Box display="flex" flexDirection="column" gap={1}>
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

const getRiskChipColor = (riskLevel?: string) => {
  if (riskLevel === 'Critical' || riskLevel === 'High') return 'error';
  if (riskLevel === 'Medium') return 'warning';
  return 'success';
};

const getStatusChipColor = (status?: string) => {
  if (status === 'Completed') return 'success';
  if (status === 'Delayed' || status === 'Critically Delayed') return 'error';
  if (status === 'In Progress' || status === 'Due To Start') return 'warning';
  return 'default';
};

const formatDateCell = (value?: string | null) =>
  value && value !== '-' && dayjs(value).isValid() ? dayjs(value).format('DD-MM-YYYY') : '-';

const normalizeChapter = (chapter: any): ICourseDetail => ({
  ...chapter,
  id: chapter.id ?? chapter.chapterId,
  chapterId: chapter.chapterId ?? chapter.id,
  chapterName: chapter.chapterName ?? '',
  progress: chapter.progress ?? 0,
  expectedProgress: chapter.expectedProgress ?? 0,
  variance: chapter.variance ?? (chapter.progress ?? 0) - (chapter.expectedProgress ?? 0),
  startDate: chapter.startDate ?? null,
  endDate: chapter.endDate ?? chapter.timeLine ?? null,
  timeLine: chapter.timeLine ?? chapter.endDate ?? null,
  status: chapter.status ?? 'Not Started',
  scheduleStatus: chapter.scheduleStatus ?? 'On Track',
  riskLevel: chapter.riskLevel ?? 'Low',
});

interface CourseProgressComponentProps {
  courseData?: any;
  isAction?: boolean;
  selectedClass?: string;
  selectedDivision?: string;
  layout?: 'horizontal' | 'vertical';
  employeeId?: string;
}

const CourseProgressComponent = ({
  courseData,
  isAction = true,
  selectedClass,
  selectedDivision,
  layout = 'horizontal',
  employeeId,
}: CourseProgressComponentProps) => {
  const isVertical = layout === 'vertical';
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

  const isEmployeeMode = !!employeeId;
  const isApiActive = isEmployeeMode
    ? !!(selectedClass && selectedDivision && employeeId)
    : !!(selectedClass && selectedDivision && (currentMedium as Medium)?.id);

  const {
    data: subjectData,
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: isEmployeeMode
      ? useGetEmployeeSubjectsProgressQuery
      : useGetSubjectsQuery,
    params: isEmployeeMode
      ? {
        employeeId,
        classId: selectedClass,
        divisionId: selectedDivision,
      }
      : {
        academicMediumId: (currentMedium as Medium)?.id,
        classId: selectedClass,
        divisionId: selectedDivision,
      },
    options: {
      skip: !isApiActive,
    },
  });

  const courses = useMemo<ICourse[]>(() => {
    // When the API is not active (student/HR profile view without params), use the courseData prop directly
    if (!isApiActive) return courseData || [];

    const raw: any[] =
      subjectData?.data?.items ??
      subjectData?.items ??
      subjectData?.records ??
      (Array.isArray(subjectData) ? subjectData : Array.isArray(subjectData?.data) ? subjectData.data : []);

    const seen = new Set<string>();
    return raw
      .map((s: any) => ({
        id: s.id ?? s.subjectId,
        name: s.subjectName ?? s.name ?? '',
        color: s.subjectColor ?? s.color ?? '#1976d2',
        progress: s.progressPercentage ?? s.progress ?? 0,
        expectedProgress: s.expectedProgressPercentage ?? s.expectedProgress ?? 0,
        variance: s.variancePercentage ?? s.variance ?? 0,
        scheduleStatus: s.scheduleStatus ?? 'On Track',
        riskLevel: s.riskLevel ?? 'Low',
        lastUpdatedAt: s.lastUpdatedAt ?? null,
        completedChapter: s.completedChapters ?? s.completedChapter ?? 0,
        totalChapter: s.totalChapters ?? s.totalChapter ?? 0,
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

  // Reset selection only when class changes — division changes should keep the current subject
  useEffect(() => {
    setSelectedCourse(null);
    setSelectedSubjectId('');
  }, [selectedClass]);

  // Auto-select the first subject once subjects have finished loading and nothing is selected.
  useEffect(() => {
    if (isApiActive && (isSubjectsLoading || isSubjectsFetching)) return;
    if (courses.length === 0 || selectedCourse) return;
    setSelectedCourse(courses[0]);
    setSelectedSubjectId(courses[0].id ? String(courses[0].id) : '');
  }, [courses, isSubjectsLoading, isSubjectsFetching, isApiActive, selectedCourse]);

  const {
    data: chaptersData,
    isLoading: isChaptersLoading,
    isFetching: isChaptersFetching,
  } = useQueryAndMutation({
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

  const chapterDetails = useMemo<ICourseDetail[]>(() => {
    // Non-API mode: use details already embedded in the course
    if (!isApiActive) return selectedCourse?.details ?? [];

    if (!chaptersData) return [];

    const raw: any[] =
      chaptersData?.data?.items ??
      chaptersData?.items ??
      chaptersData?.records ??
      (Array.isArray(chaptersData) ? chaptersData : Array.isArray(chaptersData?.data) ? chaptersData.data : []);

    return raw.map(normalizeChapter);
  }, [chaptersData, isApiActive, selectedCourse?.details]);

  const progressSummary = useMemo(() => {
    const total = chapterDetails.length;
    const completed = chapterDetails.filter((chapter) => chapter.progress >= 100).length;
    const delayed = chapterDetails.filter((chapter) =>
      ['Delayed', 'Critically Delayed'].includes(chapter.scheduleStatus ?? chapter.status ?? '')
    ).length;
    const highRisk = chapterDetails.filter((chapter) =>
      ['High', 'Critical'].includes(chapter.riskLevel ?? '')
    ).length;
    const averageProgress = total
      ? Math.round(chapterDetails.reduce((sum, chapter) => sum + chapter.progress, 0) / total)
      : 0;
    const expectedProgress = total
      ? Math.round(
        chapterDetails.reduce((sum, chapter) => sum + (chapter.expectedProgress ?? 0), 0) / total
      )
      : 0;

    return {
      total,
      completed,
      delayed,
      highRisk,
      averageProgress,
      expectedProgress,
      variance: averageProgress - expectedProgress,
    };
  }, [chapterDetails]);

  // Dialog state for updating progress
  const updateProgressDialog = useBoolean();

  const handleCardDetails = useCallback((course: ICourse) => {
    setSelectedCourse((prev) => {
      if (prev?.id === course.id) return prev;
      return course;
    });
    setSelectedSubjectId((prevId) => {
      const newId = course.id ? String(course.id) : '';
      return prevId === newId ? prevId : newId;
    });
  }, []);

  const [selectedChapter, setSelectedChapter] = useState<ICourseDetail | null>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const viewLogsDialog = useBoolean();

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem onClick={() => { }}>
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
          <Iconify icon={GlobalIcons.eye} />
          View Logs
        </MenuItem>
        <MenuItem
          onClick={() => {
            updateProgressDialog.onTrue();
            setSelectedChapter(row);
            pop.onClose();
          }}
        >
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

  const navOpen = useBoolean(true);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          mt: 0,
          flexGrow: 1,
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          gap: 1.5,
          height: isVertical ? 'auto' : '100%',
          minHeight: 0,
          width: '100%',
        }}
      >
        {/* Left Section – Course Cards */}
        <Box
          sx={{
            width: isVertical
              ? '100%'
              : navOpen.value
                ? { xs: '100%', md: 320 }
                : 0,
            opacity: isVertical || navOpen.value ? 1 : 0,
            overflow: 'hidden',
            visibility: !isVertical && !navOpen.value ? 'hidden' : 'visible',
            transition: 'width 0.25s ease-in-out, opacity 0.2s ease-in-out, visibility 0.25s ease-in-out',
            flexShrink: 0,
            height: isVertical ? 'auto' : '100%',
          }}
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 0.5,
                  pb: 1,
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  Subjects
                </Typography>
                <CustomTooltip arrow title="Collapse subject navigation">
                  <IconButton
                    size="small"
                    onClick={navOpen.onToggle}
                    aria-label="Collapse subject navigation"
                    aria-expanded="true"
                    sx={{
                      p: 0.25,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Iconify icon="eva:arrow-ios-back-fill" width={16} height={16} />
                  </IconButton>
                </CustomTooltip>
              </Box>

              <CourseCardsGrid
                key={`${selectedClass}-${selectedDivision}`}
                courses={courses}
                handleCardDetails={handleCardDetails}
                layout={layout}
                isLoading={isSubjectsLoading || isSubjectsFetching}
              />
            </Card>
          )}
        </Box>

        {/* Right Section – Chapter Details */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            height: isVertical ? 'auto' : '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card
            sx={{
              p: 2,
              height: isVertical ? 'auto' : '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {selectedCourse ? (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  sx={{ flexShrink: 0, mb: 1 }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {!navOpen.value && !isVertical && (
                      <CustomTooltip arrow title="Open subject navigation">
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={navOpen.onToggle}
                          aria-label="Open subject navigation"
                          aria-expanded="false"
                          sx={{
                            p: 0.25,
                            mr: 0.5,
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Iconify icon="eva:arrow-ios-forward-fill" width={16} height={16} />
                        </IconButton>
                      </CustomTooltip>
                    )}
                    <SubjectColorIndicator color={selectedCourse.color} />
                    <Typography variant="h6" fontWeight={700}>
                      {selectedCourse.name} Details
                    </Typography>
                  </Box>
                </Box>
                <Accordion
                  defaultExpanded
                  sx={{
                    mb: 1.5,
                    flexShrink: 0,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px !important',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                    sx={{ minHeight: 40, px: 1.5, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      Summary Overview
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 1.5, pt: 0 }}>
                    <TimetableSettingsSummaryCards
                      cards={[
                        {
                          label: 'Actual',
                          value: `${progressSummary.averageProgress}%`,
                          icon: 'solar:chart-2-bold-duotone',
                          color: 'primary',
                        },
                        {
                          label: 'Expected',
                          value: `${progressSummary.expectedProgress}%`,
                          icon: 'solar:target-bold-duotone',
                          color: 'info',
                        },
                        {
                          label: 'Variance',
                          value: `${progressSummary.variance >= 0 ? '+' : ''}${progressSummary.variance}%`,
                          icon: 'solar:graph-up-bold-duotone',
                          color: progressSummary.variance < 0 ? 'error' : 'success',
                        },
                        {
                          label: 'Completed',
                          value: `${progressSummary.completed}/${progressSummary.total}`,
                          icon: 'solar:check-circle-bold-duotone',
                          color: 'success',
                        },
                        {
                          label: 'Delayed',
                          value: progressSummary.delayed,
                          icon: 'solar:clock-circle-bold-duotone',
                          color: progressSummary.delayed > 0 ? 'warning' : 'info',
                        },
                        {
                          label: 'High Risk',
                          value: progressSummary.highRisk,
                          icon: 'solar:danger-bold-duotone',
                          color: progressSummary.highRisk > 0 ? 'error' : 'info',
                        },
                      ]}
                      cardsPerRow={3}
                    />
                  </AccordionDetails>
                </Accordion>
                {isAction ? (
                  <CustomizableTable
                    tableId="course-progress-table"
                    isLoading={isChaptersLoading || isChaptersFetching}
                    noDataText={<>No Chapters Found For This Course Found </>}
                    columns={[
                      {
                        id: 'chapterName',
                        label: 'Chapter Name',
                        align: 'left',
                        minWidth: 280,
                        sticky: true,
                        stickyPosition: 'left',
                        isFilter: true,
                        filterType: 'string',
                        isSort: true,
                        render: (value, row) => (
                          <Box component="span">
                            {row.chapterNumber ? `(${row.chapterNumber}) ` : ''}
                            {value}
                          </Box>
                        ),
                      },
                      {
                        id: 'startDate',
                        label: 'Start Date',
                        align: 'left',
                        filterType: 'date',
                        minWidth: 170,
                        isSort: true,
                        render: (value) => (
                          <Typography variant="body2" sx={{ fontSize: 13 }}>
                            {formatDateCell(value)}
                          </Typography>
                        ),
                      },
                      {
                        id: 'endDate',
                        label: 'End Date',
                        minWidth: 170,
                        align: 'left',
                        filterType: 'date',
                        isSort: true,
                        renderColumn: () => <EndToolTip />,
                        render(value, row) {
                          const isValidDate = value && value !== '-' && dayjs(value).isValid();

                          if (!isValidDate) {
                            return (
                              <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary' }}>
                                -
                              </Typography>
                            );
                          }

                          const endDate = dayjs(value).startOf('day');
                          const today = dayjs().startOf('day');
                          const diffDays = endDate.diff(today, 'day');

                          if (row.progress === 100) {
                            return (
                              <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary' }}>
                                {endDate.format('DD-MM-YYYY')}
                              </Typography>
                            );
                          }

                          let color = 'text.secondary';
                          if (diffDays <= 7) {
                            color = 'error.main';
                          } else if (diffDays <= 30) {
                            color = 'warning.main';
                          } else {
                            color = 'success.main';
                          }

                          return (
                            <Typography variant="body2" sx={{ fontSize: 13, color, fontWeight: diffDays <= 7 ? 700 : 500 }}>
                              {endDate.format('DD-MM-YYYY')}
                            </Typography>
                          );
                        },
                      },
                      {
                        id: 'progress',
                        label: 'Progress',
                        filterType: 'number',
                        align: 'left',
                        isSort: true,
                        render(value, row) {
                          return (
                            <Box sx={{ minWidth: 190 }}>
                              <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                <Typography variant="caption" fontWeight={700}>
                                  {value}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Expected {row.expectedProgress ?? 0}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={value}
                                sx={{ height: 6, borderRadius: 1, mb: 0.5 }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: (row.variance ?? 0) < 0 ? 'error.main' : 'success.main',
                                  fontWeight: 700,
                                }}
                              >
                                {(row.variance ?? 0) >= 0 ? '+' : ''}
                                {row.variance ?? 0}% variance
                              </Typography>
                            </Box>
                          );
                        },
                      },

                      {
                        id: 'riskLevel',
                        label: 'Risk',
                        minWidth: 120,
                        align: 'left',
                        isFilter: true,
                        filterType: 'enum',
                        enumOptions: [
                          { label: 'Low', value: 'Low' },
                          { label: 'Medium', value: 'Medium' },
                          { label: 'High', value: 'High' },
                          { label: 'Critical', value: 'Critical' },
                        ],
                        isSort: true,
                        render(value) {
                          return (
                            <Label color={getRiskChipColor(value) as any} variant="soft">
                              {value || 'Low'}
                            </Label>
                          );
                        },
                      },
                      {
                        id: 'actualStartDate',
                        label: 'Actual Start',
                        minWidth: 140,
                        align: 'left',
                        isFilter: true,
                        filterType: 'date',
                        isSort: true,
                        render: (value) => (
                          <Typography variant="body2" sx={{ fontSize: 13 }}>
                            {formatDateCell(value)}
                          </Typography>
                        ),
                      },
                      {
                        id: 'actualEndDate',
                        label: 'Actual End',
                        minWidth: 140,
                        align: 'left',
                        isFilter: true,
                        filterType: 'date',
                        isSort: true,
                        render: (value) => (
                          <Typography variant="body2" sx={{ fontSize: 13 }}>
                            {formatDateCell(value)}
                          </Typography>
                        ),
                      },
                      {
                        id: 'lastUpdatedAt',
                        label: 'Last Updated',
                        minWidth: 155,
                        align: 'left',
                        isFilter: true,
                        filterType: 'date',
                        isSort: true,
                        render: (value) => (
                          <Typography variant="body2" sx={{ fontSize: 13 }}>
                            {formatDateCell(value)}
                          </Typography>
                        ),
                      },
                      {
                        id: 'status',
                        label: 'Status',
                        minWidth: 150,
                        align: 'left',
                        sticky: true,
                        stickyPosition: 'right',
                        isSort: true,
                        isFilter: false,
                        render(value, row) {
                          return (
                            <Stack spacing={0.5} alignItems="flex-start">
                              <Label color={getStatusChipColor(value) as any} variant="soft">
                                {value || 'Not Started'}
                              </Label>
                              {row.scheduleStatus && (
                                <Label color={getStatusChipColor(row.scheduleStatus) as any} variant="outlined">
                                  {row.scheduleStatus}
                                </Label>
                              )}
                            </Stack>
                          );
                        },
                      },
                      {
                        id: 'actions',
                        label: 'Actions',
                        minWidth: 50,
                        align: 'left',
                        sticky: true,
                        stickyPosition: 'right',
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
                    data={chapterDetails}
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
                    isLoading={isChaptersLoading || isChaptersFetching}
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
                          const isValidDate = value && value !== '-' && dayjs(value).isValid();

                          if (!isValidDate) {
                            return (
                              <Typography variant="caption" fontSize="13px">
                                -
                              </Typography>
                            );
                          }

                          const endDate = dayjs(value).startOf('day');
                          const today = dayjs().startOf('day');
                          const diffDays = endDate.diff(today, 'day');

                          if (row.progress === 100) {
                            return (
                              <Typography variant="caption" fontSize="13px">
                                {endDate.format('DD-MM-YYYY')}
                              </Typography>
                            );
                          }

                          let color = 'text.secondary';

                          if (diffDays <= 7) {
                            color = 'error.main';
                          } else if (diffDays <= 30) {
                            color = 'warning.main';
                          } else {
                            color = 'success.main';
                          }

                          return (
                            <Typography variant="caption" fontSize="13px" sx={{ color }}>
                              {endDate.format('DD-MM-YYYY')}
                            </Typography>
                          );
                        },
                      },
                      {
                        id: 'progress',
                        label: 'Progress',
                        filterType: 'number',
                        render(value) {
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
                    ]}
                    data={chapterDetails}
                  />
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  color: 'text.disabled',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Typography variant="body2">Select a subject to view chapter details</Typography>
              </Box>
            )}
          </Card>
        </Box>
      </Box>

      {/* Dialogs */}
      <CustomDialog
        open={updateProgressDialog.value}
        handleClose={() => {
          updateProgressDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                Update Chapter Progress
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Update the completion percentage and add notes about the progress made in this chapter"
              >
                <Iconify
                  icon="lucide:info"
                  sx={{ display: 'inline-flex', verticalAlign: 'middle', cursor: 'pointer' }}
                  color="info.main"
                  width={16}
                />
              </CustomTooltip>
            </Box>
            {selectedChapter && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {(selectedChapter as any).chapterNumber
                  ? `Chapter ${(selectedChapter as any).chapterNumber}: `
                  : ''}
                {selectedChapter.chapterName}
              </Typography>
            )}
          </Box>
        }
      >
        <UpdateProgress
          onClose={handleClose}
          selectedChapter={selectedChapter}
          divisionId={selectedDivision}
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
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                Chapter Logs
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="View the history of progress updates and changes made to this chapter's completion status"
              >
                <Iconify
                  icon="lucide:info"
                  sx={{ display: 'inline-flex', verticalAlign: 'middle', cursor: 'pointer' }}
                  color="info.main"
                  width={16}
                />
              </CustomTooltip>
            </Box>
            {selectedChapter && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {(selectedChapter as any).chapterNumber
                  ? `Chapter ${(selectedChapter as any).chapterNumber}: `
                  : ''}
                {selectedChapter.chapterName}
              </Typography>
            )}
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

const UpdateProgress: React.FC<IUpdateProgressProps> = ({
  onClose,
  selectedChapter,
  divisionId,
}: IUpdateProgressProps) => {
  const currentProgress = selectedChapter?.progress ?? 0;

  const [updateChapterProgress, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChapterProgressMutation,
  });

  const formik = useFormik({
    initialValues: {
      completePercentage: currentProgress,
      status: selectedChapter?.status ?? 'In Progress',
      delayReason: '',
      revisedEndDate: '',
      conductedLectures: '',
      currentTopic: '',
      teachingMethod: '',
      studentUnderstanding: '',
      description: '',
    },
    validationSchema: Yup.object({
      completePercentage: Yup.number()
        .min(0, 'Percentage cannot be negative')
        .max(100, 'Percentage cannot exceed 100')
        .test(
          'is-progress-changed',
          currentProgress >= 100 ? 'Progress is already completed' : 'Change the progress value',
          (value) => currentProgress < 100 && Number(value) !== currentProgress
        )
        .required('Complete Percentage is required'),
      status: Yup.string().required('Status is required'),
      delayReason: Yup.string().when('completePercentage', {
        is: (value: number) => value < currentProgress,
        then: (schema) => schema.required('Delay reason is required when progress is reduced'),
        otherwise: (schema) => schema,
      }),
      revisedEndDate: Yup.string().when('delayReason', {
        is: (value: string) => !!value,
        then: (schema) => schema.required('Revised end date is required for delayed chapters'),
        otherwise: (schema) => schema,
      }),
      description: Yup.string().required('Update note is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (!selectedChapter) return;

        const payload = {
          chapterId: (selectedChapter as any).id || (selectedChapter as any).chapterId,
          data: {
            divisionId,
            progress: values.completePercentage,
            description: values.description,
            status: values.status,
            delayReason: values.delayReason || undefined,
            revisedEndDate: values.revisedEndDate || undefined,
            conductedLectures: values.conductedLectures
              ? Number(values.conductedLectures)
              : undefined,
            currentTopic: values.currentTopic || undefined,
            teachingMethod: values.teachingMethod || undefined,
            studentUnderstanding: values.studentUnderstanding || undefined,
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
        <Card variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Current Progress
              </Typography>
              <Typography variant="h6">{currentProgress}%</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Expected Progress
              </Typography>
              <Typography variant="h6">{selectedChapter?.expectedProgress ?? 0}%</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Risk
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={selectedChapter?.riskLevel ?? 'Low'}
                  size="small"
                  color={getRiskChipColor(selectedChapter?.riskLevel) as any}
                />
              </Box>
            </Box>
          </Stack>
        </Card>

        <ShakingTextField
          error={!!(formik.touched.completePercentage && formik.errors.completePercentage) || false}
        >
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.neutral',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Box sx={{ flex: 1, width: '100%' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="subtitle2" color="primary.main">
                    {formik.values.completePercentage}%
                  </Typography>
                </Stack>
                <Slider
                  value={formik.values.completePercentage}
                  onChange={(event, value) => {
                    const nextValue = Array.isArray(value) ? value[0] : value;
                    formik.setFieldValue('completePercentage', nextValue);
                  }}
                  getAriaValueText={(value) => `${value}%`}
                  min={0}
                  max={100}
                  step={5}
                  valueLabelDisplay="off"
                  marks={[
                    { value: 0, label: '0' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' },
                  ]}
                  sx={{
                    mt: 0.5,
                    mb: 0,
                    '& .MuiSlider-markLabel': {
                      fontSize: 11,
                      color: 'text.secondary',
                    },
                  }}
                />
              </Box>
              <TextField
                name="completePercentage"
                label="Progress %"
                type="number"
                size="small"
                sx={{ width: { xs: '100%', sm: 140 } }}
                value={formik.values.completePercentage}
                onChange={(event) => {
                  const value = Math.max(0, Math.min(100, Number(event.target.value)));
                  formik.setFieldValue('completePercentage', value);
                }}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.completePercentage && formik.errors.completePercentage)}
              />
            </Stack>
            {formik.touched.completePercentage && formik.errors.completePercentage && (
              <Typography variant="caption" color="error">
                {formik.errors.completePercentage}
              </Typography>
            )}
          </Box>
        </ShakingTextField>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              name="status"
              label="Chapter Status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.status && formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              {['Not Started', 'In Progress', 'Delayed', 'Completed'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="conductedLectures"
              label="Conducted Lectures"
              type="number"
              value={formik.values.conductedLectures}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="delayReason"
              label="Delay / Change Reason"
              value={formik.values.delayReason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.delayReason && formik.errors.delayReason)}
              helperText={formik.touched.delayReason && formik.errors.delayReason}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="revisedEndDate"
              label="Revised End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.revisedEndDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.revisedEndDate && formik.errors.revisedEndDate)}
              helperText={formik.touched.revisedEndDate && formik.errors.revisedEndDate}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              name="currentTopic"
              label="Current Topic / Lesson Plan Reference"
              value={formik.values.currentTopic}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="teachingMethod"
              label="Teaching Method"
              value={formik.values.teachingMethod}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              name="studentUnderstanding"
              label="Student Understanding"
              value={formik.values.studentUnderstanding}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          size="small"
          multiline
          rows={4}
          name="description"
          label="Update Note / Evidence"
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
          disabled={formik.values.completePercentage === currentProgress}
          startIcon={<Iconify icon={GlobalIcons.edit} />}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
