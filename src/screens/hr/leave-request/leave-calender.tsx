import type { LabelColor } from 'src/components/label';
import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeLeaveQuery } from 'src/redux/employee/employeeApi';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import { Label } from 'src/components/label';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';

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

  const { employee } = useSelector((state: any) => state.auth);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
  });

  const calendarData = useMemo(
    () =>
      data?.items.map((i: any) => ({
        ...i,
        start: i.startDate,
        color: i.leavePolicy.color,
        end: i.endDate,
        allDay: false,
        textColor: i.leavePolicy.color,
        title: `${i.leavePolicy.leaveType} [${i.employee.firstName} ${i.employee.lastName}] ${EmployeeLeaveStatusType[i?.status]}`,
        description: i.description.replace(/<[^>]+>/g, ''),
        viewStartDate: i.startDate,
        viewEndDate: i.endDate,
        ...(i.employeeId === employee?.id ? { className: 'ownEvent' } : {}),
      })) || [],
    [data?.items, employee?.id]
  );
  const editData = useMemo(() => {
    if (currentDateClick) {
      return calendarData.find((i: any) => i.id === currentDateClick.event.id);
    }
    return null;
  }, [calendarData, currentDateClick]);

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

export const LeaveRequestForm = ({ editData }: any) => (
  <Box sx={{ p: 2 }} bgcolor="background.neutral">
    <Grid container spacing={3}>
      <Grid item xs={4}>
        <Typography variant="body2" fontWeight={600}>
          {' '}
          Employee
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2">
          {editData?.employee?.firstName} {editData?.employee?.lastName}{' '}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" fontWeight={600}>
          {' '}
          Organization
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2">{editData?.employee?.educationMediumStage?.name}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" fontWeight={600}>
          {' '}
          Leave Type
        </Typography>
      </Grid>
      <Grid item xs={8}>
        {editData?.leavePolicy?.leaveType && (
          <Typography
            variant="body2"

            // color={editData?.leavePolicy?.color}
          >
            {editData?.leavePolicy?.leaveType}
          </Typography>
        )}
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" fontWeight={600}>
          {' '}
          Half Day
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2"> {editData?.halfDay ? 'Yes' : 'No'} </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" fontWeight={600}>
          {' '}
          Start Date
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2">
          {' '}
          {dayjs(editData?.viewStartDate).format('DD-MM-YYYY')}{' '}
        </Typography>
      </Grid>
      {!editData?.halfDay && (
        <>
          {' '}
          <Grid item xs={4}>
            <Typography variant="body2" fontWeight={600}>
              {' '}
              End Date
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">
              {dayjs(editData?.viewEndDate).format('DD-MM-YYYY')}
            </Typography>
          </Grid>{' '}
        </>
      )}
      <Grid item xs={4}>
        <Typography variant="body2" fontWeight={600}>
          {' '}
          Description
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2" dangerouslySetInnerHTML={{ __html: editData?.description }} />
      </Grid>
      {editData?.rejectionReason && (
        <>
          <Grid item xs={4}>
            <Typography variant="body2" fontWeight={600}>
              {' '}
              Rejection Reason
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2"> {editData.rejectionReason}</Typography>
          </Grid>
        </>
      )}
      <Grid item xs={4}>
        <Typography variant="body2" fontWeight={600}>
          {' '}
          Status
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Label
          color={
            EmployeeLeaveStatusTypeColor[editData?.status as EmployeeLeaveStatusType] as LabelColor
          }
        >
          {EmployeeLeaveStatusType[editData?.status]}
        </Label>
      </Grid>
    </Grid>
  </Box>
);
