'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Paper, Stack, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';

import CreateNoOfLecture from '../../settings/components/weeklyLectures/createWeeklyLectures';

import type { Subject } from '../type';

interface SubjectListProps {
  onDragStart: (e: any, subject: any) => void;
  subjectsGroups: any;
  selectedClass: any;
  timetable: any; // Add timetable prop
}

const SubjectList: React.FC<SubjectListProps> = ({
  onDragStart,
  subjectsGroups,
  selectedClass,
  timetable, // Add timetable prop
}) => {
  const weeklyLecturesDialog = useBoolean();
  const dispatch = useDispatch();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      weeklyLecturesDialog.onFalse();
      // resetState();
    } else if (!isChanges) {
      weeklyLecturesDialog.onFalse();
      // resetState();
    }
  };

  return (
    <Stack spacing={1}>
      {subjectsGroups.map((subject: any) => {
        // Count how many times this subject appears in the current timetable
        const usedLectures =
          timetable?.reduce(
            (count: number, row: any) =>
              count +
              row.dayData.reduce((dayCount: number, dayData: any) => {
                if (dayData.subjects && dayData.subjects.length > 0) {
                  const hasThisSubject = dayData.subjects.some((s: any) =>
                    subject.subjects.some((subj: any) => subj.subject === s.subject)
                  );
                  return hasThisSubject ? dayCount + 1 : dayCount;
                }
                return dayCount;
              }, 0),
            0
          ) || 0;

        // Check if subject has available lectures for dragging
        const isDraggable = usedLectures < subject.totalLectures;

        return (
          <Paper
            key={subject.id}
            elevation={1}
            draggable={isDraggable}
            onDragStart={(e) => {
              if (!isDraggable) {
                e.preventDefault(); // 🔒 Prevent dragging
                return;
              }
              onDragStart(e, subject);
            }}
            sx={{
              p: 1,
              cursor: isDraggable ? 'move' : 'not-allowed',
              boxShadow: 'var(--shadows-10)',
              borderLeft: `4px solid ${subject.subjectColor}`,
              borderRadius: '8px',
              opacity: isDraggable ? 1 : 0.5,
              backgroundColor: isDraggable ? 'background.paper' : 'action.disabledBackground',
              '&:hover': {
                opacity: isDraggable ? 0.9 : 0.5,
              },
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
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 0.5,
                  maxWidth: 150,
                  lineHeight: 1.2,
                }}
              >
                {subject.subjects.map((sub: Subject, index: number) => (
                  <React.Fragment key={index}>
                    <CustomTooltip title={`${sub.subject} (${sub.subjectCode})`} placement="top">
                      <Typography
                        variant="body2"
                        noWrap={false}
                        sx={{
                          wordBreak: 'break-word',
                          color: isDraggable ? 'text.primary' : 'text.disabled',
                          maxWidth: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {sub.subject}
                        {index < subject.subjects.length - 1 && ','}
                      </Typography>
                    </CustomTooltip>
                  </React.Fragment>
                ))}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: isDraggable ? 'text.primary' : 'text.disabled',
                  fontWeight: usedLectures >= subject.totalLectures ? 'bold' : 'normal',
                }}
              >
                ({usedLectures} / {subject.totalLectures})
                {usedLectures >= subject.totalLectures && (
                  <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                    ✓ Complete
                  </Typography>
                )}
              </Typography>
            </Box>
          </Paper>
        );
      })}
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
        Create Weekly Lectures
      </Typography>
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Weekly Lectures</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Configure the number of lectures per week for each subject"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={weeklyLecturesDialog.value}
        handleClose={weeklyLecturesDialog.onFalse}
        maxWidth="sm"
      >
        <CreateNoOfLecture
          isEdit
          editData={null}
          onClose={handleClose}
          selectedClass={selectedClass}
        />
      </CustomDialog>
    </Stack>
  );
};

export default SubjectList;
