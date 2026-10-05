import type {
  SeatingPlanGroupDto,
  SeatingPlanWorkspaceDto,
  GuidedAllocationPreviewDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { DndContext } from '@dnd-kit/core';
import Skeleton from '@mui/material/Skeleton';
import { useGetSeatLayoutQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import RoomSwitcher from '../../components/workspace/RoomSwitcher';
import { GuidedClassroomPanel } from '../manual/guided-classroom-panel';
import { mapClassroomPreview } from './seating-classroom-preview-mapper';

import type { ManualLayoutResponseDto } from '../manual/manual-editor-types';

const ignoreSeatAction = () => undefined;

interface Props {
  workspace: SeatingPlanWorkspaceDto;
  plan: SeatingPlanGroupDto;
  roomIds: string[];
  preview: GuidedAllocationPreviewDto;
}

export function SeatingClassroomPreview({ workspace, plan, roomIds, preview }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState(roomIds[0] ?? '');
  const roomId = roomIds.includes(selectedRoomId) ? selectedRoomId : (roomIds[0] ?? '');
  const { currentData, isFetching, isError, refetch } = useGetSeatLayoutQuery(
    {
      examId: workspace.examId,
      seatingPlanId: plan.seatingPlanId,
      divisionId: plan.divisions[0]?.id ?? '',
      roomId,
      pageSize: 1000,
    },
    { skip: !roomId }
  );
  /** Memoization Justification: mapping builds every physical seat and indexes the proposal.
   * Keep that work and the canvas data stable across unrelated Formik and workflow renders. */
  const data = useMemo(
    () =>
      currentData
        ? mapClassroomPreview(
            plan,
            { ...(currentData as ManualLayoutResponseDto), roomId },
            preview
          )
        : undefined,
    [currentData, plan, preview, roomId]
  );
  const counts = new Map<string, number>();
  preview.assignments.forEach((assignment) => {
    counts.set(assignment.roomId, (counts.get(assignment.roomId) ?? 0) + 1);
  });
  const rooms = plan.availableRooms
    .filter((room) => roomIds.includes(room.roomId))
    .map((room) => ({
      roomId: room.roomId,
      roomName: room.roomName,
      occupied: counts.get(room.roomId) ?? 0,
      usable: room.usableCapacity,
    }));

  return (
    <Box aria-label="Read-only classroom seating preview" sx={{ minWidth: 0 }}>
      <RoomSwitcher rooms={rooms} activeRoomId={roomId} onSwitch={setSelectedRoomId} />
      {isError ? (
        <Alert severity="error" action={<Button onClick={() => refetch()}>Try again</Button>}>
          The classroom layout could not be loaded.
        </Alert>
      ) : !data || (isFetching && !currentData) ? (
        <Skeleton variant="rounded" height={460} aria-label="Loading classroom preview" />
      ) : (
        <DndContext>
          <GuidedClassroomPanel
            rooms={data.rooms}
            assignments={data.assignments}
            students={data.students}
            activeRoomId={roomId}
            isReadOnly
            hideRoomSwitcher
            readOnlyDescription="Automatic seating preview is read-only. Change rooms or allocation rules to update the proposal."
            onSwitchRoom={setSelectedRoomId}
            onAssign={ignoreSeatAction}
            onUnassign={ignoreSeatAction}
          />
        </DndContext>
      )}
    </Box>
  );
}
