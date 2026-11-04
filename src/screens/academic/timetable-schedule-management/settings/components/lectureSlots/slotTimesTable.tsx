import type { Dayjs } from 'dayjs';

import React from 'react';
import { Box } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { slotTimeColumns } from './slot-time-columns';
import { slotDurationMin, cascadeFromIndex } from './slot-time-utils';

import type { ITimeSlot } from './slot-time-utils';
import type { SlotErrors } from './slot-time-columns';

export type { ITimeSlot } from './slot-time-utils';

interface Props {
  configId: React.Key;
  slots: ITimeSlot[];
  disabled?: boolean;
  errors?: SlotErrors;
  minTime?: Dayjs | null;
  maxTime?: Dayjs | null;
  onChange: (next: ITimeSlot[]) => void;
  onTouchField?: (index: number, field: 'startTime' | 'endTime' | 'slotType') => void;
  namePrefix?: string;
}

export default function SlotTimesTable({
  configId,
  slots,
  disabled,
  errors,
  minTime,
  maxTime,
  onChange,
  onTouchField,
  namePrefix = 'timeSlots',
}: Props) {
  const columns = slotTimeColumns({
    namePrefix,
    slots,
    disabled,
    errors,
    minTime,
    maxTime,
    onTouchField,
    onStartChange: (index, startTime) => {
      const duration = slotDurationMin(slots[index]);
      const updated = slots.map((slot, offset) =>
        offset === index
          ? {
              ...slot,
              startTime,
              endTime: startTime ? startTime.add(duration, 'minute') : slot.endTime,
            }
          : { ...slot }
      );
      onChange(cascadeFromIndex(updated, index));
      onTouchField?.(index, 'startTime');
    },
    onEndChange: (index, endTime) => {
      onChange(
        cascadeFromIndex(
          slots.map((slot, offset) => (offset === index ? { ...slot, endTime } : slot)),
          index
        )
      );
      onTouchField?.(index, 'endTime');
    },
    onTypeChange: (index, slotType) =>
      onChange(
        slots.map((slot, offset) =>
          offset === index
            ? { ...slot, slotType, breakType: slotType === 'break' ? 'short' : '' }
            : { ...slot }
        )
      ),
  });
  return (
    <Box sx={{ minWidth: 0, width: 1 }}>
      <CustomizableTable
        tableId={`time-schedule-${String(configId)}`}
        tableTitle="Time slots"
        variant="embedded"
        showToolbar={false}
        isShowedDense={false}
        isSearch={false}
        isFilter={false}
        isPagination={false}
        columns={columns}
        data={slots}
        wrapperProps={{ sx: { height: 'auto', flex: 'none' } }}
        tableContainerProps={{ sx: { height: 'auto', flex: 'none' } }}
      />
    </Box>
  );
}
