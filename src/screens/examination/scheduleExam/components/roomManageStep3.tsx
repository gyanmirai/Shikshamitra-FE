import type { FormikProps } from 'formik';
import type { Division } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Box, Grid, Switch, Typography } from '@mui/material';

import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamFormValues } from '../type';

const RoomDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik = props;

  return (
    <Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Switch
          checked={formik.values.isRoomAssign}
          size="small"
          onChange={() => {
            formik.setFieldValue('isRoomAssign', !formik.values.isRoomAssign);
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        <Typography sx={{ mr: 2 }} variant="body2">
          Do you want to assign room for this exam?
        </Typography>
      </Box>
      {formik.values.isRoomAssign &&
        (formik.values.roomDetails && typeof formik.values.roomDetails === 'object'
          ? Object.entries(formik.values.roomDetails)
          : []
        ).map(([subjectName, subjectDetails]) => (
          <RoomAssignmentCard
            key={subjectName}
            subjectName={subjectName}
            subjectData={subjectDetails}
            formik={formik}
          />
        ))}
    </Box>
  );
};
export default RoomDetails;

const RoomAssignmentCard = ({ key, subjectName, subjectData, formik }: any) => {
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

  // Transform subject division data into table-ready format
  // Maps division IDs to their names and includes room assignment data (roomIds, capacity)
  const tableData = subjectData?.divisions
    ? Object.entries(subjectData.divisions).map(([divisionId, divisionData]) => ({
        divisionId,
        division: divisions?.find((div: Division) => div.id === divisionId)?.name || divisionId,
        ...(divisionData as { roomIds: string[]; capacity: number }),
      }))
    : [];

  // Static mock data for available rooms
  // TODO: Replace with API call to fetch actual room data from backend
  const roomsData = [
    { id: 'room-101', name: 'Room 101', building: 'Main Building', capacity: 30 },
    { id: 'room-102', name: 'Room 102', building: 'Main Building', capacity: 30 },
    { id: 'room-103', name: 'Room 103', building: 'Main Building', capacity: 30 },
  ];

  return (
    <SectionCard title={`${subjectName} • ${subjectData.examDate.format('DD-MM-YYYY')}`} key={key}>
      <Grid item xs={12}>
        <CustomizableTable
          tableId={`room-assignment-${subjectName}`}
          isSearch={false}
          isPagination={false}
          isFilter={false}
          columns={[
            {
              id: 'division',
              label: 'Division',
              minWidth: 100,
              align: 'left',
            },
            {
              id: 'roomIds',
              label: 'Room Assignment',
              render: (value, row) => {
                const fieldPath = `roomDetails.${subjectName}.divisions.${row.divisionId}.roomIds`;
                const selectedRoomId =
                  formik.values.roomDetails?.[subjectName]?.divisions?.[row.divisionId]?.roomIds ||
                  [];

                return (
                  <CustomSelect
                    label="Room"
                    value={selectedRoomId}
                    options={roomsData}
                    labelKey="name"
                    multiple
                    valueKey="id"
                    onChange={(val) => {
                      const totalCapacity = val.reduce((sum, roomId) => {
                        const room = roomsData.find((r) => r.id === roomId);
                        return Number(sum) + (room?.capacity || 0);
                      }, 0);

                      formik.setFieldValue(fieldPath, val);
                      formik.setFieldValue(
                        `roomDetails.${subjectName}.divisions.${row.divisionId}.capacity`,
                        totalCapacity
                      );
                    }}
                    formControlProps={{
                      sx: { minWidth: '400px', fullWidth: '100%' },
                    }}
                  />
                );
              },
            },
            {
              id: 'capacity',
              label: 'Capacity',
              render: (_: any, row: any) =>
                formik.values.roomDetails?.[subjectName]?.divisions?.[row.divisionId]?.capacity ||
                '-',
            },
          ]}
          data={tableData}
        />
      </Grid>
    </SectionCard>
  );
};
