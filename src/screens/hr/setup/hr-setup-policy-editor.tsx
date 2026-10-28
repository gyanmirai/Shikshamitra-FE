'use client';

import { useRef, useState, useEffect, useContext } from 'react';
import { Alert, Stack, Button, MenuItem, TextField } from '@mui/material';
import { useHRPolicyWorkspace } from 'src/screens/hr/policies/hooks/useHRPolicyWorkspace';
import { PolicyImpactDrawer } from 'src/screens/hr/policies/components/PolicyImpactDrawer';
import { PayrollPolicyDrawer } from 'src/screens/hr/policies/components/PayrollPolicyDrawer';
import { ManualHolidayDialog } from 'src/screens/hr/policies/components/ManualHolidayDialog';
import { CalendarPolicyDrawer } from 'src/screens/hr/policies/components/CalendarPolicyDrawer';
import { AttendancePolicyDrawer } from 'src/screens/hr/policies/components/AttendancePolicyDrawer';

import { useHrSetupEditorState, HrSetupNavigationContext } from './hr-setup-editor-context';

export function HrSetupPolicyEditor({ task, onSaved }: { task: string; onSaved: () => void }) {
  const navigate = useContext(HrSetupNavigationContext);
  const ctx = useHRPolicyWorkspace({ tabs: [], embedded: true });
  const kind =
    task === 'calendar' ? 'calendar' : task === 'payroll-policy' ? 'payroll' : 'attendance';
  const rows =
    kind === 'calendar' ? ctx.calendars : kind === 'payroll' ? ctx.payroll : ctx.attendance;
  const [selected, setSelected] = useState(ctx.canCreatePolicy ? 'new' : '');
  const [generation, setGeneration] = useState(0);
  const opening = useRef('');
  const baseline = useRef('');
  const baselineDrawer = useRef<typeof ctx.drawer>(null);
  const wasOpen = useRef(false);
  const savedRef = useRef(onSaved);
  savedRef.current = onSaved;
  const snapshot = JSON.stringify(
    kind === 'calendar'
      ? ctx.calendarForm
      : kind === 'payroll'
        ? ctx.payrollForm
        : ctx.attendanceForm
  );
  const loading =
    kind === 'calendar'
      ? ctx.calendarsLoading
      : kind === 'payroll'
        ? ctx.payrollLoading
        : ctx.attendanceLoading;
  const error =
    kind === 'calendar'
      ? ctx.calendarsError
      : kind === 'payroll'
        ? ctx.payrollError
        : ctx.attendanceError;
  useEffect(() => {
    if (loading || error || !selected || opening.current === `${task}:${selected}:${generation}`)
      return;
    opening.current = `${task}:${selected}:${generation}`;
    wasOpen.current = false;
    if (kind === 'calendar')
      ctx.openCalendarDrawer(ctx.calendars.find((row) => row.id === selected));
    else if (kind === 'payroll')
      ctx.openPayrollDrawer(ctx.payroll.find((row) => row.id === selected));
    else ctx.openAttendanceDrawer(ctx.attendance.find((row) => row.id === selected));
  }, [task, selected, generation, loading, error, kind, ctx]);
  useEffect(() => {
    if (ctx.drawer) {
      wasOpen.current = true;
      if (baselineDrawer.current !== ctx.drawer) {
        baselineDrawer.current = ctx.drawer;
        baseline.current = snapshot;
      }
    } else if (wasOpen.current) {
      wasOpen.current = false;
      savedRef.current();
    }
  }, [ctx.drawer, snapshot]);
  useHrSetupEditorState({
    dirty: Boolean(
      ctx.drawer && baselineDrawer.current === ctx.drawer && snapshot !== baseline.current
    ),
    busy: ctx.isPolicyOperationActive,
    save: ctx.drawer
      ? kind === 'calendar'
        ? ctx.saveCalendar
        : kind === 'payroll'
          ? ctx.savePayroll
          : ctx.saveAttendance
      : null,
    disabled: selected === 'new' ? !ctx.canCreatePolicy : !ctx.canEditPolicy,
  });
  if (error)
    return (
      <Alert
        severity="error"
        action={
          <Button
            size="small"
            onClick={async () => {
              await ctx.refreshSetupConfiguration();
              setGeneration((value) => value + 1);
            }}
          >
            Retry
          </Button>
        }
      >
        Unable to load policy configuration. Check your access and connection.
      </Alert>
    );
  if (loading) return <Alert severity="info">Loading policy configuration...</Alert>;
  return (
    <Stack spacing={2}>
      <TextField
        select
        size="small"
        label="Policy to configure"
        value={selected}
        disabled={ctx.isPolicyOperationActive}
        onChange={(event) => navigate(() => setSelected(event.target.value))}
      >
        {ctx.canCreatePolicy && <MenuItem value="new">Create configuration</MenuItem>}
        {rows.map((row) => (
          <MenuItem key={row.id} value={row.id}>
            {row.name}
          </MenuItem>
        ))}
      </TextField>
      {kind !== 'calendar' && selected !== 'new' && ctx.canSetDefaultPolicy && (
        <Button
          size="small"
          variant="outlined"
          disabled={ctx.isPolicyOperationActive}
          onClick={() =>
            navigate(() => {
              if (kind === 'payroll') {
                const policy = ctx.payroll.find((row) => row.id === selected);
                if (policy) ctx.setDefaultWithImpact('payroll', policy);
              } else {
                const policy = ctx.attendance.find((row) => row.id === selected);
                if (policy) ctx.setDefaultWithImpact('attendance', policy);
              }
            })
          }
        >
          Set as default
        </Button>
      )}
      {kind === 'calendar' ? (
        <CalendarPolicyDrawer ctx={ctx} />
      ) : kind === 'payroll' ? (
        <PayrollPolicyDrawer ctx={ctx} />
      ) : (
        <AttendancePolicyDrawer ctx={ctx} />
      )}
      <PolicyImpactDrawer ctx={ctx} />
      <ManualHolidayDialog ctx={ctx} />
    </Stack>
  );
}
