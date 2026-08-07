'use client';

// ── Components ─────────────────────────────────────────────────────────────────
import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AcademicDatePicker } from 'src/components/academic-date-picker';
import { useSession } from 'next-auth/react';
import { EventBusy, MeetingRoom, CheckCircle } from '@mui/icons-material';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomTooltip from 'src/components/custom-tooltip';
import { academicPaths } from 'src/constants/academic-menu';
import { Label } from 'src/components/label';
import { CustomTabs } from 'src/components/custom-tabs';
import {
  Box,
  Tab,
  Paper,
  Stack,
  Alert,
  Button,
  Tooltip,
  IconButton,
  LinearProgress,
  Chip,
  Typography,
} from '@mui/material';

// Removed MOCK_SUMMARY
import { RoomDetailDrawer } from './components/RoomDetailDrawer';
import { RoomApprovalQueue } from './components/RoomApprovalQueue';
import { RoomAuditLogDrawer } from './components/RoomAuditLogDrawer';
import { RoomReservationsTab } from './components/RoomReservationsTab';
// Removed AIRoomAssistantPanel
import { RoomAvailabilityTable } from './components/RoomAvailabilityTable';
import { RoomMaintenanceDrawer } from './components/RoomMaintenanceDrawer';
import { DEFAULT_ROOM_AVAILABILITY_FILTERS } from './roomAvailability.constants';
import { useRoomAvailability, useRoomReservations } from './roomAvailability.hooks';
// Removed RoomAvailabilityKpiCards
import { SmartRoomReservationDrawer } from './components/SmartRoomReservationDrawer';
import { DirectRoomReservationDrawer } from './components/DirectRoomReservationDrawer';

import type {
  TabType,
  RoomReservation,
  RoomAvailabilityItem,
  RoomAvailabilityFilters,
} from './types';

type BuildingWithFloors = {
  id: string;
  buildingName: string;
  floors?: Array<{
    id: string;
    floorName?: string;
    floorNo?: string | number;
  }>;
};

const RoomAvailabilityScreen = () => {
  const { data: session } = useSession() as any;

  const isApprover = useMemo(() => {
    const role = session?.profile?.role;
    if (!role) return false;
    const roles = Array.isArray(role) ? role : [role];
    const approverRoles = ['admin', 'coordinator', 'hod', 'principal'];
    return roles.some((r: any) => typeof r === 'string' && approverRoles.includes(r.toLowerCase()));
  }, [session]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('availability');
  const [filters, setFilters] = useState<RoomAvailabilityFilters>(
    DEFAULT_ROOM_AVAILABILITY_FILTERS
  );
  const [reservationDateFilter, setReservationDateFilter] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [detailRoom, setDetailRoom] = useState<RoomAvailabilityItem | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isReservationOpen, setReservationOpen] = useState(false);
  const [prefilledRoom, setPrefilledRoom] = useState<{ roomId: string; roomName: string } | null>(
    null
  );
  const [isMaintenanceOpen, setMaintenanceOpen] = useState(false);
  const [isDirectReservationOpen, setDirectReservationOpen] = useState(false);
  const [directReservationRoom, setDirectReservationRoom] = useState<RoomAvailabilityItem | null>(
    null
  );
  const [maintenanceRoom, setMaintenanceRoom] = useState<RoomAvailabilityItem | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: 'approve' | 'reject';
  } | null>(null);

  // ── Data Hooks ─────────────────────────────────────────────────────────────
  const { data: buildingsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBuildingsQuery,
    params: undefined,
  });
  const buildings = useMemo(() => (buildingsData || []) as BuildingWithFloors[], [buildingsData]);

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
  const reservationsHook = useRoomReservations({
    isApprovalView: activeTab === 'approvals',
    createdDate: reservationDateFilter || undefined,
  });

  // Initial load
  useEffect(() => {
    availability.fetch();
    reservationsHook.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isApprover && activeTab === 'approvals') {
      setActiveTab('availability');
    }
  }, [isApprover, activeTab]);

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
    },
    [availability, reservationsHook]
  );

  const handleCancelReservation = useCallback(
    async (id: string) => {
      setPendingAction({ id, type: 'cancel' as any });
      try {
        await reservationsHook.cancelReservation(id);
        availability.fetch();
        shikshaMitraToast.success({ message: 'Reservation cancelled successfully.' });
      } finally {
        setPendingAction(null);
      }
    },
    [availability, reservationsHook]
  );

  const handleApproveReservation = useCallback(
    async (id: string): Promise<boolean> => {
      setPendingAction({ id, type: 'approve' });
      try {
        const roomName =
          reservationsHook.data.find((r) => r.id === id)?.roomName || 'Reservation';
        const ok = await reservationsHook.updateReservation(id, {
          approvalStatus: 'approved',
          status: 'active',
        });
        if (ok) {
          shikshaMitraToast.success({ message: `${roomName} reservation approved.` });
        } else {
          shikshaMitraToast.error({
            message: `Failed to approve ${roomName} reservation. Please try again.`,
          });
        }
        return ok;
      } finally {
        setPendingAction(null);
        availability.fetch();
      }
    },
    [availability, reservationsHook]
  );

  const handleRejectReservation = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      setPendingAction({ id, type: 'reject' });
      try {
        const roomName =
          reservationsHook.data.find((r) => r.id === id)?.roomName || 'Reservation';
        const ok = await reservationsHook.updateReservation(id, {
          approvalStatus: 'rejected',
          status: 'rejected',
          remarks: reason,
        });
        if (ok) {
          shikshaMitraToast.info({ message: `${roomName} reservation rejected.` });
        } else {
          shikshaMitraToast.error({
            message: `Failed to reject ${roomName} reservation. Please try again.`,
          });
        }
        return ok;
      } finally {
        setPendingAction(null);
        availability.fetch();
      }
    },
    [availability, reservationsHook]
  );

  const handleRefresh = useCallback(() => {
    availability.fetch();
    reservationsHook.fetch();
    shikshaMitraToast.success({ message: 'Data refreshed.' });
  }, [availability, reservationsHook]);

  // ── Screen Loading States ──────────────────────────────────────────────────
  const isScreenLoading =
    availability.isLoading ||
    reservationsHook.isLoading ||
    reservationsHook.isFetching ||
    reservationsHook.isMutationLoading;
  const isScreenFetching =
    availability.isFetching ||
    reservationsHook.isFetching ||
    reservationsHook.isMutationLoading;

  // ── Pending count for approval badge ──────────────────────────────────────
  const pendingCount = useMemo(
    () => reservationsHook.data.filter((r) => r.approvalStatus === 'pending').length,
    [reservationsHook.data]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: 0.5 }}>
      {/* ── Breadcrumbs & Header ─────────────────────────── */}
      <Box sx={{ flexShrink: 0 }}>
        <CustomBreadcrumbs
          sx={{ mb: 0.5 }}
          heading="Room Availability"
          description="Find free rooms, inspect conflicts, reserve rooms, and review room usage."
          links={[
            { name: 'Academic', href: academicPaths.dashboard },
            { name: 'Timetable' },
            { name: 'Room Availability' },
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Audit Trail">
                <Button
                  size="small"
                  variant={showAudit ? 'contained' : 'outlined'}
                  color="inherit"
                  startIcon={<Iconify icon={GlobalIcons.history} />}
                  onClick={() => setShowAudit((v) => !v)}
                >
                  Audit Log
                </Button>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton size="small" onClick={handleRefresh}>
                  <Iconify icon={GlobalIcons.refresh} />
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={() => handleOpenReservation()}
              >
                Reserve Room
              </Button>
            </Stack>
          }
        />
      </Box>

      {/* ── Sticky Tabs Paper (matching Learning Tasks tab styling) ───── */}
      <Paper
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          flexShrink: 0,
          borderRadius: '12px',
          p: 0.25,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          sx={{ p: 0 }}
        >
          <CustomTabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v as TabType)}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, borderRadius: '12px', p: 0 }}
            role="tablist"
          >
            <Tab
              value="availability"
              label="Availability"
              icon={<Iconify icon="mdi:meeting-room" width={20} />}
            />
            <Tab
              value="reservations"
              label="Reservations"
              icon={<Iconify icon="mdi:calendar-lock" width={20} />}
            />
            {isApprover && (
              <Tab
                value="approvals"
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
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
            )}
          </CustomTabs>

          {/* Right side: View Switcher & Filters — only for availability tab */}
          {(activeTab === 'reservations' || activeTab === 'approvals') && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 0.5 }}>
              <AcademicDatePicker
                label="Filter by Created Date"
                value={reservationDateFilter ? dayjs(reservationDateFilter) : null}
                onChange={(value) => {
                  setReservationDateFilter(value ? value.format('YYYY-MM-DD') : '');
                }}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
              />
            </Stack>
          )}

          {activeTab === 'availability' && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 0.25 }}>
              <AcademicDatePicker
                label="Date"
                value={dayjs(filters.date)}
                onChange={(value) => {
                  if (value) {
                    patchFilters({ date: value.format('YYYY-MM-DD') });
                  }
                }}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
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
      </Paper>

      {/* Screen Loading Progress Bar */}
      {isScreenFetching && (
        <LinearProgress sx={{ height: 2, borderRadius: 1, flexShrink: 0 }} color="primary" />
      )}

      {/* ── Tab Content Container with Scrollbar ──────────────────── */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {availability.error && (
              <Alert
                severity="error"
                sx={{ mb: 1 }}
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
              isLoading={availability.isLoading || availability.isFetching}
              canReserve
              canMaintenance
              canApprove={isApprover}
              onViewRoom={handleViewRoom}
              onReserveRoom={handleOpenReservation}
              onViewSchedule={handleViewSchedule}
              onMarkMaintenance={handleOpenMaintenance}
            />
          </Box>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <RoomReservationsTab
            reservations={reservationsHook.data}
            canApprove={isApprover}
            isLoading={isScreenLoading}
            pendingAction={pendingAction}
            onCancel={handleCancelReservation}
            onApprove={handleApproveReservation}
            onReject={handleRejectReservation}
            onViewRoom={handleViewRoom}
          />
        )}

        {/* Approvals Tab */}
        {isApprover && activeTab === 'approvals' && (
          <RoomApprovalQueue
            reservations={reservationsHook.data}
            isLoading={isScreenLoading}
            pendingAction={pendingAction}
            onApprove={handleApproveReservation}
            onReject={handleRejectReservation}
          />
        )}
      </Box>

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
        prefillDate={filters.date}
        onClose={() => setReservationOpen(false)}
        onSuccess={handleReservationSuccess}
      />

      {/* Direct Reservation Drawer */}
      <DirectRoomReservationDrawer
        open={isDirectReservationOpen}
        room={directReservationRoom}
        prefillDate={filters.date}
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
