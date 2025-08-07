import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import RoomIcon from '@mui/icons-material/Room';
import { Chip, Grid, Stack, Typography } from '@mui/material';

import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { IRoomDetails, IExamFormValues, ISubjectRoomDetail } from '../type';

const RoomAllocationReview = ({ formik }: { formik: FormikProps<IExamFormValues> }) => {
  const { roomDetails } = formik.values;
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Flatten all standards/classes from education medium stages into a single array
  // This creates a comprehensive list of all available classes across different stages
  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  // Get divisions for the currently selected class from formik values
  // Finds the specific class and extracts its divisions for dropdown/selection purposes
  const divisions = useMemo(
    () => allClass.find((cls: any) => cls.id === formik.values.className)?.divisions || [],
    [allClass, formik.values.className]
  );

  return (
    <SectionCard title="Room Allocation">
      {Object.entries(roomDetails as IRoomDetails).map(
        ([subjectName, subjectDetail]: [string, ISubjectRoomDetail]) => (
          <Grid item xs={12}>
            <SectionCard key={subjectName} title={`${subjectName}`}>
              {/* <Stack spacing={2}> */}
              {Object.entries(subjectDetail.divisions).map(([divisionName, divisionData]) => (
                <Grid item xs={12} display="flex" flexDirection="column" key={divisionName}>
                  <Typography fontWeight={600} display="flex" alignItems="center" mb={1}>
                    <RoomIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                    Division :{' '}
                    {divisions?.find((div: Division) => div.id === divisionName)?.name ||
                      divisionName}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {divisionData.roomIds?.map((room: string, index: number) => (
                      <Chip key={index} label={`${room}`} variant="outlined" />
                    ))}
                  </Stack>
                </Grid>
              ))}
              {/* </Stack> */}
            </SectionCard>
          </Grid>
        )
      )}
    </SectionCard>
  );
};
export default RoomAllocationReview;
