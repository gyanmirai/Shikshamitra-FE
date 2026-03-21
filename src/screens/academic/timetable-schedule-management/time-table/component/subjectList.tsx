'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Paper, Stack, Typography } from '@mui/material';

import CreateNoOfLecture from '../../settings/components/weekly-lectures/createWeeklyLectures';

import type { Subject } from '../type';

interface SubjectListProps {
  onDragStart: (e: any, subject: any) => void;
  subjectsGroups: any;
  selectedClass: any;
  timetable: any;
}

const SubjectList: React.FC<SubjectListProps> = ({
  onDragStart,
  subjectsGroups,
  selectedClass,
  timetable,
}) => {
  const weeklyLecturesDialog = useBoolean();
  // const dispatch = useDispatch();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      weeklyLecturesDialog.onFalse();
    } else if (!isChanges) {
      weeklyLecturesDialog.onFalse();
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: '68vh',
      }}
    >
      {/* Scrollable content area */}
      <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <Scrollbar sx={{ height: '100%' }}>
          <Stack spacing={1} sx={{ pr: 1 }}>
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
                      e.preventDefault();
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
                      gap: 1,
                    }}
                  >
                    {/* Subject Names */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {subject.subjects.map((sub: Subject, index: number) => (
                        <React.Fragment key={index}>
                          <CustomTooltip
                            title={`${sub.subject} (${sub.subjectCode})`}
                            placement="top"
                          >
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                color: isDraggable ? 'text.primary' : 'text.disabled',
                                fontSize: '0.875rem',
                                lineHeight: 1.3,
                              }}
                            >
                              {sub.subject}
                              {index < subject.subjects.length - 1 && ', '}
                            </Typography>
                          </CustomTooltip>
                        </React.Fragment>
                      ))}
                    </Box>

                    {/* Lecture Count */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDraggable ? 'text.secondary' : 'text.disabled',
                          fontWeight: usedLectures >= subject.totalLectures ? 600 : 400,
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ({usedLectures}/{subject.totalLectures})
                      </Typography>
                      {usedLectures >= subject.totalLectures && (
                        <Iconify
                          icon="mdi:check-circle"
                          width={16}
                          sx={{ color: 'success.main', flexShrink: 0 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Scrollbar>
      </Box>

      {/* Fixed footer button */}
      <Box
        sx={{
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          backgroundColor: 'background.paper',
          mt: 1,
        }}
      >
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
      </Box>

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
    </Box>
  );
};

export default SubjectList;
