'use client';

import type { RootState } from 'src/redux/store';

import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { useGetWeeklyLectureSlotsQuery } from 'src/redux/academicAPI/timetableApi/weeklyLecturesApi';

import CreateNoOfLecture from './createWeeklyLectures';

import type { ISubject, ISubjectFormValues } from './type';

const data = [
  {
    id: '1',
    className: 1,
    totalLectures: 52,
    subjects: [
      {
        name: 'Mathematics',
        subjectCode: 'MATH101',
        subjectColor: '#FFB74D',
        noOfLecture: 10,
      },
      { name: 'Science', subjectCode: 'SCI101', subjectColor: '#81C784', noOfLecture: 8 },
      { name: 'English', subjectCode: 'ENG101', subjectColor: '#64B5F6', noOfLecture: 8 },
      { name: 'Hindi', subjectCode: 'HIN101', subjectColor: '#E57373', noOfLecture: 6 },
      { name: 'Computer', subjectCode: 'COM101', subjectColor: '#4DB6AC', noOfLecture: 6 },
      { name: 'Art', subjectCode: 'ART101', subjectColor: '#FF8A65', noOfLecture: 4 },
      {
        name: 'Physical Education',
        subjectCode: 'PHY101',
        subjectColor: '#9575CD',
        noOfLecture: 4,
      },
      {
        name: 'Environmental Studies',
        subjectCode: 'EVS101',
        subjectColor: '#7CB342',
        noOfLecture: 6,
      },
    ],
  },
  {
    id: '2',
    className: 2,
    totalLectures: 54,
    subjects: [
      {
        name: 'Mathematics',
        subjectCode: 'MATH201',
        subjectColor: '#FFB74D',
        noOfLecture: 10,
      },
      { name: 'Science', subjectCode: 'SCI201', subjectColor: '#81C784', noOfLecture: 8 },
      { name: 'English', subjectCode: 'ENG201', subjectColor: '#64B5F6', noOfLecture: 8 },
      { name: 'Hindi', subjectCode: 'HIN201', subjectColor: '#E57373', noOfLecture: 7 },
      { name: 'Computer', subjectCode: 'COM201', subjectColor: '#4DB6AC', noOfLecture: 6 },
      { name: 'Art', subjectCode: 'ART201', subjectColor: '#FF8A65', noOfLecture: 4 },
      {
        name: 'Physical Education',
        subjectCode: 'PHY201',
        subjectColor: '#9575CD',
        noOfLecture: 5,
      },
      {
        name: 'Environmental Studies',
        subjectCode: 'EVS201',
        subjectColor: '#7CB342',
        noOfLecture: 6,
      },
    ],
  },
  {
    id: '3',
    className: 3,
    totalLectures: 56,
    subjects: [
      {
        name: 'Mathematics',
        subjectCode: 'MATH301',
        subjectColor: '#FFB74D',
        noOfLecture: 10,
      },
      { name: 'Science', subjectCode: 'SCI301', subjectColor: '#81C784', noOfLecture: 9 },
      { name: 'English', subjectCode: 'ENG301', subjectColor: '#64B5F6', noOfLecture: 8 },
      { name: 'Hindi', subjectCode: 'HIN301', subjectColor: '#E57373', noOfLecture: 7 },
      { name: 'Computer', subjectCode: 'COM301', subjectColor: '#4DB6AC', noOfLecture: 6 },
      { name: 'Art', subjectCode: 'ART301', subjectColor: '#FF8A65', noOfLecture: 4 },
      {
        name: 'Physical Education',
        subjectCode: 'PHY301',
        subjectColor: '#9575CD',
        noOfLecture: 5,
      },
      {
        name: 'Environmental Studies',
        subjectCode: 'EVS301',
        subjectColor: '#7CB342',
        noOfLecture: 7,
      },
    ],
  },
];

const WeeklyLectures = () => {
  const [selectedWeeklyLecture, setSelectedWeeklyLecture] = useState<ISubjectFormValues | null>(
    null
  );

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: weeklyLectureData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotsQuery,
  });

  // Dialog state to control the visibility of create lecture number dialog
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();
  const [isEdit, setIsEdit] = useState(false);
  // Custom boolean hook to control create lecture number dialog visibility
  // const addWeeklyLectureDialog = useBoolean();

  // State to control form field disabled status
  const [disabled, setDisabled] = React.useState(false);
  const addWeeklyLectureDialog = useBoolean(false);

  // Custom boolean hook to control view weekly lectures dialog visibility
  const viewWeeklyLecturesDialog = useBoolean();

  /**
   * Handles closing of the create lecture dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setIsEdit(false);
        setDisabled(false);
        setSelectedWeeklyLecture(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing if needed to match dialog animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addWeeklyLectureDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addWeeklyLectureDialog.onFalse();
      resetState();
    }
  };

  const tableData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        newSubject: item.subjects
          .map((subject, ind) => `${subject.name} (${subject.noOfLecture})`)
          .join(' '),
      })),
    []
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* Weekly Lectures Slots Breadcrumb */}
      <CustomBreadcrumbs
        heading="Weekly Lectures Slots"
        description="Configure and manage weekly lecture slots for each class."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Timetable', href: '/academic/newTimetable' },
          { name: 'Settings' },
          { name: 'Weekly Lectures Slots' },
        ]}
        action={
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            size="small"
            onClick={addWeeklyLectureDialog.onTrue}
            sx={{ px: '32px' }}
          >
            Weekly Lectures
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        noDataText={
          <>
            Weekly Lectures Data Not Found{' '}
            <Box
              onClick={() => {
                addWeeklyLectureDialog.onTrue();
                // setEditData(null);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Weekly Lectures
            </Box>
          </>
        }
        columns={[
          { id: 'className', label: 'Class', filterType: 'number', align: 'left' },
          {
            id: 'totalLectures',
            label: 'Total Lectures',
            minWidth: 150,
            filterType: 'number',
            align: 'left',
          },
          {
            id: 'newSubject',
            label: 'Subjects',
            isSort: false,
            align: 'left',
            render: (value, row) => (
              <Box sx={{ display: 'flex', gap: 0.9, flexWrap: 'wrap' }}>
                {row.subjects.map((subject: ISubject) => (
                  <Box key={subject.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SubjectColorIndicator color={subject.subjectColor} />
                    <Typography variant="caption" fontSize="13px">
                      {`${subject.name} (${subject.noOfLecture})`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 60,
            sticky: true,
            align: 'left',
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showViewIcon
                  handleViewClick={() => {
                    setSelectedWeeklyLecture(row as ISubjectFormValues);
                    viewWeeklyLecturesDialog.onTrue();
                    setDisabled(true);
                  }}
                  showEditIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setSelectedWeeklyLecture(row as ISubjectFormValues);
                    setIsEdit(true);
                    addWeeklyLectureDialog.onTrue();
                    setDisabled(false);
                  }}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={tableData}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isEdit ? 'Update Weekly Lectures' : 'Add Weekly Lectures'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                isEdit
                  ? 'Update weekly lecture details the total number of lectures scheduled per week.'
                  : 'You can add weekly lectures by specifying the class and total weekly number of lectures.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={addWeeklyLectureDialog.value}
        handleClose={() => {
          addWeeklyLectureDialog.onFalse();
          setTimeout(() => {
            setSelectedWeeklyLecture(null);
            setIsEdit(false);
            setDisabled(false);
          }, 200); // Adjust duration if your dialog animation is longer
        }}
        maxWidth="sm"
      >
        <CreateNoOfLecture
          // onSave={handleSave}
          // dialogValue={dialog.value}
          disabled={disabled}
          onClose={handleClose}
          editData={selectedWeeklyLecture}
          // data={selectedEntry}
          isEdit={isEdit}
          // allData={roomData}
        />
      </CustomDialog>

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Weekly Lectures Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View weekly lecture details such as class, total lectures, and distribution by subject."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewWeeklyLecturesDialog.value}
        handleClose={() => {
          setIsEdit(false);
          setDisabled(false);
          setSelectedWeeklyLecture(null);
          viewWeeklyLecturesDialog.onFalse();
        }}
        maxWidth="sm"
      >
        <CreateNoOfLecture
          disabled={disabled}
          isEdit={false}
          onClose={handleClose}
          editData={selectedWeeklyLecture}
          // onSave={handleSave}
          // dialogValue={dialog.value}
          // onClose={closeDialog}
          // data={selectedEntry}
          // isEdit={isEdit}
          // allData={roomData}
          // onSave={handleSave}
          // dialogValue={dialog.value}
          // onClose={closeDialog}
          // data={selectedEntry}
          // isEdit={isEdit}
          // allData={roomData}
        />
      </CustomDialog>
    </Box>
  );
};

export default WeeklyLectures;
