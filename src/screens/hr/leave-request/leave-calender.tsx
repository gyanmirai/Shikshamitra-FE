import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Form, Field, Formik } from 'formik';
import React, { useMemo, useState } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import { Grid, useTheme, MenuItem, Checkbox, TextField, FormControlLabel } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeLeaveQuery } from 'src/redux/employee/employeeApi';

import { Editor } from 'src/components/editor';
import CommonCalender from 'src/components/calender';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ColorPicker } from 'src/components/color-utils';

import { leaveTypes, CALENDAR_COLOR_OPTIONS } from './leave-requst';

import type { TabComponentType } from '.';

// {
//     "id": "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2",
//     "title": "Summer Music Festival",
//     "allDay": false,
//     "color": "#00A76F",
//     "description": "Atque eaque ducimus minima distinctio velit. Laborum et veniam officiis. Delectus ex saepe hic id laboriosam officia. Odit nostrum qui illum saepe debitis ullam. Laudantium beatae modi fugit ut. Dolores consequatur beatae nihil voluptates rem maiores.",
//     "start": "2024-10-23T06:50:11+00:00",
//     "end": "2024-10-23T10:20:11+00:00",
//     "textColor": "#00A76F"
// }

const LeaveCalender = (props: TabComponentType) => {
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);
  const theme = useTheme();

  const { userInfo } = useSelector((state: any) => state.user);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
  });

  const calendarData = useMemo(
    () =>
      data?.items.map((i: any) => ({
        ...i,
        start: i.startDate,
        color: i.color,
        end: i.endDate,
        allDay: false,
        textColor: i.color,
        title: i.leaveType,
        description: i.description.replace(/<[^>]+>/g, ''),
        ...(i.employeeId === userInfo?.employee?.id ? { className: 'ownEvent' } : {}),
      })) || [],
    [data?.items, userInfo?.employee?.id]
  );
  const editData = useMemo(() => {
    if (currentDateClick) {
      return calendarData.find((i: any) => i.id === currentDateClick.event.id);
    }
    return null;
  }, [calendarData, currentDateClick]);

  console.log('currentDateClick', editData);

  return (
    <>
      <CommonCalender
        data={calendarData}
        isLoading={isLoading}
        onDateClick={(arg) => {
          setCurrentDateClick(arg);
        }}
      />
      <CustomDialog
        open={!!currentDateClick}
        handleClose={() => setCurrentDateClick(null)}
        title="Leave Request Details"
      >
        <LeaveRequestForm editData={editData} />
      </CustomDialog>
    </>
  );
};

export default LeaveCalender;

const LeaveRequestForm = ({ editData }: any) => (
  <Formik
    initialValues={{
      leaveType: editData?.leaveType || '',
      description: editData?.description || '',
      startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
      endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
      isHalfDay: editData?.halfDay || false,
      rejectionReason: editData?.rejectionReason || '',
      status: editData?.status || 0,
      color: editData?.color || '',
    }}
    // validationSchema={validationSchema}
    onSubmit={() => {}}
  >
    {({ errors, touched, setFieldValue, values, submitForm }) => (
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3 }}>
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Field
                name="leaveType"
                as={TextField}
                select
                fullWidth
                label="Leave Type"
                size="small"
                error={touched.leaveType && errors.leaveType}
                helperText={touched.leaveType && errors.leaveType}
                disabled={editData}
              >
                {leaveTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Field
                    name="isHalfDay"
                    as={Checkbox}
                    checked={values.isHalfDay}
                    disabled={editData}
                    onChange={(e: any) => {
                      setFieldValue('isHalfDay', e.target.checked);
                      if (e.target.checked) {
                        setFieldValue('endDate', null);
                      }
                    }}
                  />
                }
                label="Half Day"
              />
            </Grid>
            <Grid item xs={12}>
              <DateTimePicker
                label={values.isHalfDay ? 'Date and Time' : 'Start Date and Time'}
                onChange={(value) => setFieldValue('startDate', value)}
                format="DD-MM-YYYY HH:mm:ss"
                value={values.startDate}
                disabled={editData}
                slotProps={{
                  textField: {
                    size: 'small',
                    helperText: touched.startDate && errors.startDate,
                    error: touched.startDate && Boolean(errors.startDate),
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            {!values.isHalfDay && (
              <Grid item xs={12}>
                <DateTimePicker
                  label="End Date and Time"
                  onChange={(value) => setFieldValue('endDate', value)}
                  value={values.endDate}
                  format="DD-MM-YYYY HH:mm:ss"
                  disabled={editData}
                  slotProps={{
                    textField: {
                      size: 'small',
                      helperText: touched.endDate && errors.endDate,
                      error: touched.endDate && Boolean(errors.endDate),
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Editor
                onChange={(value) => {
                  setFieldValue('description', value);
                }}
                value={values.description}
                placeholder="Leave description"
                error={touched.description && Boolean(errors.description)}
                // @ts-ignore
                helperText={touched.description && errors.description}
                editable={false}
              />
            </Grid>
            <Grid item xs={12}>
              <ColorPicker
                selected={values.color}
                onSelectColor={(color) => {
                  setFieldValue('color', color);
                }}
                colors={CALENDAR_COLOR_OPTIONS}
                disabled={editData}
              />
            </Grid>
          </Grid>
        </Form>
      </Scrollbar>
    )}
  </Formik>
);
