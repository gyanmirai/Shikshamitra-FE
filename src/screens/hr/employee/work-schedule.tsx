'use client';

import type { RootState } from 'src/redux/store';
import type { ShiftAssignment } from 'src/redux/hr/work-shifts-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetWorkScheduleQuery,
  useCancelWorkShiftMutation,
  useGetWorkShiftOptionsQuery,
  useScheduleWorkShiftMutation,
} from 'src/redux/hr/work-shifts-api';

export default function EmployeeWorkSchedule({ employeeId }: { employeeId: string }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'HR.Employee.EmployeeList.View');
  const canEdit = hasGrantedPermission(permissions, 'HR.Employee.EmployeeList.Edit');
  const { data, error, isLoading, refetch } = useGetWorkScheduleQuery(employeeId, {
    skip: !employeeId || !canView,
  });
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState('');
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [failure, setFailure] = useState('');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [draftBaseline, setDraftBaseline] = useState('');
  const [cancelled, setCancelled] = useState<ShiftAssignment | null>(null);
  const options = useGetWorkShiftOptionsQuery(undefined, { skip: !canEdit || !open });
  const [schedule, scheduling] = useScheduleWorkShiftMutation();
  const [cancel, cancelling] = useCancelWorkShiftMutation();
  const busy = scheduling.isLoading || cancelling.isLoading;
  const draftDirty = draftBaseline !== `${shift}|${date?.format('YYYY-MM-DD') || ''}`;
  const requestClose = () => {
    if (busy) return;
    if (draftDirty) setDiscardOpen(true);
    else setOpen(false);
  };
  const showForm = (row?: ShiftAssignment) => {
    setDraftBaseline(`${row?.workShiftId || ''}|${row?.effectiveFrom || data?.today || ''}`);
    setDiscardOpen(false);
    setShift(row?.workShiftId || '');
    setDate(dayjs(row?.effectiveFrom || data?.today));
    setFailure('');
    setOpen(true);
  };
  const submit = async () => {
    if (!data || !shift || !date?.isValid() || date.format('YYYY-MM-DD') < data.today) {
      setFailure('Select a work shift and today or a future effective date.');
      return;
    }
    try {
      await schedule({
        employeeId,
        workShiftId: shift,
        effectiveFrom: date.format('YYYY-MM-DD'),
        concurrencyStamp: data.concurrencyStamp,
      }).unwrap();
      setOpen(false);
      shikshaMitraToast.success({ message: 'Work schedule updated.' });
    } catch (e) {
      setFailure(
        parseApiProblemDetail(e).detail || 'Could not update the schedule. Refresh and try again.'
      );
    }
  };
  const confirmCancel = async () => {
    if (!data || !cancelled) return;
    try {
      await cancel({
        employeeId,
        assignmentId: cancelled.id,
        concurrencyStamp: data.concurrencyStamp,
      }).unwrap();
      setCancelled(null);
      shikshaMitraToast.success({ message: 'Future assignment cancelled.' });
    } catch (e) {
      setFailure(
        parseApiProblemDetail(e).detail || 'Could not cancel the assignment. Refresh and try again.'
      );
    }
  };
  if (!canView)
    return (
      <Alert severity="info">Employee view permission is required to see work schedules.</Alert>
    );
  const render = (row: ShiftAssignment, future = false) => (
    <Stack
      key={row.id}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="space-between"
    >
      <Stack>
        <Typography variant="body2">
          {row.shiftName}: {row.startTime.slice(0, 5)} - {row.endTime.slice(0, 5)}
        </Typography>
        <Typography variant="body2">
          {row.effectiveFrom} to {row.effectiveTo ? `${row.effectiveTo} (exclusive)` : 'ongoing'}
        </Typography>
        {row.provenance === 'ImportedLastKnown' && (
          <Typography variant="body2">
            Imported last-known configuration. Earlier changes are unknown.
          </Typography>
        )}
      </Stack>
      {future && canEdit && (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => showForm(row)}>
            Change
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => {
              setFailure('');
              setCancelled(row);
            }}
          >
            Cancel assignment
          </Button>
        </Stack>
      )}
    </Stack>
  );
  return (
    <Stack spacing={2}>
      <FormSectionCard
        title="Work Schedule"
        actionFullWidthOnMobile
        icon={GlobalIcons.clock}
        descriptionTooltip="Employee working hours are independent of school sessions. Changes preserve recorded attendance and payroll."
        action={
          canEdit && data ? (
            <Button variant="contained" size="small" onClick={() => showForm()}>
              Schedule work shift
            </Button>
          ) : undefined
        }
      >
        {isLoading && (
          <Typography variant="body2" role="status">
            Loading work schedule...
          </Typography>
        )}
        {error && (
          <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
            Could not load the work schedule.
          </Alert>
        )}
        {data &&
          (data.current ? (
            render(data.current)
          ) : (
            <Alert severity="info">No work shift is assigned for today.</Alert>
          ))}
      </FormSectionCard>
      {data && (
        <>
          <FormSectionCard
            title="Upcoming Assignments"
            icon={GlobalIcons.calendar}
            descriptionTooltip="Future changes take effect on the displayed start date."
          >
            {data.upcoming.length ? (
              data.upcoming.map((row) => render(row, true))
            ) : (
              <Typography variant="body2">No upcoming assignments.</Typography>
            )}
          </FormSectionCard>
          <FormSectionCard
            title="Assignment History"
            icon={GlobalIcons.history}
            descriptionTooltip="Saved shift hours remain fixed for historical attendance."
          >
            {data.history.length ? (
              data.history.map((row) => render(row))
            ) : (
              <Typography variant="body2">No historical assignments.</Typography>
            )}
          </FormSectionCard>
        </>
      )}
      <CustomDialog
        title="Schedule Work Shift"
        titleInfo="Choose a daytime work shift and effective date. Dates with saved attendance or locked payroll cannot change."
        open={open}
        handleClose={requestClose}
        hasForm={false}
        hasUnsavedChanges={draftDirty}
        guardUnsavedChanges={false}
        disableClose={busy}
      >
        <FormSectionCard
          title="Assignment Details"
          icon={GlobalIcons.clock}
          descriptionTooltip="One work shift applies per employee per date."
        >
          {failure && (
            <Alert severity="error">
              {failure}
              <Button onClick={() => refetch()}>Refresh schedule</Button>
            </Alert>
          )}
          {options.error && (
            <Alert
              severity="error"
              action={<Button onClick={() => options.refetch()}>Retry</Button>}
            >
              Could not load work shifts.
            </Alert>
          )}
          <TextField
            select
            label="Work shift"
            required
            size="small"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            disabled={busy || options.isLoading}
          >
            {(options.data?.items || []).map((x) => (
              <MenuItem key={x.id} value={x.id}>
                {x.shiftName} ({x.startTime.slice(0, 5)} - {x.endTime.slice(0, 5)})
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="Effective from"
            value={date}
            minDate={dayjs(data?.today)}
            onChange={setDate}
            disabled={busy}
            slotProps={{ textField: { size: 'small', required: true } }}
          />
        </FormSectionCard>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={requestClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={submit}
            disabled={busy || !shift || !date?.isValid()}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        title="Cancel Future Assignment"
        icon="warning"
        open={Boolean(cancelled)}
        onClose={() => setCancelled(null)}
        cancelText="Keep assignment"
        disableCancel={busy}
        content={
          <>
            {failure && <Alert severity="error">{failure}</Alert>}Cancel {cancelled?.shiftName}{' '}
            starting {cancelled?.effectiveFrom}? The preceding assignment continues until the next
            scheduled change.
          </>
        }
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={confirmCancel}
            disabled={busy}
          >
            Cancel assignment
          </Button>
        }
      />
      <ConfirmDialog
        title="Discard Changes"
        icon="warning"
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        cancelText="Keep editing"
        content="Your unsaved work schedule changes will be lost."
        action={
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={() => {
              setDiscardOpen(false);
              setOpen(false);
            }}
          >
            Discard changes
          </Button>
        }
      />
    </Stack>
  );
}
