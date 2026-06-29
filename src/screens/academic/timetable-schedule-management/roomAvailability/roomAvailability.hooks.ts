'use client';

import { useState, useCallback } from 'react';

import {
  MOCK_SUMMARY,
  MOCK_SCHEDULES,
  MOCK_AUDIT_LOGS,
  MOCK_AVAILABILITY,
  MOCK_RESERVATIONS,
  MOCK_USAGE_REPORT,
  MOCK_SUGGESTED_ROOMS,
  MOCK_AI_PARSE_RESULT,
  MOCK_CONFLICT_CHECK_CLEAR,
  MOCK_CONFLICT_CHECK_WARNING,
} from './roomAvailability.mock';

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
  RoomAvailabilitySummary,
  ReservationRequirements,
  RoomAvailabilityFilters,
} from './types';

// ─── Helper: simulate async delay ────────────────────────────────────────────
const fakeDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ─── useRoomAvailability ──────────────────────────────────────────────────────
export function useRoomAvailability(filters?: Partial<RoomAvailabilityFilters>) {
  const [data, setData] = useState<RoomAvailabilityItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay();
      let result = [...MOCK_AVAILABILITY];

      if (filters) {
        if (filters.building && filters.building !== 'all') {
          result = result.filter((r) => r.buildingName === filters.building);
        }
        if (filters.floor && filters.floor !== 'all') {
          result = result.filter((r) => r.floorName?.includes(filters.floor!));
        }
        if (filters.roomType && filters.roomType !== 'all') {
          result = result.filter((r) => r.type === filters.roomType);
        }
        if (filters.status && filters.status !== 'all') {
          result = result.filter((r) => r.status === filters.status);
        }
        if (filters.minimumCapacity) {
          result = result.filter((r) => r.capacity >= filters.minimumCapacity!);
        }
        if (filters.onlyAvailable) {
          result = result.filter((r) => r.status === 'available');
        }
        if (!filters.includeOccupied) {
          result = result.filter((r) => r.status !== 'occupied');
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (r) =>
              r.roomName.toLowerCase().includes(q) ||
              r.buildingName.toLowerCase().includes(q) ||
              r.type.toLowerCase().includes(q)
          );
        }
      }
      setData(result);
    } catch {
      setError('Failed to load room availability.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return { data, isLoading, error, refetch: fetch, fetch };
}

// ─── useRoomAvailabilitySummary ───────────────────────────────────────────────
export function useRoomAvailabilitySummary() {
  const [data, setData] = useState<RoomAvailabilitySummary | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(400);
      setData(MOCK_SUMMARY);
    } catch {
      setError('Failed to load summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, refetch: fetch, fetch };
}

// ─── useRoomSchedule ──────────────────────────────────────────────────────────
export function useRoomSchedule(roomId: string | null) {
  const [data, setData] = useState<RoomSchedule | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(400);
      setData(MOCK_SCHEDULES[roomId] || null);
    } catch {
      setError('Failed to load room schedule.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  return { data, isLoading, error, refetch: fetch, fetch };
}

// ─── useRoomDetails ───────────────────────────────────────────────────────────
export function useRoomDetails(roomId: string | null) {
  const [data, setData] = useState<RoomAvailabilityItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(300);
      const found = MOCK_AVAILABILITY.find((r) => r.roomId === roomId) || null;
      setData(found);
    } catch {
      setError('Failed to load room details.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  return { data, isLoading, error, refetch: fetch, fetch };
}

// ─── useRoomReservations ──────────────────────────────────────────────────────
export function useRoomReservations() {
  const [data, setData] = useState<RoomReservation[]>(MOCK_RESERVATIONS);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(400);
      setData(MOCK_RESERVATIONS);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addReservation = useCallback((reservation: RoomReservation) => {
    setData((prev) => [reservation, ...prev]);
  }, []);

  const updateReservation = useCallback((id: string, updates: Partial<RoomReservation>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const cancelReservation = useCallback((id: string) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetch,
    fetch,
    addReservation,
    updateReservation,
    cancelReservation,
  };
}

// ─── useRoomUsageReport ───────────────────────────────────────────────────────
export function useRoomUsageReport() {
  const [data, setData] = useState<UsageReportData[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(600);
      setData(MOCK_USAGE_REPORT);
    } catch {
      setError('Failed to load usage report.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, refetch: fetch, fetch };
}

// ─── useRoomAuditLogs ─────────────────────────────────────────────────────────
export function useRoomAuditLogs(roomId?: string | null) {
  const [data, setData] = useState<AuditLogEntry[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(400);
      const result = roomId
        ? MOCK_AUDIT_LOGS.filter((log) => log.roomId === roomId)
        : MOCK_AUDIT_LOGS;
      setData(result);
    } catch {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const addLog = useCallback((log: AuditLogEntry) => {
    setData((prev) => [log, ...prev]);
  }, []);

  return { data, isLoading, error, refetch: fetch, fetch, addLog };
}

// ─── useRoomSuggestions ───────────────────────────────────────────────────────
export function useRoomSuggestions() {
  const [data, setData] = useState<SuggestedRoom[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggest = useCallback(async (_requirements: ReservationRequirements) => {
    setLoading(true);
    setError(null);
    setData([]);
    try {
      await fakeDelay(900);
      setData(MOCK_SUGGESTED_ROOMS);
    } catch {
      setError('Failed to get room suggestions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return { data, isLoading, error, suggest, reset };
}

// ─── useRoomConflictCheck ─────────────────────────────────────────────────────
export function useRoomConflictCheck() {
  const [data, setData] = useState<ConflictCheck | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async (requirements: ReservationRequirements, roomId: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      await fakeDelay(1000);
      // Simulate: if teacher field is filled, show a warning conflict
      const hasWarning = !!(requirements.teacherName && requirements.teacherName.length > 0);
      setData(hasWarning ? MOCK_CONFLICT_CHECK_WARNING : MOCK_CONFLICT_CHECK_CLEAR);
    } catch {
      setError('Conflict check failed. Cannot proceed without conflict check.');
    } finally {
      setLoading(false);
    }
    return { roomId };
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, check, reset };
}

// ─── useCreateRoomReservation ─────────────────────────────────────────────────
export function useCreateRoomReservation() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setSuccess] = useState(false);

  const create = useCallback(
    async (payload: Partial<RoomReservation>): Promise<RoomReservation | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        await fakeDelay(700);
        const newReservation: RoomReservation = {
          id: `res-${Date.now()}`,
          roomId: payload.roomId || '',
          roomName: payload.roomName || '',
          date: payload.date || new Date().toISOString().split('T')[0],
          startTime: payload.startTime || '09:00',
          endTime: payload.endTime || '09:45',
          purpose: payload.purpose || 'Manual reservation',
          reservationType: payload.reservationType || 'other',
          status: payload.approvalStatus === 'pending' ? 'pendingApproval' : 'active',
          approvalStatus: payload.approvalStatus || 'approved',
          conflictStatus: 'none',
          ...payload,
          createdAt: new Date().toISOString().split('T')[0],
        } as RoomReservation;
        setSuccess(true);
        return newReservation;
      } catch {
        setError('Failed to create reservation.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { isLoading, error, isSuccess, create };
}

// ─── useUpdateRoomReservation ─────────────────────────────────────────────────
export function useUpdateRoomReservation() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: string, updates: Partial<RoomReservation>) => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(500);
      return { id, ...updates };
    } catch {
      setError('Failed to update reservation.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { isLoading, error, update };
}

// ─── useCancelRoomReservation ─────────────────────────────────────────────────
export function useCancelRoomReservation() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(async (id: string, _reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(500);
      return id;
    } catch {
      setError('Failed to cancel reservation.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { isLoading, error, cancel };
}

// ─── useApproveRoomReservation ────────────────────────────────────────────────
export function useApproveRoomReservation() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(async (id: string, _remarks?: string) => {
    setLoading(true);
    setError(null);
    try {
      await fakeDelay(500);
      return id;
    } catch {
      setError('Failed to approve reservation.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { isLoading, error, approve };
}

// ─── useRejectRoomReservation ─────────────────────────────────────────────────
export function useRejectRoomReservation() {
  const [isLoading, error, reject] = useActionHook('Failed to reject reservation.');
  return { isLoading, error, reject };
}

// ─── useCreateMaintenanceBlock ────────────────────────────────────────────────
export function useCreateMaintenanceBlock() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (payload: MaintenanceBlock): Promise<MaintenanceBlock | null> => {
      setLoading(true);
      setError(null);
      try {
        await fakeDelay(700);
        return { ...payload, id: `maint-${Date.now()}`, status: 'scheduled' };
      } catch {
        setError('Failed to create maintenance block.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { isLoading, error, create };
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

// ─── Internal helper ──────────────────────────────────────────────────────────
function useActionHook(
  failMessage: string
): [boolean, string | null, (id: string, reason?: string) => Promise<string | null>] {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action = useCallback(
    async (id: string, _reason?: string): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        await fakeDelay(500);
        return id;
      } catch {
        setError(failMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [failMessage]
  );

  return [isLoading, error, action];
}
