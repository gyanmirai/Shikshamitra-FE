import type { Dayjs } from 'dayjs';

import { useState, useEffect, useCallback } from 'react';

import type { DateRange, DateRangePickerProps } from '../types';

// ----------------------------------------------------------------------

type UseDateRangeReturn = {
  // State
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  inputs: DateRange; // For input fields
  hoverDate: Dayjs | null;

  // Actions
  onChangeStartDate: (date: Dayjs | null) => void;
  onChangeEndDate: (date: Dayjs | null) => void;
  onCalendarSelect: (date: Dayjs) => void;
  onHoverDate: (date: Dayjs | null) => void;

  // Control
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onReset: () => void;
  onAccept: () => void;

  // Helpers
  isSelectingEnd: boolean;
};

export function useDateRange(props: DateRangePickerProps): UseDateRangeReturn {
  const {
    value,
    defaultValue,
    onChange,
    onAccept: onAcceptProp,
    onClose: onCloseProp,
    onOpen: onOpenProp,
    open: openProp,
    defaultOpen = false,
    closeOnSelect = false,
  } = props;

  // 1. Open/Close State
  const [openState, setOpenState] = useState(defaultOpen);

  const open = openProp !== undefined ? openProp : openState;

  const onOpen = useCallback(() => {
    if (onOpenProp) {
      onOpenProp();
    }
    setOpenState(true);
  }, [onOpenProp]);

  // 2. Value State
  // We use internal state for the picker interaction, and sync with props
  const [committedRange, setCommittedRange] = useState<DateRange>(
    defaultValue || value || [null, null]
  );

  const [internalRange, setInternalRange] = useState<DateRange>(committedRange);

  // Sync with controlled value if provided
  useEffect(() => {
    if (value) {
      setCommittedRange(value);
      setInternalRange(value);
    }
  }, [value]);

  const [startDate, endDate] = internalRange;

  // 3. Selection Logic
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);

  // If we have a start date but no end date, we are selecting the end date
  const isSelectingEnd = !!startDate && !endDate && open;

  const onChangeStartDate = useCallback(
    (date: Dayjs | null) => {
      setInternalRange([date, endDate]);
    },
    [endDate]
  );

  const onChangeEndDate = useCallback(
    (date: Dayjs | null) => {
      setInternalRange([startDate, date]);
    },
    [startDate]
  );

  const onAccept = useCallback(() => {
    setCommittedRange(internalRange);

    if (onChange) {
      onChange(internalRange);
    }

    if (onAcceptProp) {
      onAcceptProp(internalRange);
    }
    onCloseProp?.();
    setOpenState(false);
  }, [onAcceptProp, onChange, internalRange, onCloseProp]);

  // Update onClose to revert interactions
  const onClose = useCallback(() => {
    setInternalRange(committedRange); // Revert to last committed

    if (onCloseProp) {
      onCloseProp();
    }
    setOpenState(false);
  }, [onCloseProp, committedRange]);

  const onCalendarSelect = useCallback(
    (date: Dayjs) => {
      if (!startDate || (startDate && endDate)) {
        // selecting start date (new range)
        setInternalRange([date, null]);
      } else if (startDate && !endDate) {
        // selecting end date
        let newStart = startDate;
        let newEnd = date;

        if (date.isBefore(startDate)) {
          newStart = date;
          newEnd = startDate;
        }

        const newRange: DateRange = [newStart, newEnd];
        setInternalRange(newRange);

        if (closeOnSelect) {
          // If closeOnSelect, we treat it as an Accept
          setCommittedRange(newRange);
          if (onChange) onChange(newRange);
          if (onAcceptProp) onAcceptProp(newRange);
          onClose(); // logic inside onClose will revert if we don't update committedRange first.
          // But we just updated it.
        }
      }
    },
    [startDate, endDate, onChange, closeOnSelect, onClose, onAcceptProp]
  );

  const onReset = useCallback(() => {
    setInternalRange(committedRange);
  }, [committedRange]);

  // Return confirmed range as "inputs" (for the field)
  // Return internal range as startDate/endDate (for the calendar)
  return {
    startDate,
    endDate,
    inputs: committedRange, // Use committed range for inputs!
    hoverDate,
    onChangeStartDate,
    onChangeEndDate,
    onCalendarSelect,
    onHoverDate: setHoverDate,
    open,
    onOpen,
    onClose,
    onReset,
    onAccept,
    isSelectingEnd,
  };
}
