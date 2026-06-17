'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { toDateOnly } from 'src/utils/date-only';
import CommonCalender from 'src/components/calender';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetCalendarViewQuery } from 'src/redux/calendar/calendarApi';
import { Box, Chip, Stack, Paper, Button, Typography } from '@mui/material';
import { useGetEventTypeOptionsQuery } from 'src/redux/calendar/events/eventTypeApi';
import { useGetHolidayTypeQuery } from 'src/redux/communication/holiday/holidayDataApi';

import CalendarViewDialog from './Components/ViewDialog';
import FilterControls, { statusOptions } from './Components/FilterControls';

import type { Filters } from './Components/FilterControls';
import type { CalendarDialogItem } from './Components/ViewDialog';

interface CalendarViewItem {
  id: string;
  title: string;
  calendarItemType: number | string;
  color?: string;
  typeName?: string;
  description?: string;
  mode?: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
  audienceCount?: number;
  status?: number;
  startDate: string;
  endDate: string;
}

const CalendarView = () => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: eventTypeData } = useGetEventTypeOptionsQuery({});
  const { data: holidayTypeData } = useGetHolidayTypeQuery({});
  const eventTypeOptions = useMemo(
    () => ['ALL', ...((eventTypeData?.items || []).map((item: any) => item.id) as string[])],
    [eventTypeData?.items]
  );
  const holidayTypeOptions = useMemo(
    () => ['ALL', ...((holidayTypeData?.items || []).map((item: any) => item.id) as string[])],
    [holidayTypeData?.items]
  );
  const typeLabelById = useMemo(() => {
    const labels: Record<string, string> = { ALL: 'ALL' };
    (eventTypeData?.items || []).forEach((item: any) => {
      labels[item.id] = item.name;
    });
    (holidayTypeData?.items || []).forEach((item: any) => {
      labels[item.id] = item.name;
    });
    return labels;
  }, [eventTypeData?.items, holidayTypeData?.items]);
  const [filters, setFilters] = useState<Filters>({
    eventType: ['ALL'],
    holidayType: ['ALL'],
    status: statusOptions,
  });
  const [currentDateClick, setCurrentDateClick] = useState<CalendarDialogItem | null>(null);
  const selectedStatuses = filters.status.filter((item) => item !== 'ALL');
  const selectedEventTypeIds = filters.eventType.filter((item) => item !== 'ALL');
  const selectedHolidayTypeIds = filters.holidayType.filter((item) => item !== 'ALL');
  const statusMap: Record<string, number> = { Upcoming: 0, Active: 1, Completed: 2 };
  const selectedStatusValues = selectedStatuses
    .map((status) => statusMap[status])
    .filter((status): status is number => status !== undefined);
  const {
    data: calendarViewData,
    isLoading,
    isFetching,
  } = useGetCalendarViewQuery(
    {
      academicYearId: currentYear?.id,
      eventTypeIds: selectedEventTypeIds.length ? selectedEventTypeIds : undefined,
      holidayTypeIds: selectedHolidayTypeIds.length ? selectedHolidayTypeIds : undefined,
      status: selectedStatusValues.length === 1 ? selectedStatusValues[0] : undefined,
      statuses: selectedStatusValues.length > 1 ? selectedStatusValues : undefined,
      maxResultCount: 500,
    },
    { skip: !currentYear?.id }
  );

  const calendarData = useMemo(
    () =>
      (calendarViewData?.items || []).map((i: CalendarViewItem) => {
        const holiday = isHolidayItem(i);
        const fallbackColor = holiday ? theme.palette.error.main : theme.vars.palette.success.main;

        return {
          ...i,
          start: holiday ? toDateOnly(i.startDate) : buildCalendarDate(i.startDate, i.startTime),
          color: i.color || fallbackColor,
          end: holiday ? toDateOnly(i.endDate) : buildCalendarDate(i.endDate, i.endTime),
          allDay: holiday,
          textColor: fallbackColor,
          title: i.title,
        };
      }) || [],
    [calendarViewData?.items, theme.palette.error.main, theme.vars.palette.success.main]
  );

  const handleEventClick = (info: any) => {
    const clickedEvent = calendarData.find((event: any) => event.id.toString() === info.event.id);
    setCurrentDateClick(clickedEvent || null);
  };

  const handleApply = (currentFilters: Filters) => {
    setFilters(currentFilters);
  };

  const isAllSelected = (arr: string[]) => arr.includes('ALL');

  const handleRemoveFilter = (type: keyof Filters, value: string) => {
    setFilters((prevFilters) => {
      const current = prevFilters[type];
      if (isAllSelected(current)) return prevFilters;
      const next = current.filter((item) => item !== value);
      return { ...prevFilters, [type]: next.length ? next : ['ALL'] };
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (filterArray) => filterArray.length > 0 && !isAllSelected(filterArray)
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: 2 }}>
      <CustomBreadcrumbs
        heading="Calendar View"
        links={[{ name: 'Calendar' }, { name: 'Calendar View' }]}
      />

      <Paper
        sx={{
          mb: 3,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: theme.customShadows?.z1 || 'none',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          gap={2}
        >
          <Box sx={{ flexGrow: 1 }}>
            <FilterControls
              filters={filters}
              onChange={handleApply}
              eventTypeOptions={eventTypeOptions}
              holidayTypeOptions={holidayTypeOptions}
              getOptionLabel={(value) => typeLabelById[value] || value}
            />
          </Box>
        </Stack>

        {hasActiveFilters && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              alignItems: 'center',
              mt: 1,
              pt: 2,
              borderTop: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mr: 1 }}>
              Active Filters:
            </Typography>

            {filters.eventType.length > 0 && !isAllSelected(filters.eventType) && (
              <FilterGroupBlock
                title="Events"
                color="primary"
                items={filters.eventType}
                onDelete={(v) => handleRemoveFilter('eventType', v)}
                chipColor="primary"
                labelByValue={typeLabelById}
              />
            )}
            {filters.holidayType.length > 0 && !isAllSelected(filters.holidayType) && (
              <FilterGroupBlock
                title="Holidays"
                color="error"
                items={filters.holidayType}
                onDelete={(v) => handleRemoveFilter('holidayType', v)}
                chipColor="error"
                labelByValue={typeLabelById}
              />
            )}
            {filters.status.length > 0 && !isAllSelected(filters.status) && (
              <FilterGroupBlock
                title="Status"
                color="info"
                items={filters.status}
                onDelete={(v) => handleRemoveFilter('status', v)}
                chipColor="info"
              />
            )}

            <Button
              size="small"
              color="error"
              startIcon={
                <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: '16px', height: '16px' }} />
              }
              onClick={() =>
                setFilters({ eventType: ['ALL'], holidayType: ['ALL'], status: ['ALL'] })
              }
              sx={{ ml: 'auto' }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Paper>

      <CommonCalender
        data={calendarData}
        isLoading={isLoading || isFetching}
        showCalendarToolbar
        initialView="timeGridWeek"
        onDateClick={(e) => {
          handleEventClick(e);
        }}
        showCalendarFilter={false}
        containerProps={{
          sx: {
            flexGrow: 1,
            '--Paper-shadow': 'var(--shadows-0)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0',
          },
        }}
        canReset={hasActiveFilters}
        nowIndicator
      />

      <CalendarViewDialog
        open={Boolean(currentDateClick)}
        onClose={() => setCurrentDateClick(null)}
        data={currentDateClick}
      />
    </Box>
  );
};

export default CalendarView;

const isHolidayItem = (item: CalendarViewItem) =>
  item.calendarItemType === 1 || item.calendarItemType === 'Holiday';

const buildCalendarDate = (date?: string, time?: string) => {
  if (!date || !time) {
    return date;
  }

  const datePart = date.split('T')[0];
  if (!datePart || !/^\d{2}:\d{2}/.test(time)) {
    return date;
  }

  return `${datePart}T${time}`;
};

interface FilterGroupBlockProps {
  title: string;
  items: string[];
  onDelete: (value: string) => void;
  color: 'primary' | 'error' | 'info' | 'success' | 'warning' | 'secondary';
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  labelByValue?: Record<string, string>;
}

const FilterGroupBlock = ({
  title,
  items,
  onDelete,
  color,
  chipColor = 'primary',
  labelByValue = {},
}: FilterGroupBlockProps) => {
  const theme = useTheme();
  if (!items.length) return null;
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        px: 1,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: 'text.secondary',
          // textTransform: 'uppercase',
        }}
      >
        {title}:
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {items.map((item) => (
          <Chip
            key={`${title}-${item}`}
            label={labelByValue[item] || item}
            onDelete={() => onDelete(item)}
            color={chipColor}
            variant="soft" // 'soft' is usually good for modern look
            size="small"
            sx={{ height: 24 }} // make them compact
          />
        ))}
      </Box>
    </Box>
  );
};
