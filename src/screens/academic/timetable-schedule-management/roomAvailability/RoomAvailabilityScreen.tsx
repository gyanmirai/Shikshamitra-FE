'use client';

import { Iconify } from 'src/components/iconify';
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
  Typography,
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
import { RoomAuditLogPanel } from './components/RoomAuditLogPanel';
import { RoomReservationsTab } from './components/RoomReservationsTab';
import { AIRoomAssistantPanel } from './components/AIRoomAssistantPanel';
import { RoomAvailabilityTable } from './components/RoomAvailabilityTable';
import { RoomMaintenanceDrawer } from './components/RoomMaintenanceDrawer';
import { DEFAULT_ROOM_AVAILABILITY_FILTERS } from './roomAvailability.constants';
// ── Components ─────────────────────────────────────────────────────────────────
import { RoomAvailabilityKpiCards } from './components/RoomAvailabilityKpiCards';
import { SmartRoomReservationDrawer } from './components/SmartRoomReservationDrawer';
import {
  useRoomAvailability,
  useRoomReservations,
  useRoomAvailabilitySummary,
} from './roomAvailability.hooks';
import {
  getActiveFilters,
  RoomAvailabilityActiveFilters,
  RoomAvailabilityFilters as FiltersBar,
} from './components/RoomAvailabilityFilters';

import type {
  TabType,
  ViewType,
  RoomReservation,
  RoomAvailabilityItem,
  RoomAvailabilityFilters,
} from './types';

// ── View Switcher buttons ──────────────────────────────────────────────────────
const VIEW_OPTIONS: { value: ViewType; label: string; icon: React.ReactNode }[] = [
  { value: 'table', label: 'Table', icon: <TableChart fontSize="small" /> },
  { value: 'timeline', label: 'Timeline', icon: <ViewTimeline fontSize="small" /> },
  { value: 'calendar', label: 'Calendar', icon: <CalendarMonth fontSize="small" /> },
  { value: 'floor', label: 'Floor', icon: <GridView fontSize="small" /> },
];

const RoomAvailabilityScreen = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('availability');
  const [activeView, setActiveView] = useState<ViewType>('table');
  const [filters, setFilters] = useState<RoomAvailabilityFilters>(
    DEFAULT_ROOM_AVAILABILITY_FILTERS
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [detailRoom, setDetailRoom] = useState<RoomAvailabilityItem | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isReservationOpen, setReservationOpen] = useState(false);
  const [prefilledRoom, setPrefilledRoom] = useState<{ roomId: string; roomName: string } | null>(
    null
  );
  const [isMaintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceRoom, setMaintenanceRoom] = useState<RoomAvailabilityItem | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  // ── Data Hooks ─────────────────────────────────────────────────────────────
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
      setActiveView('table');
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
    setPrefilledRoom(room ? { roomId: room.roomId, roomName: room.roomName } : null);
    setReservationOpen(true);
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
    (id: string, _reason?: string) => {
      reservationsHook.updateReservation(id, { approvalStatus: 'rejected', status: 'rejected' });
    },
    [reservationsHook]
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
            <Tab value="reports" label="Usage Report" icon={<Print />} iconPosition="start" />
          </Tabs>

          {/* Right side: View Switcher & Filters — only for availability tab */}
          {activeTab === 'availability' && (
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1 }}>
              <FiltersBar filters={filters} onChange={patchFilters} onReset={resetFilters} />

              <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />

              <Stack direction="row" spacing={0.5}>
                {VIEW_OPTIONS.map((opt) => (
                  <Tooltip key={opt.value} title={opt.label}>
                    <IconButton
                      size="small"
                      onClick={() => setActiveView(opt.value)}
                      color={activeView === opt.value ? 'primary' : 'default'}
                      sx={{
                        borderRadius: 1,
                        bgcolor: activeView === opt.value ? 'primary.lighter' : 'transparent',
                      }}
                    >
                      {opt.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>

        {/* Active Chips Row (under the borderBottom divider, inside the Card) */}
        {activeTab === 'availability' && getActiveFilters(filters).length > 0 && (
          <Box sx={{ px: 2, py: 1.25, bgcolor: 'background.neutral' }}>
            <RoomAvailabilityActiveFilters
              filters={filters}
              onChange={patchFilters}
              onReset={resetFilters}
            />
          </Box>
        )}
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

          {activeView === 'table' && (
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
          )}

          {activeView === 'timeline' && (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Today&apos;s Timeline
              </Typography>
              <RoomTimelineView
                rooms={availability.data}
                onEmptySlotClick={(roomId, _period, startTime) => {
                  const room = availability.data.find((r) => r.roomId === roomId);
                  if (room) handleOpenReservation(room);
                }}
                onBlockClick={(roomId) => handleViewRoom(roomId)}
              />
            </Card>
          )}

          {activeView === 'calendar' && (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Reservations Calendar
              </Typography>
              <RoomCalendarView
                reservations={reservationsHook.data}
                onEventClick={(r) =>
                  shikshaMitraToast.info({ message: `${r.roomName}: ${r.purpose}` })
                }
                onSlotClick={(date, startTime) => {
                  patchFilters({ date });
                  setReservationOpen(true);
                }}
              />
            </Card>
          )}

          {activeView === 'floor' && (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Floor / Building View
              </Typography>
              <RoomFloorView
                rooms={availability.data}
                onRoomClick={handleViewRoom}
                onReserveRoom={handleOpenReservation}
              />
            </Card>
          )}
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

      {/* Usage Report Tab */}
      {activeTab === 'reports' && (
        <Card sx={{ p: 2 }}>
          <RoomUsageReport />
        </Card>
      )}

      {/* ── Audit Log (floating panel) ───────────────────── */}
      {showAudit && (
        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:history" width={20} />
              <Typography variant="h6">Room Audit Trail</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setShowAudit(false)}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <RoomAuditLogPanel />
        </Card>
      )}

      {/* ── Drawers ──────────────────────────────────────── */}

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
