import { Paper, Avatar, Typography } from '@mui/material';
import { DragOverlay, useDndContext } from '@dnd-kit/core';

import type { SeatingStudent, SeatingAssignment } from '../../types';

export default function RoomStudioDragOverlay({
  studentsById,
}: {
  studentsById: Map<string, SeatingStudent>;
}) {
  const { active } = useDndContext();
  const data = active?.data.current as
    { student?: SeatingStudent; assignment?: SeatingAssignment } | undefined;
  const student =
    data?.student ?? (data?.assignment ? studentsById.get(data.assignment.studentId) : undefined);
  return (
    <DragOverlay>
      {student && (
        <Paper
          elevation={4}
          sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, maxWidth: 280 }}
        >
          <Avatar sx={{ width: 28, height: 28 }}>{student.studentName.charAt(0)}</Avatar>
          <Typography variant="body2" noWrap>
            {student.studentName}
          </Typography>
        </Paper>
      )}
    </DragOverlay>
  );
}
