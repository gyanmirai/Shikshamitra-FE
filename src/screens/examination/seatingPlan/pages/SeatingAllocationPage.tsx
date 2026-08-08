'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Checkbox,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { keyframes } from '@mui/system';
import {
  useGetExamRoomsQuery,
  useGetSeatLayoutQuery,
  useGetExamDivisionsQuery,
  useGetSeatingPlanDraftQuery,
  useGetSeatingPlanScopesQuery,
  useSaveSeatAllocationMutation,
  useAutoAllocatePreviewMutation,
  useSaveSeatingPlanScopeMutation,
  useSaveSeatingPlanDraftMutation,
  useGetSeatAllocationStudentsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import { autoAllocate } from '../utils/autoAllocate';
import { validateSeatingDraft } from '../utils/validate';
import RoomSwitcher from '../components/workspace/RoomSwitcher';
import { seatId, useSeatingDraft } from '../hooks/useSeatingDraft';
import SeatLayoutCanvas from '../components/workspace/SeatLayoutCanvas';
import StudentQueuePanel from '../components/workspace/StudentQueuePanel';
import SeatInspectorPanel from '../components/workspace/SeatInspectorPanel';
import AllocationRuleDrawer from '../components/workspace/AllocationRuleDrawer';
import SeatingWorkspaceHeader from '../components/workspace/SeatingWorkspaceHeader';
import AllocationProgressSummary from '../components/workspace/AllocationProgressSummary';
import {
  buildEmptyDraft,
  toSeatingStudents,
  toSeatingRoomLayout,
  toSeatingAssignments,
  toSaveSeatingPlanPayload,
} from '../utils/mappers';

import type {
  SeatingSeat,
  SeatingStudent,
  SeatingPlanScope,
  SeatingAssignment,
  SeatingPlanSubject,
} from '../types';

interface Props {
  examId: string;
  onClose?: () => void;
  onOpenReview?: (context: {
    divisionId: string;
    roomIds: string[];
    seatingPlanId?: string;
  }) => void;
}

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

export default function SeatingAllocationPage({ examId, onClose, onOpenReview }: Props) {
  const router = useRouter();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAutoAllocate = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.seatAllocation}.AutoAllocate`
  );

  const [standardId, setStandardId] = useState('');
  const [division, setDivision] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');

  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [scopeName, setScopeName] = useState('');
  const [scopeSubjectIds, setScopeSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [];
    if (!standardId) setStandardId(allClasses[0]?.id || '');
  }, [currentMedium, standardId]);

  // ── Queries via useQueryAndMutation (skill § 4.1) ───────────────────────
  const {
    data: divisionsData,
    isLoading: isDivisionsLoading,
    isFetching: isDivisionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { examId, standardId },
    options: { skip: !examId || !standardId },
  });

  const {
    data: scopesData,
    isLoading: isScopesLoading,
    isFetching: isScopesFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanScopesQuery,
    params: { examId },
    options: { skip: !examId },
  });

  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    isFetching: isRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId, divisionId: division, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !division || !selectedPlanId },
  });

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isFetching: isStudentsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationStudentsQuery,
    params: { examId, divisionId: division, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !division || !selectedPlanId },
  });

  const {
    data: seatLayoutData,
    isLoading: isSeatLayoutLoading,
    isFetching: isSeatLayoutFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatLayoutQuery,
    params: { examId, divisionId: division, roomId: activeRoomId, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !division || !activeRoomId || !selectedPlanId },
  });

  const {
    data: planDraftData,
    isLoading: isPlanDraftLoading,
    isFetching: isPlanDraftFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanDraftQuery,
    params: { examId, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !selectedPlanId },
  });

  // ── Combined loading flags for queries (only show skeletons when data is missing) ──
  const isScopesDataLoading = (isScopesLoading || isScopesFetching) && !scopesData;
  const isDivisionsDataLoading = (isDivisionsLoading || isDivisionsFetching) && !divisionsData;
  const isRoomsDataLoading = (isRoomsLoading || isRoomsFetching) && !roomsData;
  // Always show skeleton during any seat-layout or student-data fetch to prevent stale/blank-bench state
  const isStudentsDataLoading = isStudentsLoading || isStudentsFetching;
  const isSeatLayoutDataLoading = isSeatLayoutLoading || isSeatLayoutFetching;
  const isPlanDraftDataLoading = (isPlanDraftLoading || isPlanDraftFetching) && !planDraftData;

  const isFetchingAny =
    isScopesFetching ||
    isDivisionsFetching ||
    isRoomsFetching ||
    isStudentsFetching ||
    isSeatLayoutFetching ||
    isPlanDraftFetching;

  // True only on initial page load when core dropdown data is still missing
  const isInitialLoading = isScopesDataLoading || isDivisionsDataLoading;

  // ── Mutations via useQueryAndMutation (skill § 4.2) ─────────────────────
  const [saveSeatingPlanScope, { isLoading: isSavingScope }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveSeatingPlanScopeMutation,
  });

  const [saveSeatAllocation, { isLoading: isSavingSeatAllocation }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveSeatAllocationMutation,
  });

  const [saveSeatingPlanDraft, { isLoading: isSavingPlanDraft }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveSeatingPlanDraftMutation,
  });

  const [autoAllocatePreview] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAutoAllocatePreviewMutation,
  });

  const isSaving = isSavingSeatAllocation || isSavingPlanDraft;

  useEffect(() => {
    if (!selectedPlanId && scopesData?.items?.length) {
      setSelectedPlanId(scopesData.items[0].seatingPlanId);
    }
  }, [scopesData, selectedPlanId]);

  const selectedScope = (scopesData?.items || []).find(
    (scope: SeatingPlanScope) => scope.seatingPlanId === selectedPlanId
  );
  const selectedPlanIsLocked = !!selectedScope?.isLocked;
  const selectedPlanHasAllocations = (selectedScope?.allocatedStudents ?? 0) > 0;
  const subjectWiseSubjectOwners = useMemo(() => {
    const owners = new Map<string, SeatingPlanScope>();
    (scopesData?.items || [])
      .filter((scope: SeatingPlanScope) => scope.scopeType !== 0)
      .forEach((scope: SeatingPlanScope) => {
        scope.subjects.forEach((subject: SeatingPlanSubject) =>
          owners.set(subject.examSubjectId, scope)
        );
      });
    return owners;
  }, [scopesData?.items]);
  const allSubjectPlanWithAllocations = useMemo(
    () =>
      (scopesData?.items || []).find(
        (scope: SeatingPlanScope) => scope.scopeType === 0 && scope.allocatedStudents > 0
      ),
    [scopesData?.items]
  );
  const selectedDialogSubjectIds = scopeSubjectIds.length
    ? scopeSubjectIds
    : (scopesData?.availableSubjects || [])
      .filter(
        (subject: SeatingPlanSubject) => !subjectWiseSubjectOwners.has(subject.examSubjectId)
      )
      .map((subject: SeatingPlanSubject) => subject.examSubjectId);
  const selectedDialogHasOwnedSubject = selectedDialogSubjectIds.some((subjectId: string) =>
    subjectWiseSubjectOwners.has(subjectId)
  );

  const { draft, setDraft, counters, roomUtilization, actions, canUndo, canRedo } = useSeatingDraft(
    buildEmptyDraft(examId)
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const assignmentBySeat = useMemo(() => {
    const map = new Map<string, SeatingAssignment>();
    draft.assignments.forEach((a) => {
      if (a.roomId === activeRoomId) map.set(a.seatId, a);
    });
    return map;
  }, [draft.assignments, activeRoomId]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (selectedPlanIsLocked) return;
      const { active, over } = event;
      if (!over) return;
      const activeData = active.data.current as
        | { type: 'student'; student?: SeatingStudent }
        | { type: 'assigned-seat'; assignment?: SeatingAssignment }
        | undefined;
      const overData = over.data.current as
        | { type: string; seat?: SeatingSeat; roomId?: string }
        | undefined;
      if (!activeData || overData?.type !== 'seat' || !overData.seat || !overData.roomId || overData.seat.isDisabled) {
        return;
      }
      const existing = assignmentBySeat.get(overData.seat.seatId);
      if (activeData.type === 'assigned-seat') {
        const draggedAssignment = activeData.assignment;
        if (!draggedAssignment || draggedAssignment.seatId === overData.seat.seatId) return;
        if (existing && existing.studentId !== draggedAssignment.studentId) {
          actions.swapSeats(draggedAssignment.studentId, existing.studentId);
          return;
        }
        actions.moveStudent(draggedAssignment.studentId, overData.roomId, overData.seat);
        return;
      }

      if (!activeData.student) return;
      if (existing && existing.studentId !== activeData.student.studentId) {
        actions.assignStudent(activeData.student, overData.roomId, overData.seat);
        return;
      }
      const isAlreadyPlaced = draft.assignments.some(
        (a) => a.studentId === activeData.student!.studentId
      );
      if (isAlreadyPlaced) {
        actions.moveStudent(activeData.student.studentId, overData.roomId, overData.seat);
      } else {
        actions.assignStudent(activeData.student, overData.roomId, overData.seat);
      }
    },
    [assignmentBySeat, draft.assignments, actions, selectedPlanIsLocked]
  );

  // Merge server-persisted plan-level state once, on first load
  const [planLoaded, setPlanLoaded] = useState(false);
  useEffect(() => {
    setPlanLoaded(false);
    setActiveRoomId('');
    setDraft(buildEmptyDraft(examId));
  }, [selectedPlanId, examId, setDraft]);

  useEffect(() => {
    if (planLoaded || !planDraftData) return;
    setDraft((d) => ({
      ...d,
      examName: selectedScope?.name ?? d.examName,
      allocationRules: planDraftData.allocationRulesJson
        ? JSON.parse(planDraftData.allocationRulesJson)
        : d.allocationRules,
      excludedStudentIds: planDraftData.excludedStudentIds ?? d.excludedStudentIds,
    }));
    setPlanLoaded(true);
  }, [planDraftData, planLoaded, selectedScope, setDraft]);

  // Load students into draft once per division
  useEffect(() => {
    if (!studentsData?.items) return;
    const specialIds = new Set(planDraftData?.specialRequirementStudentIds ?? []);
    setDraft((d) => ({
      ...d,
      divisionIds: division ? [division] : d.divisionIds,
      students: toSeatingStudents(studentsData.items).map((s) => ({
        ...s,
        hasSpecialRequirement: specialIds.has(s.studentId),
      })),
    }));
  }, [studentsData, division, planDraftData, setDraft]);

  const toggleSpecialRequirement = useCallback(
    (studentId: string) => {
      if (selectedPlanIsLocked) return;
      setDraft((d) => ({
        ...d,
        students: d.students.map((s) =>
          s.studentId === studentId ? { ...s, hasSpecialRequirement: !s.hasSpecialRequirement } : s
        ),
      }));
    },
    [setDraft, selectedPlanIsLocked]
  );

  // Merge active room layout + existing assignments into draft
  useEffect(() => {
    if (!activeRoomId || isSeatLayoutDataLoading || !seatLayoutData) return;
    const roomMeta = (roomsData?.items || []).find((r: any) => r.id === activeRoomId);
    const layout = toSeatingRoomLayout(
      seatLayoutData,
      activeRoomId,
      roomMeta?.roomName ?? activeRoomId
    );
    const loadedAssignments = toSeatingAssignments(seatLayoutData.items, activeRoomId);

    setDraft((d) => {
      const rooms = [...d.rooms.filter((r) => r.roomId !== activeRoomId), layout];
      const assignments = [
        ...d.assignments.filter((a) => a.roomId !== activeRoomId),
        ...loadedAssignments,
      ];
      const roomIds = d.roomIds.includes(activeRoomId) ? d.roomIds : [...d.roomIds, activeRoomId];
      return { ...d, rooms, assignments, roomIds };
    });
  }, [activeRoomId, seatLayoutData, isSeatLayoutDataLoading, roomsData, setDraft]);

  const validation = useMemo(() => validateSeatingDraft(draft), [draft]);
  const conflictStudentIds = useMemo(
    () =>
      new Set(
        [...validation.blockers, ...validation.warnings]
          .map((i) => i.studentId)
          .filter(Boolean) as string[]
      ),
    [validation]
  );
  const conflictSeatIds = useMemo(
    () =>
      new Set(
        [...validation.blockers, ...validation.warnings]
          .map((i) => i.seatId)
          .filter(Boolean) as string[]
      ),
    [validation]
  );

  const activeRoom = draft.rooms.find((r) => r.roomId === activeRoomId);
  const studentsById = useMemo(
    () => new Map(draft.students.map((s) => [s.studentId, s])),
    [draft.students]
  );

  const emptySeats = draft.rooms.reduce(
    (sum, r) =>
      sum +
      Math.max(0, r.seats.length - draft.assignments.filter((a) => a.roomId === r.roomId).length),
    0
  );
  const overallUtilization =
    draft.rooms.length === 0
      ? 0
      : Math.round(
        (draft.assignments.length /
          draft.rooms.reduce((s, r) => s + (r.seats.length || r.capacity), 0 || 1)) *
        100
      );

  const handleSaveDraft = useCallback(async () => {
    if (selectedPlanIsLocked) return;
    try {
      await Promise.all(
        draft.roomIds.map((roomId) =>
          saveSeatAllocation({
            examId,
            body: { ...toSaveSeatingPlanPayload(draft, roomId), seatingPlanId: selectedPlanId },
          })
        )
      );
      await saveSeatingPlanDraft({
        examId,
        body: {
          seatingPlanId: selectedPlanId,
          name: selectedScope?.name,
          scopeType: selectedScope?.scopeType,
          examSubjectIds:
            selectedScope?.subjects?.map((subject: SeatingPlanSubject) => subject.examSubjectId) ??
            [],
          roomIds: draft.roomIds,
          allocationRulesJson: JSON.stringify(draft.allocationRules),
          excludedStudentIds: draft.excludedStudentIds,
          specialRequirementStudentIds: draft.students
            .filter((s) => s.hasSpecialRequirement)
            .map((s) => s.studentId),
          lastKnownModifiedTime: planDraftData?.lastModifiedTime ?? null,
        },
      });
      setDraft((d) => ({ ...d, isDirty: false }));
      shikshaMitraToast.success({ message: 'Seating plan saved successfully.' });
    } catch {
      shikshaMitraToast.error({ message: 'Failed to save seating plan draft.' });
    }
  }, [
    draft,
    examId,
    saveSeatAllocation,
    saveSeatingPlanDraft,
    planDraftData,
    selectedPlanId,
    selectedScope,
    setDraft,
    selectedPlanIsLocked,
  ]);

  const handleAutoAllocatePreview = useCallback(
    (rules: typeof draft.allocationRules) => {
      const result = autoAllocate(
        draft.students,
        draft.rooms,
        draft.assignments,
        rules,
        draft.excludedStudentIds
      );
      const roomsUsed = new Set(result.assignments.map((a) => a.roomId)).size;
      const usableTotal = draft.rooms.reduce(
        (s, r) => s + (r.seats.filter((se) => !se.isDisabled).length || r.capacity),
        0
      );
      return {
        totalStudents: draft.students.filter((s) => !draft.excludedStudentIds.includes(s.studentId))
          .length,
        allocated: result.assignments.length,
        roomsUsed,
        remaining: result.unallocatedStudentIds.length,
        emptySeats: Math.max(0, usableTotal - result.assignments.length),
        utilization:
          usableTotal === 0 ? 0 : Math.round((result.assignments.length / usableTotal) * 100),
      };
    },
    [draft]
  );

  const applyAutoAllocate = useCallback(() => {
    if (selectedPlanIsLocked) return;
    const result = autoAllocate(
      draft.students,
      draft.rooms,
      draft.assignments,
      draft.allocationRules,
      draft.excludedStudentIds
    );
    actions.applyAssignments(result.assignments, 'auto-allocate');
    shikshaMitraToast.success({ message: 'Auto-allocation applied.' });
  }, [draft, actions, selectedPlanIsLocked]);

  const handleBulkAllocateSequential = useCallback(
    (studentIds: string[]) => {
      if (selectedPlanIsLocked) return;
      if (!activeRoom || studentIds.length === 0) return;
      const studentIdSet = new Set(studentIds);
      const existingOtherAssignments = draft.assignments.filter(
        (a) => !studentIdSet.has(a.studentId)
      );
      const occupiedSeatIds = new Set(existingOtherAssignments.map((a) => a.seatId));
      const freeSeats = activeRoom.seats.filter(
        (s) => !s.isDisabled && !s.isReserved && !occupiedSeatIds.has(s.seatId)
      );
      const next = [...existingOtherAssignments];
      studentIds.forEach((studentId, idx) => {
        const seat = freeSeats[idx];
        if (!seat) return;
        next.push({
          studentId,
          roomId: activeRoom.roomId,
          seatId: seat.seatId,
          seatNumber: seat.seatNumber,
          benchId: seat.benchId,
          assignedBy: 'manual',
        });
      });
      actions.applyAssignments(next, 'bulk-allocate');
      setMultiSelectedIds(new Set());
    },
    [activeRoom, draft.assignments, actions, selectedPlanIsLocked]
  );

  const handleToggleReserveSeat = useCallback(
    (roomId: string, seatNumber: number) => {
      if (selectedPlanIsLocked) return;
      setDraft((d) => ({
        ...d,
        rooms: d.rooms.map((room) =>
          room.roomId === roomId
            ? {
              ...room,
              seats: room.seats.map((seat) =>
                seat.seatNumber === seatNumber ? { ...seat, isReserved: !seat.isReserved } : seat
              ),
            }
            : room
        ),
        isDirty: true,
      }));
    },
    [setDraft, selectedPlanIsLocked]
  );

  const handleCreateSelectedScope = async () => {
    const subjects = scopesData?.availableSubjects || [];
    const chosenIds = scopeSubjectIds.length
      ? scopeSubjectIds
      : subjects
        .filter(
          (subject: SeatingPlanSubject) => !subjectWiseSubjectOwners.has(subject.examSubjectId)
        )
        .map((subject: SeatingPlanSubject) => subject.examSubjectId);
    if (!chosenIds.length) return;
    const ownedSubject = chosenIds.find((subjectId: string) =>
      subjectWiseSubjectOwners.has(subjectId)
    );
    if (ownedSubject) {
      shikshaMitraToast.error({
        message: 'One or more selected subjects already belong to another subject-wise plan.',
      });
      return;
    }
    try {
      const response = await saveSeatingPlanScope({
        examId,
        body: {
          name: scopeName || 'Selected Subject Plan',
          scopeType: chosenIds.length === subjects.length ? 0 : chosenIds.length === 1 ? 2 : 1,
          examSubjectIds: chosenIds,
        },
      }).unwrap();
      setSelectedPlanId(response.seatingPlanId);
      setScopeDialogOpen(false);
      setScopeName('');
      setScopeSubjectIds([]);
      shikshaMitraToast.success({ message: 'Seating plan scope created.' });
    } catch {
      shikshaMitraToast.error({ message: 'Failed to create seating plan scope.' });
    }
  };

  const handleCreateIndividualScopes = async () => {
    const subjects = scopesData?.availableSubjects || [];
    const missingSubjects = subjects.filter(
      (subject: SeatingPlanSubject) => !subjectWiseSubjectOwners.has(subject.examSubjectId)
    );
    if (!missingSubjects.length) {
      const firstExisting = (scopesData?.items || []).find(
        (scope: SeatingPlanScope) => scope.scopeType !== 0
      );
      if (firstExisting?.seatingPlanId) setSelectedPlanId(firstExisting.seatingPlanId);
      return;
    }

    try {
      const created = await Promise.all(
        missingSubjects.map((subject: SeatingPlanSubject) =>
          saveSeatingPlanScope({
            examId,
            body: {
              name: subject.subjectName,
              scopeType: 2,
              examSubjectIds: [subject.examSubjectId],
            },
          }).unwrap()
        )
      );
      if (created[0]?.seatingPlanId) setSelectedPlanId(created[0].seatingPlanId);
      shikshaMitraToast.success({ message: 'Subject-wise plans created successfully.' });
    } catch {
      shikshaMitraToast.error({ message: 'Failed to create subject-wise plans.' });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <SeatingWorkspaceHeader
          examName={draft.examName}
          examTypeName={draft.examTypeName}
          standardName={draft.standardName}
          isDirty={draft.isDirty}
          isSaving={isSaving}
          canAutoAllocate={!!activeRoom && canAutoAllocate && !selectedPlanIsLocked}
          canFinalize={counters.pendingCount === 0 && validation.blockers.length === 0}
          isReadOnly={selectedPlanIsLocked}
          onBack={() => {
            if (onClose) {
              onClose();
              return;
            }
            router.push('/academic/seatallocation');
          }}
          onSaveDraft={handleSaveDraft}
          onAutoAllocate={() => setRulesOpen(true)}
          onReview={async () => {
            if (!selectedPlanIsLocked) await handleSaveDraft();
            if (onOpenReview) {
              onOpenReview({
                divisionId: division,
                roomIds: draft.roomIds,
                seatingPlanId: selectedPlanId,
              });
              return;
            }
            const roomIdsParam = draft.roomIds.join(',');
            router.push(
              `/academic/seatallocation/${examId}/review?divisionId=${division}&roomIds=${roomIdsParam}&seatingPlanId=${selectedPlanId}`
            );
          }}
          onUndo={actions.undo}
          onRedo={actions.redo}
          canUndo={canUndo && !selectedPlanIsLocked}
          canRedo={canRedo && !selectedPlanIsLocked}
        />

        {isInitialLoading ? (
          <Stack spacing={1} sx={{ flex: 1, p: 2 }}>
            {/* Progress summary skeleton */}
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: 1 }} />
            {/* Filter bar skeleton */}
            <Skeleton variant="rounded" height={52} sx={{ borderRadius: 1 }} />
            {/* Three-panel workspace skeleton */}
            <Grid container spacing={1} sx={{ flex: 1, minHeight: 0 }}>
              {/* Left panel: Student queue */}
              <Grid size={2.75}>
                <Stack spacing={1} sx={{ p: 1 }}>
                  <Skeleton variant="rounded" height={36} sx={{ borderRadius: 1 }} />
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
                      <Skeleton variant="circular" width={28} height={28} />
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="70%" sx={{ height: 14 }} />
                        <Skeleton variant="text" width="40%" sx={{ height: 12 }} />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
              {/* Center panel: Seat layout grid */}
              <Grid size={7}>
                <Stack spacing={1.5} sx={{ p: 1 }}>
                  <Skeleton variant="rounded" height={36} sx={{ borderRadius: 1 }} />
                  <Grid container spacing={1.5}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Skeleton variant="rounded" height={72} sx={{ borderRadius: 1 }} />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Grid>
              {/* Right panel: Inspector */}
              <Grid size={2.25}>
                <Stack spacing={1} sx={{ p: 1.5 }}>
                  <Skeleton variant="rounded" height={28} sx={{ borderRadius: 1 }} />
                  {[1, 2, 3].map((i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 1 }} />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <>
            {isPlanDraftDataLoading || isScopesDataLoading ? (
              <Skeleton variant="rounded" height={60} sx={{ mx: 2, mt: 1, borderRadius: 1 }} />
            ) : (
          <AllocationProgressSummary
            totalStudents={counters.totalStudents}
            allocatedCount={counters.allocatedCount}
            pendingCount={counters.pendingCount}
            emptySeats={emptySeats}
            roomsUsed={draft.rooms.length}
            utilization={overallUtilization}
            conflicts={validation.blockers.length}
            progress={counters.allocationProgress}
          />
        )}

        <Paper sx={{ mx: 2, mt: 1, p: 1, boxShadow: 'var(--shadows-2)' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', md: 'center' }}
            flexWrap="wrap"
          >
            {/* Seating Plan Select with built-in skeleton */}
            <CustomSelect
              options={scopesData?.items || []}
              label="Seating Plan"
              value={selectedPlanId}
              onChange={(val) => setSelectedPlanId(val as string)}
              labelKey="name"
              valueKey="seatingPlanId"
              isLoading={isScopesDataLoading}
              formControlProps={{ sx: { minWidth: 200 } }}
            />
            {/* Division Select with built-in skeleton */}
            <CustomSelect
              options={divisionsData?.items || []}
              label="Division"
              value={division}
              onChange={(val) => {
                setDivision(val as string);
                setActiveRoomId('');
              }}
              labelKey="name"
              valueKey="id"
              isLoading={isDivisionsDataLoading}
              formControlProps={{ sx: { minWidth: 160 } }}
            />
            {/* Room Select with built-in skeleton */}
            <CustomSelect
              options={roomsData?.items || []}
              label="Room"
              value={activeRoomId}
              onChange={(val) => val && setActiveRoomId(val as string)}
              labelKey="roomName"
              valueKey="id"
              isLoading={isRoomsDataLoading}
              formControlProps={{ sx: { minWidth: 160 } }}
              disabled={!division || isRoomsDataLoading}
            />
            <Box sx={{ flex: 1, minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedScope?.subjects
                  ?.map((subject: SeatingPlanSubject) => subject.subjectName)
                  .join(', ') || 'No subjects selected'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setScopeDialogOpen(true)}
              disabled={selectedPlanIsLocked}
            >
              Selected Subjects
            </Button>
            <SubmitButton
              variant="outlined"
              buttonText="Subject Wise"
              loading={isSavingScope}
              onClick={handleCreateIndividualScopes}
              disabled={isSavingScope || selectedPlanIsLocked}
              type="button"
            />
          </Stack>
          {(selectedPlanIsLocked ||
            selectedPlanHasAllocations ||
            allSubjectPlanWithAllocations) && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {selectedPlanIsLocked && (
                  <Alert severity="warning">
                    This seating plan is finalized. Unlock it before changing seats, rooms, rules, or
                    subjects.
                  </Alert>
                )}
                {!selectedPlanIsLocked && selectedPlanHasAllocations && (
                  <Alert severity="info">
                    This plan already has allocations. Remove allocations before changing its subject
                    scope.
                  </Alert>
                )}
                {!selectedPlanIsLocked &&
                  selectedScope?.scopeType !== 0 &&
                  allSubjectPlanWithAllocations &&
                  allSubjectPlanWithAllocations.seatingPlanId !== selectedPlanId && (
                    <Alert severity="warning">
                      The all-subject plan already has allocations. Review validation before
                      finalizing this subject plan.
                    </Alert>
                  )}
              </Stack>
            )}
        </Paper>

        {draft.rooms.length > 0 && (
          <RoomSwitcher
            rooms={roomUtilization}
            activeRoomId={activeRoomId}
            onSwitch={setActiveRoomId}
          />
        )}

        <Grid container spacing={1} sx={{ flex: 1, minHeight: 0, p: 1 }}>
          {/* Left Panel: Student Queue */}
          <Grid size={2.75} sx={{ height: '100%' }}>
            <Paper elevation={2} sx={{ p: 1, height: '100%' }}>
              <StudentQueuePanel
                students={draft.students}
                assignments={draft.assignments}
                conflictStudentIds={conflictStudentIds}
                multiSelectedIds={multiSelectedIds}
                isLoading={isStudentsDataLoading}
                onToggleMultiSelect={(id) =>
                  setMultiSelectedIds((prev) => {
                    if (selectedPlanIsLocked) return prev;
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onSelectAll={(ids) => {
                  if (selectedPlanIsLocked) return;
                  setMultiSelectedIds(new Set(ids));
                }}
                onDeselectAll={() => {
                  if (selectedPlanIsLocked) return;
                  setMultiSelectedIds(new Set());
                }}
                onBulkAllocateSequential={handleBulkAllocateSequential}
                onBulkExclude={(ids) => {
                  if (selectedPlanIsLocked) return;
                  setDraft((d) => ({
                    ...d,
                    excludedStudentIds: [...new Set([...d.excludedStudentIds, ...ids])],
                  }));
                  setMultiSelectedIds(new Set());
                }}
                isReadOnly={selectedPlanIsLocked}
              />
            </Paper>
          </Grid>

          {/* Center Panel: Seat Layout Canvas */}
          <Grid size={7} sx={{ height: '100%' }}>
            <Paper elevation={2} sx={{ p: 1, height: '100%' }}>
              {isSeatLayoutDataLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    p: 2,
                    height: '100%',
                  }}
                >
                  <Skeleton variant="rounded" height={36} />
                  <Grid container spacing={1.5} sx={{ flex: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Skeleton variant="rounded" height={72} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : !activeRoom ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <Chip label="Select a division and add a room to begin" variant="outlined" />
                </Box>
              ) : (
                <SeatLayoutCanvas
                  room={activeRoom}
                  assignments={draft.assignments}
                  studentsById={studentsById}
                  conflictSeatIds={conflictSeatIds}
                  onAssign={actions.assignStudent}
                  onUnassign={actions.unassignStudent}
                  onToggleReserve={(roomId, seat) =>
                    handleToggleReserveSeat(roomId, seat.seatNumber)
                  }
                  isReadOnly={selectedPlanIsLocked}
                />
              )}
            </Paper>
          </Grid>

          {/* Right Panel: Seat Inspector / Rules */}
          <Grid size={2.25} sx={{ height: '100%' }}>
            <Paper elevation={2} sx={{ height: '100%' }}>
              <SeatInspectorPanel
                blockers={validation.blockers}
                warnings={validation.warnings}
                isLoading={isPlanDraftDataLoading || isScopesDataLoading}
                onOpenRules={() => setRulesOpen(true)}
              />
            </Paper>
          </Grid>
        </Grid>
          </>
        )}

        <AllocationRuleDrawer
          open={rulesOpen}
          rules={draft.allocationRules}
          onClose={() => setRulesOpen(false)}
          onPreview={(rules) => {
            if (selectedPlanIsLocked) {
              return {
                totalStudents: counters.totalStudents,
                allocated: counters.allocatedCount,
                roomsUsed: draft.rooms.length,
                remaining: counters.pendingCount,
                emptySeats,
                utilization: overallUtilization,
              };
            }
            setDraft((d) => ({ ...d, allocationRules: rules }));
            return handleAutoAllocatePreview(rules);
          }}
          onApply={applyAutoAllocate}
          onCancelPreview={() => { }}
        />

        {/* Scope Creation Dialog */}
        {scopeDialogOpen && (
          <Formik
            initialValues={{ planName: scopeName, subjectIds: scopeSubjectIds }}
            validationSchema={Yup.object().shape({
              planName: Yup.string().trim().required('Plan name is required'),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              const subjects = scopesData?.availableSubjects || [];
              const chosenIds = values.subjectIds.length
                ? values.subjectIds
                : subjects
                  .filter(
                    (subject: SeatingPlanSubject) => !subjectWiseSubjectOwners.has(subject.examSubjectId)
                  )
                  .map((subject: SeatingPlanSubject) => subject.examSubjectId);
              if (!chosenIds.length) {
                setSubmitting(false);
                return;
              }
              const ownedSubject = chosenIds.find((subjectId: string) =>
                subjectWiseSubjectOwners.has(subjectId)
              );
              if (ownedSubject) {
                shikshaMitraToast.error({
                  message: 'One or more selected subjects already belong to another subject-wise plan.',
                });
                setSubmitting(false);
                return;
              }
              try {
                const response = await saveSeatingPlanScope({
                  examId,
                  body: {
                    name: values.planName,
                    scopeType: chosenIds.length === subjects.length ? 0 : chosenIds.length === 1 ? 2 : 1,
                    examSubjectIds: chosenIds,
                  },
                }).unwrap();
                setSelectedPlanId(response.seatingPlanId);
                setScopeDialogOpen(false);
                setScopeName('');
                setScopeSubjectIds([]);
                shikshaMitraToast.success({ message: 'Seating plan scope created.' });
              } catch {
                shikshaMitraToast.error({ message: 'Failed to create seating plan scope.' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit, isSubmitting }) => (
              <CustomDialog
                open={scopeDialogOpen}
                handleClose={() => setScopeDialogOpen(false)}
                title={
                  <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span" sx={{ fontWeight: 'normal' }}>
                    <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                      Create Seating Plan
                    </Box>
                    <CustomTooltip
                      arrow
                      placement="right"
                      title="Define a new seating arrangement plan for specific subjects and classrooms."
                    >
                      <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={16} height={16} />
                    </CustomTooltip>
                  </Box>
                }
                maxWidth="sm"
                hasForm={false}
              >
                <DialogScrollContent>
                  <Stack spacing={2}>
                    <Box sx={{ pt: 1 }}>
                      <TextField
                        name="planName"
                        value={values.planName}
                        label="Plan Name *"
                        onChange={(e) => {
                          handleChange(e);
                          setScopeName(e.target.value);
                        }}
                        onBlur={handleBlur}
                        placeholder="Enter plan name"
                        fullWidth
                        size="small"
                        error={touched.planName && Boolean(errors.planName)}
                        helperText={touched.planName && errors.planName}
                        sx={{
                          animation: touched.planName && errors.planName ? `${shakeAnimation} 0.5s ease-in-out` : 'none',
                        }}
                      />
                    </Box>
                    {allSubjectPlanWithAllocations && (
                      <Alert severity="warning">
                        The all-subject plan already has allocations. This new plan will be validated
                        separately.
                      </Alert>
                    )}
                    {selectedDialogHasOwnedSubject && (
                      <Alert severity="error">
                        Remove subjects already used in another subject-wise plan before creating this
                        plan.
                      </Alert>
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Select Subjects
                      </Typography>
                      <Grid container spacing={1}>
                        {(scopesData?.availableSubjects || []).map((subject: any) => {
                          const owner = subjectWiseSubjectOwners.get(subject.examSubjectId);
                          const label =
                            owner && owner.name !== subject.subjectName
                              ? `${subject.subjectName} (${owner.name})`
                              : subject.subjectName;
                          return (
                            <Grid key={subject.examSubjectId} size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={values.subjectIds.includes(subject.examSubjectId)}
                                    disabled={!!owner}
                                    onChange={(event) => {
                                      const nextIds = event.target.checked
                                        ? [...values.subjectIds, subject.examSubjectId]
                                        : values.subjectIds.filter((id) => id !== subject.examSubjectId);
                                      setFieldValue('subjectIds', nextIds);
                                      setScopeSubjectIds(nextIds);
                                    }}
                                  />
                                }
                                label={label}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Stack>
                </DialogScrollContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <CancelButton onClick={() => setScopeDialogOpen(false)} />
                  <SubmitButton
                    buttonText="Create"
                    type="button"
                    loading={isSavingScope || isSubmitting}
                    onClick={() => handleSubmit()}
                  />
                </DialogActions>
              </CustomDialog>
            )}
          </Formik>
        )}
      </Box>
    </DndContext>
  );
}

