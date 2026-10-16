import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Grid, Paper, Divider, Typography } from '@mui/material';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { ExamReviewInfoItem } from './ExamReviewInfoItem';
import { ExamReviewAccordion } from './ExamReviewAccordion';
import { reviewCardSx, reviewChipSx } from './exam-review-styles';
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
      icon="fluent:conference-room-24-filled"
      onEdit={onEdit}
    >
      <Grid container spacing={2} alignItems="stretch">
        {activeReviewSubjects.map((entry) => {
          const { subjectId, subjectName, electiveGroupName, divisionMap } = entry;

          return (
            <Grid key={subjectId} size={{ xs: 12, lg: activeReviewSubjects.length === 1 ? 12 : 6 }}>
              <Paper variant="outlined" sx={reviewCardSx}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    minHeight: 32,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {subjectName}
                  </Typography>
                  {electiveGroupName && (
                    <Chip
                      label={electiveGroupName}
                      size="small"
                      variant="outlined"
                      sx={reviewChipSx}
                    />
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                    columnGap: 2,
                    rowGap: 2,
                  }}
                >
                  {Object.entries(divisionMap).map(([divisionName, divisionData]) => {
                    if (!divisionData.roomIds || divisionData.roomIds.length === 0) return null;

                    const divisionLabel =
                      divisions?.find((div: Division) => div.id === divisionName)?.name ||
                      divisionName;

                    return (
                      <ExamReviewInfoItem
                        key={`${subjectId}-${divisionName}`}
                        label={`Division ${divisionLabel}`}
                        value={
                          <Box display="flex" flexWrap="wrap" gap={0.75} sx={{ minWidth: 0 }}>
                            {divisionData.roomIds.map((roomId: string) => (
                              <Chip
                                key={roomId}
                                label={String(roomLabelById.get(roomId) ?? roomId)}
                                size="small"
                                variant="outlined"
                                sx={reviewChipSx}
                              />
                            ))}
                          </Box>
                        }
                      />
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </ExamReviewAccordion>
  );
};

export default RoomAllocationReview;
