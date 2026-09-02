import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { DndContext } from '@dnd-kit/core';
import Skeleton from '@mui/material/Skeleton';

import { usePublishedSeatingData } from './use-published-seating-data';
import { GuidedClassroomPanel } from '../manual/guided-classroom-panel';

import type { SeatingSeat, SeatingStudent } from '../../types';

interface Props {
  examId: string;
  standardId: string;
  plan: SeatingPlanGroupDto;
}

const ignoreSeatAssignment = (_student: SeatingStudent, _roomId: string, _seat: SeatingSeat) =>
  undefined;
const ignoreSeatRemoval = (_studentId: string) => undefined;

export function PublishedPlanRoomView({ examId, standardId, plan }: Props) {
  const [activeRoomId, setActiveRoomId] = useState(plan.selectedRoomIds[0] ?? '');
  const data = usePublishedSeatingData({ examId, standardId, plan });
  const visibleRoomId = data.rooms.some((room) => room.roomId === activeRoomId)
    ? activeRoomId
    : (data.rooms[0]?.roomId ?? '');

  if (data.isLoading) {
    return (
      <Skeleton
        variant="rounded"
        height={560}
        aria-label={`Loading published seating for ${plan.name}`}
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
    <Box aria-label={`Published seating for ${plan.name}`}>
      <DndContext>
        <GuidedClassroomPanel
          rooms={data.rooms}
          assignments={data.assignments}
          students={data.students}
          activeRoomId={visibleRoomId}
          isReadOnly
          onSwitchRoom={setActiveRoomId}
          onAssign={ignoreSeatAssignment}
          onUnassign={ignoreSeatRemoval}
        />
      </DndContext>
    </Box>
  );
}
