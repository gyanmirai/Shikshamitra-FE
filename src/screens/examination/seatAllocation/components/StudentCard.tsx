import type { Theme } from '@mui/material';

import { Box, Card, Avatar, Typography } from '@mui/material';

import type { IStudentRoomAssignment } from '../type';

interface DragData {
  type: string;
  student: IStudentRoomAssignment;
}
const StudentCard = ({ student, theme }: { student: IStudentRoomAssignment; theme: Theme }) => {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData: DragData = { type: 'student', student };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const isAssigned = student.isSeatAllocate;

  return (
    <Card
      draggable={!isAssigned}
      onDragStart={handleDragStart}
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: isAssigned ? 'pointer' : 'grab',
        transition: 'all 0.2s ease-in-out',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (t) => (isAssigned ? 'none' : t.shadows[2]),
        bgcolor: isAssigned ? 'action.selected' : 'background.paper',
        opacity: isAssigned ? 0.6 : 1,
        '&:hover': {
          transform: isAssigned ? 'none' : 'translateY(-2px)',
          boxShadow: (t) => (isAssigned ? 'none' : t.shadows[4]),
        },
        '&:active': { cursor: 'grabbing' },
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: isAssigned ? 'action.disabledBackground' : 'primary.main',
          color: isAssigned ? 'text.disabled' : 'primary.contrastText',
          fontWeight: 700,
          fontSize: '0.875rem',
        }}
      >
        {student.studentName?.split(' ')?.[0]?.[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
          {student.studentName}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            Roll:{' '}
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {student.rollNo}
            </Box>
          </Typography>

          {isAssigned && student.bench && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              • Bench:{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {student.bench}
              </Box>
            </Typography>
          )}
        </Box>
      </Box>

      {isAssigned && student.room && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 0.75,
            bgcolor: 'success.lighter',
            color: 'success.dark',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          {student.room}
        </Box>
      )}
    </Card>
  );
};

export default StudentCard;
