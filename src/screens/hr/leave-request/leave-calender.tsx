import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';

import { Box, Grid, Button, MenuList, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeLeaveQuery } from 'src/redux/employee/employeeApi';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

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
  const [organization, setOrganization] = useState<string | null>(null);
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);
  const popover = usePopover();
  const { employee } = useSelector((state: any) => state.auth);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
  });

  const handleChange = (event: any) => {
    setOrganization(event?.target?.value);
  };

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
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const onChangeView = useCallback((newView: any) => {
    setOrganization(newView);
  }, []);
  return (
    <>
      <Button
        size="small"
        color="inherit"
        onClick={popover.onOpen}
        variant="outlined"
        // startIcon={<Iconify icon={selectedItem.icon} />}
        endIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: -0.5 }} />}
        sx={{ display: { xs: 'none', sm: 'inline-flex', width: '150px' } }}
      >
        {organization || 'Organization'}
      </Button>
      <CommonCalender
        data={calendarData}
        isLoading={isLoading}
        onDateClick={(arg) => {
          setCurrentDateClick(arg);
        }}
        initialView="dayGridMonth"
        formate="MMM YYYY"
        views={{
          timeGridWeek: {
            dayHeaderFormat: { weekday: 'short', day: '2-digit' }, // Sun, 01
          },
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' }, // June 2025
          },
          dayGridDay: {
            titleFormat: { day: '2-digit', month: 'long', year: 'numeric' }, // 18 June 2025
          },
        }}
        allDaySlot={false}
        viewOptions={[
          { value: 'dayGridMonth', label: 'Month', icon: 'mingcute:calendar-month-line' },
          { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
          { value: 'listWeek', label: 'Agenda', icon: 'fluent:calendar-agenda-24-regular' },
        ]}
        validRange={{ start: currentYear?.startDate, end: currentYear?.endDate }}
      />
      <CustomDialog
        open={!!currentDateClick}
        handleClose={() => setCurrentDateClick(null)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Leave Request Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This is the attendance update dialog where you can modify biometric records manually. Ensure changes reflect actual attendance."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <LeaveRequestForm editData={editData} />
      </CustomDialog>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <MenuList>
          {medium?.educationMediumStages?.map((org: any) => (
            <MenuItem
              key={org.id}
              value={org.id}
              onClick={() => {
                popover.onClose();
                onChangeView(org.name);
              }}
            >
              {org.name}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </>
  );
};

export default LeaveCalender;

export const LeaveRequestForm = ({ editData }: any) => {
  const isView = useBoolean();
  return (
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
              EmployeeLeaveStatusTypeColor[
                editData?.status as EmployeeLeaveStatusType
              ] as LabelColor
            }
          >
            {EmployeeLeaveStatusType[editData?.status]}
          </Label>
        </Grid>
        {editData?.attachment && (
          <>
            {' '}
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight={600}>
                {' '}
                Document
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Iconify
                icon="eva:eye-fill"
                sx={{ mr: 0.5, cursor: 'pointer' }}
                onClick={isView.onTrue}
              />
            </Grid>
          </>
        )}
      </Grid>
      {/* <CustomDialog open={isView.value} handleClose={isView.onFalse} title="Document">
        <Box sx={{ p: 2 }} bgcolor="background.neutral">
          <iframe
            src={convertBase64Format(editData?.attachment)}
            width="100%"
            height="400px"
            title="Document"
          />
        </Box>
      </CustomDialog> */}
    </Box>
  );
};
