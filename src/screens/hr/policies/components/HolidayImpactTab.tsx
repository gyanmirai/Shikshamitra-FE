'use client';

import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import {
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Select,
  Tooltip,
  MenuItem,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  LinearProgress,
} from '@mui/material';

import { EmptyRows, SectionTable } from './HRPolicySharedUI';
import { toLabel, formatDate, getErrorMessage } from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- HolidayImpactTab ----------------------------------------------------------

export function HolidayImpactTab({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    calendars,
    payroll,
    attendance,
    holidayFilters,
    setHolidayFilters,
    holidayImpact,
    holidayImpactLoading,
    holidayImpactError,
    openPayrollDrawer,
  } = ctx;

  const activeCalendars = calendars.filter((item) => item.status === 'active');
  const selectedHolidayCalendarId = holidayFilters.workCalendarPolicyId || '';
  const selectedHolidayPayrollId = holidayFilters.payrollPolicyId || '';
  const selectedHolidayAttendanceId = holidayFilters.attendancePolicyId || '';

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Holiday Impact
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Work Calendar</InputLabel>
          <Select
            label="Work Calendar"
            displayEmpty
            value={selectedHolidayCalendarId}
            renderValue={(value) =>
              value
                ? calendars.find((item) => item.id === value)?.name || 'Selected calendar'
                : 'Use payroll policy calendar'
            }
            onChange={(event) =>
              setHolidayFilters((current) => ({
                ...current,
                workCalendarPolicyId: event.target.value,
              }))
            }
          >
            <MenuItem value="">
              <em>Use payroll policy calendar</em>
            </MenuItem>
            {activeCalendars.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Payroll Policy</InputLabel>
          <Select
            label="Payroll Policy"
            value={selectedHolidayPayrollId}
            onChange={(event) =>
              setHolidayFilters((current) => ({ ...current, payrollPolicyId: event.target.value }))
            }
          >
            {payroll.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Attendance Policy</InputLabel>
          <Select
            label="Attendance Policy"
            value={selectedHolidayAttendanceId}
            onChange={(event) =>
              setHolidayFilters((current) => ({
                ...current,
                attendancePolicyId: event.target.value,
              }))
            }
          >
            {attendance.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          type="month"
          label="Month"
          InputLabelProps={{ shrink: true }}
          value={holidayFilters.month}
          onChange={(event) =>
            setHolidayFilters((current) => ({
              ...current,
              month: event.target.value,
              fromDate: '',
              toDate: '',
            }))
          }
          sx={{ minWidth: 180 }}
        />
        <DatePicker
          label="From"
          value={holidayFilters.fromDate ? dayjs(holidayFilters.fromDate) : null}
          disabled={Boolean(holidayFilters.month)}
          onChange={(val) =>
            setHolidayFilters((current) => ({
              ...current,
              fromDate: val?.format('YYYY-MM-DD') || '',
            }))
          }
          format="DD/MM/YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="To"
          value={holidayFilters.toDate ? dayjs(holidayFilters.toDate) : null}
          disabled={Boolean(holidayFilters.month)}
          onChange={(val) =>
            setHolidayFilters((current) => ({
              ...current,
              toDate: val?.format('YYYY-MM-DD') || '',
            }))
          }
          format="DD/MM/YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
        <Button
          size="small"
          variant="text"
          onClick={() =>
            setHolidayFilters((current) => ({ ...current, month: '', fromDate: '', toDate: '' }))
          }
        >
          Clear Dates
        </Button>
      </Stack>
      {holidayImpactLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {holidayImpactError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(holidayImpactError, 'Could not load holiday impact.')}
        </Alert>
      ) : null}
      <SectionTable
        columns={[
          'Date',
          'Holiday',
          'Calendar',
          'Attendance',
          'Payroll',
          'Basis',
          'Difference',
          'Actions',
        ]}
      >
        {holidayImpact?.items?.length ? (
          holidayImpact.items.map((item) => (
            <TableRow
              key={`${item.calendarHolidayId}-${item.date}`}
              hover
              selected={item.hasDifference}
            >
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{item.holidayName}</TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2">
                    {item.workCalendarPolicyName || item.workCalendarPolicyId || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {toLabel(item.calendarSource)}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={item.isAttendanceWorkingDay ? 'Working' : 'Non-working'}
                    color={item.isAttendanceWorkingDay ? 'warning' : 'default'}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={item.isPunchRequired ? 'Punch required' : 'No punch'}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={toLabel(item.holidayWorkBehavior || item.attendanceImpact)}
                    variant="outlined"
                  />
                  {item.attendanceBehaviorText ? (
                    <Typography variant="caption">{item.attendanceBehaviorText}</Typography>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={item.isPaidInPayroll ? 'Paid' : 'Unpaid'}
                    color={item.isPaidInPayroll ? 'success' : 'error'}
                    variant="outlined"
                  />
                  <Chip size="small" label={`${item.payableUnit ?? 0} unit`} variant="outlined" />
                  <Chip
                    size="small"
                    label={toLabel(item.payrollOverrideSource || item.payrollImpact)}
                    variant="outlined"
                  />
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Chip
                    size="small"
                    label={`${item.payrollBasisDayDelta ?? 0} basis day`}
                    color={(item.payrollBasisDayDelta ?? 0) < 0 ? 'warning' : 'default'}
                    variant="outlined"
                  />
                  {item.payrollBasisImpactText ? (
                    <Typography variant="caption">{item.payrollBasisImpactText}</Typography>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                {item.hasDifference ? <Chip size="small" color="warning" label="Review" /> : '-'}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Open payroll policy overrides">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const pol = payroll.find((row) => row.id === selectedHolidayPayrollId);
                      if (pol) openPayrollDrawer(pol);
                    }}
                  >
                    <Iconify icon="mdi:calendar-edit" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <EmptyRows colSpan={8} message="No holiday impact rows." />
        )}
      </SectionTable>
    </Card>
  );
}
