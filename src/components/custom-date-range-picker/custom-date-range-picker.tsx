import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import { useState, useCallback } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useResponsive } from 'src/hooks/use-responsive';

import { RangeField } from './RangeField';
import { CalendarPanel } from './CalendarPanel';
import { ShortcutPanel } from './ShortcutPanel';
import { useDateRange } from './hooks/useDateRange';
import { useRangeValidation } from './hooks/useRangeValidation';

import type { DateRangePickerProps } from './types';

// ----------------------------------------------------------------------

export function CustomDateRangePicker(props: DateRangePickerProps) {
  const {
    open: openProp,
    onClose,
    title = 'Select Date Range',
    variant = 'input',
    mode: modeProp,
    calendars: calendarsProp,
    singleInput = true, // Default to single input as requested
    shortcuts,
    showShortcuts,
    // Validation
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    disableWeekends,
    shouldDisableDate,
    // Input props
    label,
    startLabel,
    endLabel,
    placeholder,
    readOnly,
    disabled,
    error: errorProp,
    helperText,
    dateFormat,
    allowManualInput,
    referenceDate,
    name,
    required,
    //
    slots,
    slotProps,
  } = props;

  const mdUp = useResponsive('up', 'md');

  const mode = modeProp || (mdUp ? 'desktop' : 'mobile');
  const calendars = calendarsProp || (mdUp && mode === 'desktop' ? 2 : 1);

  const {
    startDate,
    endDate,
    inputs,
    onChangeStartDate,
    onChangeEndDate,
    onInputChange,
    onCalendarSelect,
    onHoverDate,
    hoverDate,
    open,
    onOpen,
    onClose: handleClose,
    onReset,
    onAccept,
    isSelectingEnd,
  } = useDateRange(props);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      onOpen();
    },
    [onOpen]
  );

  const handleCloseWrapped = useCallback(() => {
    // setAnchorEl(null); // Keep anchor for exit animation if needed, but usually fine to clear?
    handleClose();
  }, [handleClose]);

  const validation = useRangeValidation({
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    disableWeekends,
    shouldDisableDate,
  });

  const isCalendarView = variant === 'calendar';

  // ----------------------------------------------------------------------

  const renderContent = (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        height: '100%',
      }}
    >
      {showShortcuts && (
        <ShortcutPanel
          shortcuts={shortcuts}
          selectedRange={[startDate, endDate]}
          onSelectRange={(range) => {
            onChangeStartDate(range[0]);
            onChangeEndDate(range[1]);
          }}
        />
      )}

      <Stack spacing={2} sx={{ p: 2 }}>
        <CalendarPanel
          calendars={calendars}
          startDate={startDate}
          referenceDate={referenceDate}
          endDate={endDate}
          hoverDate={hoverDate}
          onCalendarSelect={onCalendarSelect}
          onHoverDate={onHoverDate}
          // Validation
          minDate={minDate}
          maxDate={maxDate}
          disablePast={disablePast}
          disableFuture={disableFuture}
          disableWeekends={disableWeekends}
          shouldDisableDate={shouldDisableDate}
        />

        {/* Footer / Actions */}
        {!isCalendarView && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Button variant="outlined" color="inherit" onClick={onReset}>
              Reset
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Button variant="outlined" color="inherit" onClick={handleCloseWrapped}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onAccept}
              disabled={
                !startDate ||
                !endDate ||
                !startDate.isValid() ||
                !endDate.isValid() ||
                endDate.isBefore(startDate, 'day') ||
                Boolean(validation.validateDate(startDate) || validation.validateDate(endDate))
              }
            >
              Apply
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );

  // ----------------------------------------------------------------------

  if (isCalendarView) {
    return <Box sx={{ display: 'inline-block' }}>{renderContent}</Box>;
  }

  return (
    <>
      {/* Trigger Field */}
      <RangeField
        required={required}
        startDate={inputs[0]}
        endDate={inputs[1]}
        onOpen={handleOpen}
        singleInput={singleInput}
        label={label}
        name={name}
        startLabel={startLabel}
        endLabel={endLabel}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        error={errorProp}
        helperText={helperText}
        dateFormat={dateFormat}
        allowManualInput={allowManualInput}
        onChange={onInputChange}
        validateDate={validation.validateDate}
      />

      {/* Picker Modal/Popover */}
      {mode === 'mobile' ? (
        <Dialog
          fullWidth
          maxWidth="xs"
          open={open}
          onClose={handleCloseWrapped}
          PaperProps={{
            sx: {
              maxWidth: 'unset', // Allow it to adapt
            },
          }}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent sx={{ p: 0 }}>{renderContent}</DialogContent>
        </Dialog>
      ) : (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseWrapped}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              mt: 1, // Margin top for spacing
              boxShadow: (theme) => theme.customShadows.dropdown,
              borderRadius: 2,
            },
          }}
        >
          {/* Popover content usually doesn't need a heavy title like Dialog, 
              but we can keep it valid or minimal. 
              The user image shows just the calendar content directly under the input.
              Let's omit DialogTitle for Popover to match typical DatePicker look, 
              or keep it if title is important. 
              The reference image has "January 2026" inside standard headers.
              I will start with just renderContent inside the Popover.
           */}
          {renderContent}
        </Popover>
      )}
    </>
  );
}
