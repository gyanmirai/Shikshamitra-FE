import type { Key } from 'react';
import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';

import type { ITimeSlot } from '../slotTimesTable';
import type { SlotFormik } from './hooks/useSlotConfigurationErrors';

export interface ISlotConfig {
  id: Key | null | undefined;
  expanded?: boolean;
  totalSlots: string | number;
  weekRange: number[];
  timeSlots: ITimeSlot[];
}

export interface SlotConfigurationAccordionProps {
  config: ISlotConfig;
  configIndex: number;
  formik: SlotFormik;
  disabled?: boolean;
  isEdit?: boolean;
  hasData?: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onTotalSlotsChange: (value: number) => void;
  classes: Standards[];
  className: string;
  canConfigureSlots: boolean;
  classShiftMessage: string;
  shiftStartTime: Dayjs | null;
  shiftEndTime: Dayjs | null;
  classNameError?: string;
  onClassChange: (value: string) => void;
  isFirstGroup: boolean;
}
