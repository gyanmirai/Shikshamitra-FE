import type { FormikProps } from 'formik';
import type { Variants } from 'framer-motion';
import type { Division } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { getIn } from 'formik';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { GroupedRoomSelector } from 'src/components/room-selection/GroupedRoomSelector';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { sortRoomOptions, createRoomOption } from 'src/components/room-selection/roomOptions';
import {
  Box,
  Grid,
  Chip,
  Menu,
  Paper,
  Stack,
  Button,
  Switch,
  MenuItem,
  Typography,
} from '@mui/material';

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
  const formik = props;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Modernized Switch Section */}
      <Paper
        role="button"
        tabIndex={0}
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          backgroundColor: 'background.paper',
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

      {/* Render Subject Cards if functionality is enabled */}
      <AnimatePresence>
        {formik.values.isRoomAssign && (
          <motion.div
            key="room-cards"
            variants={cardListVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <Grid container spacing={1.5}>
              {(formik.values.subjects ?? []).flatMap((subject: any) => {
                if (subject.electiveGroupId && subject.subjects?.length) {
                  return subject.subjects.map((s: any, sIdx: number) => {
                    const resolvedElectiveGroupName =
                      subject.electiveGroupName ||
                      s.electiveGroupName ||
                      (subject.subjectName !== (s.subjectName || s.name)
                        ? subject.subjectName
                        : undefined);
                    return (
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
                              startTime: s.startTime || null,
                              endTime: s.endTime || null,
                              electiveGroupName: resolvedElectiveGroupName,
                              electiveGroupId: subject.electiveGroupId,
                            }}
                            formik={formik}
                          />
                        </motion.div>
                      </Grid>
                    );
                  });
                }
                return [
                  <Grid size={{ xs: 12 }} key={subject.subjectId}>
                    <motion.div variants={cardItemVariants} style={{ width: '100%' }}>
                      <RoomAssignmentCard
                        subject={{
                          ...subject,
                          electiveGroupName: subject.electiveGroupId
                            ? subject.electiveGroupName
                            : undefined,
                        }}
                        formik={formik}
                      />
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
  const { subjectId, subjectName, examDate, startTime, endTime, electiveGroupName } = subject;
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [bulkAnchorEl, setBulkAnchorEl] = useState<null | HTMLElement>(null);

  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  const classDivisions = useMemo(
    () => allClass.find((cls: any) => cls.id === formik.values.className)?.divisions || [],
    [allClass, formik.values.className]
  );

  const selectedDivisions = useMemo(
    () =>
      classDivisions.filter(
        (div: Division) => formik.values.divisions?.includes(div.id) && div.id !== 'all'
      ),
    [classDivisions, formik.values.divisions]
  );

  // Fetch rooms from API
  const {
    data: roomsApiData,
    isLoading: roomsLoading,
    isFetching: roomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });

  const isRoomsLoading = roomsLoading || roomsFetching;

  // This derived list is shared with Timetable so both room pickers retain identical grouping.
  const roomOptions = useMemo(
    () => sortRoomOptions((roomsApiData?.items ?? []).map((room: any) => createRoomOption(room))),
    [roomsApiData]
  );

  // Handle "Apply to All Divisions" action
  const handleApplyToAllDivisions = useCallback(
    (room: any) => {
      setBulkAnchorEl(null);

      selectedDivisions.forEach((div: Division) => {
        formik.setFieldValue(`roomDetails.${subjectId}.${div.id}.roomIds`, [room.id]);
        formik.setFieldValue(`roomDetails.${subjectId}.${div.id}.capacity`, room.capacity || 0);
        formik.setFieldTouched(`roomDetails.${subjectId}.${div.id}.roomIds`, true, false);
        formik.setFieldError(`roomDetails.${subjectId}.${div.id}.roomIds`, undefined);
      });
      shikshaMitraToast.success({
        message: `Applied room "${room.roomName}" to all divisions`,
      });
    },
    [formik, subjectId, selectedDivisions]
  );

  const tableData = useMemo(
    () =>
      selectedDivisions.map((div: Division) => ({
        divisionId: div.id,
        division: div.name,
        ...(formik.values.roomDetails?.[subjectId]?.[div.id] ?? { roomIds: [], capacity: 0 }),
      })),
    [selectedDivisions, formik.values.roomDetails, subjectId]
  );

  return (
    <SectionCard
      title={subjectName}
      headerContent={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
              label={dayjs(examDate).format('dddd, DD MMM YYYY')}
              size="small"
              variant="soft"
              color="primary"
              sx={{ fontWeight: 600, borderRadius: 1 }}
            />
          )}
          {startTime && endTime && (
            <Chip
              label={`${dayjs(startTime).format('hh:mm A')} – ${dayjs(endTime).format('hh:mm A')}`}
              size="small"
              variant="soft"
              color="default"
              sx={{ fontWeight: 600, borderRadius: 1 }}
            />
          )}
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<Iconify icon="mdi:domain" />}
            onClick={(e) => setBulkAnchorEl(e.currentTarget)}
            sx={{ fontWeight: 700, borderRadius: 1, textTransform: 'none' }}
          >
            Apply Room to All Divisions
          </Button>

          <Menu
            anchorEl={bulkAnchorEl}
            open={Boolean(bulkAnchorEl)}
            onClose={() => setBulkAnchorEl(null)}
            PaperProps={{ sx: { minWidth: 260, maxHeight: 320 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                SELECT ROOM TO APPLY
              </Typography>
            </Box>
            {roomOptions.map((opt: any) => (
              <MenuItem
                key={opt.id}
                onClick={() => handleApplyToAllDivisions(opt)}
                sx={{ fontSize: '0.82rem', py: 1 }}
              >
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Capacity: {opt.capacity || 'N/A'} seats
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      }
      paperProps={{
        sx: {
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        },
      }}
    >
      <Grid size={{ xs: 12 }}>
        <CustomizableTable
          tableId={`room-assignment-${subjectName}`}
          isLoading={isRoomsLoading}
          isSearch={false}
          isPagination={false}
          isFilter={false}
          columns={[
            {
              id: 'division',
              label: 'Division',
              minWidth: 100,
              align: 'left',
              render: (value) => (
                <Typography variant="body2" fontWeight={700}>
                  {value}
                </Typography>
              ),
            },
            {
              id: 'roomIds',
              label: `Room Assignment${formik.values.isRoomAssign ? ' *' : ''}`,
              isFilter: false,
              isSort: false,
              render: (_value, row) => {
                const fieldPath = `roomDetails.${subjectId}.${row.divisionId}.roomIds`;
                const formikError = getIn(formik.errors, fieldPath);
                const formikTouched = getIn(formik.touched, fieldPath);

                const selectedRoomIds: string[] =
                  formik.values.roomDetails?.[subjectId]?.[row.divisionId]?.roomIds ?? [];
                const selectedRooms = roomOptions.filter((r: any) =>
                  selectedRoomIds.includes(r.id)
                );

                const isRequiredMissing =
                  formik.values.isRoomAssign &&
                  Boolean(formikTouched || formik.submitCount > 0) &&
                  selectedRoomIds.length === 0;

                const errorMessage = isRequiredMissing ? formikError || 'Room is required' : '';
                const hasError = Boolean(isRequiredMissing);

                return (
                  <GroupedRoomSelector
                    multiple
                    label={`Select Room(s)${formik.values.isRoomAssign ? ' *' : ''}`}
                    loading={isRoomsLoading}
                    options={roomOptions}
                    value={selectedRooms}
                    error={hasError}
                    helperText={errorMessage || ''}
                    onChange={(newValue) => {
                      const newVal = Array.isArray(newValue) ? newValue : [];
                      const ids = newVal.map((r) => r.id);
                      const totalCapacity = newVal.reduce((sum, r) => sum + (r.capacity || 0), 0);
                      formik.setFieldValue(fieldPath, ids);
                      formik.setFieldValue(
                        `roomDetails.${subjectId}.${row.divisionId}.capacity`,
                        totalCapacity
                      );
                      formik.setFieldTouched(fieldPath, true, false);
                      if (ids.length > 0) {
                        formik.setFieldError(fieldPath, undefined);
                      }
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
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
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
