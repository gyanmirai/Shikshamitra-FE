import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { useState } from 'react';

import { TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamFormValues } from '../type';

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik = props;
  // State to store and manage exam schedules data for each subject, initialized with subjects from formik values
  const [examSchedules, setExamSchedules] = useState(formik.values.subjects);
  return (
    <CustomizableTable
      isFilter={false}
      isPagination={false}
      isScrollbar={false}
      isShowedDense={false}
      isSearch={false}
      tableId="examschedule-table"
      columns={[
        {
          id: 'subjectName',
          label: 'Subject Name',
          minWidth: '160px',
          align: 'left',
          isFilter: false,
          isSort: false,
        },
        {
          id: 'examDate',
          label: 'Exam Start Date Time',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              <DateTimePicker
                value={value ? dayjs(value) : null}
                format="DD/MM/YYYY hh:mm"
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examStartDateTime = newTime;
                  setExamSchedules(updatedSchedules);
                }}
                minDateTime={dayjs()} // Prevents selecting past dates and times
                slotProps={{ textField: { size: 'small' } }}
                sx={{ minWidth: '250px', width: '100%' }}
              />
            );
          },
        },
        {
          id: 'examTime',
          label: 'Exam End Date Time',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              <DateTimePicker
                format="DD/MM/YYYY hh:mm"
                value={value ? dayjs(value) : null}
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examEndDateTime = newTime;
                  setExamSchedules(updatedSchedules);
                }}
                minDateTime={dayjs()}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ minWidth: '250px', width: '100%' }}
              />
            );
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          isFilter: false,
          isSort: false,
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
                sx={{ minWidth: '250px', width: '100%' }}
              />
            );
          },
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          isFilter: false,
          isSort: false,
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
                sx={{ minWidth: '250px', width: '100%' }}
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
