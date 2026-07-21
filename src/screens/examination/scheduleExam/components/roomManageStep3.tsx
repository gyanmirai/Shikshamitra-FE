import type { FormikProps } from 'formik';
import type { Variants } from 'framer-motion';
import type { Division } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { alpha } from '@mui/system';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Box, Grid, Chip, Paper, Switch, TextField, Typography, Autocomplete } from '@mui/material';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
          gap: 1,
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
            Assign Rooms{' '}
            <Typography
              component="span"
              variant="subtitle1"
              color="text.secondary"
              fontWeight={400}
            >
              (Optional)
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Optionally allocate specific rooms for each division and subject. Leave off if room
            assignment is not needed.
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
            <Grid container spacing={1}>
              {(formik.values.subjects ?? []).flatMap((subject: any) => {
                // Elective groups: render a card per individual subject
                if (subject.electiveGroupId && subject.subjects?.length) {
                  return subject.subjects.map((s: any, sIdx: number) => (
                    <Grid
                      size={{ xs: 12 }}
                      key={`${subject.electiveGroupId}-${s.subjectId || sIdx}`}
                    >
                      <motion.div variants={cardItemVariants} style={{ width: '100%' }}>
                        <RoomAssignmentCard
                          subject={{
                            subjectId: s.subjectId,
                            subjectName: s.subjectName || s.name || '',
                            subjectColor: s.subjectColor || s.color || '#9E9E9E',
                            examDate: s.examDate || null,
                            electiveGroupName: subject.subjectName,
                            electiveGroupId: subject.electiveGroupId,
                          }}
                          formik={formik}
                        />
                      </motion.div>
                    </Grid>
                  ));
                }
                // Core subjects: one card as-is
                return [
                  <Grid size={{ xs: 12 }} key={subject.subjectId}>
                    <motion.div variants={cardItemVariants} style={{ width: '100%' }}>
                      <RoomAssignmentCard subject={subject} formik={formik} />
                    </motion.div>
                  </Grid>,
                ];
              })}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
export default RoomDetails;

const RoomAssignmentCard = ({ subject, formik }: any) => {
  const { subjectId, subjectName, examDate, electiveGroupName } = subject;
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const theme = useTheme();

  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  const divisions = useMemo(
    () => allClass.find((cls: any) => cls.id === formik.values.className)?.divisions || [],
    [allClass, formik.values.className]
  );

  const tableData = divisions
    ?.filter((div: Division) => formik.values.divisions?.includes(div.id))
    .map((div: Division) => ({
      divisionId: div.id,
      division: div.name,
      ...(formik.values.roomDetails?.[subjectId]?.[div.id] ?? { roomIds: [], capacity: 0 }),
    }));

  // Fetch rooms from API
  const { data: roomsApiData, isLoading: roomsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });

  // Flatten and sort: group by building → floor → room for display
  const roomOptions = useMemo(
    () =>
      (roomsApiData?.items ?? []).map((room: any) => ({
        id: room.id,
        roomName: room.roomName ?? '',
        buildingName: room.buildingName ?? '',
        floorName: room.floorName ?? '',
        capacity: room.capacity ?? 0,
        // Label shown in dropdown option
        label: `${room.buildingName ?? ''} › ${room.floorName ?? ''} › ${room.roomName ?? ''}`,
        // Group header for Autocomplete groupBy
        group: `${room.buildingName ?? 'Unknown Building'} › ${room.floorName ?? 'Unknown Floor'}`,
      })),
    [roomsApiData]
  );

  return (
    <SectionCard
      title={subjectName}
      headerContent={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {electiveGroupName && (
            <Chip
              label={electiveGroupName}
              size="small"
              variant="soft"
              color="warning"
              sx={{ fontWeight: 600, borderRadius: 1 }}
            />
          )}
          {examDate && (
            <Chip
              label={examDate.format('dddd, DD MMM YYYY')}
              size="small"
              variant="soft"
              color="primary"
              sx={{ fontWeight: 600, borderRadius: 1 }}
            />
          )}
        </Box>
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
                const fieldPath = `roomDetails.${subjectId}.${row.divisionId}.roomIds`;
                const selectedRoomIds: string[] =
                  formik.values.roomDetails?.[subjectId]?.[row.divisionId]?.roomIds ?? [];
                const selectedRooms = roomOptions.filter((r: any) =>
                  selectedRoomIds.includes(r.id)
                );
                const hasError =
                  formik.values.isRoomAssign &&
                  formik.submitCount > 0 &&
                  selectedRoomIds.length === 0;
                const helperText = hasError ? 'Room is required' : '';

                return (
                  <Autocomplete
                    multiple
                    size="small"
                    loading={roomsLoading}
                    options={roomOptions}
                    groupBy={(option: any) => option.group}
                    getOptionLabel={(option: any) => option.label}
                    isOptionEqualToValue={(option: any, val: any) => option.id === val.id}
                    value={selectedRooms}
                    onChange={(_e, newVal: any[]) => {
                      const ids = newVal.map((r) => r.id);
                      const totalCapacity = newVal.reduce((sum, r) => sum + (r.capacity || 0), 0);
                      formik.setFieldValue(fieldPath, ids);
                      formik.setFieldValue(
                        `roomDetails.${subjectId}.${row.divisionId}.capacity`,
                        totalCapacity
                      );
                    }}
                    renderTags={(tagValues, getTagProps) =>
                      tagValues.map((option: any, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            {...tagProps}
                            label={option.label}
                            size="small"
                            variant="soft"
                            sx={{ ml: 0.5 }}
                          />
                        );
                      })
                    }
                    sx={{ minWidth: { xs: 220, md: 380 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Room(s)"
                        size="small"
                        error={hasError}
                        helperText={helperText}
                      />
                    )}
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
                  {formik.values.roomDetails?.[subjectId]?.[row.divisionId]?.capacity || '-'}
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
