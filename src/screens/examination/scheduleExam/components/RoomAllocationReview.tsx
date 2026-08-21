import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { MeetingRoom, ClassOutlined } from '@mui/icons-material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { Box, Chip, Grid, Button, Divider, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import type { IRoomDetails, IExamFormValues, IDivisionRoomDetail } from '../type';

// ----------------------------------------------------------------------

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 20 } })}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Box
        component="div"
        sx={{
          typography: 'subtitle2',
          fontWeight: 600,
          color: 'text.primary',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Box>
    </Box>
  </Box>
);

// ----------------------------------------------------------------------

interface ReviewSubjectRoomEntry {
  subjectId: string;
  subjectName: string;
  electiveGroupName?: string;
  divisionMap: Record<string, IDivisionRoomDetail>;
}

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

  // Flatten all standards/classes from education medium stages into a single array
  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  // Get divisions for the currently selected class from formik values
  const divisions = useMemo(
    () => allClass.find((cls: any) => cls.id === formik.values.className)?.divisions || [],
    [allClass, formik.values.className]
  );

  const activeReviewSubjects = useMemo(() => {
    const selectedDivIds = new Set(
      (formik.values.divisions || []).filter((d: string) => d !== 'all')
    );
    const entries: ReviewSubjectRoomEntry[] = [];

    (formik.values.subjects || []).forEach((sub: any) => {
      if (sub?.electiveGroupId && Array.isArray(sub?.subjects) && sub.subjects.length > 0) {
        sub.subjects.forEach((nested: any) => {
          if (nested?.isExamSelectionDisabled) return;
          const subId = nested.subjectId || nested.id;
          if (!subId) return;

          const rawDivMap = roomDetails?.[subId] ?? {};
          const divisionMap: Record<string, IDivisionRoomDetail> = {};
          selectedDivIds.forEach((divId) => {
            if (rawDivMap[divId]?.roomIds?.length > 0) {
              divisionMap[divId] = rawDivMap[divId];
            }
          });

          if (Object.keys(divisionMap).length > 0) {
            entries.push({
              subjectId: subId,
              subjectName: nested.subjectName || nested.name || sub.subjectName,
              electiveGroupName: sub.subjectName,
              divisionMap,
            });
          }
        });
      } else {
        const subId = sub?.subjectId || sub?.id;
        if (!subId) return;

        const rawDivMap = roomDetails?.[subId] ?? {};
        const divisionMap: Record<string, IDivisionRoomDetail> = {};
        selectedDivIds.forEach((divId) => {
          if (rawDivMap[divId]?.roomIds?.length > 0) {
            divisionMap[divId] = rawDivMap[divId];
          }
        });

        if (Object.keys(divisionMap).length > 0) {
          entries.push({
            subjectId: subId,
            subjectName: sub.subjectName || sub.name || '',
            divisionMap,
          });
        }
      }
    });

    return entries;
  }, [formik.values.subjects, formik.values.divisions, roomDetails]);

  if (activeReviewSubjects.length === 0) return null;

  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        borderRadius: 2,
        boxShadow: (theme) =>
          theme.customShadows?.card ||
          '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        border: (theme) => `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        overflow: 'hidden',
        mb: 2,
        '&:before': { display: 'none' },
      }}
    >
      {/* Header */}
      <AccordionSummary
        expandIcon={<Iconify icon="eva:chevron-down-fill" width={20} />}
        sx={{
          px: 2,
          py: 1,
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
          borderBottom: (theme) => `1px dashed ${varAlpha(theme.palette.grey['500Channel'], 0.2)}`,
          '& .MuiAccordionSummary-content': {
            my: 0.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => `0 4px 8px ${varAlpha(theme.palette.primary.mainChannel, 0.16)}`,
              border: (theme) => `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.1)}`,
            }}
          >
            <Iconify icon="fluent:conference-room-24-filled" width={24} color="primary.main" />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Room Allocation
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Designated rooms for each subject and division
            </Typography>
          </Box>
        </Box>

        {/* NON-BREAKING: Edit link navigates back to Room Details step */}
        {onEdit && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="eva:edit-2-fill" width={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{ fontSize: '0.75rem', flexShrink: 0 }}
          >
            Edit
          </Button>
        )}
      </AccordionSummary>

      {/* Body */}
      <AccordionDetails sx={{ p: 3 }}>
        <Grid container spacing={1}>
          {activeReviewSubjects.map((entry, index, arr) => {
            const { subjectId, subjectName, electiveGroupName, divisionMap } = entry;

            return (
              <React.Fragment key={subjectId}>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: 'primary.dark' }}
                    >
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
                          <InfoItem
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
      </AccordionDetails>
    </Accordion>
  );
};

export default RoomAllocationReview;
