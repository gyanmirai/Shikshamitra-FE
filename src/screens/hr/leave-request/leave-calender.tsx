import type { RootState } from 'src/redux/store';
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core';

import { useSelector } from 'react-redux';
import CommonCalender from 'src/components/calender';
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import { useLazyGetLeaveCalendarQuery } from 'src/redux/hr/leaveApi';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  CALENDAR_MAX_PAGES,
  CALENDAR_PAGE_SIZE,
  dedupeCalendarItemsById,
  shouldMarkCalendarCapReached,
  buildCalendarVisibleRangePayload,
} from 'src/screens/hr/leave-request/leave-calendar.utils';

import LeaveRequestDetailsViewModal from './leave-request-details-modal';

type LeaveCalenderProps = {
  mode?: 'hr' | 'self';
  canReviewLeaves?: boolean;
  onActionSuccess?: () => void;
};

const LeaveCalender = ({
  mode = 'hr',
  canReviewLeaves = false,
  onActionSuccess,
}: LeaveCalenderProps) => {
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
    setCalendarVisibleRange(buildCalendarVisibleRangePayload(arg.start, arg.end));
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
        .filter((item: any) =>
          selectedMediumStageId ? String(item?.mediumStageId ?? '') === selectedMediumStageId : true
        )
        .map((item: any) => {
          const color = item.leaveTypeColor || '#2065D1';
          const plainDesc = String(item.description ?? '').replace(/<[^>]+>/g, '');

          return {
            ...item,
            start: item.startDate,
            end: item.endDate,
            color,
            allDay: false,
            employeeCode: item.employeeCode,
            textColor: color,
            title: `${item.leaveTypeName ?? item.leaveType ?? ''} [${item.employeeName ?? item.name ?? ''}] ${item.status ?? ''}`,
            reason: item.reason ?? plainDesc,
            description: plainDesc,
            leaveType: item.leaveTypeName ?? item.leaveType,
            name: item.employeeName ?? item.name,
            viewStartDate: item.startDate,
            viewEndDate: item.endDate,
            ...(item.employeeId === employee?.id ? { className: 'ownEvent' } : {}),
          };
        }) || [],
    [calendarItems, employee?.id, selectedMediumStageId]
  );

  const editData = useMemo(() => {
    if (!currentDateClick) {
      return null;
    }

    return calendarData.find((item: any) => item.id === currentDateClick.event.id);
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
            dayHeaderFormat: { weekday: 'short', day: '2-digit' },
          },
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' },
          },
          dayGridDay: {
            titleFormat: { day: '2-digit', month: 'long', year: 'numeric' },
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

      <LeaveRequestDetailsViewModal
        open={!!currentDateClick}
        onClose={() => setCurrentDateClick(null)}
        editData={editData}
        mode={mode}
        canReviewLeaves={canReviewLeaves}
        onActionSuccess={onActionSuccess}
      />

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
