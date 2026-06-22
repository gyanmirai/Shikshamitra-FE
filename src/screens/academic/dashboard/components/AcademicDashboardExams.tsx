'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import React from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import {
  ScheduleExamStatus,
  ScheduleExamStatusColor,
  ScheduleExamStatusOptions,
} from 'src/enums/schedule-exam-status';

const staticExams = [
  {
    examName: 'Periodic Test - I',
    subject: 'Mathematics',
    class: 'Class 8 A',
    date: '2026-06-03',
    status: ScheduleExamStatus.Pending,
  },
  {
    examName: 'Unit Test - II',
    subject: 'Science',
    class: 'Class 9 B',
    date: '2026-06-05',
    status: ScheduleExamStatus.Published,
  },
  {
    examName: 'Weekly Assessment',
    subject: 'English',
    class: 'Class 7 A',
    date: '2026-06-06',
    status: ScheduleExamStatus.Completed,
  },
  {
    examName: 'Half-Yearly Practice',
    subject: 'Social Science',
    class: 'Class 10 A',
    date: '2026-06-09',
    status: ScheduleExamStatus.Pending,
  },
  {
    examName: 'Chapter Test',
    subject: 'Hindi',
    class: 'Class 6 B',
    date: '2026-06-11',
    status: ScheduleExamStatus.Draft,
  },
];

interface AcademicDashboardExamsProps {
  list?: Array<{
    id: string;
    examName: string;
    date: string;
    time: string;
    className: string;
    roomName: string;
  }>;
}

const AcademicDashboardExams = ({ list }: AcademicDashboardExamsProps) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: { AcademicMediumId: medium?.id, pageSize: 5, page: 1 },
    options: { skip: !medium?.id || !!list },
  });

  const parsedExams = list
    ? list.map((e) => ({
        examName: e.examName,
        subject: `Room: ${e.roomName || 'N/A'}`,
        class: e.className || 'N/A',
        date: `${e.date} (${e.time})`,
        status: ScheduleExamStatus.Pending,
      }))
    : [];

  const exams = list
    ? parsedExams
    : (data?.items ?? []).slice(0, 5).map((e: any) => ({
        examName: e.examName ?? e.name ?? '—',
        subject: Array.isArray(e.subjects)
          ? e.subjects.map((s: any) => s.subjectName ?? s.name).join(', ')
          : (e.subjectName ?? '—'),
        class: e.standardName ?? e.className ?? e.class ?? '—',
        date: e.examDate ?? e.startDate ?? e.date ?? '—',
        status: e.status ?? ScheduleExamStatus.Pending,
      }));

  const tableData = exams.length ? exams : staticExams;

  return (
    <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6">Next 5 Exams</Typography>
      <CustomizableTable
        tableId="nextExams"
        isLoading={isLoading}
        columns={[
          { id: 'examName', label: 'Exam Name' },
          { id: 'subject', label: 'Subject' },
          { id: 'class', label: 'Class' },
          { id: 'date', label: 'Date' },
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
        ]}
        data={tableData}
      />
    </Card>
  );
};

export default AcademicDashboardExams;
