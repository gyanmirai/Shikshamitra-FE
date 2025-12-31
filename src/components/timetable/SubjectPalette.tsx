import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, List, Paper, ListItem, Typography } from '@mui/material';

import { ItemTypes } from './types';
import { Scrollbar } from '../scrollbar';

import type { Subject } from './types';

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SUBJECT,
    item: { id: subject.id, type: ItemTypes.SUBJECT, subject },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <ListItem
      ref={(node) => {
        if (node) drag(node);
      }}
      sx={{
        p: 1.5,
        mb: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        cursor: 'grab',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 1,
        fontWeight: 500,
        fontSize: '0.9rem',
        borderLeft: `4px solid ${subject.color}`,
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <Typography variant="body2" fontWeight="medium">
        {subject.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subject.defaultDuration}m
      </Typography>
    </ListItem>
  );
};

interface PaletteProps {
  subjects: Subject[];
}

const SubjectPalette: React.FC<PaletteProps> = ({ subjects }) => (
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
          <SubjectCard key={sub.id} subject={sub} />
        ))}
      </List>
    </Scrollbar>
  </Paper>
);

export default SubjectPalette;
