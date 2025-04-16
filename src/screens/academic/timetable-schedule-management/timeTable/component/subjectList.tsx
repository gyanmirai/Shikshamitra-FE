'use client';

import React from 'react';

import { Box, Paper, Stack, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';

import { subjects } from '../newTimetable';
import CreateNoOfLecture from '../../settings/components/weeklyLectures/createWeeklyLectures';

interface SubjectListProps {
  onDragStart: (e: any, subject: any) => void;
  remainingLectures: any;
}

const SubjectList: React.FC<SubjectListProps> = ({ onDragStart, remainingLectures }) => {
  const weeklyLecturesDialog = useBoolean();
  return (
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
      <Typography
        variant="body2"
        fontWeight={500}
        textAlign="right"
        color="primary.main"
        fontSize={12}
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          weeklyLecturesDialog.onTrue();
        }}
      >
        Create Weekly Lectures ?
      </Typography>
      <CustomDialog
        title="Create Number of Lectures"
        open={weeklyLecturesDialog.value}
        handleClose={weeklyLecturesDialog.onFalse}
        maxWidth="md"
      >
        <CreateNoOfLecture
          onClose={weeklyLecturesDialog.onFalse}
          // onSave={handleSave}
          // dialogValue={dialog.value}
          // onClose={closeDialog}
          // data={selectedEntry}
          // isEdit={isEdit}
          // allData={roomData}
        />
      </CustomDialog>
    </Stack>
  );
};

export default SubjectList;
