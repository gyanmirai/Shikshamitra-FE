import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

import { GuidedStudentTray } from './guided-student-tray';
import { ManualEditorToolbar } from './manual-editor-toolbar';
import { handleGuidedManualDrag } from './manual-drag-handler';
import { GuidedClassroomPanel } from './guided-classroom-panel';
import { useGuidedManualEditor } from './use-guided-manual-editor';
import { manualCollisionDetection } from './manual-collision-detection';

import type { GuidedStepProps } from '../types';
import type { SeatingSeat, SeatingStudent } from '../../types';

export function GuidedManualEditor({ workspace, workflow }: GuidedStepProps) {
  const plan = workflow.selectedPlan;
  if (!plan)
    return <Alert severity="warning">Choose a seating plan before arranging students.</Alert>;

  return <GuidedManualEditorContent workspace={workspace} workflow={workflow} plan={plan} />;
}

function GuidedManualEditorContent({
  workspace,
  workflow,
  plan,
}: GuidedStepProps & { plan: SeatingPlanGroupDto }) {
  const editor = useGuidedManualEditor({
    examId: workspace.examId,
    standardId: workspace.standardId,
    plan,
    selectedRoomIds: workflow.formik.values.selectedRoomIds,
    rules: {
      strategy: workflow.formik.values.strategy,
      fillDirection: workflow.formik.values.fillDirection,
      leaveGap: workflow.formik.values.leaveGap,
      mixDivisions: workflow.formik.values.mixDivisions,
      specialRequirementPriority: workflow.formik.values.specialRequirementPriority,
    },
    inProgressPreview: workflow.preview,
    onPreviewChange: workflow.setManualPreview,
  });
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );
  const { preview } = workflow;
  const isReadOnly = plan.isLocked || !workflow.permissions.canAdd;
  const selectedStudent = editor.draft.students.find(
    (student) => student.studentId === editor.selectedStudentId
  );

  const assignStudent = (student: SeatingStudent, roomId: string, seat: SeatingSeat) => {
    editor.actions.assignStudent(student, roomId, seat);
    editor.setSelectedStudentId('');
  };
  if (editor.isLoading) {
    return (
      <Skeleton variant="rounded" height={560} aria-label="Loading classroom seating editor" />
    );
  }
  if (editor.loadError) return <Alert severity="error">{editor.loadError}</Alert>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={manualCollisionDetection}
      onDragEnd={(event) =>
        handleGuidedManualDrag(event, {
          isReadOnly,
          assignments: editor.draft.assignments,
          actions: editor.actions,
          setSelectedStudentId: editor.setSelectedStudentId,
        })
      }
    >
      <Box
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
      >
        <ManualEditorToolbar
          assigned={preview?.assignments.length ?? 0}
          total={preview?.totalStudents ?? 0}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          isReadOnly={isReadOnly}
          onAutoArrange={editor.autoArrange}
          onUndo={editor.actions.undo}
          onRedo={editor.actions.redo}
          onClear={() =>
            editor.actions.applyAssignments(
              editor.draft.assignments.filter((assignment) => assignment.isExternalExamOccupied),
              'reset-room'
            )
          }
        />
        {preview && preview.unallocatedStudentIds.length > 0 && (
          <Alert severity="warning" sx={{ m: 1.5, mb: 0 }}>
            {preview.unallocatedStudentIds.length} student
            {preview.unallocatedStudentIds.length === 1 ? '' : 's'} still need a seat. Assign every
            student before continuing.
          </Alert>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', xl: '320px minmax(0, 1fr)' },
            minHeight: { xs: 760, xl: 620 },
          }}
        >
          <GuidedStudentTray
            students={editor.draft.students}
            assignments={editor.draft.assignments}
            selectedStudentId={editor.selectedStudentId}
            onSelectStudent={(studentId) =>
              editor.setSelectedStudentId((current) => (current === studentId ? '' : studentId))
            }
            isReadOnly={isReadOnly}
          />
          <GuidedClassroomPanel
            rooms={editor.visibleRooms}
            assignments={editor.draft.assignments}
            students={editor.draft.students}
            activeRoomId={editor.activeRoomId}
            selectedStudent={selectedStudent}
            isReadOnly={isReadOnly}
            onSwitchRoom={editor.setActiveRoomId}
            onAssign={assignStudent}
            onUnassign={editor.actions.unassignStudent}
            onToggleReserve={editor.toggleSeatReservation}
          />
        </Box>
      </Box>
    </DndContext>
  );
}
