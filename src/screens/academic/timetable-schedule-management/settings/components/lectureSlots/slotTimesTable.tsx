import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useMemo, useCallback } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

export interface ITimeSlot {
  id: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  slotType: string;
  breakType: string;
}

interface ISlotErrors {
  [index: number]: { startTime?: string; endTime?: string; slotType?: string };
}

interface ISlotTimesTableProps {
  configId: React.Key;
  slots: ITimeSlot[];
  disabled?: boolean;
  errors?: ISlotErrors;
  minTime?: Dayjs | null;
  maxTime?: Dayjs | null;
  onChange: (next: ITimeSlot[]) => void;
  onTouchField?: (slotIndex: number, field: 'startTime' | 'endTime') => void;
}

const toDayjs = (v: unknown): Dayjs | null => {
  if (!v || v === '-') return null;
  const d = dayjs(v as Dayjs);
  return d.isValid() ? d : null;
};

const slotDurationMin = (s: ITimeSlot, fallback = 30): number => {
  if (!s.startTime || !s.endTime) return fallback;
  const diff = dayjs(s.endTime).diff(dayjs(s.startTime), 'minute');
  return diff > 0 ? diff : fallback;
};

const cascadeFromIndex = (slots: ITimeSlot[], fromIndex: number): ITimeSlot[] => {
  const next = slots.map((s) => ({ ...s }));
  for (let i = fromIndex + 1; i < next.length; i += 1) {
    const prev = next[i - 1];
    if (!prev.endTime) break;
    const dur = slotDurationMin(next[i]);
    next[i].startTime = dayjs(prev.endTime);
    next[i].endTime = next[i].startTime!.add(dur, 'minute');
  }
  return next;
};

const SlotTimesTable: React.FC<ISlotTimesTableProps> = ({
  configId,
  slots,
  disabled,
  errors,
  minTime,
  maxTime,
  onChange,
  onTouchField,
}) => {
  const pickerDisabled = !!disabled;

  // O(1) slot index lookup — avoids O(n) findIndex in every cell render
  const slotIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    slots.forEach((s, i) => map.set(s.id, i));
    return map;
  }, [slots]);

  const updateSlot = useCallback(
    (index: number, patch: Partial<ITimeSlot>, cascade = false) => {
      if (index < 0 || index >= slots.length) return;
      const updated = slots.map((s, i) => (i === index ? { ...s, ...patch } : { ...s }));
      onChange(cascade ? cascadeFromIndex(updated, index) : updated);
    },
    [slots, onChange]
  );

  const handleStartChange = useCallback(
    (index: number, newStart: Dayjs | null) => {
      if (index < 0 || index >= slots.length) return;
      const cur = slots[index];
      const dur = slotDurationMin(cur);
      const newEnd = newStart ? newStart.add(dur, 'minute') : cur.endTime;
      const updated = slots.map((s, i) =>
        i === index ? { ...s, startTime: newStart, endTime: newEnd } : { ...s }
      );
      onChange(cascadeFromIndex(updated, index));
      onTouchField?.(index, 'startTime');
    },
    [slots, onChange, onTouchField]
  );

  const handleEndChange = useCallback(
    (index: number, newEnd: Dayjs | null) => {
      if (index < 0 || index >= slots.length) return;
      const updated = slots.map((s, i) => (i === index ? { ...s, endTime: newEnd } : s));
      onChange(cascadeFromIndex(updated, index));
      onTouchField?.(index, 'endTime');
    },
    [slots, onChange, onTouchField]
  );

  const columns = useMemo(
    () => [
      {
        id: 'startTime',
        label: 'Start Time',
        filterType: 'string' as const,
        minWidth: 150,
        isFilter: true,
        isSort: false,
        align: 'center' as const,
        render(value: unknown, row: ITimeSlot) {
          const index = slotIndexMap.get(row.id) ?? -1;
          if (index < 0) return null;
          const err = errors?.[index]?.startTime;
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TimePicker
                value={toDayjs(value) ?? toDayjs(row.startTime)}
                format="hh:mm a"
                views={['hours', 'minutes']}
                disabled={pickerDisabled}
                minTime={minTime ?? undefined}
                maxTime={maxTime ?? undefined}
                ampm
                onChange={(t) => handleStartChange(index, t?.isValid?.() ? dayjs(t) : null)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: '200px' },
                    error: !!err,
                    helperText: err,
                  },
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
              />
            </Box>
          );
        },
      },
      {
        id: 'endTime',
        label: 'End Time',
        filterType: 'string' as const,
        minWidth: 150,
        isFilter: true,
        isSort: false,
        align: 'center' as const,
        render(value: any, row: ITimeSlot) {
          const index = slotIndexMap.get(row.id) ?? -1;
          if (index < 0) return null;
          const err = errors?.[index]?.endTime;
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TimePicker
                value={value}
                format="hh:mm a"
                views={['hours', 'minutes']}
                disabled={pickerDisabled}
                minTime={minTime ?? undefined}
                maxTime={maxTime ?? undefined}
                ampm
                onChange={(t) => handleEndChange(index, t?.isValid?.() ? dayjs(t) : null)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: '200px' },
                    error: !!err,
                    helperText: err,
                  },
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
              />
            </Box>
          );
        },
      },
      {
        id: 'totalTime',
        label: 'Duration',
        filterType: 'string' as const,
        minWidth: 100,
        isFilter: true,
        isSort: false,
        align: 'center' as const,
        render(_v: unknown, row: ITimeSlot) {
          const start = row.startTime ? dayjs(row.startTime) : null;
          let end = row.endTime ? dayjs(row.endTime) : null;

          if (!start || !end || !start.isValid() || !end.isValid()) {
            return (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                —
              </Typography>
            );
          }

          // handle crossing midnight
          if (end.isBefore(start)) {
            end = end.add(1, 'day');
          }

          const totalMinutes = end.diff(start, 'minute');
          if (totalMinutes <= 0) {
            return (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                —
              </Typography>
            );
          }

          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

          // Color coding: short (<20m) = warning, normal (20-60m) = success, long (>60m) = info
          const chipColor = totalMinutes < 20 ? 'warning' : totalMinutes > 60 ? 'info' : 'success';

          return (
            <Chip
              label={formatted}
              size="small"
              color={chipColor}
              variant="soft"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: 0.3,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          );
        },
      },
      {
        id: 'slotType',
        label: 'Slot Type',
        filterType: 'string' as const,
        minWidth: 300,
        align: 'left' as const,
        isFilter: true,
        isSort: false,
        render(_v: unknown, row: ITimeSlot) {
          const index = slotIndexMap.get(row.id) ?? -1;
          if (index < 0) return null;
          const slotType: string = row.slotType ?? 'period';
          const breakType: string = row.breakType ?? '';
          const slotTypeErr = errors?.[index]?.slotType;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CustomSelect
                  label="Slot *"
                  options={[
                    { value: 'period', label: 'Period' },
                    { value: 'break', label: 'Break' },
                  ]}
                  disabled={pickerDisabled}
                  value={slotType}
                  error={!!slotTypeErr}
                  onChange={(val: any) =>
                    updateSlot(index, {
                      slotType: val,
                      breakType: val === 'break' ? 'short' : '',
                    })
                  }
                  formControlProps={{
                    sx: {
                      minWidth: '150px',
                      '& .MuiFormLabel-root': {
                        zIndex: -1,
                      },
                    },
                    size: 'small',
                  }}
                />
              </Box>
              {slotTypeErr && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.75rem',
                    lineHeight: 1.66,
                    color: 'error.main',
                    ml: '14px',
                  }}
                >
                  {slotTypeErr}
                </Box>
              )}
            </Box>
          );
        },
      },
    ],
    [
      slotIndexMap,
      errors,
      pickerDisabled,
      minTime,
      maxTime,
      handleStartChange,
      handleEndChange,
      updateSlot,
    ]
  );

  return (
    <Box sx={{ overflowX: 'auto', width: '100%' }}>
      <CustomizableTable
        tableContainerProps={{ sx: { maxHeight: '300px', minWidth: '800px' } }}
        tableId={`time-schedule-${String(configId)}`}
        isSearch={false}
        isFilter={false}
        isPagination={false}
        columns={columns as any}
        data={slots as any}
      />
    </Box>
  );
};

export default SlotTimesTable;
