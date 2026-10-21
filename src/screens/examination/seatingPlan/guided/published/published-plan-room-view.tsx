import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { DndContext } from '@dnd-kit/core';
import Skeleton from '@mui/material/Skeleton';

import { usePublishedSeatingData } from './use-published-seating-data';
import { GuidedClassroomPanel } from '../manual/guided-classroom-panel';

import type { SeatingSeat, SeatingStudent } from '../../types';
import type { PublishedRoomGroup } from './published-room-groups';

interface Props {
  examId: string;
  standardId: string;
  group: PublishedRoomGroup;
}

const ignoreSeatAssignment = (_student: SeatingStudent, _roomId: string, _seat: SeatingSeat) =>
  undefined;
const ignoreSeatRemoval = (_studentId: string) => undefined;
const ignoreRoomSwitch = (_roomId: string) => undefined;

export function PublishedPlanRoomView({ examId, standardId, group }: Props) {
  const data = usePublishedSeatingData({
    examId,
    standardId,
    plan: group.anchorPlan,
    roomId: group.roomId,
  });

  if (data.isLoading) {
    return (
      <Skeleton
        variant="rounded"
        height={560}
        aria-label={`Loading published seating for room ${group.roomName}`}
      />
    );
  }
  if (data.error) {
    return (
      <Alert
        severity="error"
        action={data.canRetry ? <Button onClick={data.retry}>Try again</Button> : undefined}
      >
        {data.error}
      </Alert>
    );
  }

  return (
    <Box aria-label={`Combined published seating for room ${group.roomName}`}>
      <DndContext>
        <GuidedClassroomPanel
          presentation="studio"
          rooms={data.rooms}
          assignments={data.assignments}
          students={data.students}
          activeRoomId={group.roomId}
          isReadOnly
          includeProtectedAssignmentsInCount
          onSwitchRoom={ignoreRoomSwitch}
          onAssign={ignoreSeatAssignment}
          onUnassign={ignoreSeatRemoval}
        />
      </DndContext>
    </Box>
  );
}
