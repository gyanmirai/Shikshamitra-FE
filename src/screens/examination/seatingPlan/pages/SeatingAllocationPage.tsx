'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
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
  Dialog,
  Checkbox,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material';
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

  const { data: divisionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { examId, standardId },
    options: { skip: !examId || !standardId },
  });

  const { data: scopesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanScopesQuery,
    params: { examId },
    options: { skip: !examId },
  });

  const [saveSeatingPlanScope, { isLoading: isSavingScope }] = useSaveSeatingPlanScopeMutation();

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

  const { data: roomsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId, divisionId: division, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !division || !selectedPlanId },
  });

  const { data: studentsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationStudentsQuery,
    params: { examId, divisionId: division, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !division || !selectedPlanId },
  });

  const { data: seatLayoutData, isFetching: seatLayoutFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatLayoutQuery,
    params: { examId, divisionId: division, roomId: activeRoomId, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !division || !activeRoomId || !selectedPlanId },
  });

  const [saveSeatAllocation, { isLoading: isSaving }] = useSaveSeatAllocationMutation();
  const [saveSeatingPlanDraft, { isLoading: isSavingPlan }] = useSaveSeatingPlanDraftMutation();
  const [autoAllocatePreview] = useAutoAllocatePreviewMutation();

  const { data: planDraftData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanDraftQuery,
    params: { examId, seatingPlanId: selectedPlanId },
    options: { skip: !examId || !selectedPlanId },
  });

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
      if (!activeData || overData?.type !== 'seat' || !overData.seat || !overData.roomId) {
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

  // Merge server-persisted plan-level state (rules/excluded students) once, on first load,
  // without clobbering in-progress local edits on every refetch.
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

  // Load students into the draft once per division, marking anyone flagged as a special
  // seating requirement on the persisted plan (re-runs once the plan draft itself arrives).
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

  // Merge the active room's layout + existing assignments into the draft without dropping other rooms.
  useEffect(() => {
    if (!activeRoomId || seatLayoutFetching || !seatLayoutData) return;
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
  }, [activeRoomId, seatLayoutData, seatLayoutFetching, roomsData, setDraft]);

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

  const applyAutoAllocate = useCallback(async () => {
    if (selectedPlanIsLocked) return;
    try {
      const response = await autoAllocatePreview({
        examId,
        body: {
          roomIds: draft.roomIds,
          seatingPlanId: selectedPlanId,
          strategy: draft.allocationRules.strategy,
          fillDirection: draft.allocationRules.fillDirection,
          leaveGap: draft.allocationRules.leaveGap,
          mixDivisions: draft.allocationRules.mixDivisions,
          specialRequirementPriority: draft.allocationRules.specialRequirementPriority,
          excludedStudentIds: draft.excludedStudentIds,
        },
      }).unwrap();

      const proposedAssignments = response.assignments.map((a: any) => ({
        studentId: a.studentId,
        roomId: a.roomId,
        seatId: seatId(a.roomId, a.seatNumber),
        seatNumber: a.seatNumber,
        benchId: a.benchId,
        assignedBy: 'auto' as const,
      }));
      const proposedStudentIds = new Set(
        proposedAssignments.map((a: { studentId: string }) => a.studentId)
      );
      const next = [
        ...draft.assignments.filter((a) => !proposedStudentIds.has(a.studentId)),
        ...proposedAssignments,
      ];
      actions.applyAssignments(next, 'auto-allocate');
    } catch {
      // Backend unavailable — fall back to the client-side adapter so the workspace stays usable.
      const result = autoAllocate(
        draft.students,
        draft.rooms,
        draft.assignments,
        draft.allocationRules,
        draft.excludedStudentIds
      );
      actions.applyAssignments(result.assignments, 'auto-allocate');
    }
  }, [draft, actions, examId, autoAllocatePreview, selectedPlanId, selectedPlanIsLocked]);

  const handleBulkAllocateSequential = useCallback(
    (studentIds: string[]) => {
      if (selectedPlanIsLocked) return;
      if (!activeRoom) return;
      const occupiedSeatIds = new Set(draft.assignments.map((a) => a.seatId));
      const freeSeats = activeRoom.seats.filter(
        (s) => !s.isDisabled && !occupiedSeatIds.has(s.seatId)
      );
      const next = [...draft.assignments];
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
      window.alert(
        'One or more selected subjects already belong to another subject-wise seating plan.'
      );
      return;
    }
    if (
      allSubjectPlanWithAllocations &&
      !window.confirm(
        'The all-subject seating plan already has allocations. Create this subject plan separately?'
      )
    ) {
      return;
    }
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
    if (
      allSubjectPlanWithAllocations &&
      !window.confirm(
        'The all-subject seating plan already has allocations. Create individual subject plans separately?'
      )
    ) {
      return;
    }

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
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <SeatingWorkspaceHeader
          examName={draft.examName}
          examTypeName={draft.examTypeName}
          standardName={draft.standardName}
          isDirty={draft.isDirty}
          isSaving={isSaving || isSavingPlan}
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

        <Paper sx={{ mx: 2, mt: 1, p: 1, boxShadow: 'var(--shadows-2)' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <CustomSelect
              options={scopesData?.items || []}
              label="Seating Plan"
              value={selectedPlanId}
              onChange={(val) => setSelectedPlanId(val as string)}
              labelKey="name"
              valueKey="seatingPlanId"
              formControlProps={{ sx: { minWidth: 240 } }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedScope?.subjects
                  ?.map((subject: SeatingPlanSubject) => subject.subjectName)
                  .join(', ') || 'No subjects selected'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => setScopeDialogOpen(true)}
              disabled={selectedPlanIsLocked}
            >
              Selected Subjects
            </Button>
            <Button
              variant="outlined"
              onClick={handleCreateIndividualScopes}
              disabled={isSavingScope || selectedPlanIsLocked}
            >
              Subject Wise
            </Button>
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

        <Box sx={{ display: 'flex', gap: 1.5, px: 2, py: 1, flexWrap: 'wrap' }}>
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
            formControlProps={{ sx: { minWidth: 180 } }}
          />
          <CustomSelect
            options={roomsData?.items || []}
            label="Room"
            value={activeRoomId}
            onChange={(val) => val && setActiveRoomId(val as string)}
            labelKey="roomName"
            valueKey="id"
            formControlProps={{ sx: { minWidth: 180 } }}
            disabled={!division}
          />
        </Box>

        {draft.rooms.length > 0 && (
          <RoomSwitcher
            rooms={roomUtilization}
            activeRoomId={activeRoomId}
            onSwitch={setActiveRoomId}
          />
        )}

        <Grid container spacing={1} sx={{ flex: 1, minHeight: 0, p: 1 }}>
          <Grid size={2.75} sx={{ height: '100%' }}>
            <Paper elevation={2} sx={{ p: 1, height: '100%' }}>
              <StudentQueuePanel
                students={draft.students}
                assignments={draft.assignments}
                conflictStudentIds={conflictStudentIds}
                multiSelectedIds={multiSelectedIds}
                onToggleMultiSelect={(id) =>
                  setMultiSelectedIds((prev) => {
                    if (selectedPlanIsLocked) return prev;
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onBulkAllocateSequential={handleBulkAllocateSequential}
                onBulkExclude={(ids) => {
                  if (selectedPlanIsLocked) return;
                  setDraft((d) => ({
                    ...d,
                    excludedStudentIds: [...new Set([...d.excludedStudentIds, ...ids])],
                  }));
                }}
                isReadOnly={selectedPlanIsLocked}
              />
            </Paper>
          </Grid>

          <Grid size={7} sx={{ height: '100%' }}>
            <Paper elevation={2} sx={{ p: 1, height: '100%' }}>
              {!activeRoom ? (
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

          <Grid size={2.25} sx={{ height: '100%' }}>
            <Paper elevation={2} sx={{ height: '100%' }}>
              <SeatInspectorPanel
                blockers={validation.blockers}
                warnings={validation.warnings}
                onOpenRules={() => setRulesOpen(true)}
              />
            </Paper>
          </Grid>
        </Grid>

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
          onCancelPreview={() => {}}
        />
        <Dialog
          open={scopeDialogOpen}
          onClose={() => setScopeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Seating Plan</DialogTitle>
          <DialogContent>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <TextField
                label="Plan name"
                value={scopeName}
                onChange={(event) => setScopeName(event.target.value)}
                fullWidth
              />
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
                {(scopesData?.availableSubjects || []).map((subject: any) => {
                  const owner = subjectWiseSubjectOwners.get(subject.examSubjectId);
                  return (
                    <FormControlLabel
                      key={subject.examSubjectId}
                      control={
                        <Checkbox
                          checked={scopeSubjectIds.includes(subject.examSubjectId)}
                          disabled={!!owner}
                          onChange={(event) =>
                            setScopeSubjectIds((current) =>
                              event.target.checked
                                ? [...current, subject.examSubjectId]
                                : current.filter((id) => id !== subject.examSubjectId)
                            )
                          }
                        />
                      }
                      label={owner ? `${subject.subjectName} (${owner.name})` : subject.subjectName}
                    />
                  );
                })}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScopeDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateSelectedScope}
              disabled={
                isSavingScope ||
                selectedDialogHasOwnedSubject ||
                selectedDialogSubjectIds.length === 0
              }
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndContext>
  );
}
