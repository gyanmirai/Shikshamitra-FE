import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, List, Paper, ListItem, Typography } from '@mui/material';

import { ItemTypes } from './types';
import { Scrollbar } from '../scrollbar';

import type { Subject } from './types';

interface SubjectCardProps {
  subject: Subject;
  placedCount: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, placedCount }) => {
  const total = subject.totalLectures || 0;
  const isFull = total > 0 && placedCount >= total;

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.SUBJECT,
      item: { id: subject.id, type: ItemTypes.SUBJECT, subject },
      canDrag: !isFull,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [isFull, subject]
  ); // Add dependencies to ensure drag state updates

  return (
    <ListItem
      ref={(node) => {
        if (node && !isFull) drag(node);
      }}
      sx={{
        p: 1.5,
        mb: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: isFull ? 'action.disabled' : 'divider',
        borderRadius: 1,
        cursor: isFull ? 'not-allowed' : 'grab',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: isFull ? 0 : 1,
        fontWeight: 500,
        fontSize: '0.9rem',
        borderLeft: `4px solid ${isFull ? '#9e9e9e' : subject.color}`,
        opacity: isDragging ? 0.5 : isFull ? 0.6 : 1,
        filter: isFull ? 'grayscale(100%)' : 'none',
        '&:hover': {
          transform: isFull ? 'none' : 'translateY(-2px)',
          boxShadow: isFull ? 0 : 2,
          borderColor: isFull ? 'action.disabled' : 'primary.main',
        },
      }}
    >
      <Typography
        variant="body2"
        fontWeight="medium"
        color={isFull ? 'text.disabled' : 'text.primary'}
      >
        {subject.name}
      </Typography>
      <Typography
        variant="caption"
        color={isFull ? 'error.main' : placedCount > 0 ? 'primary.main' : 'text.secondary'}
        fontWeight={placedCount > 0 ? 'bold' : 'regular'}
      >
        {placedCount} / {total}
      </Typography>
    </ListItem>
  );
};

interface PaletteProps {
  subjects: Subject[];
  placedCounts: Record<string, number>;
}

const SubjectPalette: React.FC<PaletteProps> = ({ subjects, placedCounts }) => (
  <Paper
    elevation={2}
    sx={{
      width: '280px',
      height: '100%',
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      p: 1,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
    }}
  >
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight="600">
        Subjects
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Drag to schedule
      </Typography>
    </Box>
    <Scrollbar sx={{ height: '100%', pr: 1 }}>
      <List sx={{ pr: 1, maxHeight: 'unset', height: '100%' }}>
        {subjects.map((sub) => (
          <SubjectCard key={sub.id} subject={sub} placedCount={placedCounts[sub.id] || 0} />
        ))}
      </List>
    </Scrollbar>
  </Paper>
);

export default SubjectPalette;
