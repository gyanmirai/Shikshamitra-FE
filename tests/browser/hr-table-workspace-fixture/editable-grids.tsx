import { useState } from 'react';
import { Button, Drawer } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarPolicyDrawer } from 'src/screens/hr/policies/components/CalendarPolicyDrawer';
import { PayrollPolicyDrawer } from 'src/screens/hr/policies/components/PayrollPolicyDrawer';
import {
  defaultCalendarForm,
  defaultPayrollForm,
} from 'src/screens/hr/policies/hr-policy-workspace.constants';
import type { HRPolicyWorkspaceContext } from 'src/screens/hr/policies/hooks/useHRPolicyWorkspace';

export function EditableGrids() {
  const [drawer, setDrawer] = useState<'calendar' | 'payroll' | null>(null);
  const [calendarForm, setCalendarForm] = useState({
    ...defaultCalendarForm('2026-06-01'),
    name: 'Synthetic calendar',
    holidays: [
      {
        academicYearId: 'synthetic',
        date: '2026-10-02',
        holidayName: 'Synthetic central holiday',
        source: 'central_calendar',
        isIncluded: true,
      },
    ],
  });
  const [payrollForm, setPayrollForm] = useState({
    ...defaultPayrollForm('synthetic-calendar'),
    name: 'Synthetic payroll',
    dayCalculationType: 'manual-days',
  });
  const [holidayReviewFilters, setHolidayReviewFilters] = useState({
    search: '',
    month: '',
    source: 'all',
  });
  const calendars = [
    { ...calendarForm, id: 'synthetic-calendar', academicYearId: 'synthetic', version: 1 },
  ];
  const noop = () => {};
  const ctx = {
    drawer: drawer ? { kind: drawer, mode: 'create' } : null,
    calendarForm,
    setCalendarForm,
    payrollForm,
    setPayrollForm,
    holidayReviewFilters,
    setHolidayReviewFilters,
    calendars,
    activeCalendars: calendars,
    currentYear: { startDate: '2026-06-01', endDate: '2027-05-31' },
    academicYearId: 'synthetic',
    centralHolidayPreviewRows: [],
    createCalendarState: { isLoading: false },
    updateCalendarState: { isLoading: false },
    createPayrollState: { isLoading: false },
    updatePayrollState: { isLoading: false },
    loadCalendarHolidaysState: { isFetching: false },
    loadHolidayImportPreviewState: { isFetching: false },
    canEditPolicy: false,
    canCreatePolicy: false,
    closeDrawer: () => setDrawer(null),
    saveCalendar: noop,
    savePayroll: noop,
    importCentralHolidays: noop,
    openManualHolidayDialog: noop,
    removeManualHoliday: noop,
    updateCalendarHoliday: (
      index: number,
      patch: Partial<(typeof calendarForm.holidays)[number]>
    ) =>
      setCalendarForm((current) => ({
        ...current,
        holidays: current.holidays.map((holiday, i) =>
          i === index ? { ...holiday, ...patch } : holiday
        ),
      })),
  } as unknown as HRPolicyWorkspaceContext;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Button onClick={() => setDrawer('calendar')}>Calendar grid</Button>
      <Button onClick={() => setDrawer('payroll')}>Payroll grid</Button>
      <Drawer
        open={Boolean(drawer)}
        onClose={() => setDrawer(null)}
        anchor="right"
        slotProps={{ paper: { sx: { width: { xs: '100%', md: 1100 }, maxWidth: '100%' } } }}
      >
        <CalendarPolicyDrawer ctx={ctx} />
        <PayrollPolicyDrawer ctx={ctx} />
      </Drawer>
    </LocalizationProvider>
  );
}
