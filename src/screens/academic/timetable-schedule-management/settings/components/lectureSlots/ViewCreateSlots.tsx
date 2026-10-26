import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useId, useMemo, useState } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import CustomAccordion from 'src/components/custom-accordian';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Tooltip, Skeleton, Typography } from '@mui/material';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { useGetLectureSlotByIdQuery } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

import { LectureSlotConfigurationHeader } from './LectureSlotConfigurationHeader';

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
  const instanceId = useId();
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
    <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 }, overflowY: 'auto', height: 1, minHeight: 0 }}>
      {/* ── General Information ─────────────────────────────────────── */}
      <FormSectionCard
        title="General Information"
        icon={GlobalIcons.clock}
        descriptionTooltip="Review the saved class and assigned shift for these lecture slots."
        sx={{ flexShrink: 0 }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Class
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {viewData?.className || '—'}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Timing
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {viewData?.shiftTiming || 'Shift not assigned'}
            </Typography>
          </Box>
        </Box>
      </FormSectionCard>

      {/* ── Slot Configurations ────────────────────────────────────────── */}
      {viewData?.slotConfigurations && viewData.slotConfigurations.length > 0 && (
        <Stack spacing={2} sx={{ flexShrink: 0 }}>
          {viewData.slotConfigurations.map((config, index) => {
            const isExpanded = expandedConfigs[config.id] ?? false;
            const lectureCount = config.timeSlots.filter((s) => s.slotType !== 'break').length;
            const breakCount = config.timeSlots.filter((s) => s.slotType === 'break').length;

            return (
              <Box
                key={config.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <CustomAccordion
                  title={`Configuration ${index + 1}`}
                  expanded={isExpanded}
                  onChange={() => handleToggleConfig(config.id)}
                  summary={
                    <LectureSlotConfigurationHeader
                      id={`${instanceId}-${config.id}-header`}
                      aria-controls={`${instanceId}-${config.id}-content`}
                      title={`Configuration ${index + 1}`}
                      activeDaysLabel={config.activeDays.map(getDayLabel).join(', ')}
                      slotCount={config.timeSlots.length}
                      lectureCount={lectureCount}
                      breakCount={breakCount}
                      expanded={isExpanded}
                      onToggle={() => handleToggleConfig(config.id)}
                    />
                  }
                  content={
                    <Stack spacing={2} sx={{ p: { xs: 0.5, sm: 1 } }}>
                      <Stack spacing={2}>
                        <FormSectionHeader
                          icon={GlobalIcons.calendar}
                          title="Active Days"
                          descriptionTooltip="Weekdays that use this saved slot configuration."
                        />
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {config.activeDays.map((day) => (
                            <Chip
                              key={day}
                              label={getDayLabel(day)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Stack>

                      {config.timeSlots.length > 0 && (
                        <Stack spacing={2}>
                          <FormSectionHeader
                            icon={GlobalIcons.clock}
                            title="Time Slots"
                            descriptionTooltip="Saved start and end times, duration, and type for each slot in order."
                          />

                          <Stack spacing={1}>
                            {config.timeSlots.map((slot, si) => {
                              const isBreak = slot.slotType === 'break';
                              const duration = slot.endTime?.diff?.(slot.startTime, 'minute') || 0;
                              const hrs = Math.floor(duration / 60);
                              const mins = duration % 60;
                              const durationLabel = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                              return (
                                <Box
                                  key={slot.id}
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                      xs: '28px minmax(0, 1fr)',
                                      sm: '28px minmax(0, 1fr) auto',
                                    },
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    py: 1.5,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {si + 1}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    useFlexGap
                                    flexWrap="wrap"
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontFeatureSettings: '"tnum"' }}
                                    >
                                      {slot.startTime?.format?.('hh:mm A') || '—'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      →
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontFeatureSettings: '"tnum"' }}
                                    >
                                      {slot.endTime?.format?.('hh:mm A') || '—'}
                                    </Typography>
                                  </Stack>

                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    useFlexGap
                                    flexWrap="wrap"
                                    sx={{ gridColumn: { xs: 2, sm: 'auto' } }}
                                  >
                                    <Tooltip title="Duration" placement="top" arrow>
                                      <Typography variant="body2" color="text.secondary">
                                        {durationLabel}
                                      </Typography>
                                    </Tooltip>
                                    <Chip
                                      variant="outlined"
                                      icon={
                                        <Iconify
                                          icon={
                                            isBreak ? 'mdi:coffee-outline' : 'mdi:book-open-outline'
                                          }
                                          width={16}
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
                                    />
                                  </Stack>
                                </Box>
                              );
                            })}
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  }
                />
              </Box>
            );
          })}
        </Stack>
      )}

      {(!viewData?.slotConfigurations || viewData.slotConfigurations.length === 0) && (
        <EmptyContent
          title="No slot configurations"
          description="No slot configurations have been created yet."
          sx={{ py: 4, height: 'auto', minHeight: 240 }}
        />
      )}
    </Stack>
  );
};

export default ViewCreateSlots;
