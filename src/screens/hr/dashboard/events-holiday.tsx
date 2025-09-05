import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEventHolidayByDateQuery } from 'src/redux/eventHoliday/eventHolidayApi';

import { HrEventsAndHolidaysForm } from '../events-holidays';

const EventsHoliday = () => {
  const theme = useTheme();
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);
  const { data: eventHolidayData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEventHolidayByDateQuery,
    params: dayjs()?.format('YYYY-MM-DD'),
  });

  const calendarData = useMemo(
    () =>
      eventHolidayData?.items.map((i: any) => ({
        ...i,
        start: i.startDate,
        color: i.isHoliday ? theme.palette.error.main : theme.palette.success.main,
        end: i.endDate,
        allDay: false,
        textColor: i.isHoliday ? theme.palette.error.main : theme.palette.success.main,
        title: i.isHoliday ? 'Holiday' : 'Event',
        description: i.reason,
      })) || [],
    [eventHolidayData?.items, theme.palette.error.main, theme.palette.success.main]
  );

  const selectCalenderData = useMemo(() => {
    if (currentDateClick) {
      return calendarData.find((i: any) => i.id === currentDateClick.event.id);
    }
    return null;
  }, [calendarData, currentDateClick]);
  return (
    <>
      <CommonCalender
        data={calendarData}
        showCalendarToolbar={false}
        onDateClick={(e) => {
          console.log(e);
          setCurrentDateClick(e);
        }}
      />
      <CustomDialog
        open={!!selectCalenderData}
        handleClose={() => {
          setCurrentDateClick(null);
        }}
        title="Preview"
      >
        <HrEventsAndHolidaysForm
          handleClose={() => {
            setCurrentDateClick(null);
          }}
          editData={selectCalenderData}
          isCalenderPreview
        />
      </CustomDialog>
    </>
  );
};

export default EventsHoliday;
