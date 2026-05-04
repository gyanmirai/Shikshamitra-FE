import type { RootState } from 'src/redux/store';
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Box, Grid, TableRow, MenuList, MenuItem, TableCell, Typography } from '@mui/material';
import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
} from 'src/screens/hr/leave-request/leave-status.utils';
import {
  useGetLeaveRequestByIdQuery,
  useLazyGetLeaveCalendarQuery,
  useGetMyLeaveRequestByIdQuery,
} from 'src/redux/hr/leaveApi';
import {
  CALENDAR_MAX_PAGES,
  CALENDAR_PAGE_SIZE,
  dedupeCalendarItemsById,
  shouldMarkCalendarCapReached,
  buildCalendarVisibleRangePayload,
} from 'src/screens/hr/leave-request/leave-calendar.utils';

const LeaveCalender = () => {
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);
  const popover = usePopover();
  const { employee } = useSelector((state: any) => state.auth);
  const { currentMedium: mediumStageId, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const [selectedMediumStageId, setSelectedMediumStageId] = useState<string>('');
  const [calendarVisibleRange, setCalendarVisibleRange] = useState<{
    rangeStart: string;
    rangeEnd: string;
  } | null>(null);
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [calendarTotalCount, setCalendarTotalCount] = useState(0);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarCapReached, setCalendarCapReached] = useState(false);
  const [triggerCalendarQuery] = useLazyGetLeaveCalendarQuery();

  const onDatesSet = useCallback((arg: DatesSetArg) => {
    const newRange = buildCalendarVisibleRangePayload(arg.start, arg.end);
    setCalendarVisibleRange((prev) => {
      if (prev && prev.rangeStart === newRange.rangeStart && prev.rangeEnd === newRange.rangeEnd) {
        return prev;
      }
      return newRange;
    });
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadCalendarData = async () => {
      if (!currentYear?.id || !calendarVisibleRange) {
        setCalendarItems([]);
        setCalendarTotalCount(0);
        setCalendarCapReached(false);
        setIsCalendarLoading(false);
        return;
      }

      setIsCalendarLoading(true);
      setCalendarCapReached(false);

      try {
        const allItems: any[] = [];

        const loadPageRecursively = async (
          page: number,
          knownTotalCount: number
        ): Promise<{ totalCount: number; reachedPageLimit: boolean }> => {
          const response = await triggerCalendarQuery(
            {
              academicYearId: currentYear.id,
              rangeStart: calendarVisibleRange.rangeStart,
              rangeEnd: calendarVisibleRange.rangeEnd,
              page,
              pageSize: CALENDAR_PAGE_SIZE,
            },
            false
          ).unwrap();

          const totalCount = page === 1 ? (response?.totalCount ?? 0) : knownTotalCount;

          const pageItems = Array.isArray(response?.items) ? response.items : [];
          allItems.push(...pageItems);

          const shouldStop =
            allItems.length >= totalCount ||
            pageItems.length === 0 ||
            pageItems.length < CALENDAR_PAGE_SIZE;

          if (shouldStop) {
            return { totalCount, reachedPageLimit: false };
          }

          if (page >= CALENDAR_MAX_PAGES) {
            return { totalCount, reachedPageLimit: true };
          }

          return loadPageRecursively(page + 1, totalCount);
        };

        const { totalCount, reachedPageLimit } = await loadPageRecursively(1, 0);

        if (!isActive) {
          return;
        }

        const deduped = dedupeCalendarItemsById(allItems);
        setCalendarItems(deduped);
        setCalendarTotalCount(totalCount);
        setCalendarCapReached(
          shouldMarkCalendarCapReached(reachedPageLimit, totalCount, deduped.length)
        );
      } catch {
        if (!isActive) {
          return;
        }
        setCalendarItems([]);
        setCalendarTotalCount(0);
        setCalendarCapReached(false);
      } finally {
        if (isActive) {
          setIsCalendarLoading(false);
        }
      }
    };

    loadCalendarData();

    return () => {
      isActive = false;
    };
  }, [calendarVisibleRange, currentYear?.id, triggerCalendarQuery]);

  useEffect(() => {
    if (!selectedMediumStageId) {
      return;
    }
    const stageExists = mediumStageId?.educationMediumStages?.some(
      (org: any) => String(org?.id ?? '') === selectedMediumStageId
    );
    if (!stageExists) {
      setSelectedMediumStageId('');
    }
  }, [mediumStageId?.educationMediumStages, selectedMediumStageId]);

  const calendarData = useMemo(
    () =>
      calendarItems
        .filter((i: any) =>
          selectedMediumStageId ? String(i?.mediumStageId ?? '') === selectedMediumStageId : true
        )
        .map((i: any) => {
          const color = i.leaveTypeColor || '#2065D1';
          const desc = String(i.description ?? '');
          const plainDesc = desc.replace(/<[^>]+>/g, '');
          return {
            ...i,
            start: i.startDate,
            end: i.endDate,
            color,
            allDay: false,
            employeeCode: i.employeeCode,
            textColor: color,
            title: `${i.leaveTypeName ?? i.leaveType ?? ''} [${i.employeeName ?? i.name ?? ''}] ${i.status ?? ''}`,
            reason: i.reason ?? plainDesc,
            description: plainDesc,
            leaveType: i.leaveTypeName ?? i.leaveType,
            name: i.employeeName ?? i.name,
            viewStartDate: i.startDate,
            viewEndDate: i.endDate,
            ...(i.employeeId === employee?.id ? { className: 'ownEvent' } : {}),
          };
        }) || [],
    [calendarItems, employee?.id, selectedMediumStageId]
  );
  const editData = useMemo(() => {
    if (currentDateClick) {
      return calendarData.find((i: any) => i.id === currentDateClick.event.id);
    }
    return null;
  }, [calendarData, currentDateClick]);

  return (
    <Box sx={{ height: '100%' }}>
      <CommonCalender
        data={calendarData}
        isLoading={isCalendarLoading}
        datesSet={onDatesSet}
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
      {calendarCapReached && (
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          {selectedMediumStageId
            ? `Showing ${calendarData.length} filtered events from ${calendarItems.length} loaded of ${calendarTotalCount} total leave events for this view. Refine filters or date range to load remaining events.`
            : `Showing ${calendarData.length} of ${calendarTotalCount} leave events for this view. Refine filters or date range to load remaining events.`}
        </Typography>
      )}
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
          <MenuItem
            selected={!selectedMediumStageId}
            onClick={() => {
              setSelectedMediumStageId('');
              popover.onClose();
            }}
          >
            All Medium Stages
          </MenuItem>
          {mediumStageId?.educationMediumStages?.map((org: any) => (
            <MenuItem
              key={org.id}
              selected={selectedMediumStageId === String(org.id)}
              value={org.id}
              onClick={() => {
                setSelectedMediumStageId(String(org.id));
                popover.onClose();
              }}
            >
              {org.name}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </Box>
  );
};

export default LeaveCalender;

type LeaveDetailHook = (arg: any, options?: any) => any;

type LeaveRequestFormProps = {
  editData: any;
  mode?: 'hr' | 'self';
  hrDetailHook?: LeaveDetailHook;
  selfDetailHook?: LeaveDetailHook;
};

export const LeaveRequestForm = ({
  editData,
  mode = 'hr',
  hrDetailHook = useGetLeaveRequestByIdQuery,
  selfDetailHook = useGetMyLeaveRequestByIdQuery,
}: LeaveRequestFormProps) => {
  const isSelfMode = mode === 'self';
  const { currentMedium, currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: leaveDetailForHr, isLoading: isHrLeaveDetailLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: hrDetailHook,
    params: { id: editData?.id },
    options: { skip: !editData?.id || isSelfMode },
  });
  const { data: leaveDetailForSelf, isLoading: isSelfLeaveDetailLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: selfDetailHook,
    params: { id: editData?.id },
    options: { skip: !editData?.id || !isSelfMode },
  });
  const leaveDetail = isSelfMode ? leaveDetailForSelf : leaveDetailForHr;
  const isLeavePolicyLoading = isSelfMode ? isSelfLeaveDetailLoading : isHrLeaveDetailLoading;

  const detail = leaveDetail || editData;
  const submittedByLabel = detail?.submittedByEmployeeCode
    ? `${detail?.submittedByName || '-'} (${detail.submittedByEmployeeCode})`
    : (detail?.submittedByName ?? '-');
  const organizationFromStore = currentMedium?.educationMediumStages?.find(
    (org: any) =>
      String(org?.id ?? '') === String(detail?.mediumStageId ?? editData?.mediumStageId ?? '')
  )?.name;
  const academicYearLabel =
    detail?.academicYearName ||
    detail?.academicYear?.name ||
    detail?.academicYear ||
    editData?.academicYearName ||
    editData?.academicYear?.name ||
    detail?.mediumStageName ||
    detail?.organizationName ||
    organizationFromStore ||
    editData?.organization ||
    editData?.employee?.educationMediumStage?.name ||
    currentYear?.name ||
    '-';

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
            {detail?.employeeName ||
              `${editData?.employee?.firstName || ''} ${editData?.employee?.lastName || ''}`}
          </Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Employee Code
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">{detail?.employeeCode || '-'}</Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Submitted By
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">{submittedByLabel}</Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Academic Year
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">{academicYearLabel}</Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Leave Type
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">
            {detail?.leaveType || editData?.leavePolicy?.leaveType || '-'}
          </Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Start Date
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2">
            {dayjs(detail?.startDate || editData?.viewStartDate).format('DD-MM-YYYY')}
          </Typography>
        </Grid>

        {!detail?.halfDay && (
          <>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" fontWeight={600}>
                End Date
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2">
                {dayjs(detail?.endDate || editData?.viewEndDate).format('DD-MM-YYYY')}
              </Typography>
            </Grid>
          </>
        )}

        {detail?.totalDays != null && (
          <>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" fontWeight={600}>
                Total Days
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2">{detail.totalDays}</Typography>
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
            {detail?.description ||
              editData?.reason ||
              (editData?.description && (
                // eslint-disable-next-line react/no-danger
                <span dangerouslySetInnerHTML={{ __html: editData.description }} />
              ))}
          </Typography>
        </Grid>

        {detail?.remarks && (
          <>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" fontWeight={600}>
                Remarks
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography variant="body2">{detail.remarks}</Typography>
            </Grid>
          </>
        )}

        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" fontWeight={600}>
            Status
          </Typography>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Label color={getLeaveStatusColor(detail?.status ?? editData?.status)}>
            {getLeaveStatusLabel(detail?.status ?? editData?.status)}
          </Label>
        </Grid>

        {detail?.attachmentUrl && (
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
                onClick={() => window.open(detail.attachmentUrl, '_blank')}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};
