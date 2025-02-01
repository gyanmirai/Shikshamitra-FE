'use client';

import React from 'react';

import { Box, Paper, Stack, Typography } from '@mui/material';

import { subjects } from '../newTimetable';

interface SubjectListProps {
  onDragStart: (e: any, subject: any) => void;
  remainingLectures: any;
}

const SubjectList: React.FC<SubjectListProps> = ({ onDragStart, remainingLectures }) => (
  <Stack spacing={1}>
    {subjects.map((subject) => (
      <Paper
        key={subject.id}
        elevation={1}
        draggable
        onDragStart={(e) => onDragStart(e, subject)}
        sx={{
          p: 1,
          cursor: 'move',
          backgroundColor: subject.color,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2">{subject.name}</Typography>
          <Typography variant="body2">
            ({remainingLectures[subject.id]} / {subject.noOfLeacture})
          </Typography>
        </Box>
      </Paper>
    ))}
  </Stack>
);

export default SubjectList;
