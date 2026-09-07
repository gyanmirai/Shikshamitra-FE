import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MeetingRoom, ClassOutlined } from '@mui/icons-material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Grid, Divider, Typography } from '@mui/material';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { ExamReviewInfoItem } from './ExamReviewInfoItem';
import { ExamReviewAccordion } from './ExamReviewAccordion';
import { buildReviewSubjectRoomEntries } from './room-allocation-review-utils';

import type { IExamFormValues } from '../type';

// ----------------------------------------------------------------------

const RoomAllocationReview = ({
  formik,
  onEdit,
}: {
  formik: FormikProps<IExamFormValues>;
  onEdit?: () => void;
}) => {
  const { roomDetails } = formik.values;
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { data: roomsApiData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });

  /**
   * Memoization Justification:
   * - Room labels are derived from an API collection that can contain many rooms.
   * - Keeping the Map stable avoids rebuilding it for every unrelated Formik render.
   */
  const roomLabelById = useMemo(
    () =>
      new Map(
        (roomsApiData?.items ?? []).map((room: any) => {
          const labelParts = [room.buildingName, room.floorName, room.roomName].filter(Boolean);
          return [room.id, labelParts.length ? labelParts.join(' › ') : room.id];
        })
      ),
    [roomsApiData]
  );

  const classes =
    medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [];
  const divisions =
    classes.find((schoolClass: any) => schoolClass.id === formik.values.className)?.divisions || [];

  /**
   * Memoization Justification:
   * - The review projection walks nested elective subjects and room mappings.
   * - It only needs to rerun when the selected subjects, divisions, or room assignments change.
   */
  const activeReviewSubjects = useMemo(
    () =>
      buildReviewSubjectRoomEntries(
        formik.values.subjects || [],
        formik.values.divisions || [],
        roomDetails
      ),
    [formik.values.subjects, formik.values.divisions, roomDetails]
  );

  if (activeReviewSubjects.length === 0) return null;

  return (
    <ExamReviewAccordion
      title="Room Allocation"
      description="Designated rooms for each subject and division"
      icon="fluent:conference-room-24-filled"
      onEdit={onEdit}
      detailsPadding={3}
    >
      <Grid container spacing={1}>
        {activeReviewSubjects.map((entry, index, arr) => {
          const { subjectId, subjectName, electiveGroupName, divisionMap } = entry;

          return (
            <React.Fragment key={subjectId}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="subtitle1" sx={{ color: 'primary.dark' }}>
                    {subjectName}
                  </Typography>
                  {electiveGroupName && (
                    <Chip
                      label={electiveGroupName}
                      size="small"
                      color="warning"
                      variant="soft"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Box>

                <Grid container spacing={1}>
                  {Object.entries(divisionMap).map(([divisionName, divisionData]) => {
                    if (!divisionData.roomIds || divisionData.roomIds.length === 0) return null;

                    const divisionLabel =
                      divisions?.find((div: Division) => div.id === divisionName)?.name ||
                      divisionName;

                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={`${subjectName}-${divisionName}`}>
                        <ExamReviewInfoItem
                          icon={<ClassOutlined />}
                          label={`Division ${divisionLabel}`}
                          value={
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {divisionData.roomIds.map((roomId: string) => (
                                <Chip
                                  key={roomId}
                                  label={String(roomLabelById.get(roomId) ?? roomId)}
                                  size="small"
                                  variant="outlined"
                                  icon={<MeetingRoom style={{ fontSize: '1rem' }} />}
                                  sx={{ borderRadius: 1 }}
                                />
                              ))}
                            </Box>
                          }
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
              {index < arr.length - 1 && (
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                </Grid>
              )}
            </React.Fragment>
          );
        })}
      </Grid>
    </ExamReviewAccordion>
  );
};

export default RoomAllocationReview;
