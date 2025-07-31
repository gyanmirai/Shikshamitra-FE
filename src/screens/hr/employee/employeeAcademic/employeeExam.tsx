import type { LabelColor } from 'src/components/label';
import type { IExamFormValues } from 'src/screens/examination/scheduleExam/type';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Chip } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { ScheduleExamStatus } from 'src/enums/schedule-exam-status';
import ViewTimetableComp from 'src/screens/examination/scheduleExam/components/viewTimetableComp';

import { Label } from 'src/components/label';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const dummyExamData = [
  {
    examType: 'Mid-term Exam',
    examName: 'Science Mid-Term Assessment',
    className: '10',
    divisions: ['A', 'B'],
    subjects: [
      {
        id: 1,
        subjectName: 'Physics',
        examDate: '15/09/2024',
        startTime: '10:00',
        endTime: '12:00',
        totalMarks: 70,
        passingMarks: 28,
        invigilationTeacher: 'Mr. Mehta',
        teacher: 'Mrs. Iyer',
        rubric: [],
      },
      {
        id: 2,
        subjectName: 'Chemistry',
        examDate: '17/09/2024',
        startTime: '10:00',
        endTime: '12:00',
        totalMarks: 70,
        passingMarks: 28,
        invigilationTeacher: 'Mr. Patel',
        teacher: 'Dr. Shah',
        rubric: [],
      },
    ],
    description: 'This exam covers chapters 1 to 5 from the Science syllabus.',
    status: 1, // Completed
  },
  {
    examType: 'Unit Test',
    examName: 'Mathematics Unit Test - Chapter 2',
    className: '9',
    divisions: ['C'],
    subjects: [
      {
        id: 3,
        subjectName: 'Mathematics',
        examDate: '20/09/2024',
        startTime: '09:00',
        endTime: '10:30',
        totalMarks: 40,
        passingMarks: 16,
        invigilationTeacher: 'Mrs. Desai',
        teacher: 'Mr. Sharma',
        rubric: [],
      },
    ],
    description: 'Unit test based on Chapter 2: Algebraic Expressions.',
    status: 0, // Pending
  },
  {
    examType: 'Final Exam',
    examName: 'English Final Examination',
    className: '8',
    divisions: ['A', 'D'],
    subjects: [
      {
        id: 4,
        subjectName: 'English',
        examDate: '05/10/2024',
        startTime: '11:00',
        endTime: '13:30',
        totalMarks: 100,
        passingMarks: 40,
        invigilationTeacher: 'Mr. Roy',
        teacher: 'Ms. Fernandes',
        rubric: [],
      },
    ],
    description: 'Comprehensive final exam covering entire syllabus.',
    status: 1, // Completed
  },
];

const DummyScheduledExamTable = () => {
  // State to manage active tab value
  const tabs = useTabs(ScheduleExamStatus.Pending);

  // State to control exam details dialog visibility
  const viewExamDialog = useBoolean();

  // State to store selected exam data for viewing
  const [selectedExam, setSelectedExam] = useState<IExamFormValues | null>(null);

  // Memoized count of exams by status
  const examCounts = useMemo(
    () => ({
      pending: dummyExamData.filter((i) => i.status === ScheduleExamStatus.Pending).length,
      completed: dummyExamData.filter((i) => i.status === ScheduleExamStatus.Completed).length,
    }),
    []
  );

  // Memoized tab configuration with counts
  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ScheduleExamStatus.Pending,
        count: examCounts.pending,
        color: 'warning',
      },
      {
        label: 'Completed',
        value: ScheduleExamStatus.Completed,
        count: examCounts.completed,
        color: 'primary',
      },
    ],
    [examCounts]
  );

  // Handler for tab change events
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  // Memoized filtered exam data based on selected tab
  const tableData = useMemo(
    () => dummyExamData.filter((i) => i.status === tabs.value),
    [tabs.value]
  );

  return (
    <Box>
      <Box display="flex" gap={1} alignItems="flex-start">
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              sx={{ fontSize: '12px' }}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label
                    // variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                    color={(tab?.color as LabelColor) || 'default'}
                  >
                    {tab.count}
                  </Label>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      <CustomizableTable
        tableId="dummy-schedule-exam-table"
        noDataText={<>No Exam Data Found</>}
        columns={[
          { id: 'className', label: 'Class', align: 'left' },
          {
            id: 'divisions',
            label: 'Division',
            align: 'left',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((division: string) => (
                  <Chip key={division} label={division} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          { id: 'examName', label: 'Exam Name', align: 'left' },
          { id: 'examType', label: 'Exam Type', align: 'left' },
          {
            id: 'subjects',
            label: 'Subjects',
            align: 'left',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((subject: { id: string; subjectName: string }) => (
                  <Chip
                    key={subject.id}
                    label={subject.subjectName}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 50,
            isSort: false,
            sticky: true,
            isFilter: false,
            render: (value, row) => (
              <ThreeDotsActions
                showViewIcon
                handleViewClick={() => {
                  viewExamDialog.onTrue();
                  setSelectedExam(row as IExamFormValues);
                }}
                showThreeDots={false}
              />
            ),
          },
        ]}
        data={tableData}
      />
      <CustomDialog
        title={`${selectedExam?.examName} Timetable`}
        open={viewExamDialog.value}
        handleClose={() => {
          viewExamDialog.onFalse();
          setSelectedExam(null);
        }}
        maxWidth="md"
      >
        <ViewTimetableComp examData={selectedExam} />
      </CustomDialog>
    </Box>
  );
};

export default DummyScheduledExamTable;
