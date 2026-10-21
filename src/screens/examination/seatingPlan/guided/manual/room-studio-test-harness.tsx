import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { useSensor, DndContext, useSensors, TouchSensor, KeyboardSensor } from '@dnd-kit/core';

import { buildEmptyDraft } from '../../utils/mappers';
import { GuidedStudentTray } from './guided-student-tray';
import { useSeatingDraft } from '../../hooks/useSeatingDraft';
import { toSeatingRoomLayout } from '../../utils/room-layout';
import { ManualEditorToolbar } from './manual-editor-toolbar';
import { handleGuidedManualDrag } from './manual-drag-handler';
import { GuidedClassroomPanel } from './guided-classroom-panel';
import { manualCollisionDetection } from './manual-collision-detection';
import { toggleSeatReservationInRooms } from './manual-seat-reservation';

export const studioRoom = toSeatingRoomLayout(
  {
    room: {
      columnRows: [3, 1, 2],
      benchCapacity: 2,
      capacity: 12,
      reservedSeatNumbersCsv: '6',
      disabledSeatNumbersCsv: '10',
    },
  },
  'room-1',
  'B106'
);
studioRoom.seats[10].isExternalExamOccupied = true;
export const studioStudents = [
  'Aarav Shah',
  'Diya Patel',
  'Ishaan Mehta',
  'Sara Khan',
  'Anaya Rao',
  'Kabir Joshi',
].map((studentName, i) => ({
  studentId: `student-${i + 1}`,
  studentName,
  rollNo: i + 1,
  divisionName: i % 2 ? '8-B' : '8-A',
}));
const secondRoom = toSeatingRoomLayout(
  { room: { columnRows: [1], benchCapacity: 2 } },
  'room-2',
  'B105'
);

export function RoomStudioHarness({ readOnly = false }: { readOnly?: boolean }) {
  const editor = useSeatingDraft({
    ...buildEmptyDraft('exam-1'),
    students: studioStudents,
    rooms: [studioRoom, secondRoom],
    assignments: [
      {
        studentId: 'student-1',
        roomId: 'room-1',
        seatId: 'room-1:1',
        seatNumber: 1,
        assignedBy: 'manual',
      },
      {
        studentId: 'student-2',
        roomId: 'room-1',
        seatId: 'room-1:4',
        seatNumber: 4,
        assignedBy: 'manual',
      },
      {
        studentId: 'other-plan-student',
        roomId: 'room-1',
        seatId: 'room-1:11',
        seatNumber: 11,
        assignedBy: 'auto',
        isExternalExamOccupied: true,
      },
    ],
  });
  const [selected, setSelected] = useState('');
  const [room, setRoom] = useState('room-1');
  const sensors = useSensors(useSensor(KeyboardSensor), useSensor(TouchSensor, { activationConstraint: { distance: 8 } }));
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DndContext
        sensors={sensors}
        collisionDetection={manualCollisionDetection}
        onDragEnd={(event) =>
          handleGuidedManualDrag(event, {
            isReadOnly: readOnly,
            assignments: editor.draft.assignments,
            actions: editor.actions,
            setSelectedStudentId: setSelected,
          })
        }
      >
        <ManualEditorToolbar
          assigned={editor.draft.assignments.length}
          total={studioStudents.length}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          isReadOnly={readOnly}
          onUndo={editor.actions.undo}
          onRedo={editor.actions.redo}
          onClear={() => {}}
          onAutoArrange={() => {}}
        />
        <GuidedStudentTray
          students={studioStudents}
          assignments={editor.draft.assignments}
          selectedStudentId={selected}
          onSelectStudent={setSelected}
          isReadOnly={readOnly}
        />
        <GuidedClassroomPanel
          presentation="studio"
          rooms={editor.draft.rooms}
          assignments={editor.draft.assignments}
          students={studioStudents}
          activeRoomId={room}
          onSwitchRoom={setRoom}
          selectedStudent={studioStudents.find((student) => student.studentId === selected)}
          isReadOnly={readOnly}
          onAssign={(student, roomId, seat) => {
            editor.actions.assignStudent(student, roomId, seat);
            setSelected('');
          }}
          onUnassign={editor.actions.unassignStudent}
          onToggleReserve={(roomId, seat) =>
            editor.setDraft((current) => ({
              ...current,
              rooms: toggleSeatReservationInRooms(current.rooms, roomId, seat),
            }))
          }
        />
      </DndContext>
    </ThemeProvider>
  );
}
