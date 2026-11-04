import type { Dayjs } from 'dayjs';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import SlotTimePicker from './SlotTimePicker';

import type { ITimeSlot } from './slot-time-utils';

export interface SlotErrors {
  [index: number]: { startTime?: string; endTime?: string; slotType?: string };
}

interface Props {
  namePrefix: string;
  slots: ITimeSlot[];
  disabled?: boolean;
  errors?: SlotErrors;
  minTime?: Dayjs | null;
  maxTime?: Dayjs | null;
  onStartChange: (index: number, value: Dayjs | null) => void;
  onEndChange: (index: number, value: Dayjs | null) => void;
  onTypeChange: (index: number, value: string) => void;
  onTouchField?: (index: number, field: 'startTime' | 'endTime' | 'slotType') => void;
}

export function slotTimeColumns({
  namePrefix,
  slots,
  disabled,
  errors,
  minTime,
  maxTime,
  onStartChange,
  onEndChange,
  onTypeChange,
  onTouchField,
}: Props): IColumn[] {
  const timeColumn = (field: 'startTime' | 'endTime', label: string): IColumn => ({
    id: field,
    label,
    minWidth: 220,
    align: 'left',
    isFilter: false,
    isSort: false,
    render: (_value, row) => {
      const index = slots.findIndex((slot) => slot.id === row.id);
      if (index < 0) return null;
      return (
        <SlotTimePicker
          label={label}
          name={`${namePrefix}[${index}].${field}`}
          value={slots[index][field]}
          disabled={disabled}
          error={errors?.[index]?.[field]}
          minTime={minTime}
          maxTime={maxTime}
          onChange={(next) => (field === 'startTime' ? onStartChange : onEndChange)(index, next)}
          onBlur={() => onTouchField?.(index, field)}
        />
      );
    },
  });
  return [
    timeColumn('startTime', 'Start time'),
    timeColumn('endTime', 'End time'),
    {
      id: 'totalTime',
      label: 'Duration',
      minWidth: 100,
      align: 'left',
      isFilter: false,
      isSort: false,
      render: (_value, row) => {
        const start = row.startTime ? dayjs(row.startTime) : null;
        let end = row.endTime ? dayjs(row.endTime) : null;
        if (!start?.isValid() || !end?.isValid()) return '-';
        if (end.isBefore(start)) end = end.add(1, 'day');
        const duration = end.diff(start, 'minute');
        if (duration <= 0) return '-';
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return (
          <Typography variant="body2">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </Typography>
        );
      },
    },
    {
      id: 'slotType',
      label: 'Slot type',
      minWidth: 160,
      align: 'left',
      isFilter: false,
      isSort: false,
      render: (_value, row) => {
        const index = slots.findIndex((slot) => slot.id === row.id);
        if (index < 0) return null;
        const error = errors?.[index]?.slotType;
        return (
          <ShakingTextField error={Boolean(error)}>
            <CustomSelect
              label="Slot type"
              name={`${namePrefix}[${index}].slotType`}
              required
              options={[
                { value: 'period', label: 'Period' },
                { value: 'break', label: 'Break' },
              ]}
              disabled={disabled}
              value={slots[index].slotType ?? 'period'}
              error={Boolean(error)}
              helperText={error}
              onChange={(value) => {
                onTypeChange(index, String(value));
                onTouchField?.(index, 'slotType');
              }}
              onBlur={() => onTouchField?.(index, 'slotType')}
              formControlProps={{ fullWidth: true, size: 'small' }}
            />
          </ShakingTextField>
        );
      },
    },
  ];
}
