import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetExamScheduleQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import type { IExamFormValues } from '../type';

interface ViewTimetableCompProps {
  examData: IExamFormValues | null;
}

dayjs.extend(utc);

const ViewTimetableComp: React.FC<ViewTimetableCompProps> = ({ examData }) => {
  const { data: scheduleDetails, isLoading: scheduleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamScheduleQuery,
    params: { examId: examData?.examId },
    options: { skip: !examData?.examId },
  });

  const normalizedSubjects = (scheduleDetails?.subjects || []).flatMap((s: any) => {
    if (
      s.electiveGroupId &&
      Array.isArray(s.electiveGroupSubjects) &&
      s.electiveGroupSubjects.length > 0
    ) {
      return s.electiveGroupSubjects.map((sub: any) => ({
        subjectId: sub.subjectId,
        subjectName: sub.subjectName || '',
        subjectCode: sub.subjectCode || sub.code || '',
        subjectColor: sub.color || sub.subjectColor || s.electiveGroupColor || '#9E9E9E',
        electiveGroupName: s.electiveGroupName || '',
        // Per-subject schedule if set; otherwise fall back to group-level
        examDate: sub.examDate ?? s.examDate,
        startTime: sub.startTime ?? s.startTime,
        endTime: sub.endTime ?? s.endTime,
        totalMarks: sub.totalMarks ?? s.totalMarks,
        passingMarks: sub.passingMarks ?? s.passingMarks,
        notes: sub.notes ?? s.notes,
      }));
    }
    // Core subject
    return [{ ...s, subjectColor: s.color || s.subjectColor || '#9E9E9E' }];
  });

  const sortedSubjects = useMemo(
    () =>
      [...normalizedSubjects].sort((a: any, b: any) => {
        const getVal = (s: any) => {
          if (!s.startTime) return 0;
          const d = dayjs(s.examDate || '2000-01-01');
          const t = dayjs(s.startTime);
          return d.hour(t.hour()).minute(t.minute()).second(0).millisecond(0).valueOf();
        };
        const timeA = getVal(a);
        const timeB = getVal(b);
        return timeA - timeB;
      }),
    [normalizedSubjects]
  );

  if (!examData) return null;

  return (
    <CustomizableTable
      tableId="subjects-table"
      isPagination={false}
      isFilter={false}
      isSearch={false}
      isShowedDense={false}
      isLoading={scheduleLoading}
      columns={[
        {
          id: 'subjectName',
          label: 'Subject',
          align: 'left',
          isFilter: true,
          sticky: true,
          isSort: true,
          render(value, row) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    borderRadius: 1,
                    backgroundColor: row.subjectColor,
                  }}
                />
                <Box>
                  <Typography variant="caption" display="block">
                    {value}
                    {row.subjectCode ? ` (${row.subjectCode})` : ''}
                  </Typography>
                  {row.electiveGroupName && (
                    <Chip
                      label={row.electiveGroupName}
                      size="small"
                      color="warning"
                      variant="soft"
                      sx={{ fontSize: '0.62rem', height: 16, mt: 0.25 }}
                    />
                  )}
                </Box>
              </Box>
            );
          },
        },
        {
          id: 'examDate',
          label: 'Date',
          align: 'left',
          isFilter: true,
          filterType: 'date',
          isSort: true,
          render: (value) => {
            const d = dayjs(value);
            console.log(value);
            return (
              <Typography variant="caption" gutterBottom>
                {d.isValid() ? d.format('DD-MM-YYYY') : '-'}
              </Typography>
            );
          },
        },
        {
          id: 'startTime',
          label: 'Start Time',
          align: 'left',
          isFilter: true,
          isSort: true,
          render: (value) => {
            const d = dayjs(value);
            return (
              <Typography variant="caption" gutterBottom>
                {d.isValid() ? d.format('hh:mm A') : '-'}
              </Typography>
            );
          },
        },
        {
          id: 'endTime',
          label: 'End Time',
          align: 'left',
          isFilter: true,
          isSort: true,
          render: (value) => {
            const d = dayjs(value);
            return (
              <Typography variant="caption" gutterBottom>
                {d.isValid() ? d.format('hh:mm A') : '-'}
              </Typography>
            );
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          align: 'left',
          filterType: 'number',
          isFilter: true,
          isSort: true,
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          align: 'left',
          filterType: 'number',
          isFilter: true,
          isSort: true,
        },
        {
          id: 'notes',
          label: 'Notes',
          align: 'left',
          isFilter: true,
          isSort: true,
          render: (value: any) => <Typography variant="caption">{value || '-'}</Typography>,
        },
      ]}
      data={sortedSubjects}
    />
  );
};

export default ViewTimetableComp;
