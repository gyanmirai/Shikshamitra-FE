import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { ExpandMore } from '@mui/icons-material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetLectureSlotByIdQuery } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Table,
  Paper,
  Skeleton,
  TableRow,
  Accordion,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// The raw table row shape passed from the parent list component
interface ViewCreateSlotsProps {
  data: {
    id?: string;
    standardName?: string;
    [key: string]: any;
  } | null;
}

// Normalised shape used exclusively for rendering
interface NormalisedSlotData {
  className: string;
  schoolHours: string;
  previousClassSlots: string;
  slotConfigurations: Array<{
    id: string;
    totalSlots: string;
    weekRange: [number, number];
    timeSlots: Array<{
      id: string;
      startTime: any;
      endTime: any;
      slotType: string;
      breakType: string;
    }>;
  }>;
}

const dayMarks = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
];

const getDayLabel = (value: number) => dayMarks.find((d) => d.value === value)?.label || '';

/** Maps raw API detail response → normalised view model */
const mapApiToViewModel = (apiData: any, standardName?: string): NormalisedSlotData => ({
  className: standardName || apiData?.standardName || apiData?.standardId || '—',
  schoolHours: apiData?.schoolHours || '—',
  previousClassSlots: apiData?.previousStandardId || 'None',
  slotConfigurations: (apiData?.slotConfigurations ?? []).map((config: any, ci: number) => {
    // API may return weekRange array or separate fromDay / toDay fields
    const weekRange: [number, number] =
      Array.isArray(config.weekRange) && config.weekRange.length >= 2
        ? [Number(config.weekRange[0]), Number(config.weekRange[1])]
        : [Number(config.fromDay ?? 0), Number(config.toDay ?? 5)];

    const timeSlots = (config.timeSlots ?? []).map((slot: any, si: number) => ({
      id: slot.id ?? `${ci}-${si}`,
      startTime: slot.startTime ? dayjs(slot.startTime, 'HH:mm:ss') : null,
      endTime: slot.endTime ? dayjs(slot.endTime, 'HH:mm:ss') : null,
      slotType: Number(slot.slotType) === 1 ? 'break' : 'period',
      breakType:
        Number(slot.breakType) === 1 ? 'short' : Number(slot.breakType) === 2 ? 'lunch' : '',
    }));

    return {
      id: config.id ?? String(ci),
      totalSlots: String(config.totalSlots ?? timeSlots.length),
      weekRange,
      timeSlots,
    };
  }),
});

const ViewCreateSlots: React.FC<ViewCreateSlotsProps> = ({ data }) => {
  const [expandedConfigs, setExpandedConfigs] = useState<Record<string, boolean>>({});

  // Fetch full slot detail (includes timeSlots, schoolHours, etc.)
  const { data: slotDetail, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotByIdQuery,
    params: data?.id,
    options: { skip: !data?.id },
  });

  const viewData = useMemo<NormalisedSlotData | null>(() => {
    if (!slotDetail) return null;
    return mapApiToViewModel(slotDetail, data?.standardName);
  }, [slotDetail, data?.standardName]);

  const generalDetails = useMemo(
    () => [
      {
        label: 'Class',
        icon: 'mdi:google-classroom',
        value: viewData?.className || '—',
      },
    ],
    [viewData]
  );

  const handleToggleConfig = (configId: string) => {
    setExpandedConfigs((prev) => ({
      ...prev,
      [configId]: !prev[configId],
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={120} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={80} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={80} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        maxHeight: 'calc(100vh - 220px)',
        overflowY: 'auto',
      }}
    >
      {/* General Information - Simple Card */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" color="primary.main" mb={2.5}>
          General Information
        </Typography>
        <Grid container spacing={3}>
          {generalDetails.map((detail) => (
            <Grid key={detail.label} size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon={detail.icon} width={20} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                  >
                    {detail.label}:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.85rem' }}
                    noWrap
                  >
                    {detail.value}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Slot Configurations */}
      {viewData?.slotConfigurations && viewData.slotConfigurations.length > 0 && (
        <Box>
          {viewData.slotConfigurations.map((config, index) => (
            <Accordion
              key={config.id}
              expanded={expandedConfigs[config.id] ?? false} // Changed from true to false
              onChange={() => handleToggleConfig(config.id)}
              sx={{
                boxShadow: 1,
                borderRadius: '12px !important',
                '&:before': { display: 'none' },
                border: '1px solid',
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    my: 1.5,
                    display: 'block',
                  },
                }}
              >
                {/* Preview when collapsed */}
                {!expandedConfigs[config.id] && (
                  <Grid container spacing={2} mt={0.5}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon="mdi:clock-outline" width={18} color="text.secondary" />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                          >
                            Total Slots:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ fontSize: '0.75rem' }}
                            noWrap
                          >
                            {config.totalSlots}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon="mdi:calendar-range" width={18} color="text.secondary" />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                          >
                            Active Days:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ fontSize: '0.75rem' }}
                            noWrap
                          >
                            {config.weekRange?.length >= 2
                              ? `${getDayLabel(config.weekRange[0])} - ${getDayLabel(config.weekRange[1])}`
                              : '—'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon="mdi:timetable" width={18} color="text.secondary" />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                          >
                            Time Slots:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ fontSize: '0.75rem' }}
                            noWrap
                          >
                            {config.timeSlots.length}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                )}
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                <Box width="100%">
                  {/* Configuration Summary - Show when expanded */}
                  <Grid container spacing={3} mb={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon="mdi:clock-outline" width={20} color="text.secondary" />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                          >
                            Total Slots:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ fontSize: '0.85rem' }}
                          >
                            {config.totalSlots}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon="mdi:calendar-range" width={20} color="text.secondary" />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                          >
                            Active Days:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {config.weekRange?.length >= 2 &&
                              Array.from(
                                { length: config.weekRange[1] - config.weekRange[0] + 1 },
                                (_, i) => config.weekRange[0] + i
                              ).map((day) => (
                                <Chip
                                  key={day}
                                  label={getDayLabel(day)}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: '22px' }}
                                />
                              ))}
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Slot Times - Simple Table */}
                  {config.timeSlots.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        color="primary.main"
                        fontWeight={600}
                        gutterBottom
                        mb={2}
                      >
                        Slot Times
                      </Typography>

                      <TableContainer
                        component={Paper}
                        sx={{
                          boxShadow: 0,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Start Time
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                End Time
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Total Time
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Slot Type
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {config.timeSlots.map((slot) => {
                              const duration = slot.endTime?.diff?.(slot.startTime, 'minute') || 0;
                              const hours = Math.floor(duration / 60);
                              const minutes = duration % 60;
                              const durationText =
                                hours > 0
                                  ? `${hours}:${minutes.toString().padStart(2, '0')}`
                                  : `00:${minutes.toString().padStart(2, '0')}`;

                              return (
                                <TableRow
                                  key={slot.id}
                                  sx={{
                                    '&:last-child td': { border: 0 },
                                    '&:hover': { backgroundColor: 'action.hover' },
                                  }}
                                >
                                  <TableCell>
                                    <Typography variant="body2">
                                      {slot.startTime?.format?.('hh:mm A') || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {slot.endTime?.format?.('hh:mm A') || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {durationText}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      color={
                                        slot.slotType === 'break' ? 'error.main' : 'text.secondary'
                                      }
                                    >
                                      {typeof slot.slotType === 'string' && slot.slotType
                                        ? slot.slotType.charAt(0).toUpperCase() +
                                          slot.slotType.slice(1)
                                        : '—'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* No configurations message */}
      {(!viewData?.slotConfigurations || viewData.slotConfigurations.length === 0) && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.neutral',
          }}
        >
          <Iconify
            icon="mdi:calendar-clock-outline"
            width={64}
            color="text.disabled"
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Slot Configurations
          </Typography>
          <Typography variant="body2" color="text.disabled">
            No slot configurations have been created yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ViewCreateSlots;
