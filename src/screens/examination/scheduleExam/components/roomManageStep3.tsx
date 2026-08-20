import type { FormikProps } from 'formik';
import type { Variants } from 'framer-motion';
import type { Division } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { getIn } from 'formik';
import { alpha } from '@mui/system';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { useState, useMemo, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Chip,
  Menu,
  Paper,
  Stack,
  Alert,
  Button,
  Switch,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
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

const slotsOverlap = (a: any, b: any) => {
  if (!a.examDate || !b.examDate || !a.startTime || !a.endTime || !b.startTime || !b.endTime) {
    return false;
  }
  const dateA = dayjs(a.examDate).format('YYYY-MM-DD');
  const dateB = dayjs(b.examDate).format('YYYY-MM-DD');
  if (dateA !== dateB) return false;

  const tStartA = dayjs(a.startTime);
  const tEndA = dayjs(a.endTime);
  const tStartB = dayjs(b.startTime);
  const tEndB = dayjs(b.endTime);

  const startA = dayjs(a.examDate).hour(tStartA.hour()).minute(tStartA.minute()).second(0);
  const endA = dayjs(a.examDate).hour(tEndA.hour()).minute(tEndA.minute()).second(0);
  const startB = dayjs(b.examDate).hour(tStartB.hour()).minute(tStartB.minute()).second(0);
  const endB = dayjs(b.examDate).hour(tEndB.hour()).minute(tEndB.minute()).second(0);

  return startA.isBefore(endB) && endA.isAfter(startB);
};

const RoomDetails = (props: FormikProps<IExamFormValues>) => {
  const formik = props;
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Modernized Switch Section */}
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
                            startTime: s.startTime || null,
                            endTime: s.endTime || null,
                            electiveGroupName: subject.subjectName,
                            electiveGroupId: subject.electiveGroupId,
                          }}
                          formik={formik}
                        />
                      </motion.div>
                    </Grid>
                  ));
                }
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
  const { subjectId, subjectName, examDate, startTime, endTime, electiveGroupName } = subject;
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const theme = useTheme();

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

  // Flatten and sort: group by building → floor → room for display
  const roomOptions = useMemo(
    () =>
      (roomsApiData?.items ?? []).map((room: any) => ({
        id: room.id,
        roomName: room.roomName ?? '',
        buildingName: room.buildingName ?? '',
        floorName: room.floorName ?? '',
        capacity: room.capacity ?? 0,
        label: `${room.buildingName ?? ''} › ${room.floorName ?? ''} › ${room.roomName ?? ''}`,
        group: `${room.buildingName ?? 'Unknown Building'} › ${room.floorName ?? 'Unknown Floor'}`,
      })),
    [roomsApiData]
  );

  const roomNameById = useMemo(() => {
    const map = new Map<string, string>();
    roomOptions.forEach((r: any) => map.set(r.id, r.roomName || r.label));
    return map;
  }, [roomOptions]);

  // Flatten all active assignments across all subjects and divisions for live conflict checks
  const allScheduledAssignments = useMemo(() => {
    const list: Array<{
      subjectId: string;
      subjectName: string;
      divisionId: string;
      divisionName: string;
      roomIds: string[];
      examDate: any;
      startTime: any;
      endTime: any;
    }> = [];

    const rawSubjects = formik.values.subjects ?? [];
    rawSubjects.forEach((sub: any) => {
      if (sub.electiveGroupId && Array.isArray(sub.subjects)) {
        sub.subjects.forEach((nested: any) => {
          if (!nested.isExamSelectionDisabled && nested.subjectId) {
            selectedDivisions.forEach((div: Division) => {
              const rIds = formik.values.roomDetails?.[nested.subjectId]?.[div.id]?.roomIds ?? [];
              list.push({
                subjectId: nested.subjectId,
                subjectName: nested.subjectName || nested.name || 'Elective Subject',
                divisionId: div.id,
                divisionName: div.name,
                roomIds: rIds,
                examDate: nested.examDate,
                startTime: nested.startTime,
                endTime: nested.endTime,
              });
            });
          }
        });
      } else if (sub.subjectId) {
        selectedDivisions.forEach((div: Division) => {
          const rIds = formik.values.roomDetails?.[sub.subjectId]?.[div.id]?.roomIds ?? [];
          list.push({
            subjectId: sub.subjectId,
            subjectName: sub.subjectName || 'Subject',
            divisionId: div.id,
            divisionName: div.name,
            roomIds: rIds,
            examDate: sub.examDate,
            startTime: sub.startTime,
            endTime: sub.endTime,
          });
        });
      }
    });

    return list;
  }, [formik.values.subjects, formik.values.roomDetails, selectedDivisions]);

  // Compute live conflicts for the current subject card
  const divisionConflicts = useMemo(() => {
    const conflictMap: Record<string, string> = {};

    selectedDivisions.forEach((currentDiv: Division) => {
      const currentRoomIds: string[] =
        formik.values.roomDetails?.[subjectId]?.[currentDiv.id]?.roomIds ?? [];
      if (!currentRoomIds.length) return;

      const currentSlot = {
        subjectId,
        subjectName,
        divisionId: currentDiv.id,
        roomIds: currentRoomIds,
        examDate,
        startTime,
        endTime,
      };

      for (const other of allScheduledAssignments) {
        // Skip comparing division against itself in the same subject
        if (other.subjectId === subjectId && other.divisionId === currentDiv.id) continue;
        if (!other.roomIds.length) continue;

        const isSameSlot = other.subjectId === subjectId;
        const isOverlapping = isSameSlot || slotsOverlap(currentSlot, other);

        if (isOverlapping) {
          const shared = currentRoomIds.filter((id) => other.roomIds.includes(id));
          if (shared.length > 0) {
            const sharedNames = shared.map((id) => roomNameById.get(id) || 'Room').join(', ');
            if (isSameSlot) {
              conflictMap[currentDiv.id] =
                `Room conflict: ${sharedNames} is already assigned to Division ${other.divisionName} for this exam`;
            } else {
              conflictMap[currentDiv.id] =
                `Room conflict: ${sharedNames} is booked for ${other.subjectName} (Div ${other.divisionName}) during overlapping hours`;
            }
            break;
          }
        }
      }
    });

    return conflictMap;
  }, [
    selectedDivisions,
    formik.values.roomDetails,
    subjectId,
    subjectName,
    examDate,
    startTime,
    endTime,
    allScheduledAssignments,
    roomNameById,
  ]);

  const hasAnyCardConflict = Object.keys(divisionConflicts).length > 0;

  // Handle "Apply to All Divisions" action
  const handleApplyToAllDivisions = useCallback(
    (room: any) => {
      setBulkAnchorEl(null);

      // Validate conflict if multiple divisions exist
      if (selectedDivisions.length > 1) {
        shikshaMitraToast.warning({
          message: `Cannot assign single room "${room.roomName}" to all divisions at once: Simultaneous divisions require distinct rooms. Please assign individual rooms.`,
        });
      }
      selectedDivisions.forEach((div: Division) => {
        formik.setFieldValue(`roomDetails.${subjectId}.${div.id}.roomIds`, [room.id]);
        formik.setFieldValue(`roomDetails.${subjectId}.${div.id}.capacity`, room.capacity || 0);
        formik.setFieldTouched(`roomDetails.${subjectId}.${div.id}.roomIds`, true, false);
        formik.setFieldError(`roomDetails.${subjectId}.${div.id}.roomIds`, undefined);
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
          borderColor: hasAnyCardConflict ? 'error.light' : 'divider',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: (theme: any) =>
              theme.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.08)',
            borderColor: hasAnyCardConflict ? 'error.main' : 'primary.light',
            '& .MuiCardHeader-root': {
              transform: 'translateY(-2px)',
            },
          },
        },
      }}
    >
      <Grid size={{ xs: 12 }}>
        {hasAnyCardConflict && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Room Allocation Conflict Detected
            </Typography>
            <Typography variant="caption">
              One or more rooms are assigned to multiple divisions simultaneously or conflict with
              another exam slot. Please allocate distinct rooms.
            </Typography>
          </Alert>
        )}

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
              render: (value, row) => {
                const isDivInConflict = Boolean(divisionConflicts[row.divisionId]);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {value}
                    </Typography>
                    {isDivInConflict && (
                      <Chip
                        label="Conflict"
                        size="small"
                        color="error"
                        variant="soft"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                      />
                    )}
                  </Box>
                );
              },
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

                const conflictError = divisionConflicts[row.divisionId];
                const isRequiredMissing =
                  formik.values.isRoomAssign &&
                  Boolean(formikTouched || formik.submitCount > 0) &&
                  selectedRoomIds.length === 0;

                const errorMessage =
                  conflictError ||
                  (isRequiredMissing ? (formikError || 'Room is required') : '');
                const hasError = Boolean(conflictError || isRequiredMissing);

                return (
                  <Autocomplete
                    multiple
                    size="small"
                    loading={isRoomsLoading}
                    options={roomOptions}
                    groupBy={(option: any) => option.group}
                    getOptionLabel={(option: any) => option.label}
                    isOptionEqualToValue={(option: any, val: any) => option.id === val.id}
                    renderGroup={(params) => (
                      <Box component="li" key={params.key} sx={{ mb: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            px: 1.25,
                            py: 0.5,
                            fontSize: '11px',
                            color: 'text.secondary',
                            bgcolor: 'background.neutral',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {params.group}
                        </Typography>
                        <Box
                          component="ul"
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.75,
                            px: 1.25,
                            py: 0.75,
                            m: 0,
                            listStyle: 'none',
                          }}
                        >
                          {params.children}
                        </Box>
                      </Box>
                    )}
                    renderOption={(props, option: any, { selected }) => {
                      const { key, ...restProps } = props as any;
                      return (
                        <Box
                          component="li"
                          key={key}
                          {...restProps}
                          sx={{
                            px: 1,
                            py: 0.35,
                            fontSize: '12px',
                            borderRadius: 0.75,
                            border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                            bgcolor: selected ? 'primary.lighter' : 'background.paper',
                            color: selected ? 'primary.main' : 'text.primary',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: selected ? 'primary.lighter' : 'action.hover',
                              borderColor: 'primary.main',
                            },
                            // Overriding MUI's default li styles
                            width: 'auto !important',
                            minWidth: 'auto',
                            m: '0 !important',
                            display: 'inline-flex',
                            fontWeight: selected ? 600 : 500,
                          }}
                        >
                          {option.roomName}
                        </Box>
                      );
                    }}
                    value={selectedRooms}
                    onChange={(_e, newVal: any[]) => {
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
                            color="default"
                            sx={{ ml: 0.5 }}
                          />
                        );
                      })
                    }
                    sx={{ minWidth: { xs: 240, md: 420 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={`Select Room(s)${formik.values.isRoomAssign ? ' *' : ''}`}
                        size="small"
                        error={hasError}
                        helperText={errorMessage || ''}
                        slotProps={{
                          formHelperText: {
                            sx: {
                              fontWeight: 600,
                              color: hasError ? 'error.main' : 'text.secondary',
                            },
                          },
                        }}
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
