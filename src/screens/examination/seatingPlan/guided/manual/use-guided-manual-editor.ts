import type {
  SeatingPlanGroupDto,
  GuidedAllocationPreviewDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState, useEffect } from 'react';

import { buildEmptyDraft } from '../../utils/mappers';
import { autoAllocate } from '../../utils/autoAllocate';
import { buildGuidedManualPreview } from './manual-preview';
import { useSeatingDraft } from '../../hooks/useSeatingDraft';
import { useGuidedManualData } from './use-guided-manual-data';
import { toggleSeatReservationInRooms } from './manual-seat-reservation';

import type { SeatingSeat, SeatingAllocationRules } from '../../types';

interface UseGuidedManualEditorArgs {
  examId: string;
  standardId: string;
  plan: SeatingPlanGroupDto;
  selectedRoomIds: string[];
  rules: SeatingAllocationRules;
  inProgressPreview?: GuidedAllocationPreviewDto;
  onPreviewChange: (preview?: GuidedAllocationPreviewDto) => void;
}

export function useGuidedManualEditor({
  examId,
  standardId,
  plan,
  selectedRoomIds,
  rules,
  inProgressPreview,
  onPreviewChange,
}: UseGuidedManualEditorArgs) {
  const seating = useSeatingDraft(buildEmptyDraft(examId));
  const { draft, setDraft, actions } = seating;
  const [activeRoomId, setActiveRoomId] = useState(selectedRoomIds[0] ?? '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const { isLoading, loadError, isLoaded } = useGuidedManualData({
    examId,
    standardId,
    plan,
    selectedRoomIds,
    rules,
    setDraft,
    inProgressPreview,
  });

  useEffect(() => {
    setActiveRoomId((current) =>
      selectedRoomIds.includes(current) ? current : (selectedRoomIds[0] ?? '')
    );
  }, [isLoaded, selectedRoomIds]);

  useEffect(() => {
    if (!isLoaded) return;
    const selectedRooms = draft.rooms.filter((room) => selectedRoomIds.includes(room.roomId));
    const selectedAssignments = draft.assignments.filter((assignment) =>
      selectedRoomIds.includes(assignment.roomId)
    );
    onPreviewChange(buildGuidedManualPreview(draft.students, selectedRooms, selectedAssignments));
  }, [isLoaded, onPreviewChange, draft.assignments, draft.rooms, draft.students, selectedRoomIds]);

  const visibleRooms = draft.rooms.filter((room) => selectedRoomIds.includes(room.roomId));
  const autoArrange = () => {
    const result = autoAllocate(
      draft.students.filter((student) => !student.isExternalExamOccupied),
      visibleRooms,
      draft.assignments,
      rules,
      []
    );
    actions.applyAssignments(result.assignments, 'auto-allocate');
  };
  const toggleSeatReservation = (roomId: string, seat: SeatingSeat) => {
    setDraft((current) => {
      const rooms = toggleSeatReservationInRooms(current.rooms, roomId, seat);
      return rooms === current.rooms ? current : { ...current, rooms, isDirty: true };
    });
  };

  return {
    ...seating,
    visibleRooms,
    isLoading,
    loadError,
    activeRoomId,
    setActiveRoomId,
    selectedStudentId,
    setSelectedStudentId,
    autoArrange,
    toggleSeatReservation,
  };
}
