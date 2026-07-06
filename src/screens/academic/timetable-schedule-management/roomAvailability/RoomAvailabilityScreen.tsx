'use client';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Stack,
  Alert,
  Button,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Add,
  Print,
  GridView,
  EventBusy,
  TableChart,
  MeetingRoom,
  CheckCircle,
  ViewTimeline,
  CalendarMonth,
} from '@mui/icons-material';

import { MOCK_SUMMARY } from './roomAvailability.mock';
import { RoomFloorView } from './components/RoomFloorView';
import { RoomUsageReport } from './components/RoomUsageReport';
import { RoomDetailDrawer } from './components/RoomDetailDrawer';
import { RoomTimelineView } from './components/RoomTimelineView';
import { RoomCalendarView } from './components/RoomCalendarView';
import { RoomApprovalQueue } from './components/RoomApprovalQueue';
import { RoomAuditLogDrawer } from './components/RoomAuditLogDrawer';
import { RoomReservationsTab } from './components/RoomReservationsTab';
import { AIRoomAssistantPanel } from './components/AIRoomAssistantPanel';
import { RoomAvailabilityTable } from './components/RoomAvailabilityTable';
import { RoomMaintenanceDrawer } from './components/RoomMaintenanceDrawer';
import { DEFAULT_ROOM_AVAILABILITY_FILTERS } from './roomAvailability.constants';
// ── Components ─────────────────────────────────────────────────────────────────
import { RoomAvailabilityKpiCards } from './components/RoomAvailabilityKpiCards';
import { SmartRoomReservationDrawer } from './components/SmartRoomReservationDrawer';
import { DirectRoomReservationDrawer } from './components/DirectRoomReservationDrawer';
import {
  useRoomAvailability,
  useRoomReservations,
  useRoomAvailabilitySummary,
} from './roomAvailability.hooks';
import dayjs from 'dayjs';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import type {
  TabType,
  RoomReservation,
  RoomAvailabilityItem,
  RoomAvailabilityFilters,
} from './types';

const RoomAvailabilityScreen = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('availability');
  const [filters, setFilters] = useState<RoomAvailabilityFilters>(
    DEFAULT_ROOM_AVAILABILITY_FILTERS
  );
  const [startDate, setStartDate] = useState<any>(dayjs(DEFAULT_ROOM_AVAILABILITY_FILTERS.date));
  const [endDate, setEndDate] = useState<any>(dayjs(DEFAULT_ROOM_AVAILABILITY_FILTERS.date));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [detailRoom, setDetailRoom] = useState<RoomAvailabilityItem | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isReservationOpen, setReservationOpen] = useState(false);
  const [prefilledRoom, setPrefilledRoom] = useState<{ roomId: string; roomName: string } | null>(
    null
  );
  const [isMaintenanceOpen, setMaintenanceOpen] = useState(false);
  const [isDirectReservationOpen, setDirectReservationOpen] = useState(false);
  const [directReservationRoom, setDirectReservationRoom] = useState<RoomAvailabilityItem | null>(null);
  const [maintenanceRoom, setMaintenanceRoom] = useState<RoomAvailabilityItem | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  // ── Data Hooks ─────────────────────────────────────────────────────────────
  const { data: buildingsData } = useGetBuildingsQuery(undefined);
  const buildings = buildingsData || [];

  const buildingOptions = useMemo(() => {
    const list = buildings.map((b) => ({
      value: b.id,
      label: b.buildingName,
    }));
    return [{ value: 'all', label: 'All Buildings' }, ...list];
  }, [buildings]);

  const floorOptions = useMemo(() => {
    if (!filters.building || filters.building === 'all') {
      return [{ value: 'all', label: 'Select Building' }];
    }
    const selectedBuildingObj = buildings.find((b) => b.id === filters.building);
    const floorsList = selectedBuildingObj?.floors || [];
    const list = floorsList.map((f: any) => ({
      value: f.id,
      label: f.floorName || `Floor ${f.floorNo}`,
    }));
    return [{ value: 'all', label: 'All Floors' }, ...list];
  }, [buildings, filters.building]);

  const availability = useRoomAvailability(filters);
  const summary = useRoomAvailabilitySummary();
  const reservationsHook = useRoomReservations();

  // Initial load
  useEffect(() => {
    availability.fetch();
    summary.fetch();
    reservationsHook.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch availability when filters change
  useEffect(() => {
    availability.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const patchFilters = useCallback((patch: Partial<RoomAvailabilityFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_ROOM_AVAILABILITY_FILTERS);
  }, []);

  // KPI card click → apply filter + jump to availability tab
  const handleKpiFilter = useCallback(
    (patch: Partial<RoomAvailabilityFilters>) => {
      patchFilters(patch);
      setActiveTab('availability');
    },
    [patchFilters]
  );

  // ── Room actions ───────────────────────────────────────────────────────────
  const handleViewRoom = useCallback(
    (roomId: string) => {
      const room = availability.data.find((r) => r.roomId === roomId) || null;
      setDetailRoom(room);
      setDetailOpen(true);
    },
    [availability.data]
  );

  const handleOpenReservation = useCallback((room?: RoomAvailabilityItem) => {
    if (room) {
      setDirectReservationRoom(room);
      setDirectReservationOpen(true);
    } else {
      setPrefilledRoom(null);
      setReservationOpen(true);
    }
  }, []);

  const handleViewSchedule = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('availability');
    shikshaMitraToast.info({ message: 'Scroll to room schedule in table view.' });
  }, []);

  const handleOpenMaintenance = useCallback((room: RoomAvailabilityItem) => {
    setMaintenanceRoom(room);
    setMaintenanceOpen(true);
  }, []);

  const handleReservationSuccess = useCallback(
    (reservation: RoomReservation) => {
      reservationsHook.addReservation(reservation);
      availability.fetch();
      summary.fetch();
    },
    [availability, reservationsHook, summary]
  );

  const handleCancelReservation = useCallback(
    (id: string) => {
      reservationsHook.cancelReservation(id);
      availability.fetch();
      shikshaMitraToast.info({ message: 'Reservation cancelled. Audit record remains visible.' });
    },
    [availability, reservationsHook]
  );

  const handleApproveReservation = useCallback(
    (id: string) => {
      reservationsHook.updateReservation(id, { approvalStatus: 'approved', status: 'active' });
      availability.fetch();
    },
    [availability, reservationsHook]
  );

  const handleRejectReservation = useCallback(
    (id: string, reason?: string) => {
      reservationsHook.updateReservation(id, {
        approvalStatus: 'rejected',
        status: 'rejected',
        remarks: reason,
      });
      availability.fetch();
    },
    [availability, reservationsHook]
  );

  const handleRefresh = useCallback(() => {
    availability.fetch();
    summary.fetch();
    reservationsHook.fetch();
    shikshaMitraToast.success({ message: 'Data refreshed.' });
  }, [availability, reservationsHook, summary]);

  // ── Pending count for approval badge ──────────────────────────────────────
  const pendingCount = useMemo(
    () => reservationsHook.data.filter((r) => r.approvalStatus === 'pending').length,
    [reservationsHook.data]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4 }}>
      {/* ── Breadcrumbs & Header ─────────────────────────── */}
      <CustomBreadcrumbs
        heading="Room Availability"
        description="Find free rooms, inspect conflicts, reserve rooms, and review room usage."
        links={[
          { name: 'Academic', href: '/academic/dashboard' },
          { name: 'Timetable' },
          { name: 'Room Availability' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="AI Room Assistant">
              <Button
                size="small"
                variant={showAI ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<Iconify icon="mdi:robot-outline" />}
                onClick={() => setShowAI((v) => !v)}
              >
                AI Assistant
              </Button>
            </Tooltip>
            <Tooltip title="Audit Trail">
              <Button
                size="small"
                variant={showAudit ? 'contained' : 'outlined'}
                color="inherit"
                startIcon={<Iconify icon="mdi:history" />}
                onClick={() => setShowAudit((v) => !v)}
              >
                Audit Log
              </Button>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton size="small" onClick={handleRefresh}>
                <Iconify icon="mdi:refresh" />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenReservation()}
            >
              Reserve Room
            </Button>
          </Stack>
        }
      />

      {/* ── AI Assistant Panel ───────────────────────────── */}
      {showAI && (
        <AIRoomAssistantPanel
          onReserveRoom={(roomId) => {
            const room = availability.data.find((r) => r.roomId === roomId);
            if (room) handleOpenReservation(room);
          }}
        />
      )}

      {/* ── KPI Cards ────────────────────────────────────── */}
      <RoomAvailabilityKpiCards
        summary={summary.data || MOCK_SUMMARY}
        isLoading={summary.isLoading}
        onFilterClick={handleKpiFilter}
      />

      {/* ── Tabs ─────────────────────────────────────────── */}
      <Card>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v as TabType)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              value="availability"
              label="Availability"
              icon={<MeetingRoom />}
              iconPosition="start"
            />
            <Tab
              value="reservations"
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <span>Reservations</span>
                </Stack>
              }
              icon={<EventBusy />}
              iconPosition="start"
            />
            <Tab
              value="approvals"
              label={
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <CheckCircle fontSize="small" />
                  <span>Approvals</span>
                  {pendingCount > 0 && (
                    <Chip
                      size="small"
                      label={pendingCount}
                      color="warning"
                      sx={{ height: 18, fontSize: 10 }}
                    />
                  )}
                </Stack>
              }
            />
          </Tabs>

          {/* Right side: View Switcher & Filters — only for availability tab */}
          {activeTab === 'availability' && (
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1 }}>
              <CustomDateRangePicker
                label="Select Date Range"
                value={[startDate, endDate]}
                dateFormat="DD/MM/YYYY"
                onChange={(value) => {
                  setStartDate(value[0]);
                  setEndDate(value[1]);
                  if (value[0]) {
                    patchFilters({ date: value[0].format('YYYY-MM-DD') });
                  }
                }}
              />

              <CustomSelect
                label="Building"
                options={buildingOptions}
                value={filters.building}
                onChange={(v) => {
                  patchFilters({ building: v as string, floor: 'all' });
                }}
                formControlProps={{ size: 'small', sx: { minWidth: 150 } }}
              />

              <CustomSelect
                label="Floor"
                options={floorOptions}
                value={filters.floor}
                onChange={(v) => {
                  patchFilters({ floor: v as string });
                }}
                formControlProps={{ size: 'small', sx: { minWidth: 120 } }}
                disabled={filters.building === 'all'}
              />
            </Stack>
          )}
        </Stack>

        {/* Border divider placeholder */}
      </Card>

      {/* ── Tab Content ──────────────────────────────────── */}

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <>
          {availability.error && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={availability.fetch}>
                  Retry
                </Button>
              }
            >
              {availability.error}
            </Alert>
          )}

          <RoomAvailabilityTable
            data={availability.data}
            isLoading={availability.isLoading}
            canReserve
            canMaintenance
            canApprove
            onViewRoom={handleViewRoom}
            onReserveRoom={handleOpenReservation}
            onViewSchedule={handleViewSchedule}
            onMarkMaintenance={handleOpenMaintenance}
          />
        </>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <Card sx={{ p: 2 }}>
          <RoomReservationsTab
            reservations={reservationsHook.data}
            canApprove
            onCancel={handleCancelReservation}
            onApprove={handleApproveReservation}
            onReject={handleRejectReservation}
            onViewRoom={handleViewRoom}
          />
        </Card>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <Card sx={{ p: 2 }}>
          <RoomApprovalQueue
            reservations={reservationsHook.data}
            onApprove={handleApproveReservation}
            onReject={handleRejectReservation}
          />
        </Card>
      )}


      {/* ── Drawers ──────────────────────────────────────── */}

      {/* Audit Log Drawer */}
      <RoomAuditLogDrawer
        open={showAudit}
        onClose={() => setShowAudit(false)}
        rooms={availability.data}
      />

      {/* Room Detail Drawer */}
      <RoomDetailDrawer
        open={isDetailOpen}
        room={detailRoom}
        onClose={() => setDetailOpen(false)}
        onReserve={(room) => {
          setDetailOpen(false);
          handleOpenReservation(room);
        }}
        onMaintenance={(room) => {
          setDetailOpen(false);
          handleOpenMaintenance(room);
        }}
        onViewFullSchedule={(roomId) => {
          setDetailOpen(false);
          setSelectedRoomId(roomId);
        }}
      />

      {/* Smart Reservation Drawer */}
      <SmartRoomReservationDrawer
        open={isReservationOpen}
        prefilledRoom={prefilledRoom}
        onClose={() => setReservationOpen(false)}
        onSuccess={handleReservationSuccess}
      />

      {/* Direct Reservation Drawer */}
      <DirectRoomReservationDrawer
        open={isDirectReservationOpen}
        room={directReservationRoom}
        onClose={() => {
          setDirectReservationOpen(false);
          setDirectReservationRoom(null);
        }}
        onSuccess={handleReservationSuccess}
      />

      {/* Maintenance Drawer */}
      <RoomMaintenanceDrawer
        open={isMaintenanceOpen}
        room={maintenanceRoom}
        onClose={() => setMaintenanceOpen(false)}
        onSuccess={() => {
          availability.fetch();
          shikshaMitraToast.success({ message: 'Maintenance block added.' });
        }}
      />
    </Box>
  );
};

export default RoomAvailabilityScreen;
