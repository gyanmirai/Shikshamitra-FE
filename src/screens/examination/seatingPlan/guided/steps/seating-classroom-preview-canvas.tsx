import { DndContext } from '@dnd-kit/core';

import { GuidedClassroomPanel } from '../manual/guided-classroom-panel';

import type { GuidedManualEditorData } from '../manual/manual-editor-types';

const ignoreSeatAction = () => undefined;

interface Props {
  data: GuidedManualEditorData;
  roomId: string;
  onSwitchRoom: (roomId: string) => void;
}

export function SeatingClassroomPreviewCanvas({ data, roomId, onSwitchRoom }: Props) {
  return (
    <DndContext>
      <GuidedClassroomPanel
        rooms={data.rooms}
        assignments={data.assignments}
        students={data.students}
        activeRoomId={roomId}
        isReadOnly
        hideRoomSwitcher
        readOnlyDescription="Automatic seating preview is read-only. Change rooms or allocation rules to update the proposal."
        onSwitchRoom={onSwitchRoom}
        onAssign={ignoreSeatAction}
        onUnassign={ignoreSeatAction}
      />
    </DndContext>
  );
}
