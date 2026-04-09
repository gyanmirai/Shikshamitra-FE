import type { FormikProps } from 'formik';
import type { Variants } from 'framer-motion';
import type { Division } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { alpha } from '@mui/system';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, Chip, Paper, Switch, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { IExamFormValues } from '../type';

// Stagger variants for room assignment cards
const cardListVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, ease: 'easeOut' },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

const RoomDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik = props;
  // Theme for consistent access to design tokens
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Modernized Switch Section with hover animation */}
      <Paper
        role="button"
        tabIndex={0}
        component={motion.div}
        whileHover={{ scale: 1.012, transition: { duration: 0.18, ease: 'easeOut' } }}
        whileTap={{ scale: 0.985, transition: { duration: 0.12 } }}
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transformOrigin: 'left center',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
          backgroundColor: formik.values.isRoomAssign
            ? alpha(theme.palette.primary.main, 0.04)
            : 'background.paper',
          borderColor: formik.values.isRoomAssign
            ? alpha(theme.palette.primary.main, 0.4)
            : theme.palette.divider,
        }}
        onClick={() => {
          formik.setFieldValue('isRoomAssign', !formik.values.isRoomAssign);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            formik.setFieldValue('isRoomAssign', !formik.values.isRoomAssign);
          }
        }}
      >
        <Switch
          checked={formik.values.isRoomAssign}
          onChange={() => {
            formik.setFieldValue('isRoomAssign', !formik.values.isRoomAssign);
          }}
          onClick={(e) => e.stopPropagation()}
          inputProps={{ 'aria-label': 'room-assignment-toggle' }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Room Assignment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Do you want to assign specific rooms for this exam schedule?
          </Typography>
        </Box>
      </Paper>

      {/* Render Subject Cards if functionality is enabled — animated with AnimatePresence */}
      <AnimatePresence>
        {formik.values.isRoomAssign && (
          <motion.div
            key="room-cards"
            variants={cardListVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <Grid container spacing={3}>
              {(formik.values.roomDetails && typeof formik.values.roomDetails === 'object'
                ? Object.entries(formik.values.roomDetails)
                : []
              ).map(([subjectName, subjectDetails]) => (
                <Grid size={{ xs: 12 }} key={subjectName}>
                  <motion.div variants={cardItemVariants} style={{ width: '100%' }}>
                    <RoomAssignmentCard
                      subjectName={subjectName}
                      subjectData={subjectDetails}
                      formik={formik}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
export default RoomDetails;

const RoomAssignmentCard = ({ subjectName, subjectData, formik }: any) => {
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const theme = useTheme();

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
    <SectionCard
      title={subjectName}
      headerContent={
        <Chip
          label={subjectData.examDate.format('dddd, DD MMM YYYY')}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderRadius: 1,
            color: 'primary.main',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
        />
      }
      paperProps={{
        sx: {
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: theme.customShadows?.card || '0px 4px 20px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: theme.customShadows?.z8 || '0px 12px 30px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      }}
      // gridProps={{ sx: { mb: 1 } }}
    >
      <Grid size={{ xs: 12 }}>
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
              render: (value, row) => (
                <Typography variant="body2" fontWeight={600}>
                  {value}
                </Typography>
              ),
            },
            {
              id: 'roomIds',
              label: 'Room Assignment',
              isFilter: false,
              isSort: false,
              render: (value, row) => {
                const fieldPath = `roomDetails.${subjectName}.divisions.${row.divisionId}.roomIds`;
                const selectedRoomId =
                  formik.values.roomDetails?.[subjectName]?.divisions?.[row.divisionId]?.roomIds ||
                  [];

                return (
                  <CustomSelect
                    label="Select Room"
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
                      sx: { width: '100%', minWidth: { xs: '200px', md: '350px' } },
                    }}
                  />
                );
              },
            },
            {
              id: 'capacity',
              label: 'Capacity',
              isFilter: false,
              isSort: false,
              render: (_: any, row: any) => (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {formik.values.roomDetails?.[subjectName]?.divisions?.[row.divisionId]
                    ?.capacity || '-'}
                </Typography>
              ),
            },
          ]}
          data={tableData}
        />
      </Grid>
    </SectionCard>
  );
};
