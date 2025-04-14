import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useMemo, useState } from 'react';

import { Box, Grid, useTheme, Typography } from '@mui/material';

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
  const theme = useTheme();

  const { user, employee } = useSelector((state: any) => state.auth);

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
        title: `${i.leavePolicy.leaveType} [${i.employee.firstName} ${i.employee.lastName}]`,
        description: i.description.replace(/<[^>]+>/g, ''),
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
  <Grid container spacing={2} bgcolor="background.neutral" m={0} p={2}>
    <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Typography variant="body2"> Employee</Typography>
    </Grid>
    <Grid item xs={8} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      {editData?.employee?.firstName} {editData?.employee?.lastName}
    </Grid>
    <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Typography variant="body2"> Leave Type</Typography>
    </Grid>
    <Grid item xs={8} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      {editData?.leavePolicy?.leaveType && (
        <Typography
          variant="body2"
          component="span"
          color={editData?.leavePolicy?.color}
          sx={{
            backgroundColor: `${editData?.leavePolicy?.color}20`,
            p: 0.8,
            borderRadius: 1,
            fontSize: 12,
          }}
        >
          {editData?.leavePolicy?.leaveType}
        </Typography>
      )}
    </Grid>
    <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Typography variant="body2"> Half Day</Typography>
    </Grid>
    <Grid item xs={8} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      {editData?.halfDay ? 'Yes' : 'No'}
    </Grid>
    <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Typography variant="body2"> Start Date</Typography>
    </Grid>
    <Grid item xs={8} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      {dayjs(editData?.startDate).format('DD-MM-YYYY')}
    </Grid>
    {!editData?.halfDay && (
      <>
        {' '}
        <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
          <Typography variant="body2"> End Date</Typography>
        </Grid>
        <Grid item xs={8} sx={{ borderBottom: '1.5px dashed #ccc' }}>
          {dayjs(editData?.endDate).format('DD-MM-YYYY')}
        </Grid>{' '}
      </>
    )}
    <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Typography variant="body2"> Description</Typography>
    </Grid>
    <Grid item xs={8} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Box dangerouslySetInnerHTML={{ __html: editData?.description }} />
    </Grid>
    {editData?.rejectionReason && (
      <>
        <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
          <Typography variant="body2"> Rejection Reason</Typography>
        </Grid>
        <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
          <Typography variant="body2"> {editData.rejectionReason}</Typography>
        </Grid>
      </>
    )}
    <Grid item xs={4} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Typography variant="body2"> Status</Typography>
    </Grid>
    <Grid item xs={8} sx={{ borderBottom: '1.5px dashed #ccc' }}>
      <Label
        color={
          EmployeeLeaveStatusTypeColor[
            EmployeeLeaveStatusType[editData?.status] as keyof typeof EmployeeLeaveStatusTypeColor
          ]
        }
      >
        {EmployeeLeaveStatusType[editData?.status]}
      </Label>
    </Grid>
  </Grid>
);
