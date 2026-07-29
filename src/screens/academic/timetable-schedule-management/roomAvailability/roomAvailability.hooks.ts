'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useCallback } from 'react';

import { MOCK_AI_PARSE_RESULT } from './roomAvailability.mock';
import {
  useGetReservationsQuery,
  useGetRoomScheduleQuery,
  useGetRoomAuditLogsQuery,
  useGetRoomUsageReportQuery,
  useGetRoomAvailabilityQuery,
  useCheckRoomConflictsMutation,
  useCreateRoomReservationMutation,
  useUpdateRoomReservationMutation,
  useCancelRoomReservationMutation,
  useRejectRoomReservationMutation,
  useApproveRoomReservationMutation,
  useCreateMaintenanceBlockMutation,
  useSuggestAlternativeRoomsMutation,
} from '../../../../redux/academicAPI/timetableApi/roomAvailabilityApi';

import type {
  RoomSchedule,
  AuditLogEntry,
  SuggestedRoom,
  ConflictCheck,
  AIParseResult,
  RoomReservation,
  UsageReportData,
  MaintenanceBlock,
  RoomAvailabilityItem,
  ReservationRequirements,
  RoomAvailabilityFilters,
} from './types';

const fakeDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

const RESERVATION_TYPE_MAP: Record<string, number> = {
  class: 1,
  practical: 2,
  exam: 3,
  meeting: 4,
  event: 5,
  maintenance: 6,
  other: 7,
};

const REVERSE_RESERVATION_TYPE_MAP: Record<number | string, string> = {
  1: 'class',
  2: 'practical',
  3: 'exam',
  4: 'meeting',
  5: 'event',
  6: 'maintenance',
  7: 'other',
  class: 'class',
  practical: 'practical',
  exam: 'exam',
  meeting: 'meeting',
  event: 'event',
  maintenance: 'maintenance',
  other: 'other',
};

// ─── useRoomAvailability ──────────────────────────────────────────────────────
export function useRoomAvailability(filters?: Partial<RoomAvailabilityFilters>) {
  const params = {
    date: filters?.date,
    startTime: filters?.startTime,
    endTime: filters?.endTime,
    buildingId: filters?.building === 'all' || !filters?.building ? undefined : filters?.building,
    floorId: filters?.floor === 'all' || !filters?.floor ? undefined : filters?.floor,
    minimumCapacity: filters?.minimumCapacity,
    includeOccupied: filters?.includeOccupied ?? true,
    search: filters?.search,
  };

  const { data, isLoading, isError, refetch, isFetching } = useGetRoomAvailabilityQuery(params);
  const roomAvailabilityData = (data || []) as RoomAvailabilityItem[];

  return {
    data: roomAvailabilityData,
    isLoading,
    error: isError ? 'Failed to load room availability.' : null,
    refetch,
    fetch: refetch,
    isFetching,
  };
}

// Removed useRoomAvailabilitySummary hook

// ─── useRoomSchedule ──────────────────────────────────────────────────────────
export function useRoomSchedule(roomId: string | null, dateStr?: string) {
  const queryDate = dateStr || dayjs().format('YYYY-MM-DD');
  const { data, isLoading, isError, refetch } = useGetRoomScheduleQuery(
    { roomId, date: queryDate },
    { skip: !roomId }
  );

  return {
    data: (data || null) as RoomSchedule | null,
    isLoading,
    error: isError ? 'Failed to load room schedule.' : null,
    refetch,
    fetch: refetch,
  };
}

// ─── useRoomDetails ───────────────────────────────────────────────────────────
export function useRoomDetails(roomId: string | null) {
  const {
    data: list,
    isLoading,
    isError,
    refetch,
  } = useGetRoomAvailabilityQuery(undefined, { skip: !roomId });
  const rooms = (list || []) as RoomAvailabilityItem[];
  const found = rooms.find((r) => r.roomId === roomId) || null;

  return {
    data: found,
    isLoading,
    error: isError ? 'Failed to load room details.' : null,
    refetch,
    fetch: refetch,
  };
}

// ─── useRoomReservations ──────────────────────────────────────────────────────
export function useRoomReservations() {
  const { data, isLoading, isError, refetch } = useGetReservationsQuery(undefined);
  const [cancelReservation] = useCancelRoomReservationMutation();
  const [approveReservation] = useApproveRoomReservationMutation();
  const [rejectReservation] = useRejectRoomReservationMutation();

  const handleCancel = useCallback(
    async (id: string, reason?: string) => {
      await cancelReservation({ id, reason: reason || 'Cancelled by user' }).unwrap();
      refetch();
    },
    [cancelReservation, refetch]
  );

  // Returns true on success, false on failure. Callers own the user-facing
  // success/error messaging; we only surface the outcome so they can react.
  const handleUpdate = useCallback(
    async (id: string, payload: any): Promise<boolean> => {
      try {
        if (payload.approvalStatus === 'approved') {
          await approveReservation(id).unwrap();
        } else if (payload.approvalStatus === 'rejected') {
          await rejectReservation({ id, reason: payload.remarks }).unwrap();
        } else {
          return false;
        }
        refetch();
        return true;
      } catch {
        return false;
      }
    },
    [approveReservation, rejectReservation, refetch]
  );

  const mapped = useMemo<RoomReservation[]>(() => {
    if (!data) return [];
    return data.map((r: any) => ({
      id: r.id,
      roomId: r.roomId,
      roomName: r.roomName || '',
      buildingName: r.buildingName || '',
      date: r.date ? r.date.split('T')[0] : '',
      startTime: r.startTime ? r.startTime.substring(0, 5) : '',
      endTime: r.endTime ? r.endTime.substring(0, 5) : '',
      purpose: r.purpose || '',
      reservationType: (REVERSE_RESERVATION_TYPE_MAP[r.reservationType] as any) || 'other',
      requestedBy: r.requestedBy || '',
      status:
        r.status === 1
          ? 'draft'
          : r.status === 2
            ? 'pendingApproval'
            : r.status === 7
              ? 'cancelled'
              : r.status === 8
                ? 'rejected'
                : 'active',
      approvalStatus:
        r.status === 3 || r.status === 4
          ? 'approved'
          : r.status === 8
            ? 'rejected'
            : r.status === 2
              ? 'pending'
              : 'none',
      createdAt: r.creationTime || '',
      remarks: r.remarks,
      isRecurring: r.isRecurring,
      recurringUntilDate: r.recurringUntilDate ? r.recurringUntilDate.split('T')[0] : undefined,
    }));
  }, [data]);

  return {
    data: mapped,
    isLoading,
    error: isError ? 'Failed to load reservations.' : null,
    refetch,
    fetch: refetch,
    addReservation: (res?: any) => refetch(),
    updateReservation: handleUpdate,
    cancelReservation: handleCancel,
  };
}

// ─── useRoomUsageReport ───────────────────────────────────────────────────────
export function useRoomUsageReport() {
  const { data, isLoading, isError, refetch } = useGetRoomUsageReportQuery(undefined);

  return {
    data: (data || []) as UsageReportData[],
    isLoading,
    error: isError ? 'Failed to load usage report.' : null,
    refetch,
    fetch: refetch,
  };
}

// ─── useRoomAuditLogs ─────────────────────────────────────────────────────────
export function useRoomAuditLogs(roomId?: string | null, options?: { skip?: boolean }) {
  const { data, isLoading, isError, refetch } = useGetRoomAuditLogsQuery(roomId || undefined, {
    skip: options?.skip,
  });

  return {
    data: (data || []) as AuditLogEntry[],
    isLoading,
    error: isError ? 'Failed to load audit logs.' : null,
    refetch,
    fetch: refetch,
    addLog: () => {},
  };
}

// ─── useRoomSuggestions ───────────────────────────────────────────────────────
export function useRoomSuggestions() {
  const [suggestRooms, { isLoading, isError }] = useSuggestAlternativeRoomsMutation();
  const [localData, setLocalData] = useState<SuggestedRoom[]>([]);

  const suggest = useCallback(
    async (requirements: ReservationRequirements) => {
      try {
        const payload = {
          date: requirements.date,
          startTime: requirements.startTime,
          endTime: requirements.endTime,
          requiredCapacity: requirements.requiredCapacity || 0,
          requiredFacilities: requirements.requiredFacilities,
          preferredBuildingId: requirements.preferredBuilding,
          standardId: undefined,
        };
        const response = await suggestRooms(payload).unwrap();

        const mapped = response.map((r: any) => ({
          roomId: r.roomId,
          roomName: r.roomName,
          buildingName: 'Main Building',
          floorName: 'First Floor',
          type: 'Classroom',
          capacity: r.capacity,
          facilities: r.features || [],
          availability: r.conflictStatus === 'critical' ? 'none' : 'full',
          matchScore: r.matchScore,
          reason: r.reason,
          conflictStatus:
            r.conflictStatus === 'critical'
              ? 'critical'
              : r.conflictStatus === 'warning'
                ? 'warning'
                : 'none',
          badges: r.badges || [],
          needsApproval: r.needsApproval,
        }));

        setLocalData(mapped);
      } catch {
        // suggest error
      }
    },
    [suggestRooms]
  );

  const reset = useCallback(() => {
    setLocalData([]);
  }, []);

  return {
    data: localData,
    isLoading,
    error: isError ? 'Failed to get room suggestions.' : null,
    suggest,
    reset,
  };
}

// ─── useRoomConflictCheck ─────────────────────────────────────────────────────
export function useRoomConflictCheck() {
  const [checkConflicts, { isLoading, isError }] = useCheckRoomConflictsMutation();
  const [localData, setLocalData] = useState<ConflictCheck | null>(null);

  const check = useCallback(
    async (requirements: ReservationRequirements, roomId: string) => {
      try {
        const payload = {
          roomId,
          date: requirements.date,
          startTime: requirements.startTime,
          endTime: requirements.endTime,
          reservationType:
            requirements.reservationType === '' ? 'other' : requirements.reservationType,
          teacherId: undefined,
          standardId: undefined,
          divisionId: undefined,
        };
        const response = await checkConflicts(payload).unwrap();

        const mappedResult: ConflictCheck = {
          roomAvailability: {
            passed: response.roomAvailability?.passed ?? true,
            message: response.roomAvailability?.message,
          },
          teacherAvailability: {
            passed: response.teacherAvailability?.passed ?? true,
            message: response.teacherAvailability?.message,
          },
          classAvailability: {
            passed: response.classAvailability?.passed ?? true,
            message: response.classAvailability?.message,
          },
          maintenanceCheck: {
            passed: response.maintenanceCheck?.passed ?? true,
            message: response.maintenanceCheck?.message,
          },
          examSchedule: { passed: true },
          holidayCalendar: {
            passed: response.holidayCalendar?.passed ?? true,
            message: response.holidayCalendar?.message,
          },
          duplicateReservation: { passed: true },
          overallSeverity: response.overallSeverity,
          canSave: response.canSave,
          requiresApproval: response.requiresApproval,
          conflicts: (response.conflicts || []).map((c: any) => ({
            type: c.type,
            severity: c.severity,
            message: c.message,
            suggestion: c.suggestion,
          })),
        };

        setLocalData(mappedResult);
      } catch {
        // conflict check error
      }
      return { roomId };
    },
    [checkConflicts]
  );

  const reset = useCallback(() => {
    setLocalData(null);
  }, []);

  return {
    data: localData,
    isLoading,
    error: isError ? 'Conflict check failed.' : null,
    check,
    reset,
  };
}

// ─── useCreateRoomReservation ─────────────────────────────────────────────────
export function useCreateRoomReservation() {
  const [createReservation, { isLoading, isError, isSuccess }] = useCreateRoomReservationMutation();

  const create = useCallback(
    async (payload: Partial<RoomReservation>): Promise<RoomReservation | null> => {
      const formatTime = (t: string) => {
        if (!t) return '00:00:00';
        const parts = t.split(':');
        if (parts.length === 2) return `${t}:00`;
        return t;
      };

      const body = {
        roomId: payload.roomId,
        date: payload.date,
        startTime: formatTime(payload.startTime || ''),
        endTime: formatTime(payload.endTime || ''),
        purpose: payload.purpose || 'Direct booking',
        reservationType: RESERVATION_TYPE_MAP[payload.reservationType || 'other'] || 7,
        remarks: payload.remarks,
        isRecurring: payload.isRecurring || false,
        recurringConfig: payload.isRecurring
          ? {
              repeatType: (payload as any).recurringConfig?.repeatType || 'daily',
              repeatDays: (payload as any).recurringConfig?.repeatDays || [],
              untilDate: (payload as any).recurringConfig?.untilDate || payload.date,
              excludeHolidays: (payload as any).recurringConfig?.excludeHolidays ?? true,
              skipConflictDates: (payload as any).recurringConfig?.skipConflictDates ?? false,
            }
          : undefined,
      };
      const response = await createReservation(body).unwrap();

      return {
        id: response.id,
        roomId: response.roomId,
        roomName: payload.roomName || 'Selected Room',
        buildingName: payload.buildingName || 'Main Building',
        date: response.date ? response.date.split('T')[0] : payload.date,
        startTime: response.startTime ? response.startTime.substring(0, 5) : payload.startTime,
        endTime: response.endTime ? response.endTime.substring(0, 5) : payload.endTime,
        purpose: response.purpose,
        reservationType: (REVERSE_RESERVATION_TYPE_MAP[response.reservationType] as any) || 'other',
        status:
          response.status === 1
            ? 'draft'
            : response.status === 2
              ? 'pendingApproval'
              : response.status === 7
                ? 'cancelled'
                : response.status === 8
                  ? 'rejected'
                  : 'active',
        approvalStatus:
          response.status === 3 || response.status === 4
            ? 'approved'
            : response.status === 8
              ? 'rejected'
              : 'pending',
        createdAt: response.creationTime,
      } as any;
    },
    [createReservation]
  );

  return { isLoading, error: isError ? 'Failed to create reservation.' : null, isSuccess, create };
}

// ─── useUpdateRoomReservation ─────────────────────────────────────────────────
export function useUpdateRoomReservation() {
  const [updateReservation, { isLoading, isError }] = useUpdateRoomReservationMutation();

  const update = useCallback(
    async (id: string, updates: Partial<RoomReservation>) => {
      try {
        const body = {
          id,
          roomId: updates.roomId,
          date: updates.date,
          startTime: updates.startTime,
          endTime: updates.endTime,
          purpose: updates.purpose || '',
          reservationType: updates.reservationType || 'other',
          remarks: updates.remarks,
        };
        const response = await updateReservation(body).unwrap();
        return {
          id: response.id,
          ...updates,
        };
      } catch {
        return null;
      }
    },
    [updateReservation]
  );

  return { isLoading, error: isError ? 'Failed to update reservation.' : null, update };
}

// ─── useCancelRoomReservation ─────────────────────────────────────────────────
export function useCancelRoomReservation() {
  const [cancelReservation, { isLoading, isError }] = useCancelRoomReservationMutation();

  const cancel = useCallback(
    async (id: string, reason?: string) => {
      try {
        await cancelReservation({ id, reason: reason || 'Cancelled by user' }).unwrap();
        return id;
      } catch {
        return null;
      }
    },
    [cancelReservation]
  );

  return { isLoading, error: isError ? 'Failed to cancel reservation.' : null, cancel };
}

// ─── useApproveRoomReservation ────────────────────────────────────────────────
export function useApproveRoomReservation() {
  const [approveReservation, { isLoading, isError }] = useApproveRoomReservationMutation();

  const approve = useCallback(
    async (id: string, _remarks?: string) => {
      try {
        await approveReservation(id).unwrap();
        return id;
      } catch {
        return null;
      }
    },
    [approveReservation]
  );

  return { isLoading, error: isError ? 'Failed to approve reservation.' : null, approve };
}

// ─── useRejectRoomReservation ─────────────────────────────────────────────────
export function useRejectRoomReservation() {
  const [rejectReservation, { isLoading, isError }] = useRejectRoomReservationMutation();

  const reject = useCallback(
    async (id: string, reason?: string) => {
      try {
        await rejectReservation({ id, reason: reason || 'Rejected by administrator' }).unwrap();
        return id;
      } catch {
        return null;
      }
    },
    [rejectReservation]
  );

  return { isLoading, error: isError ? 'Failed to reject reservation.' : null, reject };
}

// ─── useCreateMaintenanceBlock ────────────────────────────────────────────────
export function useCreateMaintenanceBlock() {
  const [createMaintenance, { isLoading, isError }] = useCreateMaintenanceBlockMutation();

  const create = useCallback(
    async (payload: MaintenanceBlock): Promise<MaintenanceBlock | null> => {
      try {
        const body = {
          roomId: payload.roomId,
          title: payload.title,
          reason: payload.reason,
          severity:
            payload.severity === 'medium'
              ? 2
              : payload.severity === 'high'
                ? 3
                : payload.severity === 'critical'
                  ? 4
                  : 1,
          startDateTime: payload.startDateTime,
          endDateTime: payload.endDateTime,
          assignedStaff: payload.assignedStaff,
          remarks: payload.remarks,
        };
        const response = await createMaintenance(body).unwrap();

        return {
          id: response.id,
          roomId: response.roomId,
          roomName: response.roomName,
          title: response.title,
          reason: response.reason,
          severity: response.severity.toString().toLowerCase() as any,
          startDateTime: response.startDateTime,
          endDateTime: response.endDateTime,
          assignedStaff: response.assignedStaff,
          remarks: response.remarks,
          status: response.status.toString().toLowerCase() as any,
        };
      } catch {
        return null;
      }
    },
    [createMaintenance]
  );

  return { isLoading, error: isError ? 'Failed to create maintenance block.' : null, create };
}

// ─── useAIRoomAssistant ───────────────────────────────────────────────────────
export function useAIRoomAssistant() {
  const [data, setData] = useState<AIParseResult | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = useCallback(async (_command: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      await fakeDelay(1200);
      setData(MOCK_AI_PARSE_RESULT);
    } catch {
      setError('AI assistant is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, parse, reset };
}
