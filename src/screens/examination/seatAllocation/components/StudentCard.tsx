import { Box, Paper, Avatar, Typography } from '@mui/material';

const StudentCard = ({ student, theme }: { student: any; theme: any }) => {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData: any = {
      type: 'student',
      student,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper
      draggable={!student.isRoomAssign}
      onDragStart={handleDragStart}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        justifyContent: 'space-between',
        cursor: student.isRoomAssign ? 'pointer' : 'grab',
        transition: 'all 0.3s ease-in-out',
        background: student.isRoomAssign ? theme.palette.action.selected : 'background.paper',
        opacity: student.isRoomAssign ? 0.7 : 1,
        '&:hover': {
          scale: '1.03',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      elevation={6}
      title={student.isRoomAssign ? 'Already Assign' : 'Drag to assign seat'}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar>{student.name.split(' ')[0][0]}</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {student.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roll No: {student.rollNo}
            {student.isRoomAssign && student.bench && ` • Bench: ${student.bench}`}
          </Typography>
        </Box>
      </Box>

      {student.isRoomAssign && student.room && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'white',
            fontSize: '0.75rem',
          }}
        >
          {student.room}
        </Box>
      )}
    </Paper>
  );
};

export default StudentCard;
