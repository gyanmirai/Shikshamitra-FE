import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FormSectionHeader } from 'src/components/form-section-card/section-header';
import { useGetLectureSlotByIdQuery } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';
import {
  Box,
  Chip,
  Stack,
  Paper,
  Tooltip,
  Skeleton,
  Accordion,
  Typography,
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
  shiftTiming: string;
  schoolHours: string;
  previousClassSlots: string;
  slotConfigurations: Array<{
    id: string;
    totalSlots: string;
    activeDays: number[];
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
  shiftTiming: apiData?.shiftTimingLabel || 'Shift not assigned',
  schoolHours: apiData?.schoolHours || '—',
  previousClassSlots: apiData?.previousStandardId || 'None',
  slotConfigurations: (apiData?.slotConfigurations ?? []).map((config: any, ci: number) => {
    const legacyRange =
      Array.isArray(config.weekRange) && config.weekRange.length >= 2
        ? [Number(config.weekRange[0]), Number(config.weekRange[1])]
        : [Number(config.fromDay ?? 0), Number(config.toDay ?? 5)];
    const activeDays =
      Array.isArray(config.activeDays) && config.activeDays.length > 0
        ? config.activeDays.map(Number)
        : Array.from(
            { length: legacyRange[1] - legacyRange[0] + 1 },
            (_unused, offset) => legacyRange[0] + offset
          );

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
      activeDays,
      timeSlots,
    };
  }),
});

const ViewCreateSlots: React.FC<ViewCreateSlotsProps> = ({ data }) => {
  const theme = useTheme();
  const [expandedConfigs, setExpandedConfigs] = useState<Record<string, boolean>>({});

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

  const handleToggleConfig = (configId: string) => {
    setExpandedConfigs((prev) => ({ ...prev, [configId]: !prev[configId] }));
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={100} sx={{ mb: 3, borderRadius: 3 }} />
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5, overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
      {/* ── General Information ─────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
        }}
      >
        {/* Accent stripe */}
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.6)})`,
          }}
        />
        <Box sx={{ p: 2.5 }}>
          <FormSectionHeader
            icon="mdi:clock-outline"
            title="General Information"
            descriptionTooltip="Review the saved class, shift and school-hour context for these slots."
          />{' '}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Iconify icon="mdi:google-classroom" width={16} color="primary.main" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                Class:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {viewData?.className || '—'}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
              }}
            >
              <Iconify icon="mdi:clock-time-four-outline" width={16} color="info.main" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                Timing:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="info.main">
                {viewData?.shiftTiming || 'Shift not assigned'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* ── Slot Configurations ────────────────────────────────────────── */}
      {viewData?.slotConfigurations && viewData.slotConfigurations.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {viewData.slotConfigurations.map((config, index) => {
            const isExpanded = expandedConfigs[config.id] ?? false;
            const lectureCount = config.timeSlots.filter((s) => s.slotType !== 'break').length;
            const breakCount = config.timeSlots.filter((s) => s.slotType === 'break').length;

            return (
              <Accordion
                key={config.id}
                expanded={isExpanded}
                onChange={() => handleToggleConfig(config.id)}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  border: '1px solid',
                  borderColor: isExpanded ? alpha(theme.palette.primary.main, 0.3) : 'divider',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isExpanded
                    ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
                    : 'none',
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isExpanded
                          ? alpha(theme.palette.primary.main, 0.1)
                          : 'action.hover',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <ExpandMore
                        sx={{
                          fontSize: 18,
                          color: isExpanded ? 'primary.main' : 'text.secondary',
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: isExpanded
                      ? alpha(theme.palette.primary.main, 0.04)
                      : 'background.paper',
                    '& .MuiAccordionSummary-content': { my: 0, mr: 1 },
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    flexWrap="wrap"
                    gap={1}
                  >
                    {/* Config title */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: isExpanded ? 'primary.main' : 'text.disabled',
                          transition: 'background-color 0.2s',
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={isExpanded ? 'primary.main' : 'text.primary'}
                      >
                        Configuration {index + 1}
                      </Typography>
                      {/* Day range pill */}
                      {config.activeDays.length > 0 && (
                        <Chip
                          icon={<Iconify icon="mdi:calendar-range" width={12} />}
                          label={config.activeDays.map(getDayLabel).join(', ')}
                          size="small"
                          variant="outlined"
                          color="default"
                          sx={{ fontSize: '0.65rem', height: 20, '& .MuiChip-label': { px: 0.75 } }}
                        />
                      )}
                    </Stack>

                    {/* Summary pills */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`${config.timeSlots.length} slots`}
                        size="small"
                        color="primary"
                        sx={{
                          fontSize: '0.62rem',
                          height: 20,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                      <Chip
                        label={`${lectureCount} lectures`}
                        size="small"
                        color="success"
                        sx={{
                          fontSize: '0.62rem',
                          height: 20,
                          bgcolor: alpha(theme.palette.success.main, 0.15),
                          color: 'success.main',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                      {breakCount > 0 && (
                        <Chip
                          label={`${breakCount} breaks`}
                          size="small"
                          color="warning"
                          sx={{
                            fontSize: '0.62rem',
                            height: 20,
                            bgcolor: alpha(theme.palette.warning.main, 0.18),
                            color: 'warning.main',
                            fontWeight: 700,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={{ px: 2.5, pb: 2.5, pt: 1.5 }}>
                    {/* Active day chips */}
                    <Stack direction="row" alignItems="center" spacing={1} mb={2} flexWrap="wrap">
                      <Typography
                        variant="overline"
                        sx={{
                          fontSize: '0.62rem',
                          color: 'text.disabled',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Active Days
                      </Typography>
                      {config.activeDays.map((day) => (
                        <Chip
                          key={day}
                          label={getDayLabel(day)}
                          size="small"
                          color="primary"
                          sx={{
                            height: 24,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.18),
                            color: theme.palette.primary.main,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                      ))}
                    </Stack>

                    {/* ── Timeline slot list ─────────────────────────── */}
                    {config.timeSlots.length > 0 && (
                      <Box>
                        <Typography
                          variant="overline"
                          sx={{
                            fontSize: '0.62rem',
                            color: 'text.disabled',
                            letterSpacing: '0.08em',
                            mb: 1.5,
                            display: 'block',
                          }}
                        >
                          Time Slots
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          {config.timeSlots.map((slot, si) => {
                            const isBreak = slot.slotType === 'break';
                            const duration = slot.endTime?.diff?.(slot.startTime, 'minute') || 0;
                            const hrs = Math.floor(duration / 60);
                            const mins = duration % 60;
                            const durationLabel = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                            const accentColor = isBreak
                              ? theme.palette.warning.main
                              : theme.palette.success.main;

                            return (
                              <Box
                                key={slot.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  px: 1.5,
                                  py: 1,
                                  borderRadius: 2,
                                  // bgcolor: isBreak
                                  //   ? alpha(theme.palette.warning.main, 0.08)
                                  //   : alpha(theme.palette.success.main, 0.08),
                                  border: '1px solid',
                                  borderColor: isBreak
                                    ? alpha(theme.palette.warning.main, 0.25)
                                    : alpha(theme.palette.success.main, 0.25),
                                  position: 'relative',
                                  overflow: 'hidden',
                                  transition: 'box-shadow 0.15s',
                                  '&:hover': {
                                    boxShadow: `0 2px 8px ${alpha(accentColor, 0.18)}`,
                                  },
                                }}
                              >
                                {/* Left accent bar */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 3,
                                    borderRadius: '2px 0 0 2px',
                                    bgcolor: accentColor,
                                  }}
                                />

                                {/* Slot number */}
                                <Box
                                  sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: alpha(accentColor, 0.15),
                                    flexShrink: 0,
                                  }}
                                >
                                  <Typography
                                    sx={{ fontSize: '0.6rem', fontWeight: 800, color: accentColor }}
                                  >
                                    {si + 1}
                                  </Typography>
                                </Box>

                                {/* Times */}
                                <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                                  <Iconify
                                    icon="mdi:clock-start"
                                    width={13}
                                    sx={{ color: 'text.disabled', flexShrink: 0 }}
                                  />
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    sx={{ fontSize: '0.78rem', fontFeatureSettings: '"tnum"' }}
                                  >
                                    {slot.startTime?.format?.('hh:mm A') || '—'}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.disabled', mx: 0.25 }}
                                  >
                                    →
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    sx={{ fontSize: '0.78rem', fontFeatureSettings: '"tnum"' }}
                                  >
                                    {slot.endTime?.format?.('hh:mm A') || '—'}
                                  </Typography>
                                </Stack>

                                {/* Duration pill */}
                                <Tooltip title="Duration" placement="top" arrow>
                                  <Box
                                    sx={{
                                      height: 22,
                                      px: 1,
                                      borderRadius: 10,
                                      // bgcolor: alpha(accentColor, 0.18),
                                      border: '1px solid',
                                      borderColor: alpha(accentColor, 0.3),
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      flexShrink: 0,
                                      verticalAlign: 'middle',
                                    }}
                                  >
                                    <Iconify
                                      icon="mdi:timer-outline"
                                      width={12}
                                      sx={{ color: accentColor, display: 'block' }}
                                    />
                                    <Typography
                                      sx={{
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        color: accentColor,
                                        lineHeight: 'normal',
                                      }}
                                    >
                                      {durationLabel}
                                    </Typography>
                                  </Box>
                                </Tooltip>

                                {/* Type badge */}
                                <Chip
                                  variant="outlined"
                                  icon={
                                    <Iconify
                                      icon={
                                        isBreak ? 'mdi:coffee-outline' : 'mdi:book-open-outline'
                                      }
                                      width={11}
                                    />
                                  }
                                  label={
                                    isBreak
                                      ? slot.breakType
                                        ? `${slot.breakType.charAt(0).toUpperCase() + slot.breakType.slice(1)} Break`
                                        : 'Break'
                                      : 'Lecture'
                                  }
                                  size="small"
                                  color={isBreak ? 'warning' : 'success'}
                                  sx={{
                                    height: 22,
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    minWidth: '95px',
                                    // bgcolor: alpha(accentColor, 0.18),
                                    color: accentColor,
                                    border: '1px solid',
                                    borderColor: alpha(accentColor, 0.3),
                                    '& .MuiChip-label': { px: 0.75 },
                                    '& .MuiChip-icon': { ml: 0.5, color: 'inherit' },
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {(!viewData?.slotConfigurations || viewData.slotConfigurations.length === 0) && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: alpha(theme.palette.primary.main, 0.15),
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Iconify icon="mdi:calendar-clock-outline" width={36} color="primary.main" />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary" gutterBottom>
            No Slot Configurations
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 260, mx: 'auto' }}>
            No slot configurations have been created yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ViewCreateSlots;
