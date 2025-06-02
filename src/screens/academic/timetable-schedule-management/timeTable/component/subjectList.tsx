'use client';

import React from 'react';

import { alpha } from '@mui/system';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';

import { subjectGroups } from '../newTimetable';
import CreateNoOfLecture from '../../settings/components/weeklyLectures/createWeeklyLectures';

interface SubjectListProps {
  onDragStart: (e: any, subject: any) => void;
  remainingLectures: any;
}

const SubjectList: React.FC<SubjectListProps> = ({ onDragStart, remainingLectures }) => {
  const weeklyLecturesDialog = useBoolean();
  return (
    <Stack spacing={1}>
      {subjectGroups.map((subject) => (
        <Paper
          key={subject.id}
          elevation={1}
          draggable
          onDragStart={(e) => onDragStart(e, subject)}
          sx={{
            p: 1,
            cursor: 'move',
            bgcolor: alpha(subject.subjectColor, 0.2),
            color: subject.subjectColor,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {subject.subjects.map((sub) => (
                <Typography variant="body2" fontWeight="bold">
                  {sub.name}
                </Typography>
              ))}
            </Box>
            <Typography variant="body2" fontWeight="bold">
              ({remainingLectures[subject.id]} / {subject.noOfLecture})
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
