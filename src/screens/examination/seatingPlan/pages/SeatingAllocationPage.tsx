'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'src/theme/styles';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
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
import { useSeatingDraft } from '../hooks/useSeatingDraft';
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
  toSeatingStudentsFromAllocations,
  upsertSeatingRoomLayout,
  toSaveSeatingPlanPayload,
} from '../utils/mappers';

import { DEFAULT_ALLOCATION_RULES } from '../types';
import type {
  SeatingSeat,
  SeatingStudent,
  SeatingPlanScope,
  SeatingAssignment,
  SeatingPlanSubject,
  SeatingAllocationRules,
} from '../types';

interface Props {
  examId: string;
  initialStandardId?: string;
  onClose?: () => void;
  onOpenReview?: (context: {
    divisionId: string;
    roomIds: string[];
    seatingPlanId?: string;
  }) => void;
  /** Notifies the host (e.g. workspace drawer) whenever unsaved changes exist. */
  onDirtyStateChange?: (isDirty: boolean) => void;
}

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

export default function SeatingAllocationPage({
  examId,
  initialStandardId,
  onClose,
  onOpenReview,
  onDirtyStateChange,
}: Props) {
  const router = useRouter();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAutoAllocate = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.seatAllocation}.AutoAllocate`
  );

  const [standardId, setStandardId] = useState(initialStandardId ?? '');
  const [division, setDivision] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');
  const roomNameByIdRef = useRef(new Map<string, string>());

  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [scopeName, setScopeName] = useState('');
  const [scopeSubjectIds, setScopeSubjectIds] = useState<string[]>([]);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isSubjectWiseMode, setIsSubjectWiseMode] = useState(false);

  useEffect(() => {
    if (initialStandardId) {
      setStandardId(initialStandardId);
      return;
    }
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [];
    if (!standardId) setStandardId(allClasses[0]?.id || '');
  }, [currentMedium, initialStandardId, standardId]);

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
    isSuccess: isPlanDraftSuccess,
    isError: isPlanDraftError,
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
  // Student data stays visible during a same-query background refresh. The seat-layout
  // skeleton intentionally appears for every layout request, including the refetch caused
  // by saving a draft, so stale seat assignments are never presented as current.
  const isStudentsDataLoading = (isStudentsLoading || isStudentsFetching) && !studentsData;
  const isSeatLayoutDataLoading = isSeatLayoutLoading || isSeatLayoutFetching;
  const isPlanDraftDataLoading = (isPlanDraftLoading || isPlanDraftFetching) && !planDraftData;

  const isFetchingAny =
    isScopesFetching ||
    isDivisionsFetching ||
    isRoomsFetching ||
    isStudentsFetching ||
    isSeatLayoutFetching ||
    isPlanDraftFetching;

  // Keep the full workspace skeleton mounted through the dependent bootstrap sequence.
  // The draft query is skipped until a plan is selected, so checking only its loading flag
  // creates a brief false/loading/false transition and exposes the empty workspace.
  const isInitialLoading =
    isScopesDataLoading ||
    isDivisionsDataLoading ||
    !selectedPlanId ||
    (!isPlanDraftSuccess && !isPlanDraftError);

  // Room results are division-scoped. Retain their labels so switching divisions or
  // subject-wise plans cannot let a late layout response expose an internal room UUID.
  useEffect(() => {
    (roomsData?.items || []).forEach((room: { id?: string; roomName?: string }) => {
      if (room.id && room.roomName) roomNameByIdRef.current.set(room.id, room.roomName);
    });
  }, [roomsData]);

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

  const allSubjectScope = useMemo(
    () => (scopesData?.items || []).find((scope: SeatingPlanScope) => scope.scopeType === 0),
    [scopesData?.items]
  );

  const seatingPlanOptions = useMemo(() => {
    const allItems = scopesData?.items || [];
    const subjectWiseItems = allItems.filter((scope: SeatingPlanScope) => scope.scopeType !== 0);
    if (isSubjectWiseMode && subjectWiseItems.length > 0) {
      return subjectWiseItems;
    }
    if (allSubjectScope) {
      return [allSubjectScope];
    }
    return allItems;
  }, [scopesData?.items, isSubjectWiseMode, allSubjectScope]);

  useEffect(() => {
    if (seatingPlanOptions.length) {
      const exists = seatingPlanOptions.some(
        (s: SeatingPlanScope) => s.seatingPlanId === selectedPlanId
      );
      if (!selectedPlanId || !exists) {
        setSelectedPlanId(seatingPlanOptions[0].seatingPlanId);
      }
    }
  }, [seatingPlanOptions, selectedPlanId]);

  useEffect(() => {
    if (divisionsData?.items?.length) {
      const exists = divisionsData.items.some((d: any) => d.id === division);
      if (!division || !exists) {
        setDivision(divisionsData.items[0].id);
        setActiveRoomId('');
      }
    }
  }, [divisionsData, division]);

  useEffect(() => {
    if (roomsData?.items?.length) {
      const exists = roomsData.items.some((r: any) => r.id === activeRoomId);
      if (!activeRoomId || !exists) {
        setActiveRoomId(roomsData.items[0].id);
      }
    }
  }, [roomsData, activeRoomId]);

  const { draft, setDraft, actions, canUndo, canRedo } = useSeatingDraft(buildEmptyDraft(examId));

  const isSaving = isSavingSeatAllocation || isSavingPlanDraft;

  const selectedScope = (scopesData?.items || []).find(
    (scope: SeatingPlanScope) => scope.seatingPlanId === selectedPlanId
  );
  const isPublished =
    selectedScope?.status === 5 ||
    planDraftData?.status === 5 ||
    draft.status === 'published';
  const selectedPlanIsLocked = !!selectedScope?.isLocked || isPublished;
  const selectedPlanHasAllocations = (selectedScope?.allocatedStudents ?? 0) > 0;
  const isSubjectWiseActive =
    isSubjectWiseMode || (!!selectedScope && selectedScope.scopeType !== 0);
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

  // Keep the host (workspace drawer) in sync so close actions can be intercepted
  // with an unsaved-changes confirmation instead of silently discarding the draft.
  useEffect(() => {
    onDirtyStateChange?.(!!draft.isDirty);
  }, [draft.isDirty, onDirtyStateChange]);

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
        { type: string; seat?: SeatingSeat; roomId?: string } | undefined;
      if (
        !activeData ||
        overData?.type !== 'seat' ||
        !overData.seat ||
        !overData.roomId ||
        overData.seat.isDisabled
      ) {
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
      roomMeta?.roomName ?? roomNameByIdRef.current.get(activeRoomId) ?? activeRoomId
    );
    const loadedAssignments = toSeatingAssignments(seatLayoutData.items, activeRoomId);

    setDraft((d) => {
      const rooms = upsertSeatingRoomLayout(d.rooms, layout);
      const assignments = [
        ...d.assignments.filter((a) => a.roomId !== activeRoomId),
        ...loadedAssignments,
      ];
      const roomIds = d.roomIds.includes(activeRoomId) ? d.roomIds : [...d.roomIds, activeRoomId];
      return { ...d, rooms, assignments, roomIds };
    });
  }, [activeRoomId, seatLayoutData, isSeatLayoutDataLoading, roomsData, setDraft]);

  const currentDivisionRoomIds = useMemo(() => {
    const roomIds = new Set<string>(
      (roomsData?.items || []).map((room: { id: string }) => room.id).filter(Boolean)
    );

    // activeRoomId is cleared whenever the division changes. Until the new division's
    // first room is selected, hide any cached rooms from the previous division.
    return activeRoomId && roomIds.has(activeRoomId) ? roomIds : new Set<string>();
  }, [roomsData, activeRoomId]);

  const workspaceDraft = useMemo(
    () => ({
      ...draft,
      roomIds: draft.roomIds.filter((roomId) => currentDivisionRoomIds.has(roomId)),
      rooms: draft.rooms.filter((room) => currentDivisionRoomIds.has(room.roomId)),
      assignments: draft.assignments.filter((assignment) =>
        currentDivisionRoomIds.has(assignment.roomId)
      ),
    }),
    [draft, currentDivisionRoomIds]
  );

  const workspaceCounters = useMemo(() => {
    const eligibleStudents = workspaceDraft.students.filter(
      (student) => !workspaceDraft.excludedStudentIds.includes(student.studentId)
    );
    const assignedStudentIds = new Set(
      workspaceDraft.assignments.map((assignment) => assignment.studentId)
    );
    const allocatedCount = eligibleStudents.filter((student) =>
      assignedStudentIds.has(student.studentId)
    ).length;
    const totalStudents = eligibleStudents.length;

    return {
      totalStudents,
      allocatedCount,
      pendingCount: Math.max(0, totalStudents - allocatedCount),
      allocationProgress:
        totalStudents === 0 ? 0 : Math.round((allocatedCount / totalStudents) * 100),
    };
  }, [workspaceDraft]);

  const workspaceRoomUtilization = useMemo(
    () =>
      workspaceDraft.rooms.map((room) => {
        const occupied = workspaceDraft.assignments.filter(
          (assignment) => assignment.roomId === room.roomId
        ).length;
        const usable = room.seats.filter((seat) => !seat.isDisabled).length || room.capacity;
        return { roomId: room.roomId, roomName: room.roomName, occupied, usable };
      }),
    [workspaceDraft]
  );

  const validation = useMemo(() => validateSeatingDraft(workspaceDraft), [workspaceDraft]);
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
  const studentsById = useMemo(() => {
    const students = new Map(draft.students.map((student) => [student.studentId, student]));

    // Keep the queue scoped to the selected division, while resolving every occupied
    // seat from the room response (including students from other divisions/exams).
    toSeatingStudentsFromAllocations(seatLayoutData?.items).forEach((student) => {
      const existing = students.get(student.studentId);
      students.set(student.studentId, existing ? { ...student, ...existing } : student);
    });

    return students;
  }, [draft.students, seatLayoutData]);

  const emptySeats = workspaceDraft.rooms.reduce(
    (sum, r) =>
      sum +
      Math.max(
        0,
        r.seats.length - workspaceDraft.assignments.filter((a) => a.roomId === r.roomId).length
      ),
    0
  );
  const overallUtilization =
    workspaceDraft.rooms.length === 0
      ? 0
      : Math.round(
        (workspaceDraft.assignments.length /
          workspaceDraft.rooms.reduce((s, r) => s + (r.seats.length || r.capacity), 0 || 1)) *
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

  const handleConfirmReset = useCallback(() => {
    if (selectedPlanIsLocked || isPublished) return;

    // Reset subject-wise mode and return Seating Plan dropdown to All Subjects
    setIsSubjectWiseMode(false);
    if (allSubjectScope?.seatingPlanId) {
      setSelectedPlanId(allSubjectScope.seatingPlanId);
    } else if (scopesData?.items?.length) {
      const defaultScope =
        scopesData.items.find((s: SeatingPlanScope) => s.scopeType === 0) || scopesData.items[0];
      setSelectedPlanId(defaultScope.seatingPlanId);
    }

    // Reset local draft state in UI and mark dirty for manual Save Draft
    setDraft((d) => ({
      ...d,
      assignments: [],
      allocationRules: DEFAULT_ALLOCATION_RULES,
      excludedStudentIds: [],
      isDirty: true,
    }));

    setMultiSelectedIds(new Set());
    if (divisionsData?.items?.length) {
      setDivision(divisionsData.items[0].id);
    }
    setActiveRoomId('');
    setResetConfirmOpen(false);
    shikshaMitraToast.success({
      message: 'Seating plan has been reset. Click "Save Draft" to save changes.',
    });
  }, [
    selectedPlanIsLocked,
    isPublished,
    allSubjectScope,
    scopesData?.items,
    setDraft,
    divisionsData?.items,
  ]);

  const handleAutoAllocatePreview = useCallback(
    (rules: SeatingAllocationRules) => {
      const result = autoAllocate(
        workspaceDraft.students,
        workspaceDraft.rooms,
        workspaceDraft.assignments,
        rules,
        workspaceDraft.excludedStudentIds
      );
      const studentIdSet = new Set(workspaceDraft.students.map((s) => s.studentId));
      const newlyAllocatedForThisScope = result.assignments.filter((a) =>
        studentIdSet.has(a.studentId)
      ).length;
      const totalEligible = workspaceDraft.students.filter(
        (s) => !workspaceDraft.excludedStudentIds.includes(s.studentId)
      ).length;
      const roomsUsed = new Set(result.assignments.map((a) => a.roomId)).size;
      const usableTotal = workspaceDraft.rooms.reduce(
        (s, r) => s + (r.seats.filter((se) => !se.isDisabled).length || r.capacity),
        0
      );
      return {
        totalStudents: totalEligible,
        allocated: newlyAllocatedForThisScope,
        roomsUsed,
        remaining: result.unallocatedStudentIds.length,
        emptySeats: Math.max(0, usableTotal - result.assignments.length),
        utilization:
          usableTotal === 0 ? 0 : Math.round((result.assignments.length / usableTotal) * 100),
      };
    },
    [workspaceDraft]
  );

  const applyAutoAllocate = useCallback(
    (appliedRules?: SeatingAllocationRules) => {
      if (selectedPlanIsLocked) return;
      const rulesToUse = appliedRules || draft.allocationRules;
      const result = autoAllocate(
        workspaceDraft.students,
        workspaceDraft.rooms,
        workspaceDraft.assignments,
        rulesToUse,
        workspaceDraft.excludedStudentIds
      );
      const otherDivisionAssignments = draft.assignments.filter(
        (assignment) => !currentDivisionRoomIds.has(assignment.roomId)
      );
      actions.applyAssignments(
        [...otherDivisionAssignments, ...result.assignments],
        'auto-allocate'
      );
      setDraft((d) => ({ ...d, allocationRules: rulesToUse }));
      shikshaMitraToast.success({ message: 'Auto-allocation applied.' });
    },
    [
      draft.assignments,
      draft.allocationRules,
      workspaceDraft,
      currentDivisionRoomIds,
      actions,
      setDraft,
      selectedPlanIsLocked,
    ]
  );

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
      setIsSubjectWiseMode(true);
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
    if (isSubjectWiseMode) {
      setIsSubjectWiseMode(false);
      if (allSubjectScope?.seatingPlanId) {
        setSelectedPlanId(allSubjectScope.seatingPlanId);
      }
      return;
    }

    const subjects = scopesData?.availableSubjects || [];
    const missingSubjects = subjects.filter(
      (subject: SeatingPlanSubject) => !subjectWiseSubjectOwners.has(subject.examSubjectId)
    );
    if (!missingSubjects.length) {
      const firstExisting = (scopesData?.items || []).find(
        (scope: SeatingPlanScope) => scope.scopeType !== 0
      );
      if (firstExisting?.seatingPlanId) {
        setIsSubjectWiseMode(true);
        setSelectedPlanId(firstExisting.seatingPlanId);
      }
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
      setIsSubjectWiseMode(true);
      if (created[0]?.seatingPlanId) setSelectedPlanId(created[0].seatingPlanId);
      shikshaMitraToast.success({ message: 'Subject-wise plans created successfully.' });
    } catch {
      shikshaMitraToast.error({ message: 'Failed to create subject-wise plans.' });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
        aria-busy={isSaving}
      >
        {isSaving && (
          <Box
            className="loading-overlay"
            role="status"
            aria-live="polite"
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: (theme) => theme.zIndex.modal + 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              color: 'text.primary',
              bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.9),
              backdropFilter: 'blur(4px)',
              cursor: 'wait',
            }}
          >
            <CircularProgress size={40} color="primary" />
            <Box component="span" sx={{ typography: 'body2', fontWeight: 600 }}>
              Saving draft...
            </Box>
          </Box>
        )}

        <SeatingWorkspaceHeader
          examName={draft.examName}
          examTypeName={draft.examTypeName}
          standardName={draft.standardName}
          isDirty={draft.isDirty}
          isSaving={isSaving}
          isReadOnly={selectedPlanIsLocked}
          isPublished={isPublished}
          canAutoAllocate={!!activeRoom && canAutoAllocate && !selectedPlanIsLocked}
          canReset={!selectedPlanIsLocked && !isPublished}
          canFinalize={workspaceCounters.pendingCount === 0 && validation.blockers.length === 0}
          onBack={() => {
            if (onClose) {
              onClose();
              return;
            }
            router.push('/academic/seatallocation');
          }}
          onSaveDraft={handleSaveDraft}
          onAutoAllocate={() => setRulesOpen(true)}
          onReset={() => setResetConfirmOpen(true)}
          onReview={async () => {
            if (!selectedPlanIsLocked && draft.isDirty) await handleSaveDraft();
            const currentRoomIds =
              draft.roomIds.length > 0
                ? draft.roomIds
                : (roomsData?.items || []).map((r: any) => r.id).filter(Boolean);
            if (onOpenReview) {
              onOpenReview({
                divisionId: division,
                roomIds: currentRoomIds,
                seatingPlanId: selectedPlanId,
              });
              return;
            }
            const roomIdsParam = currentRoomIds.join(',');
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
                totalStudents={workspaceCounters.totalStudents}
                allocatedCount={workspaceCounters.allocatedCount}
                pendingCount={workspaceCounters.pendingCount}
                emptySeats={emptySeats}
                roomsUsed={workspaceDraft.rooms.length}
                utilization={overallUtilization}
                conflicts={validation.blockers.length}
                progress={workspaceCounters.allocationProgress}
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
                  options={seatingPlanOptions}
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
                <TextField
                  label="Subject"
                  size="small"
                  value={
                    selectedScope?.subjects
                      ?.map((subject: SeatingPlanSubject) => subject.subjectName)
                      .join(', ') || 'No subjects selected'
                  }
                  slotProps={{
                    input: { readOnly: true },
                    htmlInput: { 'aria-label': 'Allocated subjects' },
                  }}
                  sx={{ flex: 1, minWidth: 180 }}
                />
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
                  sx={{
                    ...(isSubjectWiseActive && {
                      bgcolor: 'primary.lighter',
                      borderColor: 'primary.main',
                      color: 'primary.darker',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                        borderColor: 'primary.dark',
                      },
                    }),
                  }}
                />
              </Stack>
              {(selectedPlanIsLocked ||
                selectedPlanHasAllocations ||
                allSubjectPlanWithAllocations) && (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {selectedPlanIsLocked && (
                      <Alert severity="warning">
                        This seating plan is finalized. Unlock it before changing seats, rooms, rules,
                        or subjects.
                      </Alert>
                    )}
                    {!selectedPlanIsLocked && selectedPlanHasAllocations && (
                      <Alert severity="info">
                        This plan already has allocations. Remove allocations before changing its
                        subject scope.
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

            {workspaceDraft.rooms.length > 0 && (
              <RoomSwitcher
                rooms={workspaceRoomUtilization}
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
                    excludedStudentIds={draft.excludedStudentIds}
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
                      actions.excludeStudents(ids);
                      setMultiSelectedIds(new Set());
                      shikshaMitraToast.success({
                        message: `${ids.length} student${ids.length > 1 ? 's' : ''} excluded from seating plan.`,
                      });
                    }}
                    onBulkInclude={(ids) => {
                      if (selectedPlanIsLocked) return;
                      actions.includeStudents(ids);
                      setMultiSelectedIds(new Set());
                      shikshaMitraToast.success({
                        message: `${ids.length} student${ids.length > 1 ? 's' : ''} re-included in seating plan.`,
                      });
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
                totalStudents: workspaceCounters.totalStudents,
                allocated: workspaceCounters.allocatedCount,
                roomsUsed: workspaceDraft.rooms.length,
                remaining: workspaceCounters.pendingCount,
                emptySeats,
                utilization: overallUtilization,
              };
            }
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
                    (subject: SeatingPlanSubject) =>
                      !subjectWiseSubjectOwners.has(subject.examSubjectId)
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
                  message:
                    'One or more selected subjects already belong to another subject-wise plan.',
                });
                setSubmitting(false);
                return;
              }
              try {
                const response = await saveSeatingPlanScope({
                  examId,
                  body: {
                    name: values.planName,
                    scopeType:
                      chosenIds.length === subjects.length ? 0 : chosenIds.length === 1 ? 2 : 1,
                    examSubjectIds: chosenIds,
                  },
                }).unwrap();
                setIsSubjectWiseMode(true);
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
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              handleSubmit,
              isSubmitting,
            }) => (
              <CustomDialog
                open={scopeDialogOpen}
                handleClose={() => setScopeDialogOpen(false)}
                title={
                  <Box
                    display="flex"
                    flexDirection="row"
                    gap={1}
                    alignItems="center"
                    component="span"
                    sx={{ fontWeight: 'normal' }}
                  >
                    <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                      Create Seating Plan
                    </Box>
                    <CustomTooltip
                      arrow
                      placement="right"
                      title="Define a new seating arrangement plan for specific subjects and classrooms."
                    >
                      <Iconify
                        icon={GlobalIcons.info}
                        sx={{ cursor: 'pointer' }}
                        color="info.main"
                        width={16}
                        height={16}
                      />
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
                          animation:
                            touched.planName && errors.planName
                              ? `${shakeAnimation} 0.5s ease-in-out`
                              : 'none',
                        }}
                      />
                    </Box>
                    {allSubjectPlanWithAllocations && (
                      <Alert severity="warning">
                        The all-subject plan already has allocations. This new plan will be
                        validated separately.
                      </Alert>
                    )}
                    {selectedDialogHasOwnedSubject && (
                      <Alert severity="error">
                        Remove subjects already used in another subject-wise plan before creating
                        this plan.
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
                                        : values.subjectIds.filter(
                                          (id) => id !== subject.examSubjectId
                                        );
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

        {/* Reset Confirmation Dialog */}
        <ConfirmDialog
          open={resetConfirmOpen}
          onClose={() => setResetConfirmOpen(false)}
          title="Reset Seating Plan"
          content="Are you sure you want to reset the seating plan? All assigned seats in the workspace will be cleared and the plan will return to All Subjects. You can click 'Save Draft' to save your changes."
          icon="warning"
          action={
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleConfirmReset}
            >
              Reset
            </Button>
          }
        />
      </Box>
    </DndContext>
  );
}
