// @ts-nocheck

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  css,
  Chip,
  Grid,
  Paper,
  Table,
  Popover,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
} from '@mui/material'; // ES 2015
import { styled } from '@mui/material/styles';

dayjs.extend(isBetween);

export const ArrowStyle = styled(Paper)`
  height: 35px;
  width: 35px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* position: absolute; */
  right: ${(props) => props.$isRight && '5px'};
  cursor: pointer;
  &:hover {
    background-color: #f4f4f4de;
  }
  & > button {
    border: none;
    background: white;
    width: 100%;
    border-radius: 50%;
  }
`;

export const StyledButton = styled('button')`
  box-shadow:
    0px 3px 3px -2px rgba(0, 0, 0, 0.2),
    0px 3px 4px 0px rgba(0, 0, 0, 0.14),
    0px 1px 8px 0px rgba(0, 0, 0, 0.12);
  height: 35px;
  width: 35px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background-color: white;
  cursor: ${(props) => (props.disabled ? 'no-drop' : 'pointer')};
  &:hover {
    background-color: #f4f4f4de;
  }
`;

export const DateNumber = styled(Paper)`
  height: 30px;
  width: 30px;
  display: flex;
  justify-content: center;
  margin: auto;
  font-size: 14px;
  align-items: center;
  pointer-events: ${({ $isDisable }) => ($isDisable ? 'none' : '')};
  border: ${(props) => (props.$isToday ? `2px solid ${props?.activeColor}` : 'none')};
  box-shadow: ${(props) => (!props.$date || props.$isDisable ? 'none' : '')};
  border-radius: ${(props) => (!props.$date ? 'unset' : ' 50%')};
  pointer-events: ${(props) => (!props.$date ? 'none' : '')};
  background-color: ${(props) =>
    props.$isActive
      ? props?.activeColor
      : props.$isBetween && props.$date
        ? props.betweenColor
        : props.$isDisable && props.$date
          ? props.disabledColor
          : props.$date
            ? 'white'
            : 'transparent'};

  color: ${(props) =>
    props.$isActive
      ? 'white'
      : props.$isBetween
        ? 'black'
        : props.$date && props.$isDisable
          ? '#837f7f'
          : 'black'};

  ${(props) => {
    if (!props.$isActive && props.$date) {
      return css`
        &:hover {
          background-color: #f4f4f4de;
        }
      `;
    }
    return '';
  }}
`;
export const HeaderBox = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
export const MonthBox = styled(Box)`
  font-weight: 600;
  flex-grow: 1;
  text-align: center;
`;

const DatePickerButton = styled('button')`
  width: 100%;
  max-width: 330px;
  height: 40px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: 1px solid #8c8989;
  cursor: pointer;
  & small {
    font-size: inherit;
  }
  & svg {
    position: absolute;
    left: 6px;
    font-size: 20px;
  }
`;

export const FilterLabelWrapper = styled(Grid)`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  gap: 10px 10px;
`;
export const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const filterLabels1 = [
  {
    type: 'month',
    value: 1,
    next: true,
    label: <> next 1 months</>,
  },
  {
    type: 'week',
    value: 5,
    past: true,
    label: 'past 1 weeks',
  },
  {
    type: 'day',
    value: 3,
    next: true,
    label: 'next 3 days',
  },
  {
    type: 'month',
    value: 1,
    next: true,
    label: <> next 1 months</>,
  },
  {
    type: 'week',
    value: 1,
    past: true,
    label: 'past 1 weeks',
  },
  {
    type: 'day',
    value: 3,
    next: true,
    label: 'next 3 days',
  },
  {
    type: 'month',
    value: 2,
    next: true,
    label: <> next 1 months</>,
  },
  {
    type: 'week',
    value: 3,
    past: true,
    label: 'past 1 weeks',
  },
  {
    type: 'day',
    value: 9,
    next: true,
    label: 'next 3 days',
  },
];

const LeftDatePicker = styled(Box)`
  flex-grow: 1;
  justify-content: space-between;
`;
const RightDatePicker = styled(Box)`
  flex-grow: 1;
  justify-content: space-between;
`;

interface DatePickerProps {
  minDate?: string;
  maxDate?: string;
  showOnlyOneDay?: string;
  startDate?: string;
  endDate?: string;
  onApply?: () => void;
  onCancel?: () => void;
  onClear?: () => void;
  onNextClick?: () => void;
  onPreviousClick?: () => void;
  filterLabels?: string[];
  placeHolder?: string;
  dateFormat?: string;
  mainWrapperProps?: Record<string, any>;
  nextButtonProps?: Record<string, any>;
  previousButtonProps?: Record<string, any>;
  monthYearFormat?: string;
  daysHeaderProps?: Record<string, any>;
  dayProps?: () => Record<string, any>;
  dateProps?: () => Record<string, any>;
  clearButtonProps?: Record<string, any>;
  applyButtonProps?: Record<string, any>;
  cancelButtonProps?: Record<string, any>;
  onDateClicks?: () => void;
  onFilterClick?: () => void;
  selectedDateColor?: string;
  selectedDateRangeColor?: string;
  disabledColor?: string;
  filterLabelProps?: () => Record<string, any>;
  calenderIcon?: ReactNode;
  nextArrowIcon?: ReactNode;
  previousArrowIcon?: ReactNode;
  hamburgerProps?: Record<string, any>;
  filterWrapperProps?: Record<string, any>;
  customFilterText?: string;
  customFilterProps?: Record<string, any>;
  filterOptionCloseIconProps?: Record<string, any>;
  days?: any; // You might want to define a more specific type for days
  isSelectOneDate?: boolean;
}

const DateRangePicker: React.FC<any> = ({
  minDate = ``,
  maxDate = '',
  showOnlyOneDay = '',
  startDate,
  endDate,
  onApply = () => {},
  onCancel = () => {},
  onClear = () => {},
  onNextClick = () => {},
  onPreviousClick = () => {},
  filterLabels = [],
  placeHolder = 'Select Start Date And End Date',
  dateFormat = 'MMMM D, YYYY',
  mainWrapperProps = {},
  nextButtonProps = {},
  previousButtonProps = {},
  monthYearFormat = 'MMMM-YYYY',
  daysHeaderProps = {},
  dayProps = () => ({}),
  dateProps = () => ({}),
  clearButtonProps = {},
  applyButtonProps = {},
  cancelButtonProps = {},
  onDateClicks = () => {},
  onFilterClick = () => {},
  selectedDateColor = '#0059B2',
  selectedDateRangeColor = '#cfe4f9',
  disabledColor = '#dcdcdc',
  filterLabelProps = () => ({}),
  calenderIcon = <CalendarTodayIcon />,
  nextArrowIcon = <NavigateNextIcon />,
  previousArrowIcon = <NavigateBeforeIcon />,
  hamburgerProps = {},
  filterWrapperProps = {},
  customFilterText = 'CUSTOM FILTERS',
  customFilterProps = {},
  filterOptionCloseIconProps = {},
  days = allDays,
  isSelectOneDate = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState();
  const [nextMonth, setNextMonth] = useState();
  const [currentDates, setCurrentDates] = useState([]);
  const [nextDates, setNextDates] = useState([]);
  const [startDateEndDate, setStartDateEndDate] = useState([]);
  const [activeFilter, setActiveFilter] = useState();
  const [hoverDates, setHoverDates] = useState([]);
  const [isNexButtonDisable, setIsNexButtonDisable] = useState(false);
  const [isPreviousButtonDisable, setIsPreviousButtonDisable] = useState(false);
  const [isApply, setIsApply] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getDates = (currMonthValue, nextMonthValue) => {
    const startOfMonth = dayjs(currMonthValue, monthYearFormat).startOf('month');
    const endOfMonth = dayjs(currMonthValue, monthYearFormat).endOf('month');
    let currDates = [];
    const extraDayAdd = startOfMonth.day();
    for (let i = startOfMonth.date(); i <= endOfMonth.date(); i += 1) {
      currDates = [...currDates, i];
    }
    for (let j = 0; j < extraDayAdd; j += 1) {
      currDates = ['', ...currDates];
    }
    setCurrentDates(currDates);

    const startOfNextMonth = dayjs(nextMonthValue, monthYearFormat).startOf('month');
    const endOfNextMonth = dayjs(nextMonthValue, monthYearFormat).endOf('month');

    const nextDatesValue = [];
    const extraNextDayAdd = startOfNextMonth.day();

    for (let i = startOfNextMonth.date(); i <= endOfNextMonth.date(); i += 1) {
      nextDatesValue.push(i);
    }
    for (let j = 0; j < extraNextDayAdd; j += 1) {
      nextDatesValue.unshift('');
    }

    setNextDates(nextDatesValue);
  };

  const disabledNextOrPreviousButton = useCallback(() => {
    const monthYear = [
      dayjs(currentMonth, monthYearFormat).format('MM'),
      dayjs(currentMonth, monthYearFormat).format('YYYY'),
    ];
    const nextMonthYear = [
      dayjs(nextMonth, monthYearFormat).format('MM'),
      dayjs(nextMonth, monthYearFormat).format('YYYY'),
    ];

    const minDateMonthYear = [
      dayjs(minDate, dateFormat).format('MM'),
      dayjs(minDate, dateFormat).format('YYYY'),
    ];
    const maxDateMonthYear = [
      dayjs(maxDate, dateFormat).format('MM'),
      dayjs(maxDate, dateFormat).format('YYYY'),
    ];

    if (
      (minDateMonthYear[0] === monthYear[0] && minDateMonthYear[1] === monthYear[1]) ||
      (minDateMonthYear[0] === nextMonthYear[0] && minDateMonthYear[1] === nextMonthYear[1])
    ) {
      setIsPreviousButtonDisable(true);
    } else {
      setIsPreviousButtonDisable(false);
    }

    if (
      (maxDateMonthYear[1] === monthYear[1] && maxDateMonthYear[0] === monthYear[0]) ||
      (maxDateMonthYear[1] === nextMonthYear[1] && maxDateMonthYear[0] === nextMonthYear[0])
    ) {
      setIsNexButtonDisable(true);
    } else {
      setIsNexButtonDisable(false);
    }
  }, [currentMonth, dateFormat, maxDate, minDate, monthYearFormat, nextMonth]);

  useEffect(() => {
    if (startDateEndDate.length === 2) {
      setHoverDates([]);
    }
  }, [startDateEndDate]);

  useEffect(() => {
    if (startDate && endDate && !dayjs(startDate).isAfter(endDate)) {
      setStartDateEndDate([startDate, endDate]);
      setIsApply(true);
    }

    return () => {
      setStartDateEndDate([]);
    };
  }, [startDate, endDate]);

  const handleSetDates = () => {
    let currMonthValue;
    let nextMonthValue;
    if (startDate && endDate) {
      currMonthValue = dayjs(startDate, dateFormat).format(monthYearFormat);
      nextMonthValue = dayjs(dayjs(currMonthValue).add(1, 'months')).format(monthYearFormat);
    } else {
      currMonthValue = dayjs().format(monthYearFormat);
      nextMonthValue = dayjs(dayjs(currMonthValue).add(1, 'months')).format(monthYearFormat);
    }
    setCurrentMonth(currMonthValue);
    setNextMonth(nextMonthValue);
  };

  useEffect(() => {
    handleSetDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentMonth) {
      getDates(currentMonth, nextMonth);
      if (minDate || maxDate) {
        disabledNextOrPreviousButton();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextMonth, currentMonth, minDate, maxDate, showOnlyOneDay, disabledNextOrPreviousButton]);

  const handleNextMonth = () => {
    onNextClick();
    const currMonth = dayjs(dayjs(currentMonth, monthYearFormat).add(1, 'months')).format(
      monthYearFormat
    );
    const nexMonth = dayjs(dayjs(nextMonth, monthYearFormat).add(1, 'months')).format(
      monthYearFormat
    );
    setCurrentMonth(currMonth);
    setNextMonth(nexMonth);
  };
  const handlePreviousMonth = () => {
    onPreviousClick();
    setCurrentMonth(
      dayjs(dayjs(currentMonth, monthYearFormat).subtract(1, 'months')).format(monthYearFormat)
    );
    setNextMonth(
      dayjs(dayjs(nextMonth, monthYearFormat).subtract(1, 'months')).format(monthYearFormat)
    );
  };

  const onDateClick = (date, isCurrent) => {
    setActiveFilter();
    const monthYear = isCurrent
      ? [
          dayjs(currentMonth, monthYearFormat).format('MM'),
          dayjs(currentMonth, monthYearFormat).format('YYYY'),
        ]
      : [
          dayjs(nextMonth, monthYearFormat).format('MM'),
          dayjs(nextMonth, monthYearFormat).format('YYYY'),
        ];
    const selectDate = dayjs(`${monthYear[1]}-${monthYear[0]}-${date}`, 'YYYY-MM-DD').format(
      dateFormat
    );

    onDateClicks(selectDate);

    const isAfter = dayjs(dayjs(selectDate, dateFormat).format('YYYY-MM-DD')).isAfter(
      dayjs(startDateEndDate[0], dateFormat).format('YYYY-MM-DD')
    );
    if (startDateEndDate[0] && startDateEndDate[1]) {
      setStartDateEndDate([selectDate]);
    } else if (startDateEndDate.length) {
      if (!isAfter) {
        setStartDateEndDate([selectDate]);
      } else {
        setStartDateEndDate([startDateEndDate[0], selectDate]);
      }
    } else {
      setStartDateEndDate([selectDate]);
    }
  };

  const customFilter = (type, value, isPast) => {
    onFilterClick({ type, value, isPast });
    if (isPast) {
      const date = dayjs().subtract(value, type).format(dateFormat);
      setStartDateEndDate([date, dayjs().format(dateFormat)]);
    } else {
      const date = dayjs().add(value, type).format(dateFormat);
      setStartDateEndDate([dayjs().format(dateFormat), date]);
    }
  };

  const handleOnMouseEnter = (selectDate) => {
    if (startDateEndDate.length === 1) {
      const getDaysBetweenDates = function (startDateValue, endDateValue) {
        const now = startDateValue.clone();
        const dates = [];

        while (now.isSameOrBefore(endDateValue)) {
          dates.push(now.format(dateFormat));
          now.add(1, 'days');
        }
        return dates;
      };

      const startDateValue = dayjs(dayjs(startDateEndDate[0], dateFormat).format('YYYY-MM-DD'));
      const endDateValue = dayjs(selectDate, dateFormat).format('YYYY-MM-DD');

      const dateList = getDaysBetweenDates(startDateValue, endDateValue);
      setHoverDates(dateList);
    }
  };

  const handleClose = (setAnchorEl) => {
    setAnchorEl(null);
    onCancel();
    setTimeout(() => {
      handleSetDates();
      if (startDate && endDate && !dayjs(startDate).isAfter(endDate)) {
        setStartDateEndDate([startDate, endDate]);
        setIsApply(true);
      } else {
        setStartDateEndDate([]);
      }
    }, 500);
  };

  return (
    <DatePopover
      startDateEndDate={startDateEndDate}
      placeHolder={placeHolder}
      isApply={isApply}
      dateFormat={dateFormat}
      handleClose={(setAnchorEl) => handleClose(setAnchorEl)}
      calenderIcon={calenderIcon}
    >
      {({ setAnchorEl }) => (
        <Paper
          sx={{
            padding: filterLabels.length ? '10px 30px 10px 60px' : '10px 30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'relative',
          }}
          {...mainWrapperProps}
        >
          {!isOpen && filterLabels.length > 0 && (
            <MenuIcon
              style={{
                position: 'absolute',
                left: '10px',
                top: '10px',
                height: '22px',
                background: 'white',
                borderRadius: '50%',
                boxShadow:
                  '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
                width: '22px',
                padding: '5px',
                cursor: 'pointer',
              }}
              {...hamburgerProps}
              onClick={() => setIsOpen(true)}
            />
          )}
          <MakeshiftDrawer
            filterOptionCloseIconProps={filterOptionCloseIconProps}
            component={
              <Box
                sx={{
                  width: '100%',
                }}
                {...filterWrapperProps}
              >
                <Box
                  sx={{
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                  {...customFilterProps}
                >
                  {customFilterText}
                </Box>
                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  {filterLabels.length ? (
                    <FilterLabelWrapper size={12}>
                      {filterLabels.map((filter, index) => (
                        <Chip
                          label={filter.label}
                          color="primary"
                          size="small"
                          variant={activeFilter === index ? 'filled' : 'outlined'}
                          key={filter.type + index}
                          {...filterLabelProps(filter.label)}
                          onClick={() => {
                            setActiveFilter(index);
                            setHoverDates([]);
                            customFilter(filter.type, filter.value, filter.past);
                          }}
                        />
                      ))}
                    </FilterLabelWrapper>
                  ) : (
                    ''
                  )}
                </Grid>
              </Box>
            }
            open={isOpen}
            setIsOpen={setIsOpen}
          />
          {/* ... rest of your component (LeftDatePicker, RightDatePicker, etc.) unchanged ... */}
        </Paper>
      )}
    </DatePopover>
  );
};

export default DateRangePicker;

const DatePopover = ({
  children,
  startDateEndDate,
  placeHolder,
  isApply,
  dateFormat,
  handleClose,
  calenderIcon,
}: {
  children: React.ReactNode;
  startDateEndDate: string[];
  placeHolder: string;
  isApply: boolean;
  dateFormat: string;
  handleClose: (setAnchorEl: React.Dispatch<React.SetStateAction<null>>) => void;
  calenderIcon: React.ReactNode;
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [start, end] = startDateEndDate;
  const showValue =
    startDateEndDate.length === 2
      ? `${dayjs(start, dateFormat).format(dateFormat)} - ${dayjs(end, dateFormat).format(
          dateFormat
        )}`
      : null;
  return (
    <>
      <DatePickerButton aria-describedby={id} onClick={handleClick}>
        <small>{isApply && showValue ? showValue : placeHolder}</small>
        {calenderIcon}
      </DatePickerButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose(setAnchorEl)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {children({ setAnchorEl })}
      </Popover>
    </>
  );
};

const TableData = styled(TableCell)`
  text-align: center;
  cursor: ${({ $isDisable }) => ($isDisable ? 'no-drop' : 'pointer')};
`;

export const DateTable = ({
  showOnlyOneDay,
  dates,
  month,
  onDateClick,
  startDateEndDate,
  isCurrent,
  hoverDates,
  setHoverDates,
  minDate,
  maxDate,
  handleOnMouseEnter,
  monthYearFormat,
  daysHeaderProps,
  dayProps,
  dateProps,
  selectedDateColor,
  selectedDateRangeColor,
  disabledColor,
  days,
  dateFormat,
}: {
  showOnlyOneDay: string;
  dates: string[];
  month: string;
  onDateClick: (date: string) => void;
  startDateEndDate: string[];
  isCurrent: boolean;
  hoverDates: string[];
  setHoverDates: React.Dispatch<React.SetStateAction<string[]>>;
  minDate: string;
  maxDate: string;
  handleOnMouseEnter: (date: string) => void;
  monthYearFormat: string;
  daysHeaderProps: TableHeadProps;
  dayProps: TableCellProps;
  dateProps: TableCellProps;
  selectedDateColor: string;
  selectedDateRangeColor: string;
  disabledColor: string;
  days: string[];
  dateFormat: string;
}) => {
  const rows = useMemo(
    () =>
      dates.reduce(
        (acc, curr) => {
          if (acc[acc.length - 1].length < 7) {
            acc[acc.length - 1] = [...acc[acc.length - 1], curr];
          } else {
            acc.push([curr]);
          }
          return acc;
        },
        [[]]
      ),
    [dates]
  );

  if (rows.length < 6) {
    for (let i = 0; i < 6 - rows.length; i += 1) {
      rows.push(['', '', '', '', '', '', '']);
    }
  }
  return (
    <TableContainer>
      <Table sx={{ width: '100%' }} aria-label="simple table">
        <TableHead>
          <TableRow {...daysHeaderProps}>
            {days.map((day, index) => (
              <TableCell
                align="center"
                key={`${day}${index}`}
                sx={{ padding: '8px 0px' }}
                {...dayProps(day)}
              >
                {day}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {row.map((date, ind) => {
                const monthYear = [
                  dayjs(month, monthYearFormat).format('MM'),
                  dayjs(month, monthYearFormat).format('YYYY'),
                ];
                // const monthYear = month?.split("-");

                const selectDate =
                  date &&
                  dayjs(`${monthYear[1]}-${monthYear[0]}-${date}`, 'YYYY-MM-DD').format(dateFormat);

                const currentDay = dayjs(selectDate, 'YYYY-MM-DD').format('dddd');
                const disabledDate = () => {
                  if (!showOnlyOneDay) {
                    return false;
                  }
                  if (minDate && maxDate) {
                    return !(
                      dayjs(selectDate).isSameOrBefore(maxDate) &&
                      dayjs(selectDate).isSameOrAfter(minDate) &&
                      currentDay === showOnlyOneDay
                    );
                  }
                  if (minDate) {
                    return !(
                      dayjs(selectDate).isSameOrAfter(minDate) && currentDay === showOnlyOneDay
                    );
                  }
                  if (maxDate) {
                    return !(
                      dayjs(selectDate).isSameOrBefore(maxDate) && currentDay === showOnlyOneDay
                    );
                  }
                  return currentDay !== showOnlyOneDay;
                };
                const disableDate = disabledDate();
                const beetWeenFormateDate = dayjs(selectDate, dateFormat).format('YYYY-MM-DD');

                const isDateBetween = dayjs(beetWeenFormateDate).isBetween(
                  dayjs(startDateEndDate[0], dateFormat).format('YYYY-MM-DD'),
                  dayjs(startDateEndDate[1], dateFormat).format('YYYY-MM-DD'),
                  'day'
                );

                return (
                  <TableData
                    align="center"
                    key={`${date}${ind}`}
                    $isDisable={disableDate}
                    sx={{ padding: '5px', border: 'none' }}
                  >
                    <DateNumber
                      elevation={3}
                      $isActive={!!date && startDateEndDate.includes(selectDate)}
                      $isBetween={
                        disableDate
                          ? false
                          : startDateEndDate.length === 2
                            ? isDateBetween
                            : hoverDates.includes(selectDate)
                      }
                      $date={date}
                      $isToday={dayjs().format(dateFormat) === selectDate}
                      $isDisable={disableDate}
                      activeColor={selectedDateColor}
                      betweenColor={selectedDateRangeColor}
                      disabledColor={disabledColor}
                      {...dateProps({
                        date: selectDate,
                        isToday: dayjs().format(dateFormat) === selectDate,
                      })}
                      onClick={() => onDateClick(date, isCurrent)}
                      onMouseEnter={() => {
                        handleOnMouseEnter(selectDate);
                      }}
                      onMouseLeave={() => {
                        if (startDateEndDate.length !== 2) {
                          setHoverDates([]);
                        }
                      }}
                    >
                      {date}
                    </DateNumber>
                  </TableData>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
const StyledPaper = styled(Paper)({
  maxWidth: '150px',
  width: '100%',
  position: 'absolute',
  height: 'calc(100% - 20px)',
  left: '0px',
  top: '0px',
  zIndex: 9999999,
  overflow: 'auto',
  padding: '10px 0',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  flexDirection: 'column',
});

const StyledIconButton = styled(CloseIcon)({
  height: '22px',
  background: 'white',
  borderRadius: '50%',
  boxShadow:
    '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
  width: '22px',
  padding: '5px',
  cursor: 'pointer',
});
export function MakeshiftDrawer({ open, setIsOpen, component, filterOptionCloseIconProps }: any) {
  return open ? (
    <StyledPaper elevation={4}>
      <StyledIconButton {...filterOptionCloseIconProps} onClick={() => setIsOpen(false)} />
      {component}
    </StyledPaper>
  ) : (
    ''
  );
}
