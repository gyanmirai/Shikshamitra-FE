import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type { LabelColor } from 'src/components/label';
import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  useGetEmployeeLeaveQuery,
  useGetEmployeeLeaveByIdQuery,
} from 'src/redux/employee/employeeApi';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';
import {
  Box,
  Card,
  Grid,
  TableRow,
  MenuList,
  MenuItem,
  TableCell,
  Typography,
} from '@mui/material';

import type { TabComponentType } from '.';

const LeaveCalender = (props: TabComponentType) => {
  const [organization, setOrganization] = useState<string>('');
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);
  const popover = usePopover();
  const { employee } = useSelector((state: any) => state.auth);
  const { currentMedium: mediumStageId, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
    params: mediumStageId?.id,
  });

  useEffect(() => {
    setAllOrganization(mediumStageId?.educationMediumStages || []);
    setOrganization(mediumStageId?.educationMediumStages?.[0]?.id || '');
  }, [mediumStageId]);

  const calendarData = useMemo(
    () =>
      data?.items.map((i: any) => ({
        ...i,
        start: i.startDate,
        color: i.leavePolicy.color,
        end: i.endDate,
        allDay: false,
        employeeCode: i.employeeCode,
        textColor: i.leavePolicy.color,
        title: `${i.leaveType} [${i.name}] ${i.status}`,
        reason: i.reason || i.description.replace(/<[^>]+>/g, ''),
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

  const onChangeView = useCallback((newView: any) => {
    setOrganization(newView);
  }, []);
  return (
    <>
      <Card sx={{ mb: 1, mt: 1 }}>
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%', pl: 1, mt: 2, mb: 2 } }}
          disabled={!mediumStageId}
        />
      </Card>

      <CommonCalender
        data={calendarData}
        isLoading={isLoading}
        onDateClick={(arg) => {
          setCurrentDateClick(arg);
        }}
        initialView="dayGridMonth"
        formate="MMM YYYY"
        containerProps={{
          sx: {
            height: '100%',
            minHeight: '0',
          },
        }}
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
              title="Displays detailed information about the employee’s leave request, including type, dates, reason, and approval status."
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
          {mediumStageId?.educationMediumStages?.map((org: any) => (
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
  const { isLoading: isLeavePolicyLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveByIdQuery,
    params: { id: editData?.id },
  });
  return isLeavePolicyLoading ? (
    <TableRow>
      <TableCell sx={{ height: '50px' }}>
        <Box className="loader" height={24} />
      </TableCell>
    </TableRow>
  ) : (
    <Box sx={{ p: 2 }} bgcolor="background.neutral">
      <Grid container spacing={3}>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Employee
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">
            {editData?.employee?.firstName} {editData?.employee?.lastName}
          </Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Organization
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">{editData?.employee?.educationMediumStage?.name}</Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Leave Type
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          {editData?.leavePolicy?.leaveType && (
            <Typography variant="body2">{editData.leavePolicy.leaveType}</Typography>
          )}
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Half Day
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">{editData?.halfDay ? 'Yes' : 'No'}</Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Start Date
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">
            {dayjs(editData?.viewStartDate).format('DD-MM-YYYY')}
          </Typography>
        </Grid>

        {!editData?.halfDay && (
          <>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" fontWeight={600}>
                End Date
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2">
                {dayjs(editData?.viewEndDate).format('DD-MM-YYYY')}
              </Typography>
            </Grid>
          </>
        )}

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Reason
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">
            {editData?.reason ||
              (editData?.description && (
                <span dangerouslySetInnerHTML={{ __html: editData.description }} />
              ))}
          </Typography>
        </Grid>

        {editData?.rejectionReason && (
          <>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" fontWeight={600}>
                Rejection Reason
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2">{editData.rejectionReason}</Typography>
            </Grid>
          </>
        )}

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Status
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
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
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" fontWeight={600}>
                Document
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Iconify
                icon="eva:eye-fill"
                sx={{ mr: 0.5, cursor: 'pointer' }}
                onClick={isView.onTrue}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};
