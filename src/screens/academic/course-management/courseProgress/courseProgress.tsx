'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { IData } from 'src/components/customizabaleTable/types';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import React, { useState, useEffect, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, MenuList, MenuItem, Typography, CircularProgress } from '@mui/material';
import courseProgressTableData from 'src/json/academic/syllabus/courseProgressTableData.json';

import UpdateProgress from './components/updateProgress';
import CourseCardsGrid from './components/courseCardsGrid';
import ViewChapterLogs from './components/viewChapterLogs';

import type { ICourse, ICourseDetail } from './type';

const CourseProgress = (props: TabComponentType) => {
  const [courses] = useState<ICourse[]>(courseProgressTableData);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const updateProgressDialog = useBoolean();

  const handleCardDetails = (course: ICourse) => {
    setSelectedCourse(course);
  };

  const [selectedChapter, setSelectedChapter] = useState<ICourseDetail | null>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const viewLogsDialog = useBoolean();
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const selectedClass = allClass.find((org) => org?.id === classes);
    setAllDivision(selectedClass?.divisions || []);
    setDivision(selectedClass?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  /** Memoization Justification: Passed as prop to ThreeDotsActions - avoids re-renders */
  const actions = useCallback(
    (actionProps: { popover: { onClose: () => void }; row: ICourseDetail }) => (
      <MenuList>
        <MenuItem onClick={() => {}}>
          <Iconify icon={GlobalIcons.bell} />
          Reminder
        </MenuItem>
        {actionProps.row.progress > 0 && (
          <MenuItem
            onClick={() => {
              viewLogsDialog.onTrue();
              setSelectedChapter(actionProps.row);
              actionProps.popover.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.eye} />
            View Logs
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            updateProgressDialog.onTrue();
            actionProps.popover.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.edit} />
          Update Progress
        </MenuItem>
      </MenuList>
    ),
    [updateProgressDialog, viewLogsDialog]
  );

  const handleClose = (_e: unknown, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      updateProgressDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      updateProgressDialog.onFalse();
    }
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Chapters Progress"
        description="Track the progress of each subject and its chapters in real-time. Monitor completed and pending chapters, and analyze progress to ensure curriculum coverage and effective learning."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Chapters Progress' },
        ]}
      />
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
      <CourseCardsGrid courses={courses} handleCardDetails={handleCardDetails} />

      {selectedCourse && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {selectedCourse.name} Details
          </Typography>
          <CustomizableTable
            searchFieldProps={{
              placeholder: 'Search by Chapter Name, Progress, Deadline...',
              label: 'Search by Chapter Name, Progress, Deadline...',
              sx: {
                maxWidth: '450px',
                width: '100%',
              },
            }}
            tableId="course-progress-table"
            noDataText={<>No Chapters Found For This Course Found </>}
            columns={[
              { id: 'chapterName', label: 'Chapter Name', align: 'left' },
              {
                id: 'progress',
                label: 'Progress',
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
                id: 'actions',
                label: 'Actions',
                minWidth: 50,
                align: 'left',
                sticky: true,
                isFilter: false,
                render: (value: string, row: IData) => (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row: row as ICourseDetail })}
                    placement="right-top"
                  />
                ),
              },
            ]}
            data={selectedCourse.details}
          />
        </Box>
      )}
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
