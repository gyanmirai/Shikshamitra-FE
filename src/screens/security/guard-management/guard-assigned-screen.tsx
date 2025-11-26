'use client';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import data from 'src/json/security/guard-management/guard-list.json';
import {
  Box,
  Grid,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import GuardList from './component/guard-list';
import ItemCardWithActions from './component/guard-duty-hours-cell';

import type { IGuard, IAssignedGuard } from './guard-management-interface';

const timeSlots = ['00:00 - 07:00', '07:00 - 12:00', '12:00 - 18:00', '18:00 - 00:00'];

const GuardRosterScreen = () => {
  // Dialog state for showing alerts
  const alertDialog = useBoolean();
  // State to store assigned guards with their shifts
  const [assignedGuards, setAssignedGuards] = useState<{ [key: string]: IAssignedGuard[] }>({});
  // State to store list of all guards from data
  const [guardList, setGuardList] = useState<IGuard[]>(data);

  // Function to organize guard assignments by date and time slot
  const normalizeAssignedShifts = (guardsData: IGuard[]): { [key: string]: IAssignedGuard[] } => {
    const assigned: { [key: string]: IAssignedGuard[] } = {};

    guardsData.forEach((guard) => {
      guard.assignedShift.forEach((shift) => {
        // Format date consistently regardless of input type
        const formattedDate =
          typeof shift.date === 'string'
            ? dayjs(shift.date).format('YYYY-MM-DD')
            : shift.date.format('YYYY-MM-DD');
        const key = `${formattedDate}-${shift.timeSlot}`;

        if (!assigned[key]) assigned[key] = [];

        // Add guard to assignments with additional shift details
        assigned[key].push({
          ...guard,
          assignedLocation: shift.location,
          day: shift.day,
          timeSlot: shift.timeSlot,
          assignedDate: shift.date,
        });
      });
    });

    return assigned;
  };

  // Initialize assigned guards data on component mount
  useEffect(() => {
    const gdata = normalizeAssignedShifts(data);
    setAssignedGuards(gdata);
  }, []);

  // Handle dropping a guard into a shift slot
  const handleDrop = (e: React.DragEvent<HTMLElement>, fullDate: string, timeSlot: string) => {
    const guard: IGuard = JSON.parse(e.dataTransfer.getData('guard'));

    // Check if guard is available for this time slot
    if (!guard.guardShiftlist.includes(timeSlot)) {
      alertDialog.onTrue();
      alert(`${guard.guardName} is not available for the ${timeSlot} shift.`);
      return;
    }

    // Check if guard is already assigned to this slot
    const key = `${fullDate}-${timeSlot}`;
    const existing = assignedGuards[key] || [];
    const alreadyAssigned = existing.some((g) => g.guardName === guard.guardName);
    if (alreadyAssigned) {
      alertDialog.onTrue();
      alert(`${guard.guardName} is already assigned to ${fullDate} - ${timeSlot}.`);
      return;
    }

    // Add guard to assignments
    setAssignedGuards((prev) => ({
      ...prev,
      [key]: [
        ...existing,
        {
          ...guard,
          assignedLocation: '',
          day: dayjs(fullDate).format('ddd'),
          timeSlot,
          assignedDate: fullDate,
        },
      ],
    }));
  };

  // Debug log for assigned guards updates
  useEffect(() => {}, [assignedGuards]);

  // Remove a guard from a shift slot
  const onDeleteGuard = (fullDate: string, timeSlot: string, guardName: string) => {
    const key = `${fullDate}-${timeSlot}`;
    setAssignedGuards((prev) => {
      const updated = { ...prev };
      updated[key] = updated[key]?.filter((g) => g.guardName !== guardName) || [];
      return updated;
    });
  };

  // Initialize drag operation for a guard
  const handleDragStart = (e: React.DragEvent<HTMLElement>, guard: IGuard) => {
    e.dataTransfer.setData('guard', JSON.stringify(guard));
  };

  // Update a guard's assigned location
  const updateLocationHandler = (
    guardName: string,
    location: string,
    fullDate: string,
    timeSlot: string
  ) => {
    const key = `${fullDate}-${timeSlot}`;

    // Update location in assigned guards
    setAssignedGuards((prev) => {
      const updated = { ...prev };

      if (!updated[key]) return prev; // No guards assigned at this key

      updated[key] = updated[key].map((g) => {
        if (g.guardName === guardName) {
          return {
            ...g,
            assignedShift: g.assignedShift.map((shift) =>
              shift.date === fullDate && shift.timeSlot === timeSlot
                ? { ...shift, location }
                : shift
            ),
          };
        }
        return g;
      });

      return updated;
    });

    // Update location in guard list
    setGuardList((prev) =>
      prev.map((g) => (g.guardName === guardName ? { ...g, assignedLocation: location } : g))
    );
  };

  // State to store dates for the current week
  const [weekDates, setWeekDates] = useState<
    { day: string; date: string; full: string; key: string }[]
  >([]);

  // Calculate and set dates for the current week on component mount
  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    const tempDates: any[] = [];

    // Generate array of dates for the week
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = dayjs(date).format('YYYY-MM-DD');
      tempDates.push({
        day: dayjs(date).format('ddd'),
        date: dayjs(date).format('DD'),
        full: dayjs(date).format('ddd DD MMM'),
        key,
      });
    }

    setWeekDates(tempDates);
  }, []);
  return (
    <>
      <Box display="flex" alignItems="center" flexDirection="row" gap={2} py="40px">
        <Grid size={{ xs: 12, md: 3 }}>
          <DatePicker
            disabled
            label="Start Date"
            format="DD-MM-YYYY"
            value={dayjs(weekDates[0]?.key)}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <DatePicker
            disabled
            label="End Date"
            format="DD-MM-YYYY"
            value={dayjs(weekDates[6]?.key)}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper elevation={6} sx={{ width: 200, height: 'fit-content' }}>
          <Box sx={{ p: 2, borderBottom: 3, borderColor: 'divider', mb: 2 }}>
            <Typography variant="h6">Guards</Typography>
          </Box>
          <Box sx={{ p: 0 }}>
            <GuardList onDragStart={handleDragStart} guardList={guardList} />
          </Box>
        </Paper>

        <Paper elevation={4} sx={{ flexGrow: 1 }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '8%' }}>Time Slot</TableCell>
                  {weekDates.map((item) => (
                    <TableCell key={item.key} align="center">
                      <div style={{ fontWeight: 'bold' }}>{item.day}</div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>{item.date}</div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {timeSlots.map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell>{timeSlot}</TableCell>
                    {weekDates.map((item) => {
                      const key = `${item.key}-${timeSlot}`;
                      return (
                        <TableCell
                          key={key}
                          onDrop={(e) =>
                            handleDrop(e as React.DragEvent<HTMLElement>, item.key, timeSlot)
                          }
                          onDragOver={(e) => e.preventDefault()}
                          sx={{ width: '10%', height: 140 }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {(assignedGuards[key] || []).map((g) => (
                              <ItemCardWithActions
                                key={g.guardName}
                                title={g.guardName}
                                subtitle="No Shift"
                                guardName={g.guardName}
                                day={item.day}
                                timeSlot={timeSlot}
                                bgColor="white"
                                locationUpdate={updateLocationHandler}
                                onDragStart={(e) =>
                                  handleDragStart(e as React.DragEvent<HTMLElement>, g)
                                }
                                actions={[
                                  {
                                    label: 'Remove',
                                    icon: 'mdi:trash',
                                    color: 'red',
                                    onClick: () => onDeleteGuard(item.key, timeSlot, g.guardName),
                                  },
                                ]}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </>
  );
};

export default GuardRosterScreen;
