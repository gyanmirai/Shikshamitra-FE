'use client';

import React from 'react';

import { Box, Paper, Stack, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';

import CreateNoOfLecture from '../../settings/components/weeklyLectures/createWeeklyLectures';

import type { Subject } from '../type';

interface SubjectListProps {
  onDragStart: (e: any, subject: any) => void;
  subjectsGroups: any;
}

const SubjectList: React.FC<SubjectListProps> = ({ onDragStart, subjectsGroups }) => {
  const weeklyLecturesDialog = useBoolean();
  return (
    <Stack spacing={1}>
      {subjectsGroups.map((subject: any) => (
        <Paper
          key={subject.id}
          elevation={1}
          draggable
          onDragStart={(e) => onDragStart(e, subject)}
          sx={{
            p: 1,
            // boxShadow: 3,
            cursor: 'move',
            boxShadow: 'var(--shadows-10)',
            // bgcolor: alpha(subject.subjectColor, 0.2),
            // color: subject.subjectColor,
            borderLeft: `4px solid ${subject.subjectColor}`, // 👈 Left border
            borderRadius: '8px', // Optional for rounded corners like in image
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
              {subject.subjects.map((sub: Subject, index: number) => (
                <React.Fragment key={index}>
                  <CustomTooltip title={`${sub.subject} (${sub.subjectCode})`} placement="top">
                    <Typography variant="body2">
                      {sub.subject}
                      {index < subject.subjects.length - 1 && ', '}
                    </Typography>
                  </CustomTooltip>
                </React.Fragment>
              ))}
            </Box>
            <Typography variant="body2">
              ({subject.allocateLectures} / {subject.totalLectures})
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
