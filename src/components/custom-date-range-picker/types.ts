import type { Dayjs } from 'dayjs';
import type { BoxProps } from '@mui/material/Box';
import type { PaperProps } from '@mui/material/Paper';
import type { DialogProps } from '@mui/material/Dialog';
import type { PopperProps } from '@mui/material/Popper';
import type { TextFieldProps } from '@mui/material/TextField';
import type { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';

// ----------------------------------------------------------------------

export type DateRange = [Dayjs | null, Dayjs | null];

export type DateRangePickerMode = 'desktop' | 'mobile' | 'static';

export type DateRangePickerVariant = 'calendar' | 'input';

export interface Shortcut {
  label: string;
  getValue: () => DateRange;
}

export interface DateRangeValidationProps {
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disablePast?: boolean;
  disableFuture?: boolean;
  disableWeekends?: boolean;
  shouldDisableDate?: (date: Dayjs) => boolean;
}

export interface DateRangePickerSlots {
  field?: React.ElementType;
  calendar?: React.ElementType;
  shortcuts?: React.ElementType;
  popper?: React.ElementType;
  dialog?: React.ElementType;
  day?: React.ElementType;
}

export interface DateRangePickerSlotProps {
  field?: TextFieldProps;
  calendar?: DateCalendarProps;
  shortcuts?: BoxProps;
  popper?: PopperProps;
  dialog?: DialogProps;
  paper?: PaperProps;
}

export interface DateRangePickerProps extends DateRangeValidationProps {
  // Value
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (date: DateRange) => void;
  onAccept?: (date: DateRange) => void;
  onClose?: () => void;
  onOpen?: () => void;

  // State
  open?: boolean;
  defaultOpen?: boolean;

  // Display
  mode?: DateRangePickerMode;
  calendars?: 1 | 2 | 3;
  closeOnSelect?: boolean;

  // Inputs
  singleInput?: boolean;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  dateFormat?: string;
  /** Enable typing a complete range in the single input. */
  allowManualInput?: boolean;
  /** Initial calendar date when no range is selected. */
  referenceDate?: Dayjs;

  // Visuals
  title?: string;
  variant?: DateRangePickerVariant;
  error?: boolean;
  helperText?: React.ReactNode;

  // Features
  shortcuts?: Shortcut[];
  showShortcuts?: boolean;

  // Customization
  slots?: DateRangePickerSlots;
  slotProps?: DateRangePickerSlotProps;
}

export type UseDateRangePickerReturn = {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onChangeStartDate: (newValue: Dayjs | null) => void;
  onChangeEndDate: (newValue: Dayjs | null) => void;
  open: boolean;
  onOpen?: () => void;
  onClose: () => void;
  onReset?: () => void;
  selected?: boolean;
  error?: boolean;
  label?: string;
  shortLabel?: string;
  title?: string;
  variant?: 'calendar' | 'input';
  setStartDate?: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  setEndDate?: React.Dispatch<React.SetStateAction<Dayjs | null>>;
};
