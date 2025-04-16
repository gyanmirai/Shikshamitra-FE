import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { useState } from 'react';

import { TextField } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamFormValues } from '../type';

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // State to track exam schedules for subjects - currently not being used
  const formik = props;
  const [examSchedules, setExamSchedules] = useState(formik.values.subjects);
  console.log('formik exam error---', formik.values);
  return (
    <CustomizableTable
      isFilter={false}
      isPagination={false}
      isScrollbar={false}
      isShowedDense={false}
      isSearch={false}
      tableId="examschedule-table"
      columns={[
        { id: 'subjectName', label: 'Subject Name', minWidth: '160px', align: 'left' },
        {
          id: 'examDate',
          label: 'Exam Date',
          render(value, row) {
            return (
              <DatePicker
                value={value ? dayjs(value) : null}
                format="DD/MM/YYYY"
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examDate = newTime;
                  setExamSchedules(updatedSchedules);
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
            );
          },
        },
        {
          id: 'examTime',
          label: 'Exam Time',
          render(value, row) {
            return (
              <TimePicker
                format="HH:mm"
                value={value ? dayjs(value) : null}
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examTime = newTime;
                  setExamSchedules(updatedSchedules);
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
            );
          },
        },
        {
          id: 'examDuration',
          label: 'Exam Duration',
          render(value, row) {
            return (
              <TimePicker
                value={value ? dayjs(value) : null}
                format="HH:mm"
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examDuration = newTime;
                  setExamSchedules(updatedSchedules);
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
            );
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          render(value, row) {
            return (
              <TextField
                value={value}
                type="number"
                onChange={(e) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].totalMarks = Number(e.target.value);
                  setExamSchedules(updatedSchedules);
                }}
                size="small"
              />
            );
          },
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          render(value, row) {
            return (
              <TextField
                value={value}
                type="number"
                onChange={(e) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].passingMarks = Number(e.target.value);
                  setExamSchedules(updatedSchedules);
                }}
                size="small"
              />
            );
          },
        },
      ]}
      data={examSchedules}
    />
  );
};
export default ExamDetails;
