import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { SubmissionType, SubmissionTypeOptions } from 'src/enums/submission_type';
import { useGetHomeworksQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';

import AssignGrade from '../homeworkCreation/component/assignGradeForm';
import { SubmitHomeworkFile } from './homeworkSubmission/submitHomeworkFile';
import AssignMarksForText from '../homeworkCreation/component/assignMarksForText';
import { SubmitHomeworkContent } from './homeworkSubmission/submitHomeworkContent';
import ViewHomeworkDetails from '../homeworkCreation/component/viewHomeworkDetails';

import type { IHomework } from '../homeworkCreation/type';

const MyHomeworkSubmission = (props: TabComponentType) => {
  // State for managing active tab, initialized with 'Pending' status
  const tabs = useTabs(ScheduleExamStatus.Pending);

  // Dialog control states for homework submission
  const homeworkSubmissionDialog = useBoolean();
  // Dialog control states for viewing
  const viewSubmissionDialog = useBoolean();
  // Dialog control state for viewing homework details
  const viewHomeworkDetails = useBoolean();
  // State to track currently selected homework for operations
  const [selectedHomework, setSelectedHomework] = useState<IHomework | null>(null);

  // Redux state management
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // State for managing selected date with dayjs
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const { data: homeworkData, isLoading } = useGetHomeworksQuery(
    {
      academicMediumId: medium?.id,
      HomeworkDate: date ? date.format('YYYY-MM-DD') : undefined,
    },
    { skip: !medium?.id }
  );

  // Filtered table data based on active tab
  const tableData = useMemo(() => {
    const raw: any[] =
      homeworkData?.data ??
      homeworkData?.items ??
      (Array.isArray(homeworkData) ? homeworkData : []);
        return raw
      .filter((i: any) => (i.submissionStatus ?? i.status ?? 0) === tabs.value)
      .map((i: any) => ({
        id: i.id ?? i.homeworkId ?? '',
        studentId: i.studentId ?? i.student?.id ?? '',
        subject: i.subjectName ?? i.subject ?? '',
        title: i.title ?? i.name ?? '',
        homeworkType: i.homeworkType ?? '',
        startDate: i.startDate ?? i.createdAt ?? '',
        endDate: i.dueDate ?? i.endDate ?? '',
        createdBy: i.teacherName ?? i.createdBy ?? '',
        submissionType: i.submissionType ?? 0,
        feedback: i.feedback ?? '',
        status: i.submissionStatus ?? i.status ?? 0,
      }));
  }, [homeworkData, tabs.value]);

  // Handler for closing dialogs with unsaved changes check
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      setSelectedHomework(null);
      viewSubmissionDialog.onFalse();
      homeworkSubmissionDialog.onFalse();
    } else if (!isChanges) {
      setSelectedHomework(null);
      viewSubmissionDialog.onFalse();
      homeworkSubmissionDialog.onFalse();
    }
  };

  return (
    <Box>
      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
        <DatePicker
          label="Homework Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          name="date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
          sx={{ maxWidth: '250px' }}
        />
      </Box>

      <CustomizableTable
        tableId="homework-assignment-management"
        noDataText={<>No Homework Available</>}
        columns={[
          {
            id: 'subject',
            label: 'Subject',
            align: 'left',
            filterType: 'string',
          },
          {
            id: 'title',
            label: 'Title',
            align: 'left',
            filterType: 'string',
          },
          {
            id: 'homeworkType',
            label: 'Type',
            align: 'left',
            filterType: 'string',
          },
          {
            id: 'startDate',
            label: 'Created At',
            align: 'left',
            filterType: 'date',
            minWidth: 110,
          },
          {
            id: 'endDate',
            label: 'End Date',
            align: 'left',
            filterType: 'date',
            minWidth: 110,
          },
          {
            id: 'createdBy',
            label: 'Created By',
            align: 'left',
            filterType: 'string',
            minWidth: 120,
          },
          {
            id: 'submissionType',
            label: 'Submission Type',
            minWidth: 160,
            align: 'left',
            filterType: 'enum',
            enumOptions: SubmissionTypeOptions,
            render: (value, row) => (
              <Typography variant="caption" fontWeight="13px">
                {SubmissionType[value]}
              </Typography>
            ),
          },
          {
            id: 'feedback',
            label: 'Feedback',
            render: (value, row) => (
              <CustomTooltip title={value || '-'} arrow>
                <Typography
                  variant="caption"
                  fontSize="13px"
                  noWrap
                  sx={{
                    maxWidth: 150,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {value || '-'}
                </Typography>
              </CustomTooltip>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: 80,
            sticky: true,
            filterType: 'enum',
            enumOptions: ScheduleExamStatusOptions,
            align: 'left',
            render(value, row) {
              const color = ScheduleExamStatusColor[value as ScheduleExamStatus] as LabelColor;
              return <Label color={color}>{ScheduleExamStatus[value]}</Label>;
            },
          },
          // {
          //   id: 'action',
          //   label: 'Action',
          //   isSort: false,
          //   isFilter: false,
          //   sticky: true,
          //   align: 'left',
          //   minWidth: 40,
          //   render: (value, row) => (
          //     <ThreeDotsActions
          //       placement="right-top"
          //       showViewIcon
          //       handleViewClick={() => {
          //         setSelectedHomework(row as IHomework);
          //         viewHomeworkDetails.onTrue();
          //       }}
          //       showThreeDots={false}
          //       // actions={(prop) => actions({ ...prop, row })}
          //     />
          //   ),
          // },
        ]}
        data={tableData}
        isLoading={isLoading}
      />
      <CustomDialog
        title={selectedHomework?.title || 'Homework Details'}
        open={homeworkSubmissionDialog.value}
        handleClose={() => {
          homeworkSubmissionDialog.onFalse();
          setSelectedHomework(null);
        }}
        maxWidth={selectedHomework?.submissionType === 1 ? 'sm' : 'md'}
      >
        {selectedHomework?.submissionType === 1 ? (
          <SubmitHomeworkFile selectedHomework={selectedHomework} onClose={handleClose} />
        ) : (
          <SubmitHomeworkContent selectedHomework={selectedHomework} onClose={handleClose} />
        )}
      </CustomDialog>

      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={() => {
          viewSubmissionDialog.onFalse();
          setSelectedHomework(null);
        }}
        title="View Submission"
        maxWidth="sm"
      >
        {selectedHomework?.submissionType === 1 ? (
          <AssignGrade
            isEdit={false}
            data={null}
            onClose={handleClose}
            homeworkId={selectedHomework?.id}
          />
        ) : (
          <AssignMarksForText
            isEdit={false}
            data={null}
            onClose={handleClose}
            homeworkId={selectedHomework?.id}
          />
        )}
      </CustomDialog>

      {/* View subject details dialog */}
      <CustomDialog
        title={selectedHomework?.title || 'Homework Details'}
        open={viewHomeworkDetails.value}
        handleClose={() => {
          viewHomeworkDetails.onFalse();
          setSelectedHomework(null);
        }}
        maxWidth="md"
      >
        <ViewHomeworkDetails homework={selectedHomework} />
      </CustomDialog>
    </Box>
  );
};

export default MyHomeworkSubmission;
