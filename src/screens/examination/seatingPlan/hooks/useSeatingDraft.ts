import { useMemo, useState, useCallback } from 'react';

import type {
  SeatingSeat,
  SeatingStudent,
  SeatingPlanDraft,
  SeatingAssignment,
  SeatingHistoryEntry,
  SeatingHistoryActionType,
} from '../types';

const seatId = (roomId: string, seatNumber: number) => `${roomId}:${seatNumber}`;

/**
 * Single source of truth for a seating plan draft.
 *
 * `assignments` is the ONLY place allocation state lives — every counter (allocated,
 * pending, progress, room utilization, seat occupant, duplicate detection) is derived
 * from it via memoized selectors below. This directly fixes the bug where the list
 * header, sidebar stats, and backend dashboard each independently recomputed counts
 * and drifted out of sync (master spec §5).
 */
export function useSeatingDraft(initialDraft: SeatingPlanDraft) {
  const [draft, setDraft] = useState<SeatingPlanDraft>(initialDraft);
  const [history, setHistory] = useState<SeatingHistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<SeatingHistoryEntry[]>([]);

  const eligibleStudents = useMemo(
    () => draft.students.filter((s) => !draft.excludedStudentIds.includes(s.studentId)),
    [draft.students, draft.excludedStudentIds]
  );

  const totalStudents = eligibleStudents.length;
  const allocatedCount = draft.assignments.length;
  const pendingCount = Math.max(0, totalStudents - allocatedCount);
  const allocationProgress =
    totalStudents === 0 ? 0 : Math.round((allocatedCount / totalStudents) * 100);

  const studentSeatMap = useMemo(() => {
    const map = new Map<string, SeatingAssignment>();
    draft.assignments.forEach((a) => map.set(a.studentId, a));
    return map;
  }, [draft.assignments]);

  const seatOccupantMap = useMemo(() => {
    const map = new Map<string, SeatingAssignment>();
    draft.assignments.forEach((a) => map.set(a.seatId, a));
    return map;
  }, [draft.assignments]);

  const duplicateAssignments = useMemo(() => {
    const seen = new Map<string, number>();
    draft.assignments.forEach((a) => seen.set(a.studentId, (seen.get(a.studentId) ?? 0) + 1));
    return [...seen.entries()].filter(([, count]) => count > 1).map(([studentId]) => studentId);
  }, [draft.assignments]);

  const roomUtilization = useMemo(
    () =>
      draft.rooms.map((room) => {
        const occupied = draft.assignments.filter((a) => a.roomId === room.roomId).length;
        const usable = room.seats.filter((s) => !s.isDisabled).length || room.capacity;
        return {
          roomId: room.roomId,
          roomName: room.roomName,
          occupied,
          usable,
          empty: Math.max(0, usable - occupied),
          utilization: usable === 0 ? 0 : Math.round((occupied / usable) * 100),
        };
      }),
    [draft.rooms, draft.assignments]
  );

  const isReadyToFinalize =
    pendingCount === 0 && draft.validation.blockers.length === 0 && draft.status !== 'completed';

  const pushHistory = useCallback(
    (type: SeatingHistoryActionType, before: SeatingAssignment[], after: SeatingAssignment[]) => {
      setHistory((h) => [...h, { type, before, after }]);
      setRedoStack([]);
    },
    []
  );

  const applyAssignments = useCallback(
    (next: SeatingAssignment[], type: SeatingHistoryActionType) => {
      setDraft((d) => {
        pushHistory(type, d.assignments, next);
        return { ...d, assignments: next, isDirty: true };
      });
    },
    [pushHistory]
  );

  const assignStudent = useCallback(
    (student: SeatingStudent, roomId: string, seat: SeatingSeat) => {
      setDraft((d) => {
        const withoutStudent = d.assignments.filter((a) => a.studentId !== student.studentId);
        const withoutSeatOccupant = withoutStudent.filter(
          (a) => a.seatId !== seatId(roomId, seat.seatNumber)
        );
        const next: SeatingAssignment[] = [
          ...withoutSeatOccupant,
          {
            studentId: student.studentId,
            roomId,
            seatId: seatId(roomId, seat.seatNumber),
            seatNumber: seat.seatNumber,
            benchId: seat.benchId,
            assignedBy: 'manual',
          },
        ];
        pushHistory('assign', d.assignments, next);
        return { ...d, assignments: next, isDirty: true };
      });
    },
    [pushHistory]
  );

  const unassignStudent = useCallback(
    (studentId: string) => {
      setDraft((d) => {
        const next = d.assignments.filter((a) => a.studentId !== studentId);
        pushHistory('unassign', d.assignments, next);
        return { ...d, assignments: next, isDirty: true };
      });
    },
    [pushHistory]
  );

  const moveStudent = useCallback(
    (studentId: string, roomId: string, seat: SeatingSeat) => {
      setDraft((d) => {
        const next = d.assignments.map((a) =>
          a.studentId === studentId
            ? {
                ...a,
                roomId,
                seatId: seatId(roomId, seat.seatNumber),
                seatNumber: seat.seatNumber,
                benchId: seat.benchId,
              }
            : a
        );
        pushHistory('move', d.assignments, next);
        return { ...d, assignments: next, isDirty: true };
      });
    },
    [pushHistory]
  );

  const swapSeats = useCallback(
    (studentIdA: string, studentIdB: string) => {
      setDraft((d) => {
        const a = d.assignments.find((x) => x.studentId === studentIdA);
        const b = d.assignments.find((x) => x.studentId === studentIdB);
        if (!a || !b) return d;
        const next = d.assignments.map((x) => {
          if (x.studentId === studentIdA) {
            return { ...x, roomId: b.roomId, seatId: b.seatId, seatNumber: b.seatNumber, benchId: b.benchId };
          }
          if (x.studentId === studentIdB) {
            return { ...x, roomId: a.roomId, seatId: a.seatId, seatNumber: a.seatNumber, benchId: a.benchId };
          }
          return x;
        });
        pushHistory('swap', d.assignments, next);
        return { ...d, assignments: next, isDirty: true };
      });
    },
    [pushHistory]
  );

  const resetRoom = useCallback(
    (roomId: string) => {
      setDraft((d) => {
        const next = d.assignments.filter((a) => a.roomId !== roomId);
        pushHistory('reset-room', d.assignments, next);
        return { ...d, assignments: next, isDirty: true };
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const entry = h[h.length - 1];
      setDraft((d) => ({ ...d, assignments: entry.before, isDirty: true }));
      setRedoStack((r) => [...r, entry]);
      return h.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const entry = r[r.length - 1];
      setDraft((d) => ({ ...d, assignments: entry.after, isDirty: true }));
      setHistory((h) => [...h, entry]);
      return r.slice(0, -1);
    });
  }, []);

  return {
    draft,
    setDraft,
    eligibleStudents,
    counters: { totalStudents, allocatedCount, pendingCount, allocationProgress },
    studentSeatMap,
    seatOccupantMap,
    duplicateAssignments,
    roomUtilization,
    isReadyToFinalize,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    actions: {
      applyAssignments,
      assignStudent,
      unassignStudent,
      moveStudent,
      swapSeats,
      resetRoom,
      undo,
      redo,
    },
  };
}

export { seatId };
