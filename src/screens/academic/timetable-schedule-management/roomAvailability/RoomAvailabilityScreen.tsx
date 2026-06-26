'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Add, Print, EventBusy, MeetingRoom, CalendarMonth } from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Stack,
  Button,
  Switch,
  Divider,
  TextField,
  Typography,
  IconButton,
  CardContent,
  FormControlLabel,
} from '@mui/material';

import {
  todayIso,
  classOptions,
  roomSchedules,
  teacherOptions,
  initialRoomRows,
  buildingOptions,
  roomTypeOptions,
  lectureSlotOptions,
  initialReservations,
  reservationTypeOptions,
} from './roomAvailabilityData';

import type { RoomReservationRow, RoomAvailabilityRow } from './roomAvailabilityData';

const statusColor: Record<
  RoomAvailabilityRow['status'] | RoomReservationRow['status'],
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
  Available: 'success',
  Occupied: 'warning',
  Reserved: 'info',
  Maintenance: 'error',
  Active: 'success',
  Cancelled: 'default',
};

const scheduleColor: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  Free: 'success',
  Class: 'warning',
  Exam: 'info',
  Event: 'default',
  Maintenance: 'error',
};

type ReserveFormState = {
  roomId: string;
  reservationDate: Dayjs | null;
  startTime: string;
  endTime: string;
  purpose: string;
  reservationType: string;
  reservedFor: string;
  teacherName: string;
  remarks: string;
};

const defaultReserveForm: ReserveFormState = {
  roomId: '',
  reservationDate: dayjs(todayIso),
  startTime: '10:00',
  endTime: '10:45',
  purpose: '',
  reservationType: 'Class',
  reservedFor: '',
  teacherName: '',
  remarks: '',
};

const capacityOptions = [
  { value: 0, label: 'Any Capacity' },
  { value: 30, label: '30+' },
  { value: 40, label: '40+' },
  { value: 50, label: '50+' },
  { value: 100, label: '100+' },
];

const RoomAvailabilityScreen = () => {
  const [activeTab, setActiveTab] = useState('availability');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs(todayIso));
  const [lectureSlot, setLectureSlot] = useState('p2');
  const [building, setBuilding] = useState('all');
  const [roomType, setRoomType] = useState('all');
  const [minimumCapacity, setMinimumCapacity] = useState<number | string>(0);
  const [includeOccupied, setIncludeOccupied] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('room-201');
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [reserveForm, setReserveForm] = useState<ReserveFormState>(defaultReserveForm);
  const [roomRows, setRoomRows] = useState<RoomAvailabilityRow[]>(initialRoomRows);
  const [reservations, setReservations] = useState<RoomReservationRow[]>(initialReservations);

  const roomOptions = useMemo(
    () => roomRows.map((room) => ({ value: room.roomId, label: room.roomName })),
    [roomRows]
  );

  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return roomRows.filter((room) => {
      const matchesBuilding = building === 'all' || room.buildingName === building;
      const matchesType = roomType === 'all' || room.roomTypeName === roomType;
      const matchesCapacity = room.capacity >= Number(minimumCapacity || 0);
      const matchesAvailability = includeOccupied || room.isAvailable;
      const matchesSearch =
        !normalizedSearch ||
        [room.roomName, room.roomNumber, room.buildingName, room.roomTypeName]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesBuilding && matchesType && matchesCapacity && matchesAvailability && matchesSearch
      );
    });
  }, [building, includeOccupied, minimumCapacity, roomRows, roomType, search]);

  const metrics = useMemo(() => {
    const available = roomRows.filter((room) => room.isAvailable).length;
    const occupied = roomRows.filter((room) => room.status === 'Occupied').length;
    const reserved = reservations.filter((item) => item.status === 'Active').length;
    const conflicts = roomRows.filter((room) => !room.isAvailable && room.conflictReason).length;

    return [
      { label: 'Free rooms', value: available, icon: 'mdi:door-open', color: 'success.main' },
      {
        label: 'Occupied rooms',
        value: occupied,
        icon: 'mdi:calendar-clock',
        color: 'warning.main',
      },
      {
        label: 'Active reservations',
        value: reserved,
        icon: 'mdi:calendar-check',
        color: 'info.main',
      },
      {
        label: 'Conflicts visible',
        value: conflicts,
        icon: 'mdi:alert-circle-outline',
        color: 'error.main',
      },
    ];
  }, [reservations, roomRows]);

  const openReserveDialog = useCallback((room?: RoomAvailabilityRow) => {
    setReservationError('');
    setReserveForm({
      ...defaultReserveForm,
      roomId: room?.roomId ?? '',
      reservationDate: dayjs(todayIso),
    });
    setReserveDialogOpen(true);
  }, []);

  const handleSaveReservation = useCallback(() => {
    if (
      !reserveForm.roomId ||
      !reserveForm.reservationDate ||
      !reserveForm.startTime ||
      !reserveForm.endTime
    ) {
      setReservationError('Room, date, start time and end time are required.');
      return;
    }

    if (reserveForm.endTime <= reserveForm.startTime) {
      setReservationError('End time must be greater than start time.');
      return;
    }

    const selectedRoom = roomRows.find((room) => room.roomId === reserveForm.roomId);
    if (selectedRoom && !selectedRoom.isAvailable) {
      setReservationError(selectedRoom.conflictReason || 'Selected room is not available.');
      return;
    }

    const reservationDate = reserveForm.reservationDate.format('YYYY-MM-DD');
    const overlapsExisting = reservations.some(
      (reservation) =>
        reservation.status === 'Active' &&
        reservation.roomId === reserveForm.roomId &&
        reservation.reservationDate === reservationDate &&
        reserveForm.startTime < reservation.endTime &&
        reserveForm.endTime > reservation.startTime
    );

    if (overlapsExisting) {
      setReservationError('This room already has an overlapping reservation.');
      return;
    }

    const roomName = selectedRoom?.roomName ?? 'Selected room';
    const nextReservation: RoomReservationRow = {
      id: `res-${Date.now()}`,
      roomId: reserveForm.roomId,
      roomName,
      reservationDate,
      startTime: reserveForm.startTime,
      endTime: reserveForm.endTime,
      purpose: reserveForm.purpose || 'Manual reservation',
      reservationType: reserveForm.reservationType,
      reservedFor: reserveForm.reservedFor || '-',
      teacherName: reserveForm.teacherName || '-',
      status: 'Active',
      remarks: reserveForm.remarks,
    };

    setReservations((current) => [nextReservation, ...current]);
    setRoomRows((current) =>
      current.map((room) =>
        room.roomId === reserveForm.roomId
          ? {
              ...room,
              isAvailable: false,
              status: 'Reserved',
              conflictReason: `Reserved for ${nextReservation.purpose}`,
              reservationPurpose: nextReservation.purpose,
              currentAssignmentSource: 'Room Reservation',
            }
          : room
      )
    );
    setReserveDialogOpen(false);
    shikshaMitraToast.success({ message: 'Room reservation saved with conflict check.' });
  }, [reservations, reserveForm, roomRows]);

  const handleCancelReservation = useCallback(
    (reservationId: string) => {
      const reservation = reservations.find((item) => item.id === reservationId);
      setReservations((current) =>
        current.map((item) => (item.id === reservationId ? { ...item, status: 'Cancelled' } : item))
      );
      if (reservation) {
        setRoomRows((current) =>
          current.map((room) =>
            room.roomId === reservation.roomId &&
            room.currentAssignmentSource === 'Room Reservation'
              ? {
                  ...room,
                  isAvailable: true,
                  status: 'Available',
                  conflictReason: undefined,
                  reservationPurpose: undefined,
                  currentAssignmentSource: 'Free',
                }
              : room
          )
        );
      }
      shikshaMitraToast.info({ message: 'Reservation cancelled. Audit record remains visible.' });
    },
    [reservations]
  );

  const renderStatus = (status: RoomAvailabilityRow['status'] | RoomReservationRow['status']) => (
    <Chip label={status} size="small" color={statusColor[status]} variant="soft" />
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Room Availability"
        description="Find free rooms, inspect conflicts, reserve rooms, and review daily room usage."
        links={[
          { name: 'Academic', href: '/academic/dashboard' },
          { name: 'Timetable' },
          { name: 'Room Availability' },
        ]}
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            onClick={() => openReserveDialog()}
          >
            Reserve Room
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {metrics.map((item) => (
          <Card key={item.label} sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: 'grid',
                  borderRadius: 1.5,
                  placeItems: 'center',
                  color: item.color,
                  bgcolor: 'action.hover',
                }}
              >
                <Iconify icon={item.icon} width={24} />
              </Box>
              <Box>
                <Typography variant="h4">{item.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ lg: 'center' }}>
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
            slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
          />
          <CustomSelect
            label="Lecture Slot"
            options={lectureSlotOptions}
            value={lectureSlot}
            onChange={(value) => setLectureSlot(value as string)}
            formControlProps={{ sx: { minWidth: 230 } }}
          />
          <CustomSelect
            label="Building"
            options={buildingOptions}
            value={building}
            onChange={(value) => setBuilding(value as string)}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Room Type"
            options={roomTypeOptions}
            value={roomType}
            onChange={(value) => setRoomType(value as string)}
            formControlProps={{ sx: { minWidth: 160 } }}
          />
          <CustomSelect
            label="Min Capacity"
            options={capacityOptions}
            value={minimumCapacity}
            onChange={(value) => setMinimumCapacity(value as string | number)}
            formControlProps={{ sx: { minWidth: 130 } }}
          />
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: '100%', lg: 180 } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={includeOccupied}
                onChange={(event) => setIncludeOccupied(event.target.checked)}
              />
            }
            label="Include occupied"
          />
        </Stack>
      </Card>

      <Card>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ px: 2 }}>
          <Tab
            value="availability"
            label="Availability"
            icon={<MeetingRoom />}
            iconPosition="start"
          />
          <Tab
            value="schedule"
            label="Room Schedule"
            icon={<CalendarMonth />}
            iconPosition="start"
          />
          <Tab
            value="reservations"
            label="Reservations"
            icon={<EventBusy />}
            iconPosition="start"
          />
          <Tab value="reports" label="Usage Report" icon={<Print />} iconPosition="start" />
        </Tabs>
      </Card>

      {activeTab === 'availability' && (
        <CustomizableTable
          tableId="room-availability-table"
          tableTitle="Room Availability"
          data={filteredRooms}
          columns={[
            { id: 'roomName', label: 'Room', minWidth: 140, sticky: true },
            { id: 'buildingName', label: 'Building', minWidth: 120 },
            { id: 'roomTypeName', label: 'Type', minWidth: 130 },
            { id: 'capacity', label: 'Capacity', filterType: 'number', minWidth: 100 },
            {
              id: 'status',
              label: 'Status',
              minWidth: 120,
              render: (value) => renderStatus(value),
            },
            {
              id: 'occupiedByClass',
              label: 'Occupied By',
              minWidth: 220,
              render: (_value, row) =>
                row.occupiedByClass
                  ? `${row.occupiedByClass} - ${row.occupiedBySubject} (${row.occupiedByTeacher})`
                  : row.reservationPurpose || '-',
            },
            {
              id: 'conflictReason',
              label: 'Conflict Reason',
              minWidth: 230,
              render: (value) => value || 'No conflict',
            },
            {
              id: 'currentAssignmentSource',
              label: 'Source',
              minWidth: 150,
              render: (value) => value || '-',
            },
            {
              id: 'actions',
              label: 'Action',
              isSort: false,
              isFilter: false,
              minWidth: 150,
              sticky: true,
              stickyPosition: 'right',
              render: (_value, row) => (
                <Stack direction="row" justifyContent="center" spacing={0.5}>
                  <IconButton
                    size="small"
                    title="View room schedule"
                    onClick={() => {
                      setSelectedRoomId(row.roomId);
                      setActiveTab('schedule');
                    }}
                  >
                    <Iconify icon={GlobalIcons.eye} />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Reserve room"
                    disabled={!row.isAvailable}
                    onClick={() => openReserveDialog(row as RoomAvailabilityRow)}
                  >
                    <Iconify icon={GlobalIcons.reservation} />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Assign to timetable slot"
                    disabled={!row.isAvailable}
                    onClick={() =>
                      shikshaMitraToast.success({
                        message: `${row.roomName} is ready to assign to a timetable slot.`,
                      })
                    }
                  >
                    <Iconify icon={GlobalIcons.assignedRoute} />
                  </IconButton>
                </Stack>
              ),
            },
          ]}
        />
      )}

      {activeTab === 'schedule' && (
        <Card sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <CustomSelect
              label="Room"
              options={roomOptions}
              value={selectedRoomId}
              onChange={(value) => setSelectedRoomId(value as string)}
              formControlProps={{ sx: { maxWidth: 280 } }}
            />
            <DatePicker
              label="Date / Week"
              value={selectedDate}
              onChange={setSelectedDate}
              slotProps={{ textField: { size: 'small', sx: { maxWidth: 180 } } }}
            />
          </Stack>
          <Stack spacing={1.25}>
            {(roomSchedules[selectedRoomId] || []).map((slot) => (
              <Box
                key={slot.period}
                sx={{
                  p: 1.5,
                  display: 'grid',
                  gap: 1,
                  borderRadius: 1,
                  alignItems: 'center',
                  gridTemplateColumns: { xs: '1fr', sm: '160px 140px 1fr auto' },
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2">{slot.period}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {slot.time}
                </Typography>
                <Typography variant="body2">{slot.details}</Typography>
                <Chip
                  label={slot.status}
                  size="small"
                  color={scheduleColor[slot.status]}
                  variant="soft"
                />
              </Box>
            ))}
          </Stack>
        </Card>
      )}

      {activeTab === 'reservations' && (
        <CustomizableTable
          tableId="room-reservations-table"
          tableTitle="Room Reservations"
          data={reservations}
          columns={[
            { id: 'roomName', label: 'Room', minWidth: 140, sticky: true },
            { id: 'reservationDate', label: 'Date', filterType: 'date', minWidth: 120 },
            { id: 'startTime', label: 'Start', minWidth: 90 },
            { id: 'endTime', label: 'End', minWidth: 90 },
            { id: 'purpose', label: 'Purpose', minWidth: 220 },
            { id: 'reservationType', label: 'Type', minWidth: 120 },
            { id: 'reservedFor', label: 'Reserved For', minWidth: 140 },
            {
              id: 'status',
              label: 'Status',
              minWidth: 110,
              render: (value) => renderStatus(value),
            },
            {
              id: 'actions',
              label: 'Action',
              minWidth: 90,
              isSort: false,
              isFilter: false,
              sticky: true,
              stickyPosition: 'right',
              render: (_value, row) => (
                <IconButton
                  size="small"
                  title="Cancel reservation"
                  disabled={row.status !== 'Active'}
                  onClick={() => handleCancelReservation(row.id)}
                >
                  <Iconify icon={GlobalIcons.cancel} />
                </IconButton>
              ),
            },
          ]}
        />
      )}

      {activeTab === 'reports' && (
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Room Usage Report
          </Typography>
          <CustomizableTable
            tableId="room-usage-report-table"
            tableTitle="Room Usage Report"
            data={roomRows.map((room) => ({
              ...room,
              totalAvailablePeriods: 5,
              occupiedPeriods: room.isAvailable ? 1 : 3,
              freePeriods: room.isAvailable ? 4 : 2,
              utilization: room.isAvailable ? '20%' : '60%',
              mainUsageType: room.roomTypeName,
            }))}
            columns={[
              { id: 'roomName', label: 'Room', minWidth: 140 },
              { id: 'buildingName', label: 'Building', minWidth: 120 },
              { id: 'roomTypeName', label: 'Room Type', minWidth: 130 },
              {
                id: 'totalAvailablePeriods',
                label: 'Total Periods',
                filterType: 'number',
                minWidth: 120,
              },
              { id: 'occupiedPeriods', label: 'Occupied', filterType: 'number', minWidth: 110 },
              { id: 'freePeriods', label: 'Free', filterType: 'number', minWidth: 90 },
              { id: 'utilization', label: 'Utilization %', minWidth: 120 },
              { id: 'mainUsageType', label: 'Main Usage Type', minWidth: 160 },
            ]}
          />
        </Card>
      )}

      <CustomDialog
        open={reserveDialogOpen}
        title="Reserve Room"
        maxWidth="md"
        handleClose={() => setReserveDialogOpen(false)}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {reservationError && (
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'error.lighter', color: 'error.dark' }}>
                <Typography variant="body2">{reservationError}</Typography>
              </Box>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Room"
                options={roomOptions}
                value={reserveForm.roomId}
                onChange={(value) =>
                  setReserveForm((current) => ({ ...current, roomId: value as string }))
                }
              />
              <DatePicker
                label="Date"
                value={reserveForm.reservationDate}
                onChange={(value) =>
                  setReserveForm((current) => ({ ...current, reservationDate: value }))
                }
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                label="Start Time"
                type="time"
                value={reserveForm.startTime}
                onChange={(event) =>
                  setReserveForm((current) => ({ ...current, startTime: event.target.value }))
                }
                fullWidth
              />
              <TextField
                size="small"
                label="End Time"
                type="time"
                value={reserveForm.endTime}
                onChange={(event) =>
                  setReserveForm((current) => ({ ...current, endTime: event.target.value }))
                }
                fullWidth
              />
            </Stack>
            <TextField
              size="small"
              label="Purpose"
              value={reserveForm.purpose}
              onChange={(event) =>
                setReserveForm((current) => ({ ...current, purpose: event.target.value }))
              }
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Reservation Type"
                options={reservationTypeOptions}
                value={reserveForm.reservationType}
                onChange={(value) =>
                  setReserveForm((current) => ({ ...current, reservationType: value as string }))
                }
              />
              <CustomSelect
                label="Class / Event"
                options={classOptions}
                value={reserveForm.reservedFor}
                onChange={(value) =>
                  setReserveForm((current) => ({ ...current, reservedFor: value as string }))
                }
              />
              <CustomSelect
                label="Teacher / Staff"
                options={teacherOptions}
                value={reserveForm.teacherName}
                onChange={(value) =>
                  setReserveForm((current) => ({ ...current, teacherName: value as string }))
                }
              />
            </Stack>
            <TextField
              size="small"
              label="Remarks"
              value={reserveForm.remarks}
              onChange={(event) =>
                setReserveForm((current) => ({ ...current, remarks: event.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogScrollContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setReserveDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveReservation}>
            Check Conflict & Save
          </Button>
        </Stack>
      </CustomDialog>
    </Box>
  );
};

export default RoomAvailabilityScreen;
