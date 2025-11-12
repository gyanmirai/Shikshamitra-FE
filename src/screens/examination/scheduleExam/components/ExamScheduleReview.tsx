import type { FormikProps } from 'formik';

import React from 'react';
import dayjs from 'dayjs';
import { Box, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { IExamFormValues } from '../type';

const ExamScheduleReview = ({ formik }: { formik: FormikProps<IExamFormValues> }) => (
  <SectionCard title="Subject Schedule">
    {/* Left Column */}
    <Grid size={12}>
      <CustomizableTable
        tableId="exam-schedule-view"
        columns={[
          {
            id: 'subjectName',
            label: 'Subject',
            align: 'left',
            render: (_value: any, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 4, height: 18, borderRadius: 1, bgcolor: row.subjectColor }} />
                <Typography variant="caption">
                  {row.subjectName} ({row.subjectCode})
                </Typography>
              </Box>
            ),
          },
          {
            id: 'examDate',
            label: 'Date',
            filterType: 'date',
            align: 'left',
            render: (value: any) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
          },
          {
            id: 'startTime',
            label: 'Start Time',
            align: 'left',
            render: (value: any) => (value ? dayjs(value).format('hh:mm A') : '-'),
          },
          {
            id: 'endTime',
            label: 'End Time',
            align: 'left',
            render: (value: any) => (value ? dayjs(value).format('hh:mm A') : '-'),
          },
          {
            id: 'totalMarks',
            label: 'Total Marks',
            filterType: 'number',
            align: 'left',
            render: (value: any) => (value != null ? value : '-'),
          },
          {
            id: 'passingMarks',
            label: 'Passing Marks',
            filterType: 'number',
            align: 'left',
            render: (value: any) => (value != null ? value : '-'),
          },
          {
            id: 'notes',
            label: 'Notes',
            align: 'left',
            render: (value: any) => value || '-',
          },
        ]}
        data={formik.values.subjects}
        isFilter={false}
        isPagination={false}
        isScrollbar={false}
        isSearch={false}
        isShowedDense={false}
      />
    </Grid>
  </SectionCard>
);

export default ExamScheduleReview;
